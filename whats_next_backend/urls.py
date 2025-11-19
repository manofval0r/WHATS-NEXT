from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from core import views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # --- AUTHENTICATION (Login/Signup) ---
    path('api/register/', views.RegisterView.as_view(), name='register'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'), # Login
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # --- APPLICATION (The Dashboard) ---
    # This is the single endpoint the Frontend needs now. 
    # It uses the saved University Course inside the User Profile.
    path('api/my-roadmap/', views.get_my_roadmap),
]