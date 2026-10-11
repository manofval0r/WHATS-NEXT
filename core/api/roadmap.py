"""
Roadmap generation, project submission, scoring and certificates.

Moved out of core/views.py.
"""

from core.api._base import *  # noqa: F401,F403

FALLBACK_ROADMAPS = {
    "software engineering": [
        {
            "label": "HTML & CSS Foundations",
            "description": "Master semantic HTML, modern CSS layout (Flexbox/Grid), and accessibility fundamentals to build resilient pages.",
            "market_value": "Low",
            "project_prompt": "Ship a responsive portfolio with at least three sections and basic ARIA landmarks.",
            "resources": {
                "primary": [
                    {"title": "MDN HTML Guide", "url": "https://developer.mozilla.org/en-US/docs/Learn/HTML", "type": "docs"},
                    {"title": "Flexbox Froggy", "url": "https://flexboxfroggy.com/", "type": "interactive"}
                ],
                "additional": [
                    {"title": "Grid Garden", "url": "https://cssgridgarden.com/", "type": "interactive"},
                    {"title": "ARIA Landmarks", "url": "https://www.w3.org/TR/wai-aria-practices/examples/landmarks/", "type": "docs"}
                ]
            }
        },
        {
            "label": "JavaScript Essentials",
            "description": "Learn modern JavaScript (ES2020+), DOM manipulation, fetch API, and error handling to build interactive experiences.",
            "market_value": "Med",
            "project_prompt": "Build a data-powered dashboard that fetches an API, handles loading/error states, and includes keyboard navigation.",
            "resources": {
                "primary": [
                    {"title": "You Don't Know JS (Scopes)", "url": "https://github.com/getify/You-Dont-Know-JS", "type": "docs"},
                    {"title": "Frontend Mentor - API Challenge", "url": "https://www.frontendmentor.io/challenges?difficulties=3-4", "type": "interactive"}
                ],
                "additional": [
                    {"title": "MDN Fetch", "url": "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch", "type": "docs"},
                    {"title": "Async JS Crash Course", "url": "https://youtu.be/PoRJizFvM7s", "type": "video"}
                ]
            }
        },
        {
            "label": "Backend API Basics",
            "description": "Understand REST, authentication, and persistence. Practice with a minimal Python/Node API and deploy it.",
            "market_value": "High",
            "project_prompt": "Ship a CRUD API with validation and deploy to a free host (Render/Fly) including a short README.",
            "resources": {
                "primary": [
                    {"title": "Django REST Quickstart", "url": "https://www.django-rest-framework.org/tutorial/quickstart/", "type": "docs"},
                    {"title": "Railway Deploy Guide", "url": "https://docs.railway.app/deploy/deployments", "type": "docs"}
                ],
                "additional": [
                    {"title": "HTTP Status Cheat Sheet", "url": "https://http.cat/", "type": "docs"},
                    {"title": "Postman Collections", "url": "https://learning.postman.com/docs/publishing-your-api/collections/", "type": "docs"}
                ]
            }
        }
    ],
    "data analysis": [
        {
            "label": "Python & Pandas",
            "description": "Load, clean, and explore datasets using pandas; visualize quick wins with seaborn.",
            "market_value": "Low",
            "project_prompt": "Publish a notebook that cleans a messy CSV, calculates 3 KPIs, and plots two charts.",
            "resources": {
                "primary": [
                    {"title": "Pandas 10 Minutes", "url": "https://pandas.pydata.org/pandas-docs/stable/user_guide/10min.html", "type": "docs"},
                    {"title": "Seaborn Tutorial", "url": "https://seaborn.pydata.org/tutorial.html", "type": "docs"}
                ],
                "additional": [
                    {"title": "Kaggle Getting Started", "url": "https://www.kaggle.com/learn/intro-to-programming", "type": "interactive"}
                ]
            }
        },
        {
            "label": "SQL for Analysts",
            "description": "Practice SELECT, JOIN, GROUP BY, and window functions for analytics questions.",
            "market_value": "Med",
            "project_prompt": "Answer 5 business questions on a sample database and document each query with comments.",
            "resources": {
                "primary": [
                    {"title": "Mode SQL Tutorial", "url": "https://mode.com/sql-tutorial/", "type": "interactive"},
                    {"title": "Postgres Window Functions", "url": "https://www.postgresql.org/docs/current/tutorial-window.html", "type": "docs"}
                ]
            }
        },
        {
            "label": "Storytelling Dashboard",
            "description": "Design a concise dashboard with annotations, highlighting a narrative for stakeholders.",
            "market_value": "High",
            "project_prompt": "Create a 1-page dashboard (Streamlit or Tableau Public) with filters, insights, and accessibility notes.",
            "resources": {
                "primary": [
                    {"title": "Streamlit 30 Days", "url": "https://docs.streamlit.io/knowledge-base/tutorials", "type": "docs"},
                    {"title": "Data Viz Accessibility", "url": "https://www.smashingmagazine.com/2021/03/guide-accessible-data-visualizations/", "type": "docs"}
                ]
            }
        }
    ]
}


