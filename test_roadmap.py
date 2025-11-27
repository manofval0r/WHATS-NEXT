import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'whats_next_backend.settings')
django.setup()

from core.models import User
from core.ai_logic import generate_detailed_roadmap

user = User.objects.first()
if not user:
    print("No users in database")
else:
    print(f"Testing with user: {user.username}")
    try:
        result = generate_detailed_roadmap("Software Development", "Self-taught", "free")
        print(f"Generated {len(result)} modules")
        print(f"Type: {type(result)}")
        if result:
            print(f"First module keys: {result[0].keys() if isinstance(result[0], dict) else 'Not a dict'}")
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
