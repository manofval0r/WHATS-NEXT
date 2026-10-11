"""Shared imports for the api package.

Every view module starts with ``from core.api._base import *``. One place to
change an import, one place to see what the whole layer is built on, and no
per-module guesswork about which decorator or model a given file happens to
touch.

The star import is deliberate and is the only one in the codebase: these are
sibling view modules that share a layer, not scattered consumers.
"""

from __future__ import annotations

import logging
import os
import re
from datetime import datetime, timedelta

# Django
from django.conf import settings
from django.core.cache import cache as django_cache
from django.db import transaction
from django.db.models import Case, Count, F, IntegerField, Q, Value, When
from django.db.models.functions import Coalesce, Greatest
from django.http import Http404, HttpResponse
from django.shortcuts import get_object_or_404, redirect
from django.utils import timezone

# Third party
from rest_framework import filters, generics, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

# App
from core import activity
from core import xp as xp_module
from core.activity import complete_daily_quiz, daily_quiz_completed, record_activity
from core.ai_logic import (
    generate_detailed_roadmap,
    generate_quiz,
    normalize_university_course,
)
from core.guest_sessions import (
    issue_session,
    looks_like_token,
    sign_session,
    verify_session,
)
from core.models import (
    Badge,
    Certificate,
    CommunityPost,
    CommunityReply,
    JadaConversation,
    JadaMessage,
    LessonProgress,
    PostTag,
    PostVote,
    ProjectComment,
    ProjectReview,
    Quiz,
    ResourceClick,
    RoleRoadmapTemplate,
    SavedResource,
    User,
    UserActivity,
    UserFollowing,
    UserRoadmapItem,
    UserTechDebt,
    Waitlist,
)
from core.news_logic import fetch_jobs_multi, fetch_tech_news
from core.openrouter_client import (
    FREE_MODEL_CASCADE,
    OpenRouterError,
    chat_completions_cascade,
)
from core.permissions import IsAuthorOrReadOnly
from core.pivot import apply_pivot
from core.posthog_client import ph_capture, ph_identify
from core.project_scoring import MINIMUM_SCORE_THRESHOLD, score_github_project
from core.resource_queries import get_user_search_context
from core.role_catalog import (
    get_available_roles,
    get_role_template,
    suggest_role_for_course,
)
from core.serializers import (
    CommunityPostSerializer,
    CommunityReplySerializer,
    ProjectCommentSerializer,
    RegisterSerializer,
    UserProfileSerializer,
)
from core.youtube_logic import fetch_youtube_for_modules
from core.xp import award as xp_award

# Third-party
from rest_framework_simplejwt.tokens import RefreshToken

logger = logging.getLogger(__name__)

# Names that the view layer refers to but which are not worth importing at
# every module site.
__all__ = [name for name in dir() if not name.startswith("_")]