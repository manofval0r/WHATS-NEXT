# Add this to core/views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .lesson_generator import generate_lessons_for_module

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_module_lessons(request, module_id):
    """
    Generate AI-powered lessons for a specific module.
    
    POST /api/modules/{module_id}/generate-lessons/
    
    Returns: List of lesson objects with resources
    """
    user = request.user
    
    try:
        # Get the module
        from .models import UserRoadmapItem
        module = UserRoadmapItem.objects.get(id=module_id, user=user)
        
        # Generate lessons using AI
        lessons = generate_lessons_for_module(
            module_title=module.label,
            module_description=module.description,
            user_level=user.current_level or "intermediate",
            learning_platform=request.data.get('platform', 'freeCodeCamp'),
            tech_stack=module.label.split()[0] if module.label else "JavaScript"
        )
        
        return Response({
            "module_id": module_id,
            "lessons": lessons,
            "count": len(lessons)
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
