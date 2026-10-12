"""
URL configuration.

Views are split by domain under ``core/api/``. Each import at the top names
one area, and the routes below are grouped by that area, so this file reads
as a map of the product rather than a flat list.
"""

from django.contrib import admin
from django.urls import include, path, re_path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from core.api import analytics as analytics_views
from core.api import auth as auth_views
from core.api import community as community_views
from core.api import health as health_views
from core.api import jada as jada_views
from core.api import jobs as jobs_views
from core.api import lessons as lesson_views
from core.api import profile as profile_views
from core.api import quiz as quiz_views
from core.api import resources as resource_views
from core.api import roadmap as roadmap_views
from core.api import social as social_views
from core.lesson_endpoint import generate_module_lessons
from core.spa import spa_index

router = DefaultRouter()
router.register(
    r"api/community/posts", community_views.CommunityPostViewSet, basename="community-post"
)
router.register(
    r"api/community/replies", community_views.CommunityReplyViewSet, basename="community-reply"
)


# ── Auth ────────────────────────────────────────────────────────────────
# NOTE: every literal /api/profile/<something> route is declared BEFORE the
# <str:username> catch-all. Django resolves patterns in registration order,
# so '<str:username>' otherwise swallows "share", "streak", "me" and every
# other literal, which is exactly how share_profile spent its life
# unreachable (GET 404 / POST 405).

