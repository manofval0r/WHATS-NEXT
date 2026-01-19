"""
Email notification tasks using Celery.
Handles streak reminders, module completion, and community notifications.
"""
from celery import shared_task
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from .models import User, UserRoadmapItem, CommunityReply


@shared_task
def send_streak_reminder_emails():
    """
    Celery beat task: Send streak reminders to inactive users (2+ days).
    Scheduled to run daily.
    """
    inactive_threshold = timezone.now() - timedelta(days=2)
    
    # Get users with a streak who haven't been active recently
    inactive_users = User.objects.filter(
        current_streak__gt=0,
        last_login__lt=inactive_threshold,
        email_notifications=True
    ).exclude(email='')
    
    for user in inactive_users:
        try:
            context = {
                'user': user,
                'streak': user.current_streak,
                'app_url': settings.FRONTEND_URL,
            }
            message = render_to_string('emails/streak_reminder.html', context)
            
            send_mail(
                subject=f"🔥 Keep your {user.current_streak}-day streak alive!",
                message="Complete a module today to maintain your streak!",
                html_message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Failed to send streak reminder to {user.email}: {e}")


@shared_task
def send_module_completion_email(user_id, module_name):
    """
    Task: Send email when user completes a module.
    Called from submit_quiz view.
    """
    try:
        user = User.objects.get(id=user_id)
        if not user.email_notifications or not user.email:
            return
        
        context = {
            'user': user,
            'module_name': module_name,
            'app_url': settings.FRONTEND_URL,
        }
        message = render_to_string('emails/module_completion.html', context)
        
        send_mail(
            subject=f"🎉 Great job completing {module_name}!",
            message=f"You've completed {module_name}. Keep learning!",
            html_message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
    except User.DoesNotExist:
        pass
    except Exception as e:
        print(f"Failed to send module completion email: {e}")


@shared_task
def send_community_reply_notification(reply_id, post_author_id):
    """
    Task: Send email when someone replies to user's community post.
    Called from CommunityReplyViewSet.create().
    """
    try:
        post_author = User.objects.get(id=post_author_id)
        reply = CommunityReply.objects.get(id=reply_id)
        
        if not post_author.email_notifications or not post_author.email:
            return
        
        context = {
            'post_author': post_author,
            'replier': reply.author.username,
            'post_title': reply.post.title,
            'reply_preview': reply.content[:100],
            'app_url': settings.FRONTEND_URL,
        }
        message = render_to_string('emails/community_reply.html', context)
        
        send_mail(
            subject=f"💬 {reply.author.username} replied to your post: {reply.post.title}",
            message=f"{reply.author.username} replied to your post.",
            html_message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[post_author.email],
            fail_silently=True,
        )
    except (User.DoesNotExist, CommunityReply.DoesNotExist):
        pass
    except Exception as e:
        print(f"Failed to send community reply notification: {e}")


@shared_task
def send_verification_email(user_id, item_id, status):
    """
    Task: Send email when project verification status changes.
    """
    try:
        user = User.objects.get(id=user_id)
        item = UserRoadmapItem.objects.get(id=item_id)
        
        if not user.email_notifications or not user.email:
            return
        
        context = {
            'user': user,
            'module_name': item.roadmap_node.title if item.roadmap_node else 'Your project',
            'status': status,
            'app_url': settings.FRONTEND_URL,
        }
        
        if status == 'approved':
            subject = f"✅ Your project was verified!"
            template = 'emails/project_approved.html'
        else:
            subject = f"⏳ Your project needs revisions"
            template = 'emails/project_rejected.html'
        
        message = render_to_string(template, context)
        
        send_mail(
            subject=subject,
            message=f"Your project verification status: {status}",
            html_message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
    except (User.DoesNotExist, UserRoadmapItem.DoesNotExist):
        pass
    except Exception as e:
        print(f"Failed to send verification email: {e}")
