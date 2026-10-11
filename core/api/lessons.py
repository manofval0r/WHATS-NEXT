"""
Per-lesson progress and the lesson quiz gate.

Moved out of core/views.py.
"""

from core.api._base import *  # noqa: F401,F403

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_lesson_progress(request, item_id):
    """Return all LessonProgress rows for a module so the frontend can render checkmarks."""
    item = get_object_or_404(UserRoadmapItem, id=item_id, user=request.user)
    rows = LessonProgress.objects.filter(user=request.user, roadmap_item=item)
    return Response([
        {
            "lesson_id": lp.lesson_id,
            "lesson_title": lp.lesson_title,
            "is_completed": lp.is_completed,
            "quiz_passed": lp.quiz_passed,
            "quiz_score": lp.quiz_score,
            "quiz_attempts": lp.quiz_attempts,
            "confidence_rating": lp.confidence_rating,
            "xp_awarded": lp.xp_awarded,
            "time_spent_seconds": lp.time_spent_seconds,
            "completed_at": lp.completed_at,
        }
        for lp in rows
    ])


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_lesson_quiz(request, item_id, lesson_id):
    """
    Generate (or return cached) 5-question MCQ for a specific lesson.
    Creates LessonProgress row if needed.
    """
    user = request.user
    item = get_object_or_404(UserRoadmapItem, id=item_id, user=user)

    # Resolve lesson metadata from lesson_data or lesson_outline
    lesson_title = ""
    lesson_desc = ""
    lessons_list = item.lesson_data if isinstance(item.lesson_data, list) else []
    if not lessons_list:
        lessons_list = (item.resources or {}).get('lesson_outline') or []

    for les in lessons_list:
        lid = les.get('id') or f"lesson_{les.get('order', 0)}"
        if str(lid) == str(lesson_id):
            lesson_title = les.get('title', '')
            lesson_desc = les.get('description', '')
            break

    if not lesson_title:
        lesson_title = f"Lesson {lesson_id}"

    lp, created = LessonProgress.objects.get_or_create(
        user=user, roadmap_item=item, lesson_id=str(lesson_id),
        defaults={"lesson_title": lesson_title},
    )

    # Return cached quiz if exists and has questions
    if lp.quiz_questions and len(lp.quiz_questions) >= 1:
        # Strip correct answers for the frontend
        safe_qs = [
            {"question": q["question"], "options": q["options"]}
            for q in lp.quiz_questions
        ]
        return Response({
            "lesson_id": lp.lesson_id,
            "lesson_title": lp.lesson_title,
            "questions": safe_qs,
            "already_passed": lp.quiz_passed,
            "attempts": lp.quiz_attempts,
        })

    # Generate quiz
    quiz_data = generate_lesson_quiz(item.label, lesson_title, lesson_desc)
    lp.quiz_questions = quiz_data
    lp.lesson_title = lesson_title
    lp.save(update_fields=['quiz_questions', 'lesson_title'])

    safe_qs = [
        {"question": q["question"], "options": q["options"]}
        for q in quiz_data
    ]
    return Response({
        "lesson_id": lp.lesson_id,
        "lesson_title": lp.lesson_title,
        "questions": safe_qs,
        "already_passed": lp.quiz_passed,
        "attempts": lp.quiz_attempts,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_lesson_quiz(request, item_id, lesson_id):
    """
    Submit answers for a lesson quiz. ≥70% = pass.
    Awards 20 XP, logs activity, marks lesson complete.
    """
    user = request.user
    item = get_object_or_404(UserRoadmapItem, id=item_id, user=user)

    lp = LessonProgress.objects.filter(
        user=user, roadmap_item=item, lesson_id=str(lesson_id)
    ).first()
    if not lp or not lp.quiz_questions:
        return Response({"error": "Quiz not started. Call start-quiz first."}, status=400)

    user_answers = request.data.get('answers', [])
    time_spent = request.data.get('time_spent_seconds', 0)

    if not isinstance(user_answers, list) or len(user_answers) != len(lp.quiz_questions):
        return Response({
            "error": f"Expected {len(lp.quiz_questions)} answers, got {len(user_answers) if isinstance(user_answers, list) else 0}"
        }, status=400)

    # Score
    correct_count = 0
    results = []
    for i, question in enumerate(lp.quiz_questions):
        user_answer = user_answers[i]
        is_correct = user_answer == question.get("correct")
        if is_correct:
            correct_count += 1
        results.append({
            "question": question["question"],
            "your_answer": user_answer,
            "correct_answer": question["correct"],
            "is_correct": is_correct,
            "explanation": question.get("explanation", ""),
        })

    score = int((correct_count / len(lp.quiz_questions)) * 100)
    passed = score >= 70

    lp.quiz_answers = user_answers
    lp.quiz_score = score
    lp.quiz_attempts += 1
    lp.time_spent_seconds = max(lp.time_spent_seconds, int(time_spent) if time_spent else 0)

    xp_awarded = 0
    if passed and not lp.quiz_passed:
        lp.quiz_passed = True
        lp.is_completed = True
        lp.completed_at = timezone.now()

        # Idempotent: keyed on (reason, lesson id), so a resubmitted quiz
        # cannot pay twice. Previously this wrote straight into
        # User.community_xp, which is the leaderboard's sort key -- so
        # grinding lessons outranked actual community contribution.
        xp_event = xp_award(
            user, "lesson_completed", reference=f"{item.id}:{lesson_id}"
        )
        xp_awarded = xp_event.amount if xp_event else 0
        lp.xp_awarded = xp_awarded

        record_activity(user, reason="lesson")

        # Check if ALL lessons in this module are now complete
        outline = item.lesson_data if isinstance(item.lesson_data, list) else []
        if not outline:
            outline = (item.resources or {}).get('lesson_outline') or []
        total_lessons = len(outline)
        completed_lessons = LessonProgress.objects.filter(
            user=user, roadmap_item=item, is_completed=True
        ).count()

        all_done = total_lessons > 0 and completed_lessons >= total_lessons
    else:
        all_done = False

    lp.save()

    # Regenerate quiz on fail so next attempt has different questions
    if not passed:
        lesson_desc = ""
        lessons_list = item.lesson_data if isinstance(item.lesson_data, list) else []
        if not lessons_list:
            lessons_list = (item.resources or {}).get('lesson_outline') or []
        for les in lessons_list:
            lid = les.get('id') or f"lesson_{les.get('order', 0)}"
            if str(lid) == str(lesson_id):
                lesson_desc = les.get('description', '')
                break
        new_quiz = generate_lesson_quiz(item.label, lp.lesson_title, lesson_desc)
        lp.quiz_questions = new_quiz
        lp.save(update_fields=['quiz_questions'])

    return Response({
        "score": score,
        "passed": passed,
        "results": results,
        "attempts": lp.quiz_attempts,
        "xp_awarded": xp_awarded,
        "all_lessons_complete": all_done,
        "time_warning": time_spent and int(time_spent) < 30,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_lesson_confidence(request, item_id, lesson_id):
    """Save self-assessed confidence rating for a lesson."""
    user = request.user
    item = get_object_or_404(UserRoadmapItem, id=item_id, user=user)
    rating = request.data.get('confidence_rating')
    if rating is None or not isinstance(rating, int) or not (0 <= rating <= 100):
        return Response({"error": "confidence_rating must be 0-100"}, status=400)

    lp, _ = LessonProgress.objects.get_or_create(
        user=user, roadmap_item=item, lesson_id=str(lesson_id),
        defaults={"lesson_title": f"Lesson {lesson_id}"},
    )
    lp.confidence_rating = rating
    lp.save(update_fields=['confidence_rating'])

    return Response({"lesson_id": lesson_id, "confidence_rating": rating})


__all__ = [
    "get_lesson_progress",
    "start_lesson_quiz",
    "submit_lesson_quiz",
    "update_lesson_confidence",
]
