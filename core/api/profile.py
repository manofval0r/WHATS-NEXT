"""
Profile, portfolio, CV, settings, sharing and account lifecycle.

Moved out of core/views.py.
"""

from core.api._base import *  # noqa: F401,F403

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_activity_log(request):
    user = request.user
    activities = UserActivity.objects.filter(user=user)
    data = {str(act.date): act.count for act in activities}
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_streak(request):
    """
    Returns the user's current streak count.
    """
    try:
        user = request.user
        today = datetime.now().date()
        
        dates = list(UserActivity.objects.filter(user=user).values_list('date', flat=True).order_by('-date'))
        
        if not dates:
            return Response({"streak": 0})
            
        current_streak = 0
        check_date = today
        
        if today not in dates:
            check_date = today - timedelta(days=1)
            if check_date not in dates:
                 return Response({"streak": 0})
        
        while check_date in dates:
            current_streak += 1
            check_date -= timedelta(days=1)
            
        return Response({"streak": current_streak})
    except Exception as e:
        import traceback
        print(f"STREAK ERROR: {e}")
        return Response({
            "error": str(e),
            "type": type(e).__name__,
            "trace": traceback.format_exc()
        }, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    user = request.user
    
    try:
        all_items = UserRoadmapItem.objects.filter(user=user)
        completed_items = all_items.filter(status='completed').order_by('-submitted_at')
        
        total_count = all_items.count()
        completed_count = completed_items.count()
        progress_percent = 0
        if total_count > 0:
            progress_percent = round((completed_count / total_count) * 100)
        
        project_cards = []
        for item in completed_items:
            proj_text = item.project_prompt if item.project_prompt else "Completed Module"
            
            try:
                if proj_text.lower().startswith("build") or proj_text.lower().startswith("create"):
                    if ' ' in proj_text:
                        action_verb = "Designed and developed"
                        noun = proj_text.split(' ', 1)[1]
                    else:
                        action_verb = "Built"
                        noun = proj_text
                else:
                    action_verb = "Implemented"
                    noun = proj_text
                
                cv_bullet = f"{action_verb} a {noun} using {item.label} concepts."
            except:
                cv_bullet = f"Completed comprehensive module on {item.label}."

            tags = []
            if item.label:
                tags = [word for word in item.label.split() if len(word) > 2]

            date_str = "Recently"
            if item.submitted_at:
                date_str = item.submitted_at.strftime("%b %Y")

            project_cards.append({
                "id": item.id,
                "module_title": item.label,
                "cv_text": cv_bullet,
                "date": date_str,
                "tags": tags,
                "link": item.project_submission_link
            })

        market_label = "Tech Explorer"
        if progress_percent > 25: market_label = "Junior Intern"
        if progress_percent > 60: market_label = "Associate Developer"
        if progress_percent > 90: market_label = "Job-Ready Engineer"

        github = getattr(user, 'github_link', '')
        linkedin = getattr(user, 'linkedin_link', '')

        twitter = getattr(user, 'twitter_link', '')
        website = getattr(user, 'website_link', '')

        # Community counts
        posts_count = CommunityPost.objects.filter(author=user).count()
        replies_count = CommunityReply.objects.filter(author=user).count()
        reviews_given = ProjectReview.objects.filter(reviewer=user).count()

        # Contribution summary
        today = timezone.now().date()
        year_cutoff = today - timedelta(days=365)
        year_activity = UserActivity.objects.filter(user=user, date__gte=year_cutoff)
        total_activities_year = sum([a.count for a in year_activity])

        # Longest streak (within last year)
        active_dates = sorted([a.date for a in year_activity if a.count > 0])
        longest_streak = 0
        cur = 0
        prev = None
        for d in active_dates:
            if prev is None or d == prev + timedelta(days=1):
                cur += 1
            else:
                cur = 1
            longest_streak = max(longest_streak, cur)
            prev = d

        # Current streak (same logic as get_user_streak)
        dates = list(UserActivity.objects.filter(user=user).values_list('date', flat=True).order_by('-date'))
        current_streak = 0
        check_date = today
        if dates:
            if today not in dates:
                check_date = today - timedelta(days=1)
            if check_date in dates:
                while check_date in dates:
                    current_streak += 1
                    check_date -= timedelta(days=1)

        # XP comes from the ledger, the same source /api/analytics/ reads.
        # The two endpoints previously used different formulas
        # (this one counted posts/replies/reviews directly; analytics added
        # User.community_xp), so the same user saw two totals for the same
        # person on two screens of the same app.
        xp_summary = xp_module.breakdown(user)

        # Activity visibility defaults
        visibility = getattr(user, 'activity_visibility', {}) or {}
        defaults = {
            'show_contribution_graph': True,
            'show_activity_feed': True,
            'show_achievements': True,
            'show_skills': True,
            'show_projects': True,
        }
        merged_visibility = {**defaults, **visibility}

        # Module buckets (for skills + verification details)
        completed_modules = []
        active_modules = []
        locked_modules = []
        # Real lesson completion count from LessonProgress table
        lessons_completed = LessonProgress.objects.filter(user=user, is_completed=True).count()

        def _module_competencies(item):
            outline = (item.resources or {}).get('lesson_outline') or []
            titles = []
            for lesson in outline[:6]:
                title = (lesson or {}).get('title')
                if title:
                    titles.append(title)
            if titles:
                return titles
            return [word for word in (item.label or '').split() if len(word) > 2][:6]

        for item in all_items.order_by('step_order'):
            payload = {
                'id': item.id,
                'label': item.label,
                'status': item.status,
                'step_order': item.step_order,
                'project_submission_link': item.project_submission_link,
                'submitted_at': item.submitted_at.isoformat() if item.submitted_at else None,
                'verification_status': item.verification_status,
                'verification_count': item.verification_count,
                'github_score': item.github_score,
                'score_breakdown': item.score_breakdown,
                'competencies': _module_competencies(item),
            }

            outline = (item.resources or {}).get('lesson_outline') or []
            payload['lessons_total'] = len(outline) if isinstance(outline, list) else 0

            cert = getattr(item, 'certificate', None)
            payload['certificate_id'] = cert.certificate_id if cert else None

            if item.status == 'completed':
                completed_modules.append(payload)
            elif item.status == 'active':
                active_modules.append(payload)
            else:
                locked_modules.append(payload)

        # Achievements (starter set)
        badges = []

        def _badge(key, title, earned, category):
            badges.append({
                'key': key,
                'title': title,
                'category': category,
                'earned': bool(earned),
            })

        _badge('first_module', 'First Module', completed_count >= 1, 'Module Completions')
        _badge('five_modules', '5 Modules', completed_count >= 5, 'Module Completions')
        _badge('streak_3', '3-Day Fire', current_streak >= 3, 'Streaks')
        _badge('streak_7', 'Week Warrior', current_streak >= 7, 'Streaks')
        _badge('community_first_post', 'First Post', posts_count >= 1, 'Community')
        _badge('helpful_reviewer', 'Helpful Reviewer', reviews_given >= 10, 'Community')

        recent_badges = [b for b in badges if b['earned']][:6]

        return Response({
            "profile": {
                "username": user.username,
                "email": user.email,
                "target_career": user.target_career,
                "current_level": getattr(user, 'current_level', 'Beginner'),
                "market_label": market_label,
                "progress": progress_percent,
                "github": github,
                "linkedin": linkedin,
                "twitter": twitter,
                "website": website,
                "plan_tier": getattr(user, 'plan_tier', 'FREE'),
                "premium_waitlist_status": getattr(user, 'premium_waitlist_status', 'none'),
                "profile_visibility": getattr(user, 'profile_visibility', 'public'),
                "allow_indexing": getattr(user, 'allow_indexing', True),
                "activity_visibility": merged_visibility,
            },
            "stats": {
                "completed": completed_count,
                "total": total_count,
                "xp": xp_summary["total"],
                "learning_xp": xp_summary["learning"],
                "community_xp": xp_summary["community"],
                "xp_by_reason": xp_summary["by_reason"],
                "streak": current_streak,
                "longest_streak": longest_streak,
                "total_activities_year": total_activities_year,
                "community_posts": posts_count,
                "community_replies": replies_count,
                "lessons_completed": lessons_completed,
            },
            "projects": project_cards,
            "modules": {
                "completed": completed_modules,
                "active": active_modules,
                "locked": locked_modules[:12]
            },
            "achievements": {
                "recent": recent_badges,
                "all": badges
            }
        })

    except Exception as e:
        import traceback
        print(f"PROFILE GENERATION ERROR: {e}")
        traceback.print_exc()
        return Response({
            "error": str(e),
            "type": type(e).__name__,
            "trace": traceback.format_exc()
        }, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_socials(request):
    user = request.user
    user.github_link = request.data.get('github', user.github_link)
    user.linkedin_link = request.data.get('linkedin', user.linkedin_link)
    user.twitter_link = request.data.get('twitter', user.twitter_link)
    user.website_link = request.data.get('website', user.website_link)
    user.save()
    return Response({"message": "Socials updated"})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_cv_text(request, item_id):
    item = get_object_or_404(UserRoadmapItem, id=item_id, user=request.user)
    new_text = request.data.get('text')
    if new_text:
        item.custom_cv_text = new_text
        item.save()
    return Response({"message": "CV Bullet updated"})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_portfolio_html(request):
    """
    Generate and return a portable HTML portfolio page.
    """
    from core.portfolio_generator import create_portfolio_html
    from django.http import HttpResponse
    
    user = request.user
    completed_items = UserRoadmapItem.objects.filter(user=user, status='completed').order_by('-submitted_at')
    
    # Format for portfolio generator
    formatted_items = []
    for item in completed_items:
        formatted_items.append({
            'module_title': item.label,
            'cv_text': item.custom_cv_text or item.project_prompt,
            'date': item.submitted_at.strftime("%b %Y") if item.submitted_at else "Recently",
            'link': item.project_submission_link
        })
    
    html_content = create_portfolio_html(user, formatted_items)
    
    response = HttpResponse(html_content, content_type='text/html')
    response['Content-Disposition'] = f'attachment; filename="{user.username}_portfolio.html"'
    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def pivot_career(request):
    """
    Switch career, preserving work that genuinely carries over.

    Previously this set ``target_career``, deleted every active and locked
    module, and left the comment "Logic to preserve relevant modules would go
    here" -- then reported ``kept_modules: N`` while keeping only finished
    rows. Because ``get_my_roadmap`` short-circuits on
    ``existing_items.exists()``, the user was stranded on a one-node roadmap
    with no active module and nothing left to unlock.

    Now the overlap is computed and the roadmap is rebuilt, and the response
    names the specific modules that carried over and the specific gaps.
    """
    from core.pivot import apply_pivot

    user = request.user
    new_career = (request.data.get("new_career") or "").strip()

    if not new_career:
        return Response({"error": "New career target is required"}, status=400)

    # Accept either a catalog key ("devops") or the display title, because
    # the UI sends whatever it has to hand.
    role_key = _resolve_role_key(new_career)
    if not role_key:
        return Response(
            {"error": f"Unknown career target: {new_career!r}"}, status=400
        )

    try:
        transfer = apply_pivot(user, role_key)
    except ValueError as exc:
        return Response({"error": str(exc)}, status=400)
    except Exception:  # noqa: BLE001 - never leak internals to the client
        logger.exception("career pivot failed for user %s", user.pk)
        return Response({"error": "Could not switch career. Nothing was changed."}, status=500)

    return Response({
        "message": f"Roadmap rebuilt for {transfer.to_role}.",
        "from_role": transfer.from_role,
        "to_role": transfer.to_role,
        "overlap_percent": round(transfer.overlap * 100),
        # Named, not a bare count, so the number is inspectable.
        "carried_modules": transfer.carried_labels,
        "gap_modules": transfer.gap_labels,
        "kept_modules": len(transfer.carried_labels),
    })


def _resolve_role_key(value: str) -> str | None:
    """Map a catalog key or a display title to a catalog key.

    ``get_available_roles()`` returns a list of dicts with 'key' and 'title',
    so both the frontend's key and its display label resolve here.
    """
    from core.role_catalog import get_available_roles

    wanted = value.strip().lower()
    for role in get_available_roles():
        key = str(role.get("key", "")).lower()
        title = str(role.get("title", "")).strip().lower()
        if wanted in (key, title):
            return role.get("key")
    return None


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def update_settings(request):
    """
    GET: Return current user settings
    POST: Update user settings (Budget, Privacy, Notifications)
    """
    user = request.user
    
    if request.method == 'GET':
        return Response({
            "username": user.username,
            "gender": getattr(user, 'gender', 'unspecified'),
            "avatar_seed": str(getattr(user, 'avatar_seed', '')) if getattr(user, 'avatar_seed', None) else None,
            "avatar_url": ensure_avatar_url(user),
            "last_username_change_at": user.last_username_change_at.isoformat() if getattr(user, 'last_username_change_at', None) else None,
            "budget_preference": user.budget_preference,
            "profile_visibility": getattr(user, 'profile_visibility', 'public'),
            "allow_indexing": getattr(user, 'allow_indexing', True),
            "activity_visibility": getattr(user, 'activity_visibility', {}) or {},
            "email_notifications": getattr(user, 'email_notifications', True)
        })
    
    # POST - Update settings
    user.budget_preference = request.data.get('budget', user.budget_preference)

    if 'gender' in request.data:
        gender = str(request.data.get('gender') or '').strip().lower() or 'unspecified'
        allowed_genders = {'unspecified', 'female', 'male', 'nonbinary'}
        if gender not in allowed_genders:
            return Response({"error": f"Gender must be one of {sorted(allowed_genders)}"}, status=400)
        user.gender = gender

    if 'profile_visibility' in request.data:
        user.profile_visibility = request.data['profile_visibility']
    if 'allow_indexing' in request.data:
        user.allow_indexing = bool(request.data['allow_indexing'])
    if 'activity_visibility' in request.data and isinstance(request.data['activity_visibility'], dict):
        user.activity_visibility = request.data['activity_visibility']
    if 'email_notifications' in request.data:
        user.email_notifications = bool(request.data['email_notifications'])
    
    user.save()
    return Response({"message": "Settings updated"})


def _reset_cv_export_counter(user):
    today = datetime.now().date()
    if not user.cv_exports_reset_at:
        user.cv_exports_count = 0
        user.cv_exports_reset_at = today
        user.save(update_fields=['cv_exports_count', 'cv_exports_reset_at'])
        return

    if user.cv_exports_reset_at.year != today.year or user.cv_exports_reset_at.month != today.month:
        user.cv_exports_count = 0
        user.cv_exports_reset_at = today
        user.save(update_fields=['cv_exports_count', 'cv_exports_reset_at'])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_premium_status(request):
    user = request.user
    _reset_cv_export_counter(user)

    remaining = None
    if user.plan_tier != 'PREMIUM':
        remaining = max(FREE_CV_EXPORT_LIMIT - user.cv_exports_count, 0)

    return Response({
        "plan_tier": user.plan_tier,
        "is_premium": user.plan_tier == 'PREMIUM',
        "waitlist_status": user.premium_waitlist_status,
        "waitlist_joined_at": user.premium_waitlist_joined_at.isoformat() if user.premium_waitlist_joined_at else None,
        "cv_exports_remaining": remaining
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_premium_waitlist(request):
    user = request.user

    if user.plan_tier == 'PREMIUM':
        return Response({
            "message": "You already have Premium access.",
            "waitlist_status": user.premium_waitlist_status,
            "plan_tier": user.plan_tier
        })

    feature_key = request.data.get('feature_key', '').strip()
    source = request.data.get('source', '').strip()

    if user.premium_waitlist_status != 'pending':
        user.premium_waitlist_status = 'pending'
        if not user.premium_waitlist_joined_at:
            user.premium_waitlist_joined_at = datetime.now()

    if feature_key:
        user.premium_waitlist_feature = feature_key
    if source:
        user.premium_waitlist_source = source

    user.save(update_fields=[
        'premium_waitlist_status',
        'premium_waitlist_joined_at',
        'premium_waitlist_feature',
        'premium_waitlist_source'
    ])

    # PostHog: track waitlist join
    ph_capture(user, 'premium_waitlist_joined', {
        'feature_key': feature_key,
        'source': source,
    })

    return Response({
        "message": "You're on the Premium waitlist.",
        "waitlist_status": user.premium_waitlist_status,
        "waitlist_joined_at": user.premium_waitlist_joined_at.isoformat() if user.premium_waitlist_joined_at else None,
        "plan_tier": user.plan_tier
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def track_cv_export(request):
    user = request.user
    _reset_cv_export_counter(user)

    if user.plan_tier == 'PREMIUM':
        return Response({
            "allowed": True,
            "remaining": None,
            "plan_tier": user.plan_tier
        })

    if user.cv_exports_count >= FREE_CV_EXPORT_LIMIT:
        return Response({
            "allowed": False,
            "remaining": 0,
            "plan_tier": user.plan_tier
        }, status=403)

    User.objects.filter(pk=user.pk).update(cv_exports_count=F('cv_exports_count') + 1)
    user.refresh_from_db()

    remaining = max(FREE_CV_EXPORT_LIMIT - user.cv_exports_count, 0)
    return Response({
        "allowed": True,
        "remaining": remaining,
        "plan_tier": user.plan_tier
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def get_public_user_profile(request, username):
    """Get a user's profile with projects and stats (subject to privacy settings)."""
    user = get_object_or_404(User, username=username)

    visibility = getattr(user, 'profile_visibility', 'public')

    # If requesting someone else's profile, enforce privacy rules.
    if not request.user.is_authenticated:
        if visibility != 'public':
            return Response({"error": "Authentication required"}, status=401)
    else:
        if user != request.user and visibility == 'private':
            return Response({"error": "Profile is private"}, status=403)
        # 'community' and 'public' are viewable by authenticated users.
    
    # User basic info
    profile_data = UserProfileSerializer(user).data
    
    # Get completed projects
    completed_items = UserRoadmapItem.objects.filter(
        user=user,
        status='completed',
        project_submission_link__isnull=False
    ).order_by('-submitted_at')
    
    projects = []
    for item in completed_items:
        projects.append({
            "id": item.id,
            "label": item.label,
            "link": item.project_submission_link,
            "verifications": item.verification_count,
            "submitted_at": item.submitted_at.strftime("%d %b %Y"),
            "comments_count": item.comments.count()
        })
    
    profile_data['completed_projects'] = projects
    
    return Response(profile_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_profile(request):
    """Get current user's profile."""
    return get_public_user_profile(request, request.user.username)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    """
    Permanently delete the user account and all associated data.
    """
    user = request.user
    try:
        user.delete()
        return Response({"message": "Account deleted successfully"}, status=204)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_account_data(request):
    """
    Export all user data as a JSON file.
    """
    import json
    from django.http import HttpResponse
    
    user = request.user
    
    # Gather data
    roadmap_items = UserRoadmapItem.objects.filter(user=user).values()
    activity_log = UserActivity.objects.filter(user=user).values()
    
    data = {
        "username": user.username,
        "email": user.email,
        "target_career": user.target_career,
        "joined_at": str(user.date_joined),
        "roadmap": list(roadmap_items),
        "activity_log": list(activity_log)
    }
    
    response = HttpResponse(
        json.dumps(data, indent=2, default=str),
        content_type='application/json'
    )
    response['Content-Disposition'] = f'attachment; filename="{user.username}_data.json"'
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_recent_activity(request):
    """
    Returns a chronological list of user activities.
    """
    user = request.user
    activities = []
    
    # 1. Completed Modules
    completed = UserRoadmapItem.objects.filter(user=user, status='completed')
    for item in completed:
        activities.append({
            "type": "module_completed",
            "title": f"Completed module: {item.label}",
            "date": item.submitted_at,
            "details": item.description[:100] + "..."
        })

        if item.project_submission_link:
            activities.append({
                "type": "project_submitted",
                "title": f"Submitted project: {item.label}",
                "date": item.submitted_at,
                "details": item.project_submission_link
            })
        
    # 2. Project Reviews (given)
    reviews = ProjectReview.objects.filter(reviewer=user)
    for review in reviews:
        activities.append({
            "type": "review_given",
            "title": f"Reviewed {review.submission.user.username}'s project",
            "date": review.created_at,
            "details": f"Voted {review.vote_type}"
        })
        
    # 3. Comments (given)
    comments = ProjectComment.objects.filter(author=user)
    for comment in comments:
        activities.append({
            "type": "comment_added",
            "title": f"Commented on {comment.project.label}",
            "date": comment.created_at,
            "details": comment.text[:50] + "..."
        })

    # 4. Community posts + replies
    posts = CommunityPost.objects.filter(author=user)
    for post in posts:
        activities.append({
            "type": "community_post",
            "title": f"Posted in community: {post.title}",
            "date": post.created_at,
            "details": post.post_type
        })

    replies = CommunityReply.objects.filter(author=user)
    for reply in replies:
        activities.append({
            "type": "community_comment",
            "title": f"Replied in community",
            "date": reply.created_at,
            "details": (reply.content[:50] + "...") if reply.content else ""
        })

    # 5. Quiz completions
    try:
        from core.models import Quiz
        quizzes = Quiz.objects.filter(roadmap_item__user=user, completed_at__isnull=False)
        for q in quizzes:
            activities.append({
                "type": "quiz_completed",
                "title": f"Quiz completed: {q.roadmap_item.label}",
                "date": q.completed_at,
                "details": f"Score: {q.score}%"
            })
    except Exception:
        pass
        
    # Sort by date descending
    activities.sort(key=lambda x: x['date'], reverse=True)
    
    return Response(activities)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def share_profile(request):
    """Generate shareable public profile link."""
    user = request.user
    
    # Create a sharable profile URL
    public_url = f"{settings.FRONTEND_URL}/profile/public/{user.username}/"
    
    return Response({
        "public_url": public_url,
        "username": user.username,
        "message": "Profile link copied to clipboard"
    })


__all__ = [
    "_reset_cv_export_counter",
    "_resolve_role_key",
    "delete_account",
    "export_account_data",
    "export_portfolio_html",
    "get_activity_log",
    "get_my_profile",
    "get_premium_status",
    "get_public_user_profile",
    "get_recent_activity",
    "get_user_profile",
    "get_user_streak",
    "join_premium_waitlist",
    "pivot_career",
    "share_profile",
    "track_cv_export",
    "update_cv_text",
    "update_settings",
    "update_socials",
]
