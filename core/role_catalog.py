"""
Role-Based Roadmap Catalog — Registry
======================================
Thin registry that imports comprehensive career-path catalogs
from ``core.catalogs.*`` and exposes lookup helpers used by
views and the onboarding flow.

Each catalog module lives in its own file under ``core/catalogs/``
and defines a single dict constant with the schema:
  role, title, description, modules[]
    └─ label, description, market_value, node_type,
       connections[], project_prompt, resources{}, lessons[]
"""

from core.catalogs import (
    FULL_STACK_DEVELOPER,
    FRONTEND_DEVELOPER,
    BACKEND_DEVELOPER,
    DATA_SCIENTIST,
    DEVOPS_ENGINEER,
    MOBILE_DEVELOPER,
)

# ── Registry of all available role templates ─────────────────────
ROLE_CATALOG = {
    "fullstack": FULL_STACK_DEVELOPER,
    "frontend": FRONTEND_DEVELOPER,
    "backend": BACKEND_DEVELOPER,
    "data": DATA_SCIENTIST,
    "devops": DEVOPS_ENGINEER,
    "mobile": MOBILE_DEVELOPER,
}


def get_role_template(role_key: str) -> dict | None:
    """Return a role template dict or None if not found."""
    return ROLE_CATALOG.get(role_key)


def get_available_roles() -> list[dict]:
    """Return list of available roles for frontend dropdown."""
    return [
        {"key": k, "title": v["title"], "description": v["description"], "module_count": len(v["modules"])}
        for k, v in ROLE_CATALOG.items()
        if v.get("modules")
    ]


def suggest_role_for_course(university_course: str, chosen_role: str) -> str | None:
    """
    If the user has a university course, suggest an alternative role
    that may leverage their existing knowledge.
    Returns suggested role key or None.
    """
    if not university_course or len(university_course.strip()) < 3:
        return None

    course_lower = university_course.lower()

    # Mapping of course keywords to potentially better-fitting roles
    course_to_role = {
        "accounting": "fullstack",  # data-heavy, good for dashboards
        "finance": "fullstack",
        "mathematics": "data",
        "statistics": "data",
        "physics": "data",
        "economics": "data",
        "business": "fullstack",
        "marketing": "frontend",
        "design": "frontend",
        "art": "frontend",
        "electrical": "devops",
        "mechanical": "devops",
        "computer science": "fullstack",
        "information technology": "fullstack",
        "software": "fullstack",
    }

    for keyword, suggested_role in course_to_role.items():
        if keyword in course_lower and suggested_role != chosen_role:
            # Only suggest if it's different from what they chose
            template = ROLE_CATALOG.get(suggested_role)
            if template:
                return suggested_role

    return None
