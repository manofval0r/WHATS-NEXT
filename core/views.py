from rest_framework import generics
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import RegisterSerializer
from .models import UserRoadmapItem, UserActivity, ProjectReview
from .ai_logic import generate_detailed_roadmap
from .news_logic import fetch_tech_news, fetch_internships
from django.shortcuts import get_object_or_404
from datetime import datetime, timedelta
from django.db import transaction

# ==========================================
# 1. AUTHENTICATION
# ==========================================

class RegisterView(generics.CreateAPIView):
    """
    Handles creating a new user account.
    """
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

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

# ==========================================
# 2. ROADMAP ENGINE (ASYNC)
# ==========================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_my_roadmap(request):
    user = request.user
    existing_items = UserRoadmapItem.objects.filter(user=user).order_by('step_order')
    
    if existing_items.exists():
        formatted_nodes = []
        formatted_edges = []
        for i, item in enumerate(existing_items):
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
                prev_id = str(existing_items[i-1].id)
                formatted_edges.append({
                    "id": f"e{prev_id}-{node_id}",
                    "source": prev_id,
                    "target": node_id,
                    "animated": True,
                    "style": { "stroke": "#00f2ff" }
                })
        return Response({ "nodes": formatted_nodes, "edges": formatted_edges })

    # Trigger async roadmap generation
    from .tasks import generate_roadmap_async
    
    niche = user.target_career
    uni_course = user.normalized_course or user.university_course_raw
    budget = user.budget_preference
    
    task = generate_roadmap_async.delay(user.id, niche, uni_course, budget)
    
    return Response({
        "status": "generating",
        "task_id": task.id,
        "message": "Roadmap generation started"
    })

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
def submit_project(request, node_id):
    user = request.user
    submission_link = request.data.get('link')
    if not submission_link:
        return Response({"error": "Link required"}, status=400)
    
    # Basic URL validation
    if not submission_link.startswith(('http://', 'https://')):
        return Response({"error": "Link must be a valid URL (http:// or https://)"}, status=400)
    
    if len(submission_link) > 2048:
        return Response({"error": "Link exceeds maximum length"}, status=400)

    try:
        node = get_object_or_404(UserRoadmapItem, id=node_id, user=user)
    except:
        return Response({"error": "Module not found"}, status=404)
    
    # Auto-score GitHub submissions
    score_info = None
    if 'github.com' in submission_link.lower():
        from .project_scoring import score_github_project
        score_info = score_github_project(submission_link)
    
    node.project_submission_link = submission_link
    node.status = 'completed'
    node.save()
    
    next_node = UserRoadmapItem.objects.filter(user=user, step_order=node.step_order + 1).first()
    next_data = None
    if next_node:
        next_node.status = 'active'
        next_node.save()
        next_data = {"id": str(next_node.id), "status": "active"}

    today = datetime.now().date()
    activity, _ = UserActivity.objects.get_or_create(user=user, date=today)
    activity.count += 1
    activity.save()

    return Response({"message": "Submitted", "node_id": str(node.id), "status": "completed", "next_node": next_data, "score_info": score_info})

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
        recommendations.append("Keep up the momentum! You're just getting started. 🚀")
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

        return Response({
            "profile": {
                "username": user.username,
                "email": user.email,
                "target_career": user.target_career,
                "market_label": market_label,
                "progress": progress_percent,
                "github": github,
                "linkedin": linkedin
            },
            "stats": {
                "completed": completed_count,
                "total": total_count,
            },
            "projects": project_cards
        })

    except Exception as e:
        print(f"PROFILE GENERATION ERROR: {e}")
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_socials(request):
    user = request.user
    user.github_link = request.data.get('github', user.github_link)
    user.linkedin_link = request.data.get('linkedin', user.linkedin_link)
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
            
            UserRoadmapItem.objects.filter(user=user).delete()
            
            uni_course = user.normalized_course or user.university_course_raw
            budget = user.budget_preference
            
            print(f"Pivoting {user.username} to {new_career}...")
            ai_result = generate_detailed_roadmap(new_career, uni_course, budget)
            
            transferred_count = 0
            for i, ai_node in enumerate(ai_result['nodes']):
                data = ai_node['data']
                label = data.get('label', 'Unknown')
                
                status = 'locked'
                for old_skill in completed_labels:
                    if old_skill.lower() in label.lower() or label.lower() in old_skill.lower():
                        status = 'completed'
                        transferred_count += 1
                        break
                
                if i == 0 and status == 'locked':
                    status = 'active'

                UserRoadmapItem.objects.create(
                    user=user,
                    step_order=i,
                    label=label,
                    description=data.get('description', ''),
                    status=status,
                    market_value=data.get('market_value', 'Med'),
                    resources=data.get('resources', {}),
                    project_prompt=data.get('project_prompt', 'No Project defined')
                )

            return Response({
                "message": f"Career switched to {new_career}!",
                "transferred_skills": transferred_count
            })

    except Exception as e:
        print(f"Pivot Error: {e}")
        return Response({"error": "Failed to pivot career"}, status=500)

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
        has_voted = ProjectReview.objects.filter(submission=item, reviewer=user).exists()
        
        feed_data.append({
            "id": item.id,
            "username": item.user.username,
            "career": item.user.target_career,
            "module": item.label,
            "link": item.project_submission_link,
            "verifications": item.verification_count,
            "has_voted": has_voted,
            "date": item.submitted_at.strftime("%d %b")
        })
        
    return Response(feed_data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_project(request, item_id):
    """
    Upvote a project. Gives +10 Rep to reviewer.
    """
    user = request.user
    item = get_object_or_404(UserRoadmapItem, id=item_id)
    
    if item.user == user:
        return Response({"error": "Cannot verify your own work"}, status=400)
        
    if ProjectReview.objects.filter(submission=item, reviewer=user).exists():
        return Response({"error": "Already verified"}, status=400)
        
    ProjectReview.objects.create(submission=item, reviewer=user)
    
    item.verification_count += 1
    item.save()
    
    user.reputation_score += 10
    user.save()
    
    return Response({
        "message": "Verified! +10 Rep", 
        "new_count": item.verification_count
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_settings(request):
    """
    Simple profile updates (Budget, Username).
    """
    user = request.user
    user.budget_preference = request.data.get('budget', user.budget_preference)
    user.save()
    return Response({"message": "Settings updated"})

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
    
    quiz.save()
    
    return Response({
        "score": score,
        "passed": passed,
        "results": results,
        "attempts": quiz.attempts
    })