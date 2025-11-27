import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'whats_next_backend.settings')
django.setup()

from rest_framework_simplejwt.tokens import RefreshToken
from core.models import User

user = User.objects.first()
if user:
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    print(f"User: {user.username}")
    print(f"Access Token: {access_token}")
else:
    print("No users found")
