from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from core import views
from core.job_matching import match_jobs
from core.lesson_endpoint import generate_module_lessons

router = DefaultRouter()
router.register(r"api/community/posts", views.CommunityPostViewSet, basename="community-post")
router.register(r"api/community/replies", views.CommunityReplyViewSet, basename="community-reply")

urlpatterns = [
    path("admin/", admin.site.urls),
    # --- AUTHENTICATION -------------------------------------------------
    path("api/health/", views.health_check, name="health_check"),
    path("api/register/", views.RegisterView.as_view(), name="register"),
    path("api/check-username/", views.check_username, name="check_username"),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/normalize-course/", views.normalize_course, name="normalize_course"),
    path("api/roles/", views.list_roles, name="list_roles"),
    path("api/roles/suggest/", views.suggest_role, name="suggest_role"),
    # --- OAUTH ----------------------------------------------------------
    path("accounts/", include("allauth.urls")),
    path("api/auth/social/success/", views.social_login_success, name="social_login_success"),
    path("api/complete-onboarding/", views.complete_onboarding, name="complete_onboarding"),
    # --- ROADMAP --------------------------------------------------------
    path("api/my-roadmap/", views.get_my_roadmap),
    path("api/roadmap-status/<str:task_id>/", views.check_roadmap_status),
    path("api/modules/<int:module_id>/generate-lessons/", generate_module_lessons),
    path("api/submit-project/<int:node_id>/", views.submit_project),
    path("api/preview-score/", views.preview_project_score),
    path("api/certificate/<int:item_id>/", views.get_certificate),
    path("api/certificate/<int:item_id>/generate/", views.generate_certificate_pdf),
    # --- PROFILE --------------------------------------------------------
    # NOTE: every literal /api/profile/<something> route must be declared
    # BEFORE the <str:username> catch-all below. Django resolves patterns in
    # registration order, so '<str:username>' otherwise swallows "share",
    # "streak", "me" and every other literal, and share_profile was
    # unreachable (GET 404 / POST 405) for its entire life.
    path("api/profile/", views.get_user_profile),
    path("api/profile/me/", views.get_my_profile),
    path("api/profile/streak/", views.get_user_streak),
    path("api/profile/activity/", views.get_recent_activity),
    path("api/profile/activity-log/", views.get_activity_log),
    path("api/profile/update-socials/", views.update_socials),
    path("api/profile/socials/", views.update_socials),
    path("api/profile/update-cv/<int:item_id>/", views.update_cv_text),
    path("api/profile/cv/<int:item_id>/", views.update_cv_text),
    path("api/profile/export-html/", views.export_portfolio_html),
    path("api/profile/share/", views.share_profile),
    path("api/profile/<str:username>/", views.get_public_user_profile),
    # --- SETTINGS / ACCOUNT --------------------------------------------
    path("api/pivot-career/", views.pivot_career),
    path("api/settings/", views.update_settings),
    path("api/settings/update/", views.update_settings),
    path("api/account/delete/", views.delete_account),
    path("api/account/export/", views.export_account_data),
    path("api/account/username/", views.update_username),
    # --- COMMUNITY ------------------------------------------------------
    path("api/community/feed/", views.get_community_feed),
    path("api/community/leaderboard/", views.community_leaderboard),
    path("api/community/verify/<int:item_id>/", views.verify_project),
    path("api/community/comments/<int:project_id>/", views.get_project_comments),
    path("api/community/comments/<int:project_id>/create/", views.create_comment),
    path("api/community/comments/<int:comment_id>/delete/", views.delete_comment),
    path("api/community/search/", views.search_community),
    # --- QUIZ -----------------------------------------------------------
    path("api/daily-quiz/", views.get_daily_quiz),
    path("api/daily-quiz/submit/", views.submit_daily_quiz),
    path("api/quiz/<int:item_id>/", views.get_quiz),
    path("api/quiz/<int:item_id>/submit/", views.submit_quiz),
    # --- JOBS -----------------------------------------------------------
    # Replaces the employer job board. Read-only ranking of the real live
    # job feed against the user's completed modules, with the reasoning
    # shown. No employer accounts, no applications, no seeded listings.
    path("api/jobs/match/", match_jobs),
    # --- RESOURCES ------------------------------------------------------
    path("api/resources/", views.get_resources_feed),
    path("api/resources/save/", views.save_resource),
    path("api/resources/saved/", views.get_saved_resources),
    path("api/resources/saved/<int:resource_id>/delete/", views.delete_saved_resource),
    path("api/track-click/", views.track_resource_click, name="track_resource_click"),
    # --- ANALYTICS ------------------------------------------------------
    path("api/analytics/", views.get_analytics),
    # --- JADA AI ASSISTANT ----------------------------------------------
    path("api/jada/chat/", views.jada_chat, name="jada_chat"),
    path("api/jada/claim-guest/", views.jada_claim_guest, name="jada_claim_guest"),
    path("api/jada/conversations/", views.jada_conversations, name="jada_conversations"),
    path("api/jada/conversations/<int:conversation_id>/", views.jada_conversation_detail, name="jada_conversation_detail"),
    path("api/jada/conversations/<int:conversation_id>/context/", views.jada_switch_context, name="jada_switch_context"),
    # --- LESSON PROGRESS ------------------------------------------------
    path("api/modules/<int:item_id>/lesson-progress/", views.get_lesson_progress, name="get_lesson_progress"),
    path("api/modules/<int:item_id>/lessons/<str:lesson_id>/start-quiz/", views.start_lesson_quiz, name="start_lesson_quiz"),
    path("api/modules/<int:item_id>/lessons/<str:lesson_id>/submit-quiz/", views.submit_lesson_quiz, name="submit_lesson_quiz"),
    path("api/modules/<int:item_id>/lessons/<str:lesson_id>/confidence/", views.update_lesson_confidence, name="update_lesson_confidence"),
    # --- SOCIAL ---------------------------------------------------------
    path("api/social/follow/", views.follow_user, name="follow_user"),
    path("api/social/unfollow/", views.unfollow_user, name="unfollow_user"),
    path("api/social/following/", views.get_following, name="get_following"),
    path("api/social/followers/", views.get_followers, name="get_followers"),
    path("api/social/friends-progress/", views.get_friends_progress, name="friends_progress"),
    # --- WAITLIST -------------------------------------------------------
    path("api/waitlist/", views.join_waitlist, name="join_waitlist"),
]

urlpatterns += router.urls