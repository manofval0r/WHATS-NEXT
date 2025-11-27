import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'whats_next_backend.settings')
django.setup()

from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from core.models import UserRoadmapItem
import requests
import json

User = get_user_model()
user = User.objects.first()

# Clear roadmap
UserRoadmapItem.objects.filter(user=user).delete()
print(f"Cleared roadmap for user: {user.username}")

# Generate token
refresh = RefreshToken.for_user(user)
access_token = str(refresh.access_token)
print(f"Generated token")

# Test endpoint
headers = {
    'Authorization': f'Bearer {access_token}', 
    'Content-Type': 'application/json'
}

print("\n=== Testing /api/my-roadmap/ with force_regenerate ===")
response = requests.post(
    'http://127.0.0.1:8000/api/my-roadmap/', 
    json={'force_regenerate': True}, 
    headers=headers, 
    timeout=60
)

print(f"Status Code: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    print(f"Nodes returned: {len(data.get('nodes', []))}")
    print(f"Edges returned: {len(data.get('edges', []))}")
    if data.get('nodes'):
        print(f"First node: {data['nodes'][0]['data']['label']}")
else:
    print(f"Error: {response.text}")