def build_fallback_modules(target_career: str):
    key = (target_career or "").strip().lower()
    modules = FALLBACK_ROADMAPS.get(key) or FALLBACK_ROADMAPS.get('software engineering') or []
    enriched = []
    for module in modules:
        resources = module.get('resources', {}) or {}
        resources['is_fallback'] = True
        enriched.append({
            "label": module.get('label', 'Module'),
            "description": module.get('description', ''),
            "market_value": module.get('market_value', 'Med'),
            "project_prompt": module.get('project_prompt', ''),
            "resources": resources,
        })
    return enriched


def calculate_current_streak(user):
    today = datetime.now().date()
    dates = list(UserActivity.objects.filter(user=user).values_list('date', flat=True).order_by('-date'))

    if not dates:
        return 0

    current_streak = 0
    check_date = today
    if today not in dates:
        check_date = today - timedelta(days=1)
        if check_date not in dates:
            return 0

    while check_date in dates:
        current_streak += 1
        check_date -= timedelta(days=1)
    return current_streak


def award_badges(user):
    completed_count = UserRoadmapItem.objects.filter(user=user, status='completed').count()
    verified_count = UserRoadmapItem.objects.filter(user=user, verification_status='passed').count()
    community_xp = getattr(user, 'community_xp', 0)
    current_streak = calculate_current_streak(user)

    badge_specs = [
        ('first_module', 'First Module', 'Complete your first module', completed_count >= 1),
        ('modules_5', 'Five Modules', 'Complete five modules', completed_count >= 5),
        ('modules_10', 'Ten Modules', 'Complete ten modules', completed_count >= 10),
        ('verified_project', 'Verified Project', 'Pass your first project verification', verified_count >= 1),
        ('verified_5', 'Five Verifications', 'Pass five project verifications', verified_count >= 5),
        ('streak_7', '7-Day Streak', 'Maintain a 7-day learning streak', current_streak >= 7),
        ('streak_30', '30-Day Streak', 'Maintain a 30-day learning streak', current_streak >= 30),
        ('community_contributor', 'Community Contributor', 'Earn 100 community XP from posts and replies', community_xp >= 100),
    ]

    for badge_type, title, description, condition in badge_specs:
        if condition:
            Badge.objects.get_or_create(
                user=user,
                badge_type=badge_type,
                defaults={"title": title, "description": description}
            )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_onboarding(request):
    """
    Complete onboarding using role-based roadmap templates.
    Accepts: role (key from catalog), level (novice/apprentice/pro/expert),
             university_course (optional), budget, gender.
    Loads pre-built roadmap from catalog — no more per-user AI generation.
    """
    user = request.user

    # Extract data
    role_key = request.data.get('role', '').strip().lower()
    niche = request.data.get('niche', '').strip()  # legacy compat
    university_course = request.data.get('university_course', '').strip()
    budget = request.data.get('budget', 'FREE').upper()
    gender = request.data.get('gender', '').strip().lower()
    level = request.data.get('level', '').strip().lower()

    # Accept either 'role' (new) or 'niche' (legacy)
    if not role_key and niche:
        # Map legacy niche strings to role keys
        niche_to_role = {
            'full stack developer': 'fullstack',
            'frontend developer': 'frontend',
            'backend developer': 'backend',
            'data scientist': 'data',
            'devops engineer': 'devops',
            'mobile developer': 'mobile',
        }
        role_key = niche_to_role.get(niche.lower(), 'fullstack')

    if not role_key:
        return Response({"error": "Career role is required"}, status=400)

    # Validate gender
    allowed_genders = {'unspecified', 'female', 'male', 'nonbinary'}
    if gender and gender not in allowed_genders:
        return Response({"error": f"Gender must be one of {sorted(allowed_genders)}"}, status=400)

    # Load role template from catalog
    template = get_role_template(role_key)
    custom_niche = request.data.get('custom_niche', '').strip()

    # If role is 'custom' or not found in catalog, generate dynamically via AI
    is_custom_role = role_key == 'custom' or (not template and custom_niche)
    if is_custom_role:
        if not custom_niche and niche:
            custom_niche = niche
        if not custom_niche:
            return Response({"error": "Please provide a career description for custom roles"}, status=400)
    elif not template:
        return Response({"error": f"Role '{role_key}' is not available yet"}, status=400)

    try:
        # Determine the role title and module data
        if is_custom_role:
            role_title = custom_niche.title()
            # Generate custom roadmap via AI
            from core.ai_logic import generate_detailed_roadmap
            modules = generate_detailed_roadmap(custom_niche, university_course, budget)
            if not modules or len(modules) == 0:
                return Response({"error": "Failed to generate a custom roadmap. Please try a different role."}, status=500)
        else:
            role_title = template["title"]
            modules = template["modules"]

        # Update user profile
        user.target_career = role_title
        user.university_course_raw = university_course
        user.budget_preference = budget
        if gender:
            user.gender = gender
        # Persist experience level
        level_map = {'novice': 'Beginner', 'apprentice': 'Intermediate', 'pro': 'Advanced', 'expert': 'Expert'}
        if level and level in level_map:
            user.current_level = level_map[level]
        user.save()

        # Clear existing roadmap and load modules
        UserRoadmapItem.objects.filter(user=user).delete()

        created_items = []
        for i, module_data in enumerate(modules):
            item_status = 'active' if i == 0 else 'locked'
            resources = module_data.get('resources', {})
            if module_data.get('lessons'):
                resources['lesson_outline'] = module_data['lessons']
            # Store connections and node_type in resources for frontend graph rendering
            resources['_connections'] = module_data.get('connections', [])
            resources['_node_type'] = module_data.get('node_type', 'core')

            item = UserRoadmapItem.objects.create(
                user=user,
                step_order=i,
                label=module_data.get('label', f'Module {i+1}'),
                description=module_data.get('description', ''),
                status=item_status,
                market_value=module_data.get('market_value', 'Med'),
                resources=resources,
                project_prompt=module_data.get('project_prompt', 'No project defined')
            )
            created_items.append(item)

        source = 'ai-generated' if is_custom_role else role_key
        print(f"[ONBOARDING] Loaded {len(created_items)} modules from '{source}' for {user.username}")

        # PostHog: track onboarding completion
        ph_capture(user, 'onboarding_completed', {
            'role': role_key if not is_custom_role else 'custom',
            'role_title': role_title,
            'level': level,
            'module_count': len(created_items),
            'is_custom': is_custom_role,
        })

        return Response({
            "message": "Onboarding complete! Roadmap loaded.",
            "modules_created": len(created_items),
            "role": role_key if not is_custom_role else 'custom',
            "role_title": role_title,
        }, status=200)

    except Exception as e:
        import traceback
        print(f"[ONBOARDING ERROR] {type(e).__name__}: {e}")
        traceback.print_exc()
        return Response({
            "error": "Failed to load your roadmap. Please try again.",
            "technical_details": f"{type(e).__name__}: {e}" if settings.DEBUG else None
        }, status=500)


