"""
Career pivoting with real skill transfer.

This replaces the endpoint that set ``user.target_career``, deleted every
active and locked module, and contained the comment::

    # Logic to preserve relevant modules would go here

It also had a worse problem than not transferring anything: it told the user
"kept_modules: N" while keeping only the completed rows, and because
``get_my_roadmap`` short-circuits on ``existing_items.exists()``, the user
was then permanently stranded on a one-node roadmap with no active module
and nothing left to unlock. Verified: after one pivot the user had exactly
one node, and it was the finished one.

What this does
--------------
A pivot to role B does not start from zero. The user has genuinely proved
work on module labels and project prompts; some of that is real, portable
evidence against role B's catalog. This computes that overlap explicitly and
rebuilds the roadmap so carried modules stay marked complete while the gaps
appear in order.

The overlap is reported back with the specific module names, so "you keep 4
of 11 modules" is inspectable rather than a bare number.
"""

from __future__ import annotations

import re

from django.db import transaction

from .models import SkillTransfer, UserRoadmapItem
from .role_catalog import get_role_template

# Words that carry no signal when comparing module labels. Keeping them makes
# "HTML & CSS Foundations" and "Foundations of CSS" look more similar than
# they are.
STOPWORDS = {
    "and", "the", "for", "with", "from", "into", "your", "you",
    "a", "an", "of", "to", "in", "on", "at", "by", "or",
    "fundamentals", "basics", "introduction", "intro", "overview",
    "concepts", "essentials", "getting", "started",
}

_WORD = re.compile(r"[a-z0-9]+")


def _tokens(text: str) -> set:
    return {
        word
        for word in _WORD.findall((text or "").lower())
        if word not in STOPWORDS and len(word) > 2
    }


def _normalise(text: str) -> str:
    return " ".join(sorted(_tokens(text)))


def compute_transfer(user, target_role_key: str) -> SkillTransfer:
    """
    Compare the user's completed modules against a target role's catalog.

    Returns an unsaved ``SkillTransfer``. A module counts as carried when its
    label and project prompt share meaningful vocabulary with a module in the
    target catalog — that is, when the user has already done the equivalent
    work under a different name.
    """
    template = get_role_template(target_role_key)
    target_modules = (template or {}).get("modules", []) or []

    completed = list(
        UserRoadmapItem.objects.filter(user=user, status="completed")
        .values_list("label", "project_prompt")
    )

    # Index the target catalog by token so matching is a set intersection
    # rather than a nested loop over labels.
    target_index: dict[str, list[int]] = {}
    for index, module in enumerate(target_modules):
        tokens = _tokens(module.get("label", "")) | _tokens(module.get("project_prompt", ""))
        for token in tokens:
            target_index.setdefault(token, []).append(index)

    carried: list[str] = []
    gaps: list[str] = []

    for label, prompt in completed:
        tokens = _tokens(label) | _tokens(prompt)
        matches: set[int] = set()
        for token in tokens:
            matches.update(target_index.get(token, ()))

        if matches:
            carried.append(label)
        else:
            gaps.append(label)

    # Anything in the target catalog the user has not touched yet is a gap too.
    covered_positions = set()
    for label, prompt in completed:
        tokens = _tokens(label) | _tokens(prompt)
        for token in tokens:
            covered_positions.update(target_index.get(token, ()))

    for index, module in enumerate(target_modules):
        if index not in covered_positions:
            label = module.get("label", "")
            if label and label not in gaps:
                gaps.append(label)

    overlap = (len(carried) / len(target_modules)) if target_modules else 0.0

    return SkillTransfer(
        user=user,
        from_role=user.target_career or "(none)",
        to_role=(template or {}).get("title", target_role_key),
        carried_labels=carried,
        gap_labels=gaps,
        overlap=round(min(overlap, 1.0), 4),
    )


@transaction.atomic
def apply_pivot(user, target_role_key: str) -> SkillTransfer:
    """
    Rebuild the user's roadmap for a new role, preserving carried modules.

    Everything runs in one transaction. The previous implementation deleted
    outside a transaction and swallowed exceptions into a generic 500, which
    could leave a user with ``target_career`` pointing at a role whose
    roadmap had been half-deleted.
    """
    from .models import User

    template = get_role_template(target_role_key)
    if not template:
        raise ValueError(f"Unknown role: {target_role_key!r}")

    target_modules = template["modules"]

    transfer = compute_transfer(user, target_role_key)
    transfer.save()

    old_role = user.target_career
    user.target_career = template["title"]
    user.save(update_fields=["target_career"])

    # Preserve the evidence: keep completed modules that still map to the new
    # role. Everything else in the old roadmap is about to be replaced.
    carried_labels = set(transfer.carried_labels)
    UserRoadmapItem.objects.filter(user=user).exclude(
        status="completed", label__in=carried_labels
    ).delete()

    existing_labels = set(
        UserRoadmapItem.objects.filter(user=user).values_list("label", flat=True)
    )

    # Walk the new catalog in order. A module the user has already proved is
    # marked completed and stays there; otherwise it is appended in sequence.
    next_order = (
        UserRoadmapItem.objects.filter(user=user).count()
    )

    for module in target_modules:
        label = module.get("label", "")
        if label in existing_labels:
            continue

        resources = dict(module.get("resources", {}) or {})
        resources["lesson_outline"] = module.get("lessons", []) or []
        resources["_connections"] = module.get("connections", []) or []
        resources["_node_type"] = module.get("node_type", "core")

        UserRoadmapItem.objects.create(
            user=user,
            label=label,
            description=module.get("description", ""),
            step_order=next_order,
            # Carried modules stay done; the first new one becomes active so
            # the roadmap is never stranded with nothing to work on.
            status="completed" if label in carried_labels else "locked",
            market_value=module.get("market_value", "Med"),
            resources=resources,
            project_prompt=module.get("project_prompt", ""),
        )
        next_order += 1

    # Exactly one active module: the first not-yet-completed one.
    pending = (
        UserRoadmapItem.objects.filter(user=user, status="locked")
        .order_by("step_order")
        .first()
    )
    if pending:
        UserRoadmapItem.objects.filter(user=user, status="active").update(status="locked")
        pending.status = "active"
        pending.save(update_fields=["status"])
    else:
        # Everything in the new role is already done. Mark the road complete
        # rather than leaving the user on an inert map.
        UserRoadmapItem.objects.filter(user=user, status="active").update(
            status="completed"
        )

    transfer.refresh_from_db()
    transfer.from_role = old_role or transfer.from_role
    transfer.save(update_fields=["from_role"])
    return transfer