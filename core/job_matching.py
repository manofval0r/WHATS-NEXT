"""
Explainable job matching.

This replaces the employer/recruiter job board that used to live here.

Why the change
--------------
The old feature was a two-sided marketplace: employers created profiles,
posted listings, and candidates applied. With no employers it had no
products, so the only way to demonstrate it was to seed fake listings --
which is worse than not shipping it, because a portfolio piece that
demonstrates fake data teaches a reader to distrust every other number on
the page.

What this does instead
----------------------
The project already pulls a real, live job feed (WeWorkRemotely, Remotive,
Hacker News). This module ranks that feed against the modules a user has
actually completed and returns, for each job, the specific reasons it
matched. Read-only. No employer accounts. No applications. No database rows.
Every number shown derives from something real, and every match explains
itself.

The matching is deliberately simple and inspectable rather than clever:
a canonical skill taxonomy maps both sides to the same vocabulary, and the
score is the fraction of the job's detected skills that the user already
covers. A user can disagree with the ranking and be right, because they can
see exactly why it ranked what it did.
"""

import re

from .models import UserRoadmapItem
from .news_logic import fetch_jobs_multi

# How long a fetched-and-scored job list stays warm. The upstream feeds
# update on the order of hours; this is an hour, not a day.
JOB_MATCH_CACHE_TTL = 3600


# ==============================================================
# SKILL TAXONOMY
# ==============================================================
# Each canonical skill maps to the surface forms it can appear as in a
# module label or a job posting. Both sides of the comparison go through
# this, so "REST API" in a module and "RESTful services" in a posting
# resolve to the same canonical skill.
SKILL_TAXONOMY: dict[str, tuple[str, ...]] = {
    "html-css": ("html", "css", "sass", "tailwind", "responsive"),
    "javascript": ("javascript", "js", "es6", "ecmascript", "typescript", "ts"),
    "react": ("react", "reactjs", "next.js", "nextjs", "jsx"),
    "node": ("node", "nodejs", "node.js", "express", "npm"),
    "python": ("python", "django", "flask", "fastapi", "pandas", "numpy"),
    "databases": ("sql", "postgres", "postgresql", "mysql", "sqlite",
                  "mongodb", "nosql", "redis", "database"),
    "api-design": ("rest", "restful", "graphql", "api", "grpc", "openapi"),
    "git": ("git", "github", "gitlab", "version control", "ci/cd",
            "cicd", "github actions"),
    "docker": ("docker", "container", "containerisation", "containerization",
               "kubernetes", "k8s"),
    "cloud": ("aws", "azure", "gcp", "google cloud", "cloudflare",
              "vercel", "heroku", "serverless"),
    "testing": ("testing", "test", "tests", "jest", "pytest", "unit test",
                "tdd", "cypress", "playwright"),
    "auth": ("auth", "authentication", "oauth", "jwt", "sso", "security"),
    "devops": ("devops", "ci", "cd", "pipeline", "jenkins", "terraform",
               "ansible", "monitoring"),
    "linux": ("linux", "unix", "bash", "shell"),
    "algorithms": ("algorithm", "data structure", "leetcode", "dsa",
                   "complexity", "big-o"),
    "data-science": ("machine learning", "ml", "pandas", "numpy", "scikit",
                     "tensorflow", "pytorch", "data science", "statistics",
                     "visualisation", "visualization"),
    "mobile": ("android", "ios", "react native", "flutter", "swift", "kotlin"),
    "accessibility": ("accessibility", "a11y", "aria", "wcag"),
    "performance": ("performance", "optimisation", "optimization", "caching",
                    "profiling", "latency"),
    "design-systems": ("design system", "component library", "storybook",
                       "figma", "css architecture"),
}


def _canonical_skills(text: str) -> set[str]:
    """Map free text to the canonical skills it mentions."""
    if not text:
        return set()
    low = text.lower()
    found = set()
    for canonical, aliases in SKILL_TAXONOMY.items():
        for alias in aliases:
            if alias in low:
                found.add(canonical)
                break
    return found


def _user_skill_profile(user) -> tuple[set[str], list[str]]:
    """
    What the user has actually proved, from their completed modules.

    Only ``status='completed'`` counts. A locked or in-progress module is a
    plan, not evidence, and ranking a job against a plan would be a lie.
    """
    items = list(
        UserRoadmapItem.objects
        .filter(user=user, status="completed")
        .values_list("label", "project_prompt")
    )

    skills: set[str] = set()
    labels: list[str] = []
    for label, prompt in items:
        labels.append(label)
        skills |= _canonical_skills(label)
        # The project prompt names the technology far more often than the
        # module title does ("Build a REST API with Django"), so both are read.
        if prompt:
            skills |= _canonical_skills(prompt)

    return skills, labels