@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def get_my_roadmap(request):
    user = request.user

    def _format_items(items_qs):
        formatted_nodes = []
        formatted_edges = []
        items_list = list(items_qs)

        order_to_label = {item.step_order: (item.label or '') for item in items_list}

        # Build step_order → real DB id lookup for connection-based edges
        order_to_id = {item.step_order: str(item.id) for item in items_list}

        for i, item in enumerate(items_list):
            node_id = str(item.id)
            resources = item.resources or {}
            node_type = resources.pop('_node_type', 'core')
            connections = resources.pop('_connections', [])

            # Module progress is backend-provided. We currently use github_score (0-100)
            # as a stable proxy where available.
            try:
                score = int(item.github_score or 0)
            except Exception:
                score = 0
            score = max(0, min(100, score))

            if item.status == 'completed':
                progress_percent = 100
            elif item.status == 'active':
                progress_percent = score
            else:
                progress_percent = 0

            unlock_hint = None
            if item.status == 'locked':
                prev_label = order_to_label.get(item.step_order - 1) or ''
                if prev_label:
                    unlock_hint = f"Finish {prev_label} to unlock"
                else:
                    unlock_hint = "Finish the previous module to unlock"

            formatted_nodes.append({
                "id": node_id,
                "type": "customNode",
                "position": {"x": 250, "y": 500 + (i * 150)},
                "data": {
                    "label": item.label,
                    "status": item.status,
                    "description": item.description,
                    "market_value": item.market_value,
                    "resources": resources,
                    "project_prompt": item.project_prompt,
                    "node_type": node_type,
                    "step_order": item.step_order,
                    "progress_percent": progress_percent,
                    "unlock_hint": unlock_hint,
                    # ── Verification ──────────────────────────────────────
                    # These four were missing from the node payload, so the
                    # "submit your project" panel rendered against
                    # ``data.verification_project`` -- a field that existed
                    # nowhere in the backend -- and therefore NEVER RENDERED.
                    # That made the entire Build & Verify step unreachable,
                    # and with it every downstream feature: XP, streaks,
                    # certificates, the portfolio and the CV, all of which
                    # require a completed module, and only this endpoint can
                    # produce one.
                    #
                    # Derived, not stored: a module requires a submission
                    # exactly when the catalog gave it a project prompt.
                    "verification_project": bool(item.project_prompt),
                    "project_submission_link": item.project_submission_link,
                    "github_score": item.github_score,
                    "score_breakdown": item.score_breakdown,
                    "verification_status": item.verification_status,
                    "verification_count": item.verification_count,
                },
            })

            # Build edges from explicit connections stored in the catalog
            if connections:
                for target_order in connections:
                    target_id = order_to_id.get(target_order)
                    if target_id and target_id != node_id:
                        formatted_edges.append({
                            "id": f"e{node_id}-{target_id}",
                            "source": node_id,
                            "target": target_id,
                            "animated": True,
                            "style": {"stroke": "#6C63FF"},
                        })
            elif i > 0:
                # Fallback: sequential edge for legacy roadmaps without connections
                prev_id = str(items_list[i - 1].id)
                formatted_edges.append({
                    "id": f"e{prev_id}-{node_id}",
                    "source": prev_id,
                    "target": node_id,
                    "animated": True,
                    "style": {"stroke": "#6C63FF"},
                })

        is_fallback = False
        if items_list:
            is_fallback = (items_list[0].resources or {}).get('is_fallback', False)

        return formatted_nodes, formatted_edges, is_fallback
    
    # Handle DELETE request (clear roadmap for regeneration)
    if request.method == 'DELETE':
        print(f"\n=== DELETE ROADMAP REQUEST ===")
        print(f"User: {user.username}")
        deleted_count, _ = UserRoadmapItem.objects.filter(user=user).delete()
        print(f"Deleted {deleted_count} roadmap items")
        return Response({"message": f"Deleted {deleted_count} roadmap items"}, status=204)
    
    # Handle POST request (fetch or generate roadmap)
    print(f"\n=== ROADMAP REQUEST ===")
    print(f"User: {user.username}")
    print(f"Target Career: {user.target_career}")
    print(f"Course: {user.normalized_course or user.university_course_raw}")
    print(f"Budget: {user.budget_preference}")
    print(f"Request data type: {type(request.data)}")
    print(f"Request data: {request.data}")
    
    # Check for force_regenerate parameter
    force_regenerate = request.data.get('force_regenerate', False) if request.data else False
    print(f"Force regenerate: {force_regenerate}")
    
    # CRITICAL FIX A6: Optimize query to avoid N+1 issues
    existing_items = UserRoadmapItem.objects.filter(user=user).select_related('user').prefetch_related('comments', 'reviews').order_by('step_order')
    
    if existing_items.exists() and not force_regenerate:
        print(f"Found existing roadmap with {existing_items.count()} items in database")
        formatted_nodes, formatted_edges, is_fallback = _format_items(existing_items)
        print(f"Returning {len(formatted_nodes)} nodes from database")
        return Response({ 
            "nodes": formatted_nodes, 
            "edges": formatted_edges, 
            "is_fallback": is_fallback 
        })

    # Generate roadmap synchronously (new or force_regenerate)
    if force_regenerate:
        print("Force regenerate requested")
    else:
        print("No existing roadmap, generating new one...")

    # De-dupe rapid regen requests and prevent overwriting a good roadmap with fallback.
    from django.core.cache import cache
    lock_key = f"roadmap_gen_lock:{user.id}"
    if cache.get(lock_key):
        if existing_items.exists():
            formatted_nodes, formatted_edges, is_fallback = _format_items(existing_items)
            return Response({
                "error": "AI is busy generating your roadmap. Please try again in a moment.",
                "nodes": formatted_nodes,
                "edges": formatted_edges,
                "is_fallback": is_fallback,
                "generation_in_progress": True
            }, status=200)

        return Response({
            "error": "AI is generating your roadmap. Please wait a moment.",
            "nodes": [],
            "edges": [],
            "generation_in_progress": True
        }, status=202)
    cache.set(lock_key, True, timeout=120)
    
    from core.ai_logic import generate_detailed_roadmap
    
    niche = user.target_career or 'Software Development'
    uni_course = user.normalized_course or user.university_course_raw or 'Self-taught'
    budget = user.budget_preference or 'FREE'
    
    try:
        print(f"Calling generate_detailed_roadmap({niche}, {uni_course}, {budget})")
        modules, ai_meta = generate_detailed_roadmap(niche, uni_course, budget, return_meta=True)
        if not modules:
            raise ValueError("AI returned no modules; using offline fallback")
        print(f"Generated {len(modules)} modules")

        from django.db import transaction
        with transaction.atomic():
            # Only replace roadmap after we have a valid response.
            UserRoadmapItem.objects.filter(user=user).delete()

            created_items = []
            for i, module in enumerate(modules):
                resources = module.get('resources', {}) or {}
                if module.get('lessons'):
                    resources['lesson_outline'] = module.get('lessons')

                item = UserRoadmapItem.objects.create(
                    user=user,
                    step_order=i,
                    label=module.get('label', 'Module'),
                    description=module.get('description', ''),
                    status='active' if i == 0 else 'locked',
                    market_value=module.get('market_value', 'Med'),
                    resources=resources,
                    project_prompt=module.get('project_prompt', '')
                )
                created_items.append(item)

        formatted_nodes, formatted_edges, _ = _format_items(created_items)
        print(f"Returning {len(formatted_nodes)} nodes after generation")
        return Response({"nodes": formatted_nodes, "edges": formatted_edges})

    except Exception as e:
        import traceback
        print(f"\n!!! ERROR GENERATING ROADMAP !!!")
        print(f"Exception: {type(e).__name__}: {str(e)}")
        traceback.print_exc()

        # If we already have a roadmap, keep it rather than overwriting with fallback.
        if existing_items.exists():
            kept_nodes, kept_edges, is_fallback = _format_items(existing_items)
            return Response({
                "nodes": kept_nodes,
                "edges": kept_edges,
                "is_fallback": is_fallback,
                "regen_failed": True
            })

        fallback_modules = build_fallback_modules(niche)
        if fallback_modules:
            created_items = []
            for i, module in enumerate(fallback_modules):
                item = UserRoadmapItem.objects.create(
                    user=user,
                    step_order=i,
                    label=module.get('label', 'Module'),
                    description=module.get('description', ''),
                    status='active' if i == 0 else 'locked',
                    market_value=module.get('market_value', 'Med'),
                    resources=module.get('resources', {}),
                    project_prompt=module.get('project_prompt', '')
                )
                created_items.append(item)

            formatted_nodes = []
            formatted_edges = []
            for i, item in enumerate(created_items):
                node_id = str(item.id)
                formatted_nodes.append({
                    "id": node_id,
                    "type": "customNode",
                    "position": { "x": 250, "y": 500 + (i * 150) },
                    "data": {
                        "label": item.label,
                        "status": item.status,
                        "description": item.description,
                        "market_value": item.market_value,
                        "resources": item.resources,
                        "project_prompt": item.project_prompt
                    }
                })
                if i > 0:
                    prev_id = str(created_items[i-1].id)
                    formatted_edges.append({
                        "id": f"e{prev_id}-{node_id}",
                        "source": prev_id,
                        "target": node_id,
                        "animated": True,
                        "style": { "stroke": "#00f2ff" }
                    })

            print(f"Returning offline fallback roadmap with {len(formatted_nodes)} nodes")
            return Response({
                "nodes": formatted_nodes,
                "edges": formatted_edges,
                "is_fallback": True
            })

        return Response({
            "error": str(e),
            "type": type(e).__name__,
            "trace": traceback.format_exc(),
            "nodes": [],
            "edges": []
        }, status=500)

    finally:
        cache.delete(lock_key)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_roadmap_status(request, task_id):
    """
    Check the status of async roadmap generation task.
    """
    from celery.result import AsyncResult
    
    task = AsyncResult(task_id)
    user = request.user
    
    if task.ready():
        items = UserRoadmapItem.objects.filter(user=user).order_by('step_order')
        
        if items.exists():
            formatted_nodes = []
            formatted_edges = []
            for i, item in enumerate(items):
                node_id = str(item.id)
                formatted_nodes.append({
                    "id": node_id,
                    "type": "customNode",
                    "position": { "x": 250, "y": 500 + (item.step_order * 150) },
                    "data": {
                        "label": item.label,
                        "status": item.status,
                        "description": item.description,
                        "market_value": item.market_value,
                        "resources": item.resources,
                        "project_prompt": item.project_prompt
                    }
                })
                if i > 0:
                    prev_id = str(items[i-1].id)
                    formatted_edges.append({
                        "id": f"e{prev_id}-{node_id}",
                        "source": prev_id,
                        "target": node_id,
                        "animated": True,
                        "style": { "stroke": "#00f2ff" }
                    })
            
            return Response({
                "status": "complete",
                "nodes": formatted_nodes,
                "edges": formatted_edges
            })
        else:
            return Response({"status": "error", "message": "Roadmap generation failed"}, status=500)
    
    elif task.failed():
        return Response({"status": "error", "message": "Task failed"}, status=500)
    
    return Response({"status": "pending"})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def preview_project_score(request):
    """
    Preview the score of a GitHub project before final submission.
    Allows users to see what checks pass/fail without committing.
    """
    from core.project_scoring import score_github_project, MINIMUM_SCORE_THRESHOLD
    
    submission_link = request.data.get('link', '').strip()
    module_id = request.data.get('module_id')
    
    if not submission_link:
        return Response({"error": "GitHub URL is required"}, status=400)
    
    if not submission_link.startswith(('http://', 'https://')):
        return Response({"error": "Link must be a valid URL"}, status=400)
    
    # Get module label for tech matching (optional)
    module_label = ""
    if module_id:
        try:
            module = UserRoadmapItem.objects.get(id=module_id, user=request.user)
            module_label = module.label
        except UserRoadmapItem.DoesNotExist:
            pass
    
    # Score the project
    score_result = score_github_project(submission_link, module_label)
    
    return Response({
        "score": score_result.get("score", 0),
        "passed": score_result.get("passed", False),
        "valid": score_result.get("valid", False),
        "checks": score_result.get("checks", {}),
        "suggestions": score_result.get("suggestions", []),
        "metadata": score_result.get("metadata", {}),
        "threshold": MINIMUM_SCORE_THRESHOLD
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_project(request, node_id):
    """
    Submit a project for verification.
    - Scores GitHub projects automatically
    - Blocks completion if score < threshold
    - Persists score and breakdown to database
    - Only marks module complete if verification passes
    """
    from core.project_scoring import score_github_project, MINIMUM_SCORE_THRESHOLD
    
    user = request.user
    submission_link = request.data.get('link', '').strip()
    
    if not submission_link:
        return Response({"error": "Project link is required"}, status=400)
    
    # Basic URL validation
    if not submission_link.startswith(('http://', 'https://')):
        return Response({"error": "Link must be a valid URL (http:// or https://)"}, status=400)
    
    if len(submission_link) > 2048:
        return Response({"error": "Link exceeds maximum length"}, status=400)

    try:
        node = UserRoadmapItem.objects.get(id=node_id, user=user)
    except UserRoadmapItem.DoesNotExist:
        return Response({"error": "Module not found"}, status=404)
    
    # Check if already completed
    if node.status == 'completed' and node.verification_status == 'passed':
        return Response({
            "error": "This module has already been verified",
            "status": node.status,
            "verification_status": node.verification_status
        }, status=400)
    
    # Score GitHub submissions
    score_result = None
    if 'github.com' in submission_link.lower():
        score_result = score_github_project(submission_link, node.label)
        
        # Persist score data to the module
        node.github_score = score_result.get("score", 0)
        node.score_breakdown = score_result
        node.project_submission_link = submission_link
        
        # Check if passed threshold
        if not score_result.get("passed", False):
            # FAILED - Don't mark as complete
            node.verification_status = 'failed'
            node.save()
            
            return Response({
                "success": False,
                "message": f"Project score ({score_result['score']}) is below the minimum threshold ({MINIMUM_SCORE_THRESHOLD}). Please improve your project and try again.",
                "node_id": str(node.id),
                "status": node.status,
                "verification_status": "failed",
                "score": score_result.get("score", 0),
                "threshold": MINIMUM_SCORE_THRESHOLD,
                "checks": score_result.get("checks", {}),
                "suggestions": score_result.get("suggestions", []),
                "metadata": score_result.get("metadata", {})
            }, status=400)
        
        # PASSED - Mark as completed
        node.verification_status = 'passed'
        node.status = 'completed'
        node.save()
        
        # Unlock next node
        next_node = UserRoadmapItem.objects.filter(
            user=user, 
            step_order=node.step_order + 1
        ).first()
        
        next_data = None
        if next_node and next_node.status == 'locked':
            next_node.status = 'active'
            next_node.save()
            next_data = {"id": str(next_node.id), "status": "active"}
        
        # Log activity for streak (atomic — see core/activity.py)
        record_activity(user)

        # Award XP through the ledger rather than recomputing from counters.
        # Keyed on the item id, so resubmitting the same project pays once.
        xp_award(user, "project_verified", reference=str(node.id))
        xp_award(user, "module_completed", reference=str(node.id))

        # Fire-and-forget. Dispatched through the shared_task handle so a
        # missing broker degrades to "no email" rather than a 500 on the
        # request that just completed the user's module.
        try:
            from core.email_tasks import send_module_completion_email

            send_module_completion_email.delay(user.pk, node.id)
        except Exception:  # noqa: BLE001
            logger.warning("could not dispatch completion email", exc_info=True)

        award_badges(user)
        
        return Response({
            "success": True,
            "message": "Project verified successfully! Module completed.",
            "node_id": str(node.id),
            "status": "completed",
            "verification_status": "passed",
            "score": score_result.get("score", 0),
            "checks": score_result.get("checks", {}),
            "suggestions": score_result.get("suggestions", []),
            "metadata": score_result.get("metadata", {}),
            "next_node": next_data
        })
    
    else:
        # Non-GitHub URL - store but mark as pending (Phase 7: manual review)
        node.project_submission_link = submission_link
        node.verification_status = 'pending'
        node.save()
        
        return Response({
            "success": False,
            "message": "Only GitHub repositories are supported for automatic verification. Please submit a GitHub repository URL.",
            "node_id": str(node.id),
            "status": node.status,
            "verification_status": "pending"
        }, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_certificate(request, item_id):
    """
    Get certificate data for a verified module.
    Returns certificate info if exists, or generates one if module is verified.
    """
    from core.models import Certificate
    
    user = request.user
    
    try:
        item = UserRoadmapItem.objects.get(id=item_id, user=user)
    except UserRoadmapItem.DoesNotExist:
        return Response({"error": "Module not found"}, status=404)
    
    # Check if module is verified
    if item.verification_status != 'passed':
        return Response({
            "error": "Certificate not available. Module must be verified first.",
            "verification_status": item.verification_status
        }, status=400)
    
    # Get or create certificate
    try:
        certificate = Certificate.objects.get(roadmap_item=item)
    except Certificate.DoesNotExist:
        # Generate new certificate
        certificate_id = Certificate.generate_certificate_id(item.label)
        certificate = Certificate.objects.create(
            certificate_id=certificate_id,
            user=user,
            roadmap_item=item,
            github_score=item.github_score,
            peer_verifications=item.verification_count,
            score_breakdown=item.score_breakdown,
            github_repo_url=item.project_submission_link or ""
        )
    
    return Response({
        "certificate_id": certificate.certificate_id,
        "module_label": item.label,
        "module_description": item.description,
        "issued_at": certificate.issued_at.isoformat(),
        "github_score": certificate.github_score,
        "peer_verifications": certificate.peer_verifications,
        "github_repo_url": certificate.github_repo_url,
        "user": {
            "username": user.username,
            "target_career": user.target_career
        }
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_certificate_pdf(request, item_id):
    """
    Generate an HTML certificate on-demand.
    Returns the HTML content that can be converted to PDF client-side.
    """
    from core.certificate_generator import generate_certificate_html
    from core.models import Certificate
    from django.http import HttpResponse
    
    user = request.user
    
    try:
        item = UserRoadmapItem.objects.get(id=item_id, user=user)
    except UserRoadmapItem.DoesNotExist:
        return Response({"error": "Module not found"}, status=404)
    
    if item.verification_status != 'passed':
        return Response({
            "error": "Certificate not available. Module must be verified first."
        }, status=400)
    
    # Get or create certificate
    try:
        certificate = Certificate.objects.get(roadmap_item=item)
    except Certificate.DoesNotExist:
        certificate_id = Certificate.generate_certificate_id(item.label)
        certificate = Certificate.objects.create(
            certificate_id=certificate_id,
            user=user,
            roadmap_item=item,
            github_score=item.github_score,
            peer_verifications=item.verification_count,
            score_breakdown=item.score_breakdown,
            github_repo_url=item.project_submission_link or ""
        )
    
    # Generate HTML
    html_content = generate_certificate_html(certificate, user, item)
    
    response = HttpResponse(html_content, content_type='text/html')
    response['Content-Disposition'] = f'attachment; filename="certificate_{certificate.certificate_id}.html"'
    return response


__all__ = [
    "FALLBACK_ROADMAPS",
    "award_badges",
    "build_fallback_modules",
    "calculate_current_streak",
    "check_roadmap_status",
    "complete_onboarding",
    "generate_certificate_pdf",
    "get_certificate",
    "get_my_roadmap",
    "preview_project_score",
    "submit_project",
]
