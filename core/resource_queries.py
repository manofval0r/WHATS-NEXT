"""
resource_queries.py — derive search context from the user's roadmap
====================================================================
"""
from __future__ import annotations


def get_user_search_context(user) -> dict:
    """
    Return a dict with:
      - career_title : str   (user.target_career or fallback)
      - module_labels: list[str]  (ordered by step_order)
      - active_idx   : int   (index of first 'active' module, 0 if none)
    """
    from core.models import UserRoadmapItem  # deferred to avoid circular import

    career_title = getattr(user, 'target_career', '') or 'Software Developer'

    items = list(
        UserRoadmapItem.objects
        .filter(user=user)
        .order_by('step_order')
        .values_list('label', 'status')
    )

    module_labels = [label for label, _ in items]
    active_idx = 0
    for i, (_, status) in enumerate(items):
        if status == 'active':
            active_idx = i
            break

    return {
        'career_title': career_title,
        'module_labels': module_labels or [career_title],
        'active_idx': active_idx,
    }
