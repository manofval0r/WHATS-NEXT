from celery import shared_task
from .ai_logic import generate_detailed_roadmap
from .models import UserRoadmapItem
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def generate_roadmap_async(self, user_id, niche, uni_course, budget):
    """
    Background task to generate roadmap using AI.
    
    Args:
        user_id: ID of the user requesting the roadmap
        niche: Target career path
        uni_course: University course (if any)
        budget: Budget preference (FREE/PAID)
    
    Returns:
        dict: Status and message
    """
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    try:
        logger.info(f"Starting roadmap generation for user {user_id}, career: {niche}")
        
        user = User.objects.get(id=user_id)
        
        # Generate roadmap using AI
        ai_result = generate_detailed_roadmap(niche, uni_course, budget)
        
        # Clear existing roadmap
        UserRoadmapItem.objects.filter(user=user).delete()
        
        # Save new roadmap to database
        for i, ai_node in enumerate(ai_result['nodes']):
            data = ai_node['data']
            UserRoadmapItem.objects.create(
                user=user,
                step_order=i,
                label=data.get('label', 'Unknown'),
                description=data.get('description', ''),
                status=data.get('status', 'locked'),
                market_value=data.get('market_value', 'Med'),
                resources=data.get('resources', {}),
                project_prompt=data.get('project_prompt', '')
            )
        
        logger.info(f"Successfully generated roadmap for user {user_id}")
        return {
            "status": "success",
            "message": "Roadmap generated successfully",
            "node_count": len(ai_result['nodes'])
        }
        
    except User.DoesNotExist:
        logger.error(f"User {user_id} not found")
        return {"status": "error", "message": "User not found"}
        
    except Exception as e:
        logger.error(f"Error generating roadmap for user {user_id}: {str(e)}")
        # Retry the task if it fails
        try:
            raise self.retry(exc=e, countdown=60)  # Retry after 60 seconds
        except self.MaxRetriesExceededError:
            return {"status": "error", "message": f"Failed after retries: {str(e)}"}
