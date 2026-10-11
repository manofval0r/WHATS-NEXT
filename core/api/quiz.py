"""
Per-module quizzes and the daily quiz.

Moved out of core/views.py.
"""

from core.api._base import *  # noqa: F401,F403

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_daily_quiz(request):
    """
    Today's practice quiz, based on the user's active module.

    Cached per (user, day). Previously this called the LLM on *every* GET —
    a refresh, a React re-mount, or the frontend's polling each paid for a
    fresh generation, and at the 1000/hour user throttle that is up to 1,000
    paid calls per hour per account.
    """
    from core.ai_logic import generate_quiz

    user = request.user

    if daily_quiz_completed(user):
        return Response({
            "quiz_completed": True,
            "message": "You have already completed today's quiz.",
        })

    # Find active module, or fall back to the most recently completed one.
    target_item = (
        UserRoadmapItem.objects.filter(user=user, status='active').first()
        or UserRoadmapItem.objects.filter(user=user, status='completed').last()
    )

    if not target_item:
        return Response(
            {"error": "Complete a module first — the daily quiz is drawn from your roadmap."},
            status=404,
        )

    cache_key = f"dailyquiz:{user.pk}:{timezone.now().date().isoformat()}"
    payload = django_cache.get(cache_key)

    if payload is None:
        questions = generate_quiz(target_item.label, target_item.description)
        payload = {
            "module": target_item.label,
            "module_id": target_item.id,
            "questions": questions,
            "quiz_completed": False,
        }
        # Short TTL: the quiz is regenerable, the LLM call is not free.
        django_cache.set(cache_key, payload, 21600)

    return Response(payload)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_daily_quiz(request):
    """
    Grade today's quiz and extend the streak.

    Actually grades now. Previously the endpoint read ``score`` off the
    request into a local variable and never used it: the client hardcoded
    ``{score: 100}`` with the comment "we just claim completion for the
    streak", and any authenticated POST with an empty body completed it.
    """
    user = request.user
    answers = request.data.get("answers") or []

    if not isinstance(answers, list) or not answers:
        return Response(
            {"error": "Send the quiz answers as a list."}, status=400
        )

    cache_key = f"dailyquiz:{user.pk}:{timezone.now().date().isoformat()}"
    payload = django_cache.get(cache_key)

    if payload is None:
        return Response(
            {
                "error": (
                    "Today's quiz is no longer available. Reload to get a new one."
                )
            },
            status=409,
        )

    questions = payload.get("questions") or []
    if len(answers) != len(questions):
        return Response(
            {"error": f"Expected {len(questions)} answers, got {len(answers)}."},
            status=400,
        )

    results = []
    correct = 0
    for index, question in enumerate(questions):
        given = answers[index]
        expected = question.get("correct")
        is_correct = given == expected
        correct += is_correct
        results.append({
            "question": question.get("question"),
            "your_answer": given,
            "correct_answer": expected,
            "is_correct": is_correct,
            "explanation": question.get("explanation", ""),
        })

    score = int(round((correct / len(questions)) * 100))
    passed = score >= 70

    # The streak requires passing, and the completion marker is its own
    # column -- it used to be written into ``count`` as 1000, which was then
    # summed as 1,000 real contributions and paid out 15,000 XP per click.
    if passed:
        complete_daily_quiz(user)
        xp_award(user, "daily_quiz", reference=f"{timezone.now().date().isoformat()}")
        award_badges(user)

    return Response({
        "score": score,
        "passed": passed,
        "correct": correct,
        "total": len(questions),
        "results": results,
        "quiz_completed": True,
        "streak_extended": passed,
        "message": (
            "Streak extended." if passed else "Not passed today. Try again tomorrow."
        ),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_quiz(request, item_id):
    """Get or generate quiz for a module."""
    from core.models import Quiz
    from core.ai_logic import generate_quiz
    
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
    from core.models import Quiz
    
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
        # Only unlock a module that is still locked. The previous version set
        # it to 'active' unconditionally, so re-taking an old quiz downgraded
        # an already-completed module back to active and silently un-completed
        # it -- verified by replaying module 0's quiz after finishing module 1.
        if next_item and next_item.status == 'locked':
            next_item.status = 'active'
            next_item.save()

        record_activity(request.user)

        # Idempotent awards: keyed on the module id, so retaking the quiz
        # does not pay out again.
        xp_award(request.user, "quiz_passed", reference=str(item.id))
        xp_award(request.user, "module_completed", reference=str(item.id))

        award_badges(request.user)
    
    quiz.save()
    
    return Response({
        "score": score,
        "passed": passed,
        "results": results,
        "attempts": quiz.attempts
    })


__all__ = [
    "get_daily_quiz",
    "get_quiz",
    "submit_daily_quiz",
    "submit_quiz",
]