def _score_job(job: dict, user_skills: set[str], target_career: str) -> dict:
    """
    Score one job against the user's completed work, and explain the score.

    Returns the job with ``match`` metadata attached. The reasons list is
    the contract: if a reason is not in this list, the UI must not show it.
    """
    title = job.get("title", "") or ""
    description = job.get("description", "") or ""
    blob = f"{title} {description}"

    job_skills = _canonical_skills(blob)

    shared = sorted(job_skills & user_skills)
    reasons: list[str] = []

    # 1. Evidence-backed overlap: the only signal that carries weight.
    if job_skills:
        coverage = len(shared) / len(job_skills)
    else:
        # Nothing recognisable in the posting. Not a zero-score rejection --
        # just no evidence either way.
        coverage = 0.0

    if shared:
        readable = [_PRETTY.get(s, s.replace("-", " ")) for s in shared[:3]]
        reasons.append(
            f"You have completed modules covering {', '.join(readable)}."
        )
    elif job_skills:
        missing = [_PRETTY.get(s, s.replace("-", " ")) for s in sorted(job_skills)[:3]]
        reasons.append(
            f"Gap: this posting mentions {', '.join(missing)}, which your roadmap "
            "has not reached yet."
        )

    # 2. Career alignment. Honest but weak -- it is a string match on the
    # user's own declared target, so it is labelled as such in the UI.
    if target_career:
        career_low = target_career.lower()
        role_bits = {b for b in re.split(r"[^a-z]+", career_low) if len(b) > 3}
        title_low = title.lower()
        if role_bits and any(b in title_low for b in role_bits):
            reasons.append(f"Title matches your target role ({target_career}).")

    # 3. Entry level, straight from the source feed's own check.
    if job.get("is_hot"):
        reasons.append("Listed as entry-level, junior or internship.")

    # Weighted score. Overlap dominates; career alignment is a tiebreaker;
    # entry level is a nudge. There is deliberately no term for "how many
    # modules are complete" -- that would reward grinding over relevance.
    score = round(
        70 * coverage
        + (15 if any(r.startswith("Title matches") for r in reasons) else 0)
        + (10 if job.get("is_hot") else 0),
        1,
    )

    return {
        **job,
        "match_score": score,
        "match_reasons": reasons,
        "skills_matched": shared,
        "skills_missing": sorted(job_skills - user_skills),
    }


# Human-readable names for the canonical skill keys, used in reason strings.
_PRETTY = {
    "html-css": "HTML and CSS",
    "javascript": "JavaScript",
    "react": "React",
    "node": "Node.js",
    "python": "Python",
    "databases": "databases",
    "api-design": "API design",
    "git": "Git",
    "docker": "containers",
    "cloud": "cloud platforms",
    "testing": "testing",
    "auth": "authentication",
    "devops": "DevOps",
    "linux": "Linux",
    "algorithms": "algorithms",
    "data-science": "data science",
    "mobile": "mobile",
    "accessibility": "accessibility",
    "performance": "performance",
    "design-systems": "design systems",
}


def rank_jobs_for(user, *, limit: int = 40) -> list:
    """
    Fetch the live feed and rank it against one user's completed modules.

    Pure enough to test without a request. The HTTP shell lives in
    ``core/api/jobs.py``.

    Returns ``(ranked, meta)`` where meta carries the user's skill profile
    so the caller can report what the ranking was based on.
    """
    target_career = (user.target_career or "").strip()
    user_skills, completed_labels = _user_skill_profile(user)

    if not completed_labels:
        return [], {
            "completed_modules": 0,
            "skills": [],
            "target_career": target_career,
        }

    keywords = list(completed_labels)
    if target_career:
        keywords.append(target_career)

    jobs = fetch_jobs_multi(keywords, career_title=target_career, limit=limit)
    ranked = [_score_job(job, user_skills, target_career) for job in jobs]
    ranked.sort(key=lambda j: (-j["match_score"], j.get("published_ts", "")))

    return ranked, {
        "completed_modules": len(completed_labels),
        "skills": sorted(_PRETTY.get(s, s) for s in user_skills),
        "target_career": target_career,
    }


MATCH_METHOD = (
    "Score = 70% coverage of the skills detected in the posting, plus 15 if "
    "the title matches your target role, plus 10 if the source lists it as "
    "entry-level. Only completed modules count as evidence."
)