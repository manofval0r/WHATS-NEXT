"""
Email notifications, dispatched on Celery beat.

Every one of these was dead in four separate ways before:

1. ``settings.FRONTEND_URL`` did not exist, so the context dict raised
   AttributeError on the first line of every task.
2. ``User.objects.filter(current_streak__gt=0)`` — ``User`` has no
   ``current_streak`` column. The streak is *computed* from UserActivity
   (see core/activity.py), so this raised FieldError before the loop even
   started.
3. ``item.roadmap_node`` referenced a relation deleted back in migration 0003.
4. There was no ``templates/emails/`` directory, so ``render_to_string``
   raised TemplateDoesNotExist. With no ``EMAIL_BACKEND`` configured it also
   fell back to SMTP against localhost:25 with ``fail_silently=True``, so
   failures were invisible.

And none of it ever ran: zero ``.delay()`` calls existed in the codebase and
the Procfile started no worker.

All four are fixed, and the streak is now derived rather than read off a
column that does not exist.
"""

from __future__ import annotations

import logging
from datetime import timedelta

from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone

from .activity import current_streak, activity_days
from .models import CommunityReply, User, UserRoadmapItem

logger = logging.getLogger(__name__)

# How many days of silence trigger a reminder.
INACTIVE_THRESHOLD_DAYS = 2


def _send(to_address, subject, template, context) -> bool:
    """Render and send one email. Returns whether it went out."""
    try:
        html = render_to_string(template, context)
        send_mail(
            subject=subject,
            message=_plain_text(subject),
            html_message=html,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_address],
            # Not silent: a failure must be logged, not swallowed. The old
            # fail_silently=True is why this system rotted unnoticed.
            fail_silently=False,
        )
        return True
    except Exception:  # noqa: BLE001 - one bad email must not stop the batch
        logger.exception("failed to send %s to %s", template, to_address)
        return False


def _plain_text(subject: str) -> str:
    return f"{subject}\n\nOpen WHATS-NEXT: {settings.FRONTEND_URL}"


def _inactive_users(min_streak: int = 1):
    """
    Users with a live streak who have gone quiet.

    Streak length is computed in Python, so this cannot be a queryset
    filter — it pages through users in batches and evaluates per user. Kept
    deliberately simple and bounded; a per-streak database column would be
    the fix at scale.
    """
    threshold = timezone.now().date() - timedelta(days=INACTIVE_THRESHOLD_DAYS)

    candidates = (
        User.objects.filter(email_notifications=True)
        .exclude(email="")
        .only("id", "username", "email", "target_career")
    )

    for user in candidates.iterator():
        days = set(activity_days(user))
        if not days:
            continue

        today = timezone.now().date()
        # Active today or yesterday still counts as a live streak.
        if today not in days and (today - timedelta(days=1)) not in days:
            continue
        if max(days) > threshold:
            continue

        streak = current_streak(user)
        if streak >= min_streak:
            yield user, streak


@shared_task(name="core.email_tasks.send_streak_reminder_emails")
def send_streak_reminder_emails():
    """Celery beat task: nudge users whose streak is about to lapse."""
    sent = 0

    for user, streak in _inactive_users():
        ok = _send(
            user.email,
            f"Your {streak}-day streak is waiting",
            "emails/streak_reminder.html",
            {
                "user": user,
                "streak": streak,
                "app_url": settings.FRONTEND_URL,
            },
        )
        if ok:
            sent += 1
            try:
                from .posthog_client import ph_capture

                ph_capture(user, "email_sent", {"type": "streak_reminder"})
            except Exception:  # noqa: BLE001
                logger.debug("analytics failed", exc_info=True)

    logger.info("streak reminders sent: %s", sent)
    return sent


@shared_task(name="core.email_tasks.send_module_completion_email")
def send_module_completion_email(user_id: int, item_id: int) -> bool:
    """Sent when a project passes verification and a module completes."""
    try:
        user = User.objects.get(pk=user_id)
        item = UserRoadmapItem.objects.get(pk=item_id)
    except (User.DoesNotExist, UserRoadmapItem.DoesNotExist):
        logger.warning("module completion email skipped: user/item gone")
        return False

    if not user.email or not user.email_notifications:
        return False

    return _send(
        user.email,
        f"Completed: {item.label}",
        "emails/module_completion.html",
        {
            "user": user,
            "item": item,
            "app_url": settings.FRONTEND_URL,
        },
    )


@shared_task(name="core.email_tasks.send_reply_notification_email")
def send_reply_notification_email(reply_id: int) -> bool:
    """Tell someone their question or discussion got a reply."""
    try:
        reply = CommunityReply.objects.select_related("post", "post__author").get(pk=reply_id)
    except CommunityReply.DoesNotExist:
        return False

    # Never notify people about their own reply.
    if reply.author_id == reply.post.author_id:
        return False

    recipient = reply.post.author
    if not recipient.email or not recipient.email_notifications:
        return False

    return _send(
        recipient.email,
        f"{reply.author.username} replied to your post",
        "emails/reply_notification.html",
        {
            "user": recipient,
            "reply": reply,
            "post": reply.post,
            "app_url": settings.FRONTEND_URL,
        },
    )