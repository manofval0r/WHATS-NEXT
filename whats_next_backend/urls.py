from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from core import views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # --- AUTHENTICATION (Login/Signup) ---
    path('api/register/', views.RegisterView.as_view(), name='register'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # --- APPLICATION (The Dashboard) ---
    path('api/my-roadmap/', views.get_my_roadmap),
    path('api/roadmap-status/<str:task_id>/', views.check_roadmap_status),
    path('api/submit-project/<int:node_id>/', views.submit_project),
    path('api/profile/', views.get_user_profile),
    path('api/profile/update-socials/', views.update_socials),
    path('api/profile/update-cv/<int:item_id>/', views.update_cv_text),
    path('api/profile/activity/', views.get_activity_log),
    path('api/profile/streak/', views.get_user_streak),
    path('api/pivot-career/', views.pivot_career),
    path('api/settings/update/', views.update_settings),
    path('api/community/feed/', views.get_community_feed),
    path('api/community/verify/<int:item_id>/', views.verify_project),
    path('api/resources/', views.get_resources_feed),
    path('api/quiz/<int:item_id>/', views.get_quiz),
    path('api/quiz/<int:item_id>/submit/', views.submit_quiz),
]