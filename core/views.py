from rest_framework import generics
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import RegisterSerializer, ProjectCommentSerializer, UserProfileSerializer
from .models import UserRoadmapItem, UserActivity, ProjectReview, ProjectComment, User, CommunityPost, CommunityReply, Badge
from .ai_logic import generate_detailed_roadmap
from .news_logic import fetch_tech_news, fetch_internships
from django.shortcuts import get_object_or_404
from datetime import datetime, timedelta
from django.db import transaction

from django.utils import timezone
from django.db.models import Count


# Offline fallback roadmaps used when AI is unavailable
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



@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "ok", "message": "Backend is healthy"})

# ==========================================
# 1. AUTHENTICATION
# ==========================================

from django.shortcuts import redirect
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.decorators import login_required

@login_required
def social_login_success(request):
    """
    Callback after successful social login.
    Generates JWT tokens and redirects to frontend with tokens in URL.
    Includes 'needs_onboarding' flag if user hasn't completed profile.
    """
    user = request.user
    refresh = RefreshToken.for_user(user)
    
    # Add custom claim to indicate if user needs onboarding
    needs_onboarding = not user.target_career or user.target_career.strip() == ''
    refresh['needs_onboarding'] = needs_onboarding
    
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)
    
    # Determine frontend URL based on environment
    # In production, settings.DEBUG is False
    frontend_url = "https://whats-next-1.onrender.com/auth-callback"
    if settings.DEBUG:
        frontend_url = "http://localhost:5173/auth-callback"
        
    return redirect(f"{frontend_url}?access={access_token}&refresh={refresh_token}")

class RegisterView(generics.CreateAPIView):
    """
    Handles creating a new user account.
    """
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        print("DEBUG: RegisterView.create called")
        print(f"DEBUG: Request data: {request.data}")
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            import traceback
            print(f"REGISTER ERROR: {str(e)}")
            traceback.print_exc()
            return Response({
                "error": str(e),
                "type": type(e).__name__,
                "trace": traceback.format_exc()
            }, status=500)

# ==========================================
# 1b. COURSE NORMALIZATION (Smart Onboarding)
# ==========================================

@api_view(['POST'])
@permission_classes([AllowAny])
def normalize_course(request):
    """
    Uses AI to normalize and clean university course input.
    """
    from .ai_logic import normalize_university_course
    
    
    raw_course = request.data.get('course_name', '')
    if not raw_course or len(raw_course.strip()) == 0:
        return Response({"normalized": ""})
    
    try:
        normalized = normalize_university_course(raw_course)
        return Response({"normalized": normalized})
    except Exception as e:
        print(f"Normalization error: {e}")
        return Response({"normalized": raw_course})  # Return original if AI fails

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_onboarding(request):
    """
    Complete onboarding for OAuth users by collecting roadmap requirements.
    Accepts: niche (career path), university_course, budget
    Triggers roadmap generation and returns success.
    """
    user = request.user
    
    # Extract data
    niche = request.data.get('niche', '').strip()
    university_course = request.data.get('university_course', '').strip()
    budget = request.data.get('budget', 'FREE').upper()
    gender = request.data.get('gender', '').strip().lower()
    
    # Validate required field
    if not niche:
        return Response({"error": "Career path (niche) is required"}, status=400)
    
    # CRITICAL FIX A7: Input validation
    if len(niche) > 100:
        return Response({"error": "Career path must be less than 100 characters"}, status=400)
    
    if len(university_course) > 200:
        return Response({"error": "Course name must be less than 200 characters"}, status=400)
    
    # Whitelist budget options (match User.budget_preference)
    allowed_budgets = ['FREE', 'PAID']
    if budget not in allowed_budgets:
        return Response({"error": f"Budget must be one of {allowed_budgets}"}, status=400)

    # Whitelist gender options (match User.gender choices)
    allowed_genders = {'unspecified', 'female', 'male', 'nonbinary'}
    if gender and gender not in allowed_genders:
        return Response({"error": f"Gender must be one of {sorted(allowed_genders)}"}, status=400)
    
    try:
        # Update user profile
        user.target_career = niche
        user.university_course_raw = university_course
        user.budget_preference = budget
        if gender:
            user.gender = gender
        user.save()
        
        # Generate roadmap
        print(f"[ONBOARDING] Generating roadmap for {user.username}: {niche}")
        modules = generate_detailed_roadmap(niche, university_course, budget)
        
        # Create roadmap items
        created_items = []
        for i, module_data in enumerate(modules):
            status = 'active' if i == 0 else 'locked'
            resources = module_data.get('resources', {})
            if module_data.get('lessons'):
                resources['lesson_outline'] = module_data.get('lessons')

            item = UserRoadmapItem.objects.create(
                user=user,
                step_order=i + 1,
                label=module_data.get('label', f'Module {i+1}'),
                description=module_data.get('description', ''),
                status=status,
                market_value=module_data.get('market_value', 'Med'),
                resources=resources,
                project_prompt=module_data.get('project_prompt', 'No project defined')
            )
            created_items.append(item)
        
        print(f"[ONBOARDING] Created {len(created_items)} roadmap items")
        
        return Response({
            "message": "Onboarding complete! Roadmap generated.",
            "modules_created": len(created_items)
        }, status=200)
        
    except Exception as e:
        import traceback
        error_type = type(e).__name__
        error_msg = str(e)
        
        print(f"[ONBOARDING ERROR] {error_type}: {error_msg}")
        traceback.print_exc()
        
        # Provide user-friendly error messages
        user_message = "Failed to generate your roadmap. Please try again."
        
        if "timeout" in error_msg.lower() or "timed out" in error_msg.lower():
            user_message = "Roadmap generation is taking longer than expected. Please try again in a moment."
        elif "api" in error_msg.lower() or "gemini" in error_msg.lower():
            user_message = "Our AI service is temporarily unavailable. Please try again shortly."
        elif "database" in error_msg.lower() or "connection" in error_msg.lower():
            user_message = "Database connection issue. Please try again."
        
        return Response({
            "error": user_message,
            "technical_details": f"{error_type}: {error_msg}" if settings.DEBUG else None
        }, status=500)


# ==========================================
# 2. ROADMAP ENGINE (ASYNC)
# ==========================================

@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def get_my_roadmap(request):
    user = request.user

    def _format_items(items_qs):
        formatted_nodes = []
        formatted_edges = []
        items_list = list(items_qs)
        for i, item in enumerate(items_list):
            node_id = str(item.id)
            formatted_nodes.append({
                "id": node_id,
                "type": "customNode",
                "position": {"x": 250, "y": 500 + (i * 150)},
                "data": {
                    "label": item.label,
                    "status": item.status,
                    "description": item.description,
                    "market_value": item.market_value,
                    "resources": item.resources,
                    "project_prompt": item.project_prompt,
                },
            })
            if i > 0:
                prev_id = str(items_list[i - 1].id)
                formatted_edges.append({
                    "id": f"e{prev_id}-{node_id}",
                    "source": prev_id,
                    "target": node_id,
                    "animated": True,
                    "style": {"stroke": "#00f2ff"},
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
            "error": "AI is busy generating your roadmap. Please try again in a moment.",
            "nodes": [],
            "edges": []
        }, status=429)
    cache.set(lock_key, True, timeout=120)
    
    from .ai_logic import generate_detailed_roadmap
    
    niche = user.target_career or 'Software Development'
    uni_course = user.normalized_course or user.university_course_raw or 'Self-taught'
    budget = user.budget_preference or 'FREE'
    
    try:
        print(f"Calling generate_detailed_roadmap({niche}, {uni_course}, {budget})")
        modules = generate_detailed_roadmap(niche, uni_course, budget)
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

# ==========================================
# PROJECT VERIFICATION SYSTEM (Phase 3)
# ==========================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def preview_project_score(request):
    """
    Preview the score of a GitHub project before final submission.
    Allows users to see what checks pass/fail without committing.
    """
    from .project_scoring import score_github_project, MINIMUM_SCORE_THRESHOLD
    
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
    from .project_scoring import score_github_project, MINIMUM_SCORE_THRESHOLD
    
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
        
        # Log activity for streak
        today = datetime.now().date()
        activity, _ = UserActivity.objects.get_or_create(user=user, date=today)
        activity.count += 1
        activity.save()

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
    from .models import Certificate
    
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
    from .certificate_generator import generate_certificate_html
    from .models import Certificate
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
def get_analytics_dashboard(request):
    """
    Returns comprehensive learning analytics for the user.
    """
    from django.db.models import Avg, Count
    from datetime import datetime, timedelta
    
    user = request.user
    all_items = UserRoadmapItem.objects.filter(user=user)
    completed_items = all_items.filter(status='completed')
    total_items = all_items.count()
    completed_count = completed_items.count()
    
    # Progress
    progress_percent = 0
    if total_items > 0:
        progress_percent = round((completed_count / total_items) * 100)
    
    # Time-to-complete stats
    time_stats = {
        'avg_days_per_module': 0,
        'fastest_module': None,
        'slowest_module': None
    }
    
    if completed_items.exists():
        # Calculate days to complete for each module
        module_times = []
        for item in all_items.filter(step_order__gt=0):
            prev_item = all_items.filter(step_order=item.step_order - 1).first()
            if prev_item and prev_item.submitted_at and item.submitted_at:
                days = (item.submitted_at - prev_item.submitted_at).days
                if days >= 0:
                    module_times.append({'label': item.label, 'days': days})
        
        if module_times:
            avg_days = sum([m['days'] for m in module_times]) / len(module_times)
            time_stats['avg_days_per_module'] = round(avg_days, 1)
            time_stats['fastest_module'] = min(module_times, key=lambda x: x['days'])['label']
            time_stats['slowest_module'] = max(module_times, key=lambda x: x['days'])['label']
    
    # Recent activity (last 30 days)
    cutoff_date = datetime.now().date() - timedelta(days=30)
    recent_activities = UserActivity.objects.filter(user=user, date__gte=cutoff_date)
    total_recent = sum([a.count for a in recent_activities])
    
    # Quiz performance
    quiz_stats = {'attempts': 0, 'passed': 0, 'avg_score': 0}
    from .models import Quiz
    quizzes = Quiz.objects.filter(roadmap_item__user=user)
    if quizzes.exists():
        quiz_stats['attempts'] = sum([q.attempts for q in quizzes])
        quiz_stats['passed'] = quizzes.filter(passed=True).count()
        quiz_stats['avg_score'] = round(quizzes.aggregate(Avg('score'))['score__avg'] or 0, 1)
    
    # Market value distribution
    market_values = all_items.values_list('market_value', flat=True)
    market_dist = {
        'Low': market_values.count('Low'),
        'Med': market_values.count('Med'),
        'High': market_values.count('High')
    }
    
    # Recommendations
    recommendations = []
    if progress_percent < 25:
        recommendations.append("Keep up the momentum! You're just getting started.")
    elif progress_percent < 50:
        recommendations.append("Great progress! Focus on completing a project for each module to build your portfolio.")
    elif progress_percent < 75:
        recommendations.append("You're more than halfway there! Consider starting to apply to internships.")
    else:
        recommendations.append("Excellent work! You're nearly job-ready. Consider building a capstone project.")
    
    if quiz_stats['avg_score'] > 0 and quiz_stats['avg_score'] < 70:
        recommendations.append("Your quiz scores could use improvement. Review weak topics before moving forward.")
    
    if total_recent < 5:
        recommendations.append("Try to be consistent! Even small weekly progress builds momentum.")
    
    return Response({
        "progress": {
            "completed": completed_count,
            "total": total_items,
            "percentage": progress_percent
        },
        "time_stats": time_stats,
        "recent_activity_30d": total_recent,
        "quiz_stats": quiz_stats,
        "market_value_distribution": market_dist,
        "recommendations": recommendations,
        "reputation_score": user.reputation_score,
        "learning_level": user.current_level
    })

# ==========================================
# 7. EMPLOYER API (Job Listings & Matching)
# ==========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_job_listings(request):
    """
    Return job listings relevant to the user's career path with skill matching.
    """
    from .models import JobPosting, CandidateApplication
    
    user = request.user
    career = user.target_career.lower() if user.target_career else ""
    
    # Get active job postings for early-level positions
    jobs = JobPosting.objects.filter(
        is_active=True,
        level__in=['intern', 'entry', 'junior']
    ).select_related('employer').order_by('-created_at')[:50]
    
    # Get user's completed modules (skills)
    user_skills = set()
    for item in UserRoadmapItem.objects.filter(user=user, status='completed'):
        words = item.label.lower().split()
        user_skills.update([w for w in words if len(w) > 2])
    
    # Calculate match scores and check for existing applications
    job_listings = []
    existing_applications = set(
        CandidateApplication.objects.filter(candidate=user).values_list('job_posting_id', flat=True)
    )
    
    for job in jobs:
        # Simple skill match: count matching words
        required_skills = [s.lower() for s in job.required_skills] if job.required_skills else []
        matches = sum(1 for skill in required_skills if skill in user_skills)
        match_score = round((matches / max(len(required_skills), 1)) * 100) if required_skills else 50
        
        # Filter: only show if career or skills partially match
        if match_score >= 30 or career in job.title.lower():
            job_listings.append({
                "id": job.id,
                "title": job.title,
                "company": job.employer.company_name,
                "level": job.get_level_display(),
                "location": job.location,
                "salary_range": job.salary_range or "Competitive",
                "match_score": match_score,
                "required_skills": required_skills[:8],
                "is_applied": job.id in existing_applications,
                "posted": job.created_at.strftime("%d %b")
            })
    
    # Sort by match score
    job_listings.sort(key=lambda x: x['match_score'], reverse=True)
    
    return Response(job_listings[:20])

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_to_job(request, job_id):
    """
    Submit application to a job posting.
    """
    from .models import JobPosting, CandidateApplication
    
    user = request.user
    
    try:
        job = JobPosting.objects.get(id=job_id, is_active=True)
    except JobPosting.DoesNotExist:
        return Response({"error": "Job not found"}, status=404)
    
    # Check for existing application
    existing = CandidateApplication.objects.filter(candidate=user, job_posting=job).first()
    if existing:
        return Response({"error": "You've already applied to this job"}, status=400)
    
    # Calculate match score
    user_skills = set()
    for item in UserRoadmapItem.objects.filter(user=user, status='completed'):
        words = item.label.lower().split()
        user_skills.update([w for w in words if len(w) > 2])
    
    required_skills = [s.lower() for s in job.required_skills] if job.required_skills else []
    matches = sum(1 for skill in required_skills if skill in user_skills)
    match_score = round((matches / max(len(required_skills), 1)) * 100) if required_skills else 50
    
    # Create application
    application = CandidateApplication.objects.create(
        job_posting=job,
        candidate=user,
        match_score=match_score
    )
    
    return Response({
        "message": "Application submitted!",
        "match_score": match_score,
        "status": "applied"
    })

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

        # XP: computed score until a dedicated XP ledger exists
        xp = (completed_count * 500) + (total_activities_year * 15) + (posts_count * 40) + (replies_count * 15) + (reviews_given * 10)

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
        lessons_completed = 0

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
                outline = (item.resources or {}).get('lesson_outline') or []
                if isinstance(outline, list):
                    lessons_completed += len(outline)
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
                "xp": xp,
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
    from .portfolio_generator import create_portfolio_html
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
    Handles switching careers while preserving relevant progress.
    """
    user = request.user
    new_career = request.data.get('new_career')
    
    if not new_career:
        return Response({"error": "New career target is required"}, status=400)

    try:
        with transaction.atomic():
            completed_labels = list(
                UserRoadmapItem.objects.filter(user=user, status='completed')
                .values_list('label', flat=True)
            )
            
            user.target_career = new_career
            user.save()
            
            # Logic to preserve relevant modules would go here
            # For now, we just reset the roadmap but keep history
            UserRoadmapItem.objects.filter(user=user, status='active').delete()
            UserRoadmapItem.objects.filter(user=user, status='locked').delete()
            
            return Response({
                "message": f"Career pivoted to {new_career}. Generating new roadmap...",
                "kept_modules": len(completed_labels)
            })

    except Exception as e:
        return Response({"error": str(e)}, status=500)


# ==========================================
# 8. COMMUNITY Q&A VIEWS
# ==========================================

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from django.db.models import Count, Q
from .models import CommunityPost, CommunityReply, PostVote, PostTag
from .serializers import CommunityPostSerializer, CommunityReplySerializer

class CommunityPostViewSet(viewsets.ModelViewSet):
    serializer_class = CommunityPostSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content', 'tags__name']
    ordering_fields = ['created_at', 'upvotes', 'view_count']

    def get_queryset(self):
        queryset = CommunityPost.objects.all().select_related('author', 'attached_module').prefetch_related('replies', 'tags')
        
        # Filter by type
        post_type = self.request.query_params.get('type')
        if post_type:
            queryset = queryset.filter(post_type=post_type)
            
        # Filter by module
        module_id = self.request.query_params.get('module_id')
        if module_id:
            queryset = queryset.filter(attached_module_id=module_id)
            
        # Filter by solved status
        solved = self.request.query_params.get('solved')
        if solved:
            is_solved = solved.lower() == 'true'
            queryset = queryset.filter(is_solved=is_solved)

        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
        author = self.request.user
        author.community_xp = (author.community_xp or 0) + 10
        author.save(update_fields=['community_xp'])

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        instance.view_count += 1
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def upvote(self, request, pk=None):
        post = self.get_object()
        user = request.user
        
        try:
            vote = PostVote.objects.get(user=user, post=post)
            # Toggle vote (remove if exists)
            vote.delete()
            post.upvotes = max(0, post.upvotes - 1)
            voted = False
        except PostVote.DoesNotExist:
            PostVote.objects.create(user=user, post=post, vote_type='post')
            post.upvotes += 1
            voted = True
            
        post.save()
        return Response({'upvotes': post.upvotes, 'voted': voted})

    @action(detail=True, methods=['post'], url_path='mark-solved')
    def mark_solved(self, request, pk=None):
        post = self.get_object()
        if post.author != request.user:
            return Response({'error': 'Only author can mark as solved'}, status=403)
            
        post.is_solved = not post.is_solved
        post.save()
        return Response({'is_solved': post.is_solved})

    @action(detail=True, methods=['get'])
    def replies(self, request, pk=None):
        post = self.get_object()
        replies = post.replies.all().order_by('created_at')
        serializer = CommunityReplySerializer(replies, many=True, context={'request': request})
        return Response(serializer.data)


class CommunityReplyViewSet(viewsets.ModelViewSet):
    serializer_class = CommunityReplySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CommunityReply.objects.all().select_related('author')

    def perform_create(self, serializer):
        post_id = self.request.data.get('post')
        post = get_object_or_404(CommunityPost, id=post_id)
        serializer.save(author=self.request.user, post=post)
        
        # Update reply count on post
        post.reply_count += 1
        post.save()

        author = self.request.user
        author.community_xp = (author.community_xp or 0) + 5
        author.save(update_fields=['community_xp'])

    @action(detail=True, methods=['post'])
    def upvote(self, request, pk=None):
        reply = self.get_object()
        user = request.user
        
        try:
            vote = PostVote.objects.get(user=user, reply=reply)
            vote.delete()
            reply.upvotes = max(0, reply.upvotes - 1)
            voted = False
        except PostVote.DoesNotExist:
            PostVote.objects.create(user=user, reply=reply, vote_type='reply')
            reply.upvotes += 1
            voted = True
            
        reply.save()
        return Response({'upvotes': reply.upvotes, 'voted': voted})

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        reply = self.get_object()
        if reply.post.author != request.user:
            return Response({'error': 'Only post author can accept answer'}, status=403)
            
        # Toggle acceptance
        reply.is_accepted = not reply.is_accepted
        reply.save()
        
        # If accepted, mark post as solved
        if reply.is_accepted:
            reply.post.is_solved = True
            reply.post.save()
            
        return Response({'is_accepted': reply.is_accepted})




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_community_feed(request):
    """
    Returns recent project submissions from OTHER users.
    """
    user = request.user
    
    recent_subs = UserRoadmapItem.objects.filter(
        status='completed',
        project_submission_link__isnull=False
    ).exclude(user=user).order_by('-submitted_at')[:20]
    
    feed_data = []
    for item in recent_subs:
        # Check for existing vote
        vote = ProjectReview.objects.filter(submission=item, reviewer=user).first()
        user_vote = vote.vote_type if vote else None
        
        feed_data.append({
            "id": item.id,
            "username": item.user.username,
            "career": item.user.target_career,
            "module": item.label,
            "link": item.project_submission_link,
            "verifications": item.verification_count,
            "user_vote": user_vote,
            "date": item.submitted_at.strftime("%d %b")
        })
        
    return Response(feed_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_daily_quiz(request):
    """
    Generates a daily practice quiz based on the user's active module.
    Returns quiz_completed=True if already done today.
    """
    from .ai_logic import generate_quiz
    
    user = request.user
    today = datetime.now().date()
    
    # Check if quiz was already completed today (count >= 1000 is our marker)
    activity = UserActivity.objects.filter(user=user, date=today).first()
    if activity and activity.count >= 1000:
        return Response({
            "quiz_completed": True,
            "message": "You've already completed today's quiz!"
        })
    
    # Find active module, or fallback to last completed
    target_item = UserRoadmapItem.objects.filter(user=user, status='active').first()
    if not target_item:
        target_item = UserRoadmapItem.objects.filter(user=user, status='completed').last()
    
    if not target_item:
        return Response({"error": "No active roadmap found"}, status=404)
        
    # Generate fresh quiz
    questions = generate_quiz(target_item.label, target_item.description)
    
    return Response({
        "module": target_item.label,
        "questions": questions,
        "quiz_completed": False
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_daily_quiz(request):
    """
    Submit daily quiz results to update streak.
    Marks quiz as completed for today (count = 1000+).
    """
    user = request.user
    score = request.data.get('score', 0)
    
    today = datetime.now().date()
    activity, created = UserActivity.objects.get_or_create(user=user, date=today)
    
    # Mark quiz as completed (1000+ means quiz done, <1000 means regular activity)
    # This allows us to track both quiz completion AND regular activity
    if activity.count < 1000:
        activity.count = 1000  # Mark quiz completed
    else:
        # Already completed today, but we'll allow resubmission
        pass
    
    activity.save()

    award_badges(user)
    
    return Response({
        "message": "Streak updated!", 
        "streak_extended": True
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_project(request, item_id):
    """
    Toggle upvote/downvote on a project.
    """
    user = request.user
    item = get_object_or_404(UserRoadmapItem, id=item_id)
    vote_type = request.data.get('vote_type', 'up')
    
    if item.user == user:
        return Response({"error": "Cannot verify your own work"}, status=400)
        
    if vote_type not in ['up', 'down']:
        return Response({"error": "Invalid vote type"}, status=400)

    review, created = ProjectReview.objects.get_or_create(
        submission=item,
        reviewer=user,
        defaults={'vote_type': vote_type}
    )
    
    action = 'created'
    
    if not created:
        if review.vote_type == vote_type:
            # Toggle off
            review.delete()
            action = 'removed'
        else:
            # Change vote
            review.vote_type = vote_type
            review.save()
            action = 'changed'
    else:
        # New vote - award rep if upvote
        if vote_type == 'up':
            item.user.reputation_score += 10
            item.user.save()

    # Recalculate counts
    upvotes = item.reviews.filter(vote_type='up').count()
    downvotes = item.reviews.filter(vote_type='down').count()
    item.verification_count = upvotes - downvotes
    item.save()
    
    return Response({
        "message": f"Vote {action}", 
        "new_count": item.verification_count,
        "user_vote": vote_type if action != 'removed' else None
    })

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


# ==========================================
# 9. PREMIUM & WAITLIST (Phase 5 - Test Mode)
# ==========================================

FREE_CV_EXPORT_LIMIT = 3

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

    user.cv_exports_count += 1
    user.save(update_fields=['cv_exports_count'])

    remaining = max(FREE_CV_EXPORT_LIMIT - user.cv_exports_count, 0)
    return Response({
        "allowed": True,
        "remaining": remaining,
        "plan_tier": user.plan_tier
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_resources_feed(request):
    user = request.user
    career = user.target_career or "Technology"
    
    try:
        news = fetch_tech_news(career)
        jobs = fetch_internships(career)
        from .youtube_logic import search_youtube_videos
        videos = search_youtube_videos(f"{career} career guide", max_results=12)
    except Exception as e:
        print(f"Feed Error: {e}")
        news = []
        jobs = []
        videos = []

    return Response({
        "career_focus": career,
        "news": news,
        "internships": jobs,
        "videos": videos
    })

# ==========================================
# 6. QUIZ SYSTEM
# ==========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_quiz(request, item_id):
    """Get or generate quiz for a module."""
    from .models import Quiz
    from .ai_logic import generate_quiz
    
    item = get_object_or_404(UserRoadmapItem, id=item_id, user=request.user)
    
    quiz, created = Quiz.objects.get_or_create(roadmap_item=item)
    
    if created or not quiz.questions:
        quiz.questions = generate_quiz(item.label, item.description)
        quiz.save()
    
    questions_safe = [
        {
            "question": q["question"],
            "options": q["options"]
        }
        for q in quiz.questions
    ]
    
    return Response({
        "questions": questions_safe,
        "attempts": quiz.attempts,
        "passed": quiz.passed,
        "score": quiz.score if quiz.attempts > 0 else None
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quiz(request, item_id):
    """Submit quiz answers and calculate score."""
    from .models import Quiz
    
    item = get_object_or_404(UserRoadmapItem, id=item_id, user=request.user)
    quiz = get_object_or_404(Quiz, roadmap_item=item)
    
    user_answers = request.data.get('answers', [])
    
    # Validate answers format
    if not isinstance(user_answers, list):
        return Response({"error": "Answers must be a list of indices"}, status=400)
    
    correct_count = 0
    results = []
    
    for i, question in enumerate(quiz.questions):
        # Safely access answer with bounds checking
        if i >= len(user_answers):
            user_answer = -1
        else:
            try:
                user_answer = int(user_answers[i])
            except (ValueError, TypeError):
                user_answer = -1
        is_correct = user_answer == question['correct']
        
        if is_correct:
            correct_count += 1
        
        results.append({
            "question": question["question"],
            "your_answer": user_answer,
            "correct_answer": question["correct"],
            "is_correct": is_correct,
            "explanation": question["explanation"]
        })
    
    score = (correct_count / len(quiz.questions)) * 100
    passed = score >= 70
    
    quiz.user_answers = user_answers
    quiz.score = int(score)
    quiz.passed = passed
    quiz.attempts += 1
    
    if passed:
        quiz.completed_at = datetime.now()
        item.status = 'completed'
        item.save()
        
        next_item = UserRoadmapItem.objects.filter(
            user=request.user,
            step_order=item.step_order + 1
        ).first()
        if next_item:
            next_item.status = 'active'
            next_item.save()
        
        today = datetime.now().date()
        activity, _ = UserActivity.objects.get_or_create(user=request.user, date=today)
        activity.count += 1
        activity.save()

        award_badges(request.user)
    
    quiz.save()
    
    return Response({
        "score": score,
        "passed": passed,
        "results": results,
        "attempts": quiz.attempts
    })


# ==========================================
# COMMUNITY: COMMENTS & PROFILES
# ==========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_project_comments(request, project_id):
    """Get all comments for a project."""
    project = get_object_or_404(UserRoadmapItem, id=project_id)
    comments = ProjectComment.objects.filter(project=project).select_related('author')
    serializer = ProjectCommentSerializer(comments, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_comment(request, project_id):
    """Create a new comment on a project."""
    project = get_object_or_404(UserRoadmapItem, id=project_id)
    
    text = request.data.get('text', '').strip()
    if not text or len(text) > 2000:
        return Response({"error": "Comment must be 1-2000 characters"}, status=400)
    
    comment = ProjectComment.objects.create(
        project=project,
        author=request.user,
        text=text
    )
    
    serializer = ProjectCommentSerializer(comment)
    return Response(serializer.data, status=201)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_comment(request, comment_id):
    """Delete a comment (only author or project owner can delete)."""
    comment = get_object_or_404(ProjectComment, id=comment_id)
    
    if request.user != comment.author and request.user != comment.project.user:
        return Response({"error": "Unauthorized"}, status=403)
    
    comment.delete()
    return Response({"message": "Comment deleted"}, status=204)


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

# ==========================================
# 8. ACCOUNT MANAGEMENT
# ==========================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_username(request):
    """Update username with a 20-day cooldown."""
    from django.utils import timezone
    from datetime import timedelta

    user = request.user
    new_username = (request.data.get('username') or '').strip()

    if not new_username:
        return Response({"error": "Username is required"}, status=400)

    if new_username == user.username:
        return Response({"message": "Username unchanged", "username": user.username})

    # Basic sanity bounds (Django also enforces max length at DB level)
    if len(new_username) > 150:
        return Response({"error": "Username is too long"}, status=400)

    cooldown = timedelta(days=20)
    last_changed = getattr(user, 'last_username_change_at', None)
    if last_changed:
        next_allowed = last_changed + cooldown
        if timezone.now() < next_allowed:
            return Response({
                "error": "Username can only be changed once every 20 days",
                "next_allowed_at": next_allowed.isoformat(),
            }, status=400)

    if User.objects.filter(username=new_username).exclude(id=user.id).exists():
        return Response({"error": "That username is already taken"}, status=400)

    user.username = new_username
    user.last_username_change_at = timezone.now()
    user.save(update_fields=['username', 'last_username_change_at'])

    return Response({
        "message": "Username updated",
        "username": user.username,
        "last_username_change_at": user.last_username_change_at.isoformat() if user.last_username_change_at else None,
    })

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
        from .models import Quiz
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


# ==========================================
# PHASE 7: RETENTION FEATURES
# ==========================================

# ==========================================
# SAVED RESOURCES (Bookmarks)
# ==========================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_resource(request):
    """Save a resource (news, video, job) as bookmark."""
    from .models import SavedResource
    
    user = request.user
    data = request.data
    
    try:
        saved = SavedResource.objects.create(
            user=user,
            resource_type=data.get('resource_type', 'article'),  # news, video, job, article
            title=data.get('title', ''),
            url=data.get('url', ''),
            source=data.get('source', ''),
            description=data.get('description', ''),
            thumbnail_url=data.get('thumbnail', ''),
            tags=data.get('tags', []),
        )
        
        return Response({
            "id": saved.id,
            "message": "Resource saved successfully"
        }, status=201)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_saved_resources(request):
    """Get user's saved resources with optional filtering."""
    from .models import SavedResource
    
    user = request.user
    resource_type = request.query_params.get('type', None)
    search_query = request.query_params.get('search', None)
    page = int(request.query_params.get('page', 1))
    page_size = 20
    
    query = SavedResource.objects.filter(user=user)
    
    if resource_type:
        query = query.filter(resource_type=resource_type)
    
    if search_query:
        query = query.filter(title__icontains=search_query) | query.filter(description__icontains=search_query)
    
    total_count = query.count()
    offset = (page - 1) * page_size
    resources = query.order_by('-saved_at')[offset:offset + page_size]
    
    return Response({
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "results": [
            {
                "id": r.id,
                "type": r.resource_type,
                "title": r.title,
                "url": r.url,
                "source": r.source,
                "description": r.description,
                "thumbnail": r.thumbnail_url,
                "tags": r.tags,
                "saved_at": r.saved_at,
            }
            for r in resources
        ]
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_saved_resource(request, resource_id):
    """Delete a saved resource."""
    from .models import SavedResource
    
    user = request.user
    try:
        resource = SavedResource.objects.get(id=resource_id, user=user)
        resource.delete()
        return Response({"message": "Resource deleted"})
    except SavedResource.DoesNotExist:
        return Response({"error": "Resource not found"}, status=404)


# ==========================================
# COMMUNITY SEARCH (Postgres Full-Text)
# ==========================================

@api_view(['GET'])
@permission_classes([AllowAny])
def search_community(request):
    """Search community posts with Postgres full-text search."""
    from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
    
    query_str = request.query_params.get('q', '').strip()
    post_type = request.query_params.get('type', None)  # question, discussion, showcase
    page = int(request.query_params.get('page', 1))
    page_size = 20
    
    posts = CommunityPost.objects.all()
    
    if query_str:
        search_vector = SearchVector('title', weight='A') + SearchVector('content', weight='B')
        search_query = SearchQuery(query_str)
        posts = posts.annotate(
            rank=SearchRank(search_vector, search_query)
        ).filter(rank__gte=0.3).order_by('-rank', '-created_at')
    else:
        posts = posts.order_by('-created_at')
    
    if post_type:
        posts = posts.filter(post_type=post_type)
    
    total_count = posts.count()
    offset = (page - 1) * page_size
    results = posts[offset:offset + page_size]
    
    return Response({
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "results": [
            {
                "id": r.id,
                "title": r.title,
                "content": r.content[:200],
                "author": r.author.username,
                "author_avatar": r.author.avatar_url if hasattr(r.author, 'avatar_url') else '',
                "post_type": r.post_type,
                "votes": r.votes,
                "reply_count": r.replies.count(),
                "created_at": r.created_at,
            }
            for r in results
        ]
    })


# ==========================================
# ANALYTICS DASHBOARD
# ==========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_analytics(request):
    """Get user's learning analytics: time spent, progress, quiz scores."""
    from .models import Quiz, ProjectReview
    from django.db.models import Avg, Sum, Count, F
    
    user = request.user
    now = timezone.now()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)
    
    # Total modules completed
    completed_modules = UserRoadmapItem.objects.filter(
        user=user,
        verification_count__gt=0
    ).count()
    
    # Weekly activity (last 7 days)
    weekly_activity = UserActivity.objects.filter(
        user=user,
        timestamp__gte=week_ago
    ).values('activity_type').annotate(count=Count('id'))
    
    # Quiz stats (last 30 days)
    quiz_stats = Quiz.objects.filter(
        roadmap_item__user=user,
        completed_at__gte=month_ago
    ).aggregate(
        avg_score=Avg('score'),
        total_attempts=Count('id')
    )
    
    # XP trend (weekly breakdown)
    weekly_breakdown = []
    for i in range(7):
        day = now - timedelta(days=6-i)
        day_start = day.replace(hour=0, minute=0, second=0)
        day_end = day_start + timedelta(days=1)
        
        xp_earned = UserActivity.objects.filter(
            user=user,
            timestamp__gte=day_start,
            timestamp__lt=day_end
        ).count() * 10  # Simplified: 10 XP per activity
        
        weekly_breakdown.append({
            "date": day.strftime('%Y-%m-%d'),
            "xp": xp_earned
        })
    
    # Project completion velocity
    recent_projects = UserRoadmapItem.objects.filter(
        user=user,
        is_project=True
    ).order_by('-verification_count')[:5]

    leaderboard = User.objects.annotate(
        posts_count=Count('posts', distinct=True),
        replies_count=Count('replies', distinct=True)
    ).order_by('-community_xp', '-posts_count')[:5]
    
    return Response({
        "summary": {
            "total_xp": user.xp if hasattr(user, 'xp') else 0,
            "current_streak": user.current_streak,
            "completed_modules": completed_modules,
            "total_hours": 0,  # Would need to calculate from activity logs
            "community_xp": getattr(user, 'community_xp', 0)
        },
        "weekly_activity": list(weekly_activity),
        "quiz_stats": {
            "average_score": quiz_stats.get('avg_score') or 0,
            "total_attempts": quiz_stats.get('total_attempts') or 0,
        },
        "weekly_xp_trend": weekly_breakdown,
        "recent_projects": [
            {
                "id": p.id,
                "label": p.label,
                "submission_link": p.project_submission_link,
            }
            for p in recent_projects
        ],
        "community_leaderboard": [
            {
                "username": u.username,
                "xp": getattr(u, 'community_xp', 0),
                "posts": getattr(u, 'posts_count', 0),
                "replies": getattr(u, 'replies_count', 0)
            }
            for u in leaderboard
        ]
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def community_leaderboard(request):
    leaders = User.objects.annotate(
        posts_count=Count('posts', distinct=True),
        replies_count=Count('replies', distinct=True)
    ).order_by('-community_xp', '-posts_count')[:10]

    return Response({
        "leaders": [
            {
                "username": u.username,
                "xp": getattr(u, 'community_xp', 0),
                "posts": getattr(u, 'posts_count', 0),
                "replies": getattr(u, 'replies_count', 0)
            }
            for u in leaders
        ]
    })


# ==========================================
# SHARE PROFILE
# ==========================================

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


# ==========================================
# EMPLOYER JOB MANAGEMENT
# ==========================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def employer_jobs(request):
    """List employer's jobs or create a new job posting."""
    from .employer_models import EmployerProfile, JobPosting
    
    try:
        employer = EmployerProfile.objects.get(user=request.user)
    except EmployerProfile.DoesNotExist:
        return Response(
            {"error": "You need to set up an employer profile first"},
            status=403
        )
    
    if request.method == 'GET':
        jobs = JobPosting.objects.filter(employer=employer).order_by('-created_at')
        
        return Response([
            {
                "id": job.id,
                "title": job.title,
                "description": job.description,
                "level": job.level,
                "location": job.location,
                "salary_range": job.salary_range,
                "required_skills": job.required_skills,
                "is_active": job.is_active,
                "is_approved": job.is_approved,
                "created_at": job.created_at,
                "applications": job.applications.count() if hasattr(job, 'applications') else 0,
            }
            for job in jobs
        ])
    
    elif request.method == 'POST':
        data = request.data
        
        try:
            job = JobPosting.objects.create(
                employer=employer,
                title=data.get('title', ''),
                description=data.get('description', ''),
                level=data.get('level', 'entry'),
                location=data.get('location', 'Remote'),
                salary_range=data.get('salary_range', ''),
                required_skills=data.get('required_skills', []),
                is_active=True,
                is_approved=False,  # Admin review required
            )
            
            return Response({
                "id": job.id,
                "message": "Job posted successfully. Pending admin approval."
            }, status=201)
        except Exception as e:
            return Response({"error": str(e)}, status=400)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_job_listings(request):
    """Get all active, approved job listings (public endpoint)."""
    from .employer_models import JobPosting
    
    jobs = JobPosting.objects.filter(
        is_active=True,
        is_approved=True
    ).order_by('-created_at')
    
    search = request.query_params.get('search', '').strip()
    if search:
        from django.db.models import Q
        jobs = jobs.filter(
            Q(title__icontains=search) | 
            Q(description__icontains=search) |
            Q(required_skills__contains=[search])
        )
    
    return Response([
        {
            "id": job.id,
            "title": job.title,
            "employer": job.employer.company_name,
            "employer_logo": job.employer.company_logo_url,
            "description": job.description[:200],
            "level": job.level,
            "location": job.location,
            "salary_range": job.salary_range,
            "required_skills": job.required_skills,
            "created_at": job.created_at,
        }
        for job in jobs
    ])


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_to_job(request, job_id):
    """Apply to a job posting."""
    from .employer_models import JobPosting, CandidateApplication
    
    try:
        job = JobPosting.objects.get(id=job_id, is_active=True, is_approved=True)
    except JobPosting.DoesNotExist:
        return Response({"error": "Job not found"}, status=404)
    
    # Check if already applied
    existing = CandidateApplication.objects.filter(
        job_posting=job,
        candidate=request.user
    ).first()
    
    if existing:
        return Response({"error": "You've already applied to this job"}, status=400)
    
    try:
        # Calculate skill match
        user_skills = request.user.skills if hasattr(request.user, 'skills') else []
        required_skills = job.required_skills or []
        
        match_count = sum(1 for skill in user_skills if skill.lower() in [s.lower() for s in required_skills])
        match_score = int((match_count / len(required_skills) * 100)) if required_skills else 0
        
        application = CandidateApplication.objects.create(
            job_posting=job,
            candidate=request.user,
            status='applied',
            match_score=match_score,
        )
        
        return Response({
            "id": application.id,
            "message": "Application submitted successfully",
            "match_score": match_score,
        }, status=201)
    except Exception as e:
        return Response({"error": str(e)}, status=400)
