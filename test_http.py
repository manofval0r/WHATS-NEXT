import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'whats_next_backend.settings')
django.setup()

from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from core.models import UserRoadmapItem
import requests

User = get_user_model()
user = User.objects.first()

# Clear roadmap completely
deleted, _ = UserRoadmapItem.objects.filter(user=user).delete()
print(f"Cleared {deleted} items")

# Check count
count = UserRoadmapItem.objects.filter(user=user).count()
print(f"Roadmap items in DB: {count}")

# Get token
refresh = RefreshToken.for_user(user)
token = str(refresh.access_token)

# Make request to endpoint
print("\n=== Testing initial roadmap (should trigger generation) ===")
headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
response = requests.post('http://127.0.0.1:8000/api/my-roadmap/', json={}, headers=headers, timeout=60)

print(f"Response status: {response.status_code}")
data = response.json()
print(f"Nodes returned: {len(data.get('nodes', []))}")
if data.get('nodes'):
    print(f"First node: {data['nodes'][0]['data']['label'][:60]}")
    print(f"Last node: {data['nodes'][-1]['data']['label'][:60]}")
