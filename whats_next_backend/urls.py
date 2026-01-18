from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from core import views
from core.lesson_endpoint import generate_module_lessons

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # --- AUTHENTICATION (Login/Signup) ---
    path('api/health/', views.health_check, name='health_check'),
    path('api/register/', views.RegisterView.as_view(), name='register'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/normalize-course/', views.normalize_course, name='normalize_course'),

    # --- OAUTH ---
    path('accounts/', include('allauth.urls')),
    path('api/auth/social/success/', views.social_login_success, name='social_login_success'),
    path('api/complete-onboarding/', views.complete_onboarding, name='complete_onboarding'),

    # --- APPLICATION (The Dashboard) ---
    path('api/my-roadmap/', views.get_my_roadmap),
    path('api/roadmap-status/<str:task_id>/', views.check_roadmap_status),
    path('api/modules/<int:module_id>/generate-lessons/',generate_module_lessons),
    path('api/submit-project/<int:node_id>/', views.submit_project),
    
    # Project Verification (Phase 3)
    path('api/preview-score/', views.preview_project_score),
    path('api/certificate/<int:item_id>/', views.get_certificate),
    path('api/certificate/<int:item_id>/generate/', views.generate_certificate_pdf),
    
    path('api/profile/', views.get_user_profile),
    path('api/profile/me/', views.get_my_profile),
    path('api/profile/streak/', views.get_user_streak),
    path('api/profile/activity/', views.get_recent_activity),
    path('api/profile/update-socials/', views.update_socials),
    path('api/profile/update-cv/<int:item_id>/', views.update_cv_text),
    path('api/profile/export-html/', views.export_portfolio_html),
    path('api/profile/<str:username>/', views.get_public_user_profile),
    path('api/analytics/', views.get_analytics_dashboard),
    path('api/pivot-career/', views.pivot_career),
    path('api/settings/', views.update_settings),  # Handles both GET and POST
    path('api/settings/update/', views.update_settings),
    path('api/account/delete/', views.delete_account),
    path('api/account/export/', views.export_account_data),
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

# Router for ViewSets
from rest_framework.routers import DefaultRouter
router = DefaultRouter()
router.register(r'api/community/posts', views.CommunityPostViewSet, basename='community-post')
router.register(r'api/community/replies', views.CommunityReplyViewSet, basename='community-reply')

urlpatterns += router.urls
