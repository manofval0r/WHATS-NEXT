"""
Daily activity recording and streak calculation.

Two defects this fixes:

*Lost updates.* Every call site did the same read-modify-write::

    activity, _ = UserActivity.objects.get_or_create(user=user, date=today)
    activity.count += 1
    activity.save()

``get_or_create`` only protects row *creation*. Two concurrent completions on
the same day both read ``count=4`` and both wrote ``5`` — one increment lost
forever, and streaks and badges silently under-award. This uses a single
atomic ``F()`` update instead.

*Contamination.* The daily quiz used to write ``1000`` into ``count`` to mark
itself done, and every consumer summed that column as if it were real
activity — so one quiz click was worth 1,000 contributions and 15,000 XP.
Quiz completion now lives in its own column.
"""

from __future__ import annotations

from datetime import timedelta

from django.db.models import F
from django.utils import timezone

from .models import UserActivity


def record_activity(user, *, reason: str | None = None) -> UserActivity:
    """
    Record one real activity event for today, atomically.

    Returns the row. Safe under concurrency: uses ``F()`` so concurrent
    increments accumulate rather than overwrite.
    """
    today = timezone.now().date()

    UserActivity.objects.get_or_create(user=user, date=today)

    # Single atomic statement. Also touches ``updated_at``-style liveness by
    # setting the column rather than reading it first.
    UserActivity.objects.filter(user=user, date=today).update(count=F("count") + 1)

    return UserActivity.objects.get(user=user, date=today)


def complete_daily_quiz(user) -> None:
    """Mark today's daily quiz done without inflating the activity counter."""
    today = timezone.now().date()
    UserActivity.objects.get_or_create(user=user, date=today)
    UserActivity.objects.filter(user=user, date=today).update(
        daily_quiz_completed_at=timezone.now()
    )


def daily_quiz_completed(user) -> bool:
    today = timezone.now().date()
    return UserActivity.objects.filter(
        user=user, date=today, daily_quiz_completed_at__isnull=False
    ).exists()


def activity_days(user) -> list:
    """Distinct dates with real activity, newest first."""
    return list(
        UserActivity.objects.filter(user=user)
        .exclude(count=0)
        .values_list("date", flat=True)
        .order_by("-date")
    )


def current_streak(user) -> int:
    """
    Length of the current run of consecutive active days.

    A streak is alive if the user was active today or yesterday; anyone
    further back has already broken it. The previous implementation did a
    linear ``in`` scan over an unbounded list once per iteration, which is
    O(n^2) in a user-controlled input, and it ran on every completion.
    """
    days = set(activity_days(user))
    if not days:
        return 0

    today = timezone.now().date()
    cursor = today if today in days else today - timedelta(days=1)
    if cursor not in days:
        return 0

    streak = 0
    while cursor in days:
        streak += 1
        cursor -= timedelta(days=1)

    return streak


def longest_streak(user) -> int:
    """Longest run of consecutive active days ever recorded."""
    days = sorted(set(activity_days(user)))
    if not days:
        return 0

    best = run = 1
    for previous, current in zip(days, days[1:]):
        if current - previous == timedelta(days=1):
            run += 1
        else:
            run = 1
        best = max(best, run)
    return best


def total_events(user, *, since=None) -> int:
    qs = UserActivity.objects.filter(user=user)
    if since is not None:
        qs = qs.filter(date__gte=since)
    return sum(qs.values_list("count", flat=True)) or 0