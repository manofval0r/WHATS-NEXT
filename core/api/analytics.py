"""
Progress analytics.

Moved out of core/views.py.
"""

from core.api._base import *  # noqa: F401,F403

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_analytics(request):
    """Get user's learning analytics using real model fields."""
    from core.models import Quiz
    from django.db.models import Avg, Count

    user = request.user
    now = timezone.now()
    month_ago = now - timedelta(days=30)

    all_items = UserRoadmapItem.objects.filter(user=user)
    completed_count = all_items.filter(status='completed').count()
    total_count = all_items.count()

    # Weekly activity. One query, materialised into a dict — the previous
    # version re-queried the same queryset once per day of the week, which
    # cost 7 extra queries on the dashboard's hottest read path.
    week_ago_date = (now - timedelta(days=6)).date()
    activity_by_date = dict(
        UserActivity.objects.filter(user=user, date__gte=week_ago_date).values_list(
            "date", "count"
        )
    )
    weekly_total = sum(activity_by_date.values())

    # Daily breakdown for the last 7 days
    weekly_breakdown = []
    for i in range(7):
        day = (now - timedelta(days=6 - i)).date()
        weekly_breakdown.append({
            "date": day.isoformat(),
            "count": activity_by_date.get(day, 0),
        })

    # Quiz stats (last 30 days)
    quizzes = Quiz.objects.filter(roadmap_item__user=user)
    recent_quizzes = quizzes.filter(completed_at__gte=month_ago)
    quiz_stats = recent_quizzes.aggregate(
        avg_score=Avg('score'),
        total_attempts=Count('id'),
    )

    # Recent verified projects
    recent_projects = all_items.filter(
        status='completed',
        project_submission_link__isnull=False,
    ).order_by('-submitted_at')[:5]

    # Streak
    current_streak_value = activity.current_streak(user)

    # XP: read from the ledger, the same source the profile screen uses.
    # Previously this recomputed it as
    # completed*500 + activities*15 + community_xp, while get_user_profile
    # used a different formula, so the same user saw two different totals on
    # two screens of the same app.
    xp_summary = xp_module.breakdown(user)

    return Response({
        "summary": {
            "total_xp": xp_summary["total"],
            "learning_xp": xp_summary["learning"],
            "community_xp": xp_summary["community"],
            "current_streak": current_streak_value,
            "completed_modules": completed_count,
            "total_modules": total_count,
        },
        "weekly_activity_total": weekly_total,
        "quiz_stats": {
            "average_score": quiz_stats.get('avg_score') or 0,
            "total_attempts": quiz_stats.get('total_attempts') or 0,
        },
        "weekly_breakdown": weekly_breakdown,
        "recent_projects": [
            {
                "id": p.id,
                "label": p.label,
                "submission_link": p.project_submission_link,
            }
            for p in recent_projects
        ],
    })


__all__ = [
    "get_analytics",
]
