import os
import sys
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'whats_next_backend.settings')
django.setup()

# Force stdout/stderr flushing
sys.stdout.flush()
sys.stderr.flush()

from core.models import UserRoadmapItem
from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.first()

print(f"\n>>> User: {user.username}", file=sys.stderr)
print(f">>> Clearing roadmap...", file=sys.stderr)

# Delete existing roadmap
UserRoadmapItem.objects.filter(user=user).delete()

# Test generate
from core.ai_logic import generate_detailed_roadmap

print(f"\n>>> Starting roadmap generation for: {user.target_career}", file=sys.stderr)
sys.stderr.flush()

result = generate_detailed_roadmap(
    user.target_career or 'Software Development',
    user.normalized_course or user.university_course_raw or 'Self-taught',
    user.budget_preference or 'free'
)

print(f"\n>>> Result type: {type(result)}", file=sys.stderr)
print(f">>> Number of modules: {len(result)}", file=sys.stderr)
print(f">>> First module: {result[0]['label'] if result else 'NONE'}", file=sys.stderr)

sys.stdout.flush()
sys.stderr.flush()
