# Add this to core/views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .lesson_generator import generate_lessons_for_module
from django.utils import timezone
from datetime import timedelta

@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def generate_module_lessons(request, module_id):
    """
    Generate or retrieve cached AI-powered lessons for a specific module.
    
    GET /api/modules/{module_id}/generate-lessons/  — retrieve cached lessons
    POST /api/modules/{module_id}/generate-lessons/ — regenerate new lessons
    
    Implements TTL caching: lessons cached for 24 hours before regeneration.
    
    Returns: List of lesson objects with resources
    """
    user = request.user
    
    try:
        # Get the module
        from .models import UserRoadmapItem
        module = UserRoadmapItem.objects.get(id=module_id, user=user)
        
        # Check if we have valid cached lessons (GET or if cache is fresh)
        if request.method == 'GET' or (
            module.lesson_data 
            and module.lesson_cached_at 
            and (timezone.now() - module.lesson_cached_at) < timedelta(hours=24)
        ):
            # Return cached lessons
            lessons = module.lesson_data or []
            
            return Response({
                "module_id": module_id,
                "lessons": lessons,
                "count": len(lessons),
                "cached": True,
                "cached_at": module.lesson_cached_at,
            })
        
        # Generate new lessons (POST or cache expired)
        lessons = generate_lessons_for_module(
            module_title=module.label,
            module_description=module.description,
            user_level=user.current_level or "intermediate",
            learning_platform=request.data.get('platform', 'freeCodeCamp'),
            tech_stack=module.label.split()[0] if module.label else "JavaScript"
        )
        
        # Cache the lessons
        module.lesson_data = lessons
        module.lesson_cached_at = timezone.now()
        module.save(update_fields=['lesson_data', 'lesson_cached_at'])
        
        return Response({
            "module_id": module_id,
            "lessons": lessons,
            "count": len(lessons),
            "cached": False,
        })
        
    except UserRoadmapItem.DoesNotExist:
        return Response({"error": "Module not found"}, status=404)
    except Exception as e:
        import traceback
        print(f"Lesson generation error: {e}")
        traceback.print_exc()
        return Response({
            "error": str(e),
            "type": type(e).__name__
        }, status=500)