urlpatterns = [
    # The front end, at the root. Declared here rather than relying on the
    # catch-all at the bottom, because DefaultRouter contributes its own
    # `^$` API-root view and a catch-all registered after it never gets the
    # chance: hitting "/" returned the browsable API index instead of the
    # landing page.
    path("", spa_index, name="spa_root"),
    path("admin/", admin.site.urls),
    path("accounts/", include("allauth.urls")),
    path("api/health/", health_views.health_check, name="health_check"),
    path("api/register/", auth_views.RegisterView.as_view(), name="register"),
    path("api/check-username/", auth_views.check_username, name="check_username"),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/normalize-course/", auth_views.normalize_course, name="normalize_course"),
    path("api/roles/", auth_views.list_roles, name="list_roles"),
    path("api/roles/suggest/", auth_views.suggest_role, name="suggest_role"),
    path(
        "api/auth/social/success/",
        auth_views.social_login_success,
        name="social_login_success",
    ),
    path(
        "api/complete-onboarding/",
        roadmap_views.complete_onboarding,
        name="complete_onboarding",
    ),
    # ── Profile ─────────────────────────────────────────────────────────
    path("api/profile/", profile_views.get_user_profile),
    path("api/profile/me/", profile_views.get_my_profile),
    path("api/profile/streak/", profile_views.get_user_streak),
    path("api/profile/activity/", profile_views.get_recent_activity),
    path("api/profile/activity-log/", profile_views.get_activity_log),
    path("api/profile/update-socials/", profile_views.update_socials),
    path("api/profile/socials/", profile_views.update_socials),
    path("api/profile/update-cv/<int:item_id>/", profile_views.update_cv_text),
    path("api/profile/cv/<int:item_id>/", profile_views.update_cv_text),
    path("api/profile/export-html/", profile_views.export_portfolio_html),
    path("api/profile/share/", profile_views.share_profile),
    path("api/profile/<str:username>/", profile_views.get_public_user_profile),
    # ── Settings & account ─────────────────────────────────────────────
    path("api/pivot-career/", profile_views.pivot_career),
    path("api/settings/", profile_views.update_settings),
    path("api/settings/update/", profile_views.update_settings),
    path("api/account/username/", auth_views.update_username),
    path("api/account/delete/", profile_views.delete_account),
    path("api/account/export/", profile_views.export_account_data),
    # ── Roadmap ────────────────────────────────────────────────────────
    path("api/my-roadmap/", roadmap_views.get_my_roadmap),
    path("api/roadmap-status/<str:task_id>/", roadmap_views.check_roadmap_status),
    path("api/modules/<int:module_id>/generate-lessons/", generate_module_lessons),
    path("api/submit-project/<int:node_id>/", roadmap_views.submit_project),
    path("api/preview-score/", roadmap_views.preview_project_score),
    path("api/certificate/<int:item_id>/", roadmap_views.get_certificate),
    path("api/certificate/<int:item_id>/generate/", roadmap_views.generate_certificate_pdf),
    # ── Lessons ────────────────────────────────────────────────────────
    path(
        "api/modules/<int:item_id>/lesson-progress/",
        lesson_views.get_lesson_progress,
        name="get_lesson_progress",
    ),
    path(
        "api/modules/<int:item_id>/lessons/<str:lesson_id>/start-quiz/",
        lesson_views.start_lesson_quiz,
        name="start_lesson_quiz",
    ),
    path(
        "api/modules/<int:item_id>/lessons/<str:lesson_id>/submit-quiz/",
        lesson_views.submit_lesson_quiz,
        name="submit_lesson_quiz",
    ),
    path(
        "api/modules/<int:item_id>/lessons/<str:lesson_id>/confidence/",
        lesson_views.update_lesson_confidence,
        name="update_lesson_confidence",
    ),
    # ── Quizzes ────────────────────────────────────────────────────────
    path("api/daily-quiz/", quiz_views.get_daily_quiz),
    path("api/daily-quiz/submit/", quiz_views.submit_daily_quiz),
    path("api/quiz/<int:item_id>/", quiz_views.get_quiz),
    path("api/quiz/<int:item_id>/submit/", quiz_views.submit_quiz),
    # ── Community ──────────────────────────────────────────────────────
    path("api/community/feed/", community_views.get_community_feed),
    path("api/community/leaderboard/", community_views.community_leaderboard),
    path("api/community/verify/<int:item_id>/", community_views.verify_project),
    path("api/community/comments/<int:project_id>/", community_views.get_project_comments),
    path("api/community/comments/<int:project_id>/create/", community_views.create_comment),
    path("api/community/comments/<int:comment_id>/delete/", community_views.delete_comment),
    path("api/community/search/", community_views.search_community),
    # ── Resources ──────────────────────────────────────────────────────
    path("api/resources/", resource_views.get_resources_feed),
    path("api/resources/save/", resource_views.save_resource),
    path("api/resources/saved/", resource_views.get_saved_resources),
    path(
        "api/resources/saved/<int:resource_id>/delete/",
        resource_views.delete_saved_resource,
    ),
    path("api/track-click/", resource_views.track_resource_click, name="track_resource_click"),
    path("api/waitlist/", resource_views.join_waitlist, name="join_waitlist"),
    # ── Jobs ───────────────────────────────────────────────────────────
    # Read-only ranking of the live job feed against completed modules.
    path("api/jobs/match/", jobs_views.match_jobs),
    # ── Analytics ──────────────────────────────────────────────────────
    path("api/analytics/", analytics_views.get_analytics),
    # ── JADA ───────────────────────────────────────────────────────────
    path("api/jada/chat/", jada_views.jada_chat, name="jada_chat"),
    path("api/jada/claim-guest/", jada_views.jada_claim_guest, name="jada_claim_guest"),
    path("api/jada/conversations/", jada_views.jada_conversations, name="jada_conversations"),
    path(
        "api/jada/conversations/<int:conversation_id>/",
        jada_views.jada_conversation_detail,
        name="jada_conversation_detail",
    ),
    path(
        "api/jada/conversations/<int:conversation_id>/context/",
        jada_views.jada_switch_context,
        name="jada_switch_context",
    ),
    # ── Social ─────────────────────────────────────────────────────────
    path("api/social/follow/", social_views.follow_user, name="follow_user"),
    path("api/social/unfollow/", social_views.unfollow_user, name="unfollow_user"),
    path("api/social/following/", social_views.get_following, name="get_following"),
    path("api/social/followers/", social_views.get_followers, name="get_followers"),
    path("api/social/friends-progress/", social_views.get_friends_progress, name="friends_progress"),
]

urlpatterns += router.urls

# The front end routes in the browser, so every path that is not one of the
# patterns above hands back the built index.html. It must stay last.
urlpatterns += [
    re_path(r"^(?P<path>.*)$", spa_index),
]