"""
Job matching endpoint.

Replaces the employer/recruiter job board. See core/job_matching.py for why:
a two-sided marketplace cannot be honestly demonstrated with zero employers,
so this ranks the real live feed against completed modules and explains
every score.

Read-only. Nothing is persisted.
"""

from core.api._base import *  # noqa: F401,F403

from core.job_matching import JOB_MATCH_CACHE_TTL, MATCH_METHOD, rank_jobs_for

NO_ROADMAP_MESSAGE = (
    "Complete a module and this will rank live openings against it. "
    "Matching is based on what you have actually finished, not on what you "
    "have planned."
)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def match_jobs(request):
    """GET /api/jobs/match/"""
    try:
        limit = min(int(request.query_params.get("limit", 12)), 30)
        offset = max(int(request.query_params.get("offset", 0)), 0)
    except (TypeError, ValueError):
        return Response(
            {"error": "limit and offset must be integers."}, status=400
        )

    user = request.user

    # The feed is global but the ranking is per-user, so it is cached per user.
    cache_key = f"jobmatch:{user.pk}"
    cached = django_cache.get(cache_key)

    if cached is None:
        ranked, meta = rank_jobs_for(user)
        cached = {"ranked": ranked, **meta}
        django_cache.set(cache_key, cached, JOB_MATCH_CACHE_TTL)

    ranked = cached["ranked"]

    if not cached["completed_modules"]:
        return Response({
            "matches": [],
            "total": 0,
            "offset": offset,
            "has_more": False,
            "completed_modules": 0,
            "skills": [],
            "method": MATCH_METHOD,
            "message": NO_ROADMAP_MESSAGE,
        })

    return Response({
        "matches": ranked[offset:offset + limit],
        "total": len(ranked),
        "offset": offset,
        "has_more": offset + limit < len(ranked),
        "completed_modules": cached["completed_modules"],
        "skills": cached["skills"],
        # Stated in the response so the UI can show how the ranking works
        # rather than presenting an unexplained number.
        "method": MATCH_METHOD,
    })


__all__ = ["match_jobs"]