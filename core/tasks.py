from celery import shared_task
from .role_catalog import get_role_template
from .models import UserRoadmapItem
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def generate_roadmap_async(self, user_id, role_key):
    """
    Background task to load a role-based roadmap for a user.

    Args:
        user_id: ID of the user
        role_key: Role catalog key (e.g. 'fullstack')

    Returns:
        dict: Status and message
    """
    from django.contrib.auth import get_user_model
    User = get_user_model()

    try:
        logger.info(f"Loading role roadmap for user {user_id}, role: {role_key}")

        user = User.objects.get(id=user_id)
        template = get_role_template(role_key)
        if not template:
            return {"status": "error", "message": f"Role '{role_key}' not found in catalog"}

        # Clear existing roadmap
        UserRoadmapItem.objects.filter(user=user).delete()

        modules = template["modules"]
        for i, module_data in enumerate(modules):
            resources = module_data.get('resources', {}) or {}
            if module_data.get('lessons'):
                resources['lesson_outline'] = module_data['lessons']
            resources['_connections'] = module_data.get('connections', [])
            resources['_node_type'] = module_data.get('node_type', 'core')

            UserRoadmapItem.objects.create(
                user=user,
                step_order=i,
                label=module_data.get('label', 'Module'),
                description=module_data.get('description', ''),
                status='active' if i == 0 else 'locked',
                market_value=module_data.get('market_value', 'Med'),
                resources=resources,
                project_prompt=module_data.get('project_prompt', '')
            )

        logger.info(f"Successfully loaded {len(modules)} modules for user {user_id}")
        return {
            "status": "success",
            "message": "Roadmap loaded successfully",
            "node_count": len(modules)
        }

    except User.DoesNotExist:
        logger.error(f"User {user_id} not found")
        return {"status": "error", "message": "User not found"}

    except Exception as e:
        logger.error(f"Error loading roadmap for user {user_id}: {str(e)}")
        try:
            raise self.retry(exc=e, countdown=60)
        except self.MaxRetriesExceededError:
            return {"status": "error", "message": f"Failed after retries: {str(e)}"}
