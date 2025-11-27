import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'whats_next_backend.settings')
django.setup()

from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from core.models import UserRoadmapItem
from django.test import RequestFactory
from core.views import get_my_roadmap
from rest_framework.test import force_authenticate
import json

User = get_user_model()
user = User.objects.first()

print(f"User: {user.username}")

# Create a mock request with force_regenerate
factory = RequestFactory()
request = factory.post(
    '/api/my-roadmap/',
    data=json.dumps({'force_regenerate': True}),
    content_type='application/json'
)
force_authenticate(request, user=user)

print(f"\nCalling get_my_roadmap with force_regenerate=True")
response = get_my_roadmap(request)

print(f"Response status: {response.status_code}")
data = response.data
print(f"Nodes returned: {len(data.get('nodes', []))}")
print(f"Edges returned: {len(data.get('edges', []))}")

if data.get('nodes'):
    for i, node in enumerate(data['nodes'][:3]):
        print(f"  Node {i+1}: {node['data']['label'][:60]}")
