import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'whats_next_backend.settings')
django.setup()

from core.models import UserRoadmapItem
from django.contrib.auth import get_user_model
from core.ai_logic import generate_detailed_roadmap

User = get_user_model()
user = User.objects.first()

print(f"\nUser: {user.username}")
print(f"Career: {user.target_career}")

# Clear roadmap
UserRoadmapItem.objects.filter(user=user).delete()
print(f"Cleared roadmap")

# Generate 
print(f"Calling generate_detailed_roadmap...")
modules = generate_detailed_roadmap(
    user.target_career or 'Software Development',
    user.normalized_course or user.university_course_raw or 'Self-taught',
    user.budget_preference or 'free'
)

print(f"\nGenerated {len(modules)} modules")
print(f"Module keys: {modules[0].keys() if modules else 'EMPTY'}")
print(f"First module label: {modules[0].get('label') if modules else 'EMPTY'}")

# Now simulate what views.py does
print(f"\nSaving to database...")
created_items = []
for i, module in enumerate(modules):
    print(f"  Creating module {i+1}: {module.get('label', 'Unknown')[:50]}")
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

print(f"\nSaved {len(created_items)} items to database")

# Verify in database
count = UserRoadmapItem.objects.filter(user=user).count()
print(f"Database now has {count} roadmap items")

items_in_db = list(UserRoadmapItem.objects.filter(user=user).order_by('step_order'))
for item in items_in_db:
    print(f"  - {item.label}")
