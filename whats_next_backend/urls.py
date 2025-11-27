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
    path('api/normalize-course/', views.normalize_course, name='normalize_course'),

    # --- APPLICATION (The Dashboard) ---
    path('api/my-roadmap/', views.get_my_roadmap),
    path('api/roadmap-status/<str:task_id>/', views.check_roadmap_status),
    path('api/submit-project/<int:node_id>/', views.submit_project),
    path('api/profile/', views.get_user_profile),
    path('api/profile/me/', views.get_my_profile),
    path('api/profile/streak/', views.get_user_streak),
    path('api/profile/activity/', views.get_activity_log),
    path('api/profile/update-socials/', views.update_socials),
    path('api/profile/update-cv/<int:item_id>/', views.update_cv_text),
    path('api/profile/export-html/', views.export_portfolio_html),
    path('api/profile/<str:username>/', views.get_public_user_profile),
    path('api/analytics/', views.get_analytics_dashboard),
    path('api/pivot-career/', views.pivot_career),
    path('api/settings/update/', views.update_settings),
    path('api/community/feed/', views.get_community_feed),
    path('api/community/verify/<int:item_id>/', views.verify_project),
    path('api/community/comments/<int:project_id>/', views.get_project_comments),
    path('api/community/comments/<int:project_id>/create/', views.create_comment),
    path('api/community/comments/<int:comment_id>/delete/', views.delete_comment),
    
    # Daily Quiz
    path('api/daily-quiz/', views.get_daily_quiz),
    path('api/daily-quiz/submit/', views.submit_daily_quiz),
    path('api/resources/', views.get_resources_feed),
    path('api/quiz/<int:item_id>/', views.get_quiz),
    path('api/quiz/<int:item_id>/submit/', views.submit_quiz),
    
    # --- EMPLOYER ENDPOINTS ---
    path('api/employer/jobs/', views.get_job_listings),
    path('api/employer/apply/<int:job_id>/', views.apply_to_job),
]
