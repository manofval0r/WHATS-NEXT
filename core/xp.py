"""
The XP ledger.

Why this exists
---------------
XP used to be recomputed on every request from live counters, by two
different formulas:

    get_user_profile:  completed*500 + activities*15 + posts*40 + replies*15 + reviews*10
    get_analytics:     completed*500 + activities*15 + community_xp

so the same user saw two different totals on two screens of the same app,
and neither survived a change to an unrelated counter. There was no XP
column anywhere; ``User.community_xp`` was being used for two unrelated
purposes, and lesson-quiz XP was written into it, which let someone who had
never posted anything outrank genuine contributors on the leaderboard.

Now XP is an append-only log of events and every total is a sum over it.

Idempotency
-----------
``award`` is keyed on ``(user, reason, reference)`` via a partial unique
constraint. Passing the same reference twice is a no-op, so a double-clicked
submit cannot pay out twice.
"""

from __future__ import annotations

from django.db import transaction
from django.db.models import Sum

from .models import XpEvent

# Single source of truth for every award in the app. Changing a number here
# changes what users earn everywhere; previously these were scattered string
# literals across a dozen call sites.
AWARDS = {
    "module_completed": 500,
    "lesson_completed": 20,
    "quiz_passed": 120,
    "project_verified": 300,
    "daily_quiz": 50,
    "streak_milestone": 75,
    "community_post": 40,
    "community_reply": 15,
    "peer_review": 20,
    "badge": 50,
}

SCOPE_BY_REASON = {
    "module_completed": "learning",
    "lesson_completed": "learning",
    "quiz_passed": "learning",
    "project_verified": "learning",
    "daily_quiz": "learning",
    "streak_milestone": "learning",
    "community_post": "community",
    "community_reply": "community",
    "peer_review": "community",
    "badge": "learning",
    "adjustment": "learning",
}


def award(user, reason: str, *, reference: str = "", amount: int | None = None,
          scope: str | None = None) -> XpEvent | None:
    """
    Record an XP award. Returns the event, or None if it was already awarded.

    ``reference`` should identify the thing being rewarded (a roadmap item id,
    a lesson id) so repeat submissions of the same thing do not pay twice.
    """
    if amount is None:
        amount = AWARDS.get(reason)
    if amount is None:
        raise ValueError(f"No XP value defined for reason={reason!r}")

    if scope is None:
        scope = SCOPE_BY_REASON.get(reason, "learning")

    # Unreferenced awards (badge awards, streak milestones, manual
    # adjustments) are not deduplicated — only keyed ones are.
    if not reference:
        return XpEvent.objects.create(
            user=user, amount=amount, reason=reason, scope=scope, reference=""
        )

    event, _created = XpEvent.objects.get_or_create(
        user=user,
        reason=reason,
        reference=str(reference),
        defaults={"amount": amount, "scope": scope},
    )
    return event


def award_once(user, reason: str, reference, **kwargs) -> XpEvent | None:
    """Convenience wrapper for the common ``award(..., reference=pk)`` case."""
    return award(user, reason, reference=str(reference), **kwargs)


def total(user, scope: str | None = None) -> int:
    """Total XP, optionally restricted to one scope (learning / community)."""
    qs = XpEvent.objects.filter(user=user)
    if scope is not None:
        qs = qs.filter(scope=scope)
    return qs.aggregate(total=Sum("amount"))["total"] or 0


def breakdown(user) -> dict:
    """Full XP summary, used by both the profile and the analytics screen."""
    rows = (
        XpEvent.objects.filter(user=user)
        .values("reason")
        .annotate(amount=Sum("amount"), events=Sum("amount"))
    )
    per_reason = {row["reason"]: row["amount"] for row in rows}

    return {
        "total": total(user),
        "learning": total(user, "learning"),
        "community": total(user, "community"),
        "by_reason": per_reason,
    }


@transaction.atomic
def grant_many(user, grants) -> None:
    """
    Award a batch of (reason, reference) pairs in one transaction.

    Used when a single action legitimately pays out more than once, e.g.
    finishing a module awards module_completed plus every lesson in it.
    """
    for reason, reference in grants:
        award(user, reason, reference=str(reference))