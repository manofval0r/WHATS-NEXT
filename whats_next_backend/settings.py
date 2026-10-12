"""
Django settings for whats_next_backend.

Configuration is entirely environment-driven; see .env.example.
Nothing here falls back to a hardcoded credential in production.
"""

import os
import sys
from pathlib import Path
from datetime import timedelta

import dj_database_url
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent


def env_bool(name, default=False):
    """Read a boolean from the environment. Anything not 'true' is False."""
    return os.getenv(name, str(default)).strip().lower() in {"true", "1", "yes", "on"}


def env_list(name, default=()):
    """Read a comma-separated list from the environment."""
    raw = os.getenv(name)
    if not raw:
        return list(default)
    return [item.strip() for item in raw.split(",") if item.strip()]


# ==============================================================
# CORE
# ==============================================================

# Defaults to False. Set DEBUG=true in .env for local development.
DEBUG = env_bool("DEBUG", False)

# Required in every environment. .env.example shows how to generate one.
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY")
if not SECRET_KEY:
    raise ValueError(
        "DJANGO_SECRET_KEY is not set. "
        "Generate one with: python -c \"from django.core.management.utils "
        "import get_random_secret_key as k; print(k())\""
    )

if not DEBUG and SECRET_KEY == "dev-insecure-key-for-local-testing-only-do-not-use-in-production":
    raise ValueError("Refusing to start with the example development SECRET_KEY while DEBUG is False.")

ALLOWED_HOSTS = env_list("ALLOWED_HOSTS", ["localhost", "127.0.0.1"])

# Render injects RENDER_EXTERNAL_URL; add it so deploys work without config edits.
if render_url := os.getenv("RENDER_EXTERNAL_URL"):
    ALLOWED_HOSTS.append(render_url.replace("https://", "").replace("http://", "").rstrip("/"))

# Public URL of the frontend. Used for OAuth redirects, share links and emails.
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")

# ==============================================================
# APPLICATIONS
# ==============================================================

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sites",
    "core",
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "django_celery_results",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.socialaccount.providers.github",
    "allauth.socialaccount.providers.google",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
]

ROOT_URLCONF = "whats_next_backend.urls"
WSGI_APPLICATION = "whats_next_backend.wsgi.application"

# ==============================================================
# REST FRAMEWORK
# ==============================================================

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
        # Required for the 'ai_endpoints' rate below to take effect at all.
        # Without this class declared here, the scoped rate is dead config.
        "rest_framework.throttling.ScopedRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/hour",
        "user": "1000/hour",
        # LLM-backed endpoints are ~1000x more expensive per call than a DB read.
        "ai_endpoints": "30/hour",
    },
    "EXCEPTION_HANDLER": "core.error_handler.api_exception_handler",
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": False,
}

# ==============================================================
# TEMPLATES
# ==============================================================

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# ==============================================================
# DATABASE
# ==============================================================

_db_config = dj_database_url.config(
    default="sqlite:///" + str(BASE_DIR / "db.sqlite3"),
    conn_max_age=600,
    # Required with persistent connections against a managed/proxied
    # Postgres (Render). Without it, the first query after an idle
    # period raises InterfaceError and Django does not retry it.
    conn_health_checks=True,
)

DATABASES = {"default": _db_config}

# psycopg3 connection pooling (Django 5.1+). Only meaningful on Postgres;
# SQLite does not accept a pool key.
if _db_config.get("ENGINE", "").endswith("postgresql"):
    DATABASES["default"].setdefault("OPTIONS", {})["pool"] = True

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
AUTH_USER_MODEL = "core.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# PBKDF2 is deliberately slow, which is correct for production and ruinous
# for a test suite: almost every test creates a user, and the suite was
# spending ~90 seconds almost entirely hashing passwords. A cheap hasher is
# used only while tests are running. Password *validation* above is
# unchanged, so the rules being tested still hold.
if "test" in sys.argv:
    PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]

# ==============================================================
# I18N / TIME
# ==============================================================

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# ==============================================================
# STATIC FILES
# ==============================================================

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# Django 5.1 removed the STATICFILES_STORAGE setting; STORAGES is the
# supported replacement. The old key is silently ignored, which silently
# disabled whitenoise's hashed filenames and far-future cache headers.
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"
        if not DEBUG
        else "django.contrib.staticfiles.storage.StaticFilesStorage"
    },
}

# The built single-page app, served from the ROOT of the site.
#
# Vite emits root-absolute URLs -- /assets/index-*.js, /figure-locks.html,
# /manifest.json -- and routing happens in the browser. Running that build
# through collectstatic would rewrite every one of them under /static/ and
# break the app, because collectstatic only knows the STATIC_URL prefix.
#
# WHITENOISE_ROOT mounts the directory at / instead, which is what the build
# output expects. The API is unaffected: it lives under /api/ and is
# resolved by Django before WhiteNoise is consulted.
#
# Nothing here exists until `npm run build` has run. The SPA index view says
# so plainly rather than raising a 500, because "build the frontend" is the
# fix and a stack trace is not.
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"
WHITENOISE_ROOT = FRONTEND_DIST if FRONTEND_DIST.is_dir() else None
WHITENOISE_INDEX_FILE = True

# ==============================================================
# CORS / CSRF
# ==============================================================

# Env-driven. Set CORS_ALLOWED_ORIGINS to your deployed frontend origin.
CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS", ["http://localhost:5173", "http://127.0.0.1:5173"])
if render_url := os.getenv("RENDER_EXTERNAL_URL"):
    CORS_ALLOWED_ORIGINS.append(render_url.rstrip("/"))
if FRONTEND_URL not in CORS_ALLOWED_ORIGINS:
    CORS_ALLOWED_ORIGINS.append(FRONTEND_URL)

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = env_list("CSRF_TRUSTED_ORIGINS", CORS_ALLOWED_ORIGINS)

# ==============================================================
# SECURITY
# ==============================================================

# Render terminates TLS and redirects; set this so request.is_secure()
# is correct behind the proxy rather than always False.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# HSTS is safe on Render. SECURE_SSL_REDIRECT is deliberately NOT enabled:
# Render already redirects to https, and enabling both risks a redirect loop.
SECURE_HSTS_SECONDS = 31536000 if not DEBUG else 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = not DEBUG
SECURE_HSTS_PRELOAD = not DEBUG

SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"

# ==============================================================
# CACHING
# ==============================================================
# Redis when CELERY_BROKER_URL is set, otherwise a per-process local cache.
# The local cache is NOT safe across gunicorn workers: the roadmap
# generation lock is a no-op there, so concurrent requests both pay for
# generation. Set CELERY_BROKER_URL in any multi-worker deployment.

REDIS_URL = os.getenv("CELERY_BROKER_URL", "").strip()

if REDIS_URL:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.redis.RedisCache",
            "LOCATION": REDIS_URL,
            "TIMEOUT": 3600,
            "KEY_PREFIX": "wn",
        }
    }
else:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "TIMEOUT": 3600,
        }
    }

# ==============================================================
# CELERY
# ==============================================================

CELERY_BROKER_URL = REDIS_URL or "redis://localhost:6379/0"
CELERY_RESULT_BACKEND = "django-db"
CELERY_RESULT_EXPIRES = 3600  # otherwise django_celery_results grows forever
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = "UTC"
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60
CELERY_TASK_SOFT_TIME_LIMIT = 25 * 60
CELERY_WORKER_HIJACK_ROOT_LOGGER = False
# Beat schedule lives in whats_next_backend/celery.py, next to the
# `namespace="CELERY"` that determines how these keys are resolved.
# Defining it in both places meant the one here was silently overridden.

# ==============================================================
# EMAIL
# ==============================================================

DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "WHATS-NEXT <no-reply@example.com>")

if os.getenv("SMTP_HOST"):
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_HOST = os.environ["SMTP_HOST"]
    EMAIL_PORT = int(os.getenv("SMTP_PORT", "587"))
    EMAIL_HOST_USER = os.getenv("SMTP_USERNAME", "")
    EMAIL_HOST_PASSWORD = os.getenv("SMTP_PASSWORD", "")
    EMAIL_USE_TLS = env_bool("SMTP_USE_TLS", True)
    EMAIL_USE_SSL = env_bool("SMTP_USE_SSL", False)
    EMAIL_TIMEOUT = 20
else:
    # Prints to stdout. Nothing silently vanishes into a dead localhost:25.
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# ==============================================================
# ANALYTICS
# ==============================================================

POSTHOG_API_KEY = os.getenv("POSTHOG_API_KEY", "")
POSTHOG_HOST = os.getenv("POSTHOG_HOST", "https://us.i.posthog.com")

# ==============================================================
# AUTHENTICATION
# ==============================================================

SITE_ID = 1

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
]

ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_USERNAME_REQUIRED = True
ACCOUNT_AUTHENTICATION_METHOD = "username_email"
ACCOUNT_EMAIL_VERIFICATION = "mandatory"

SOCIALACCOUNT_LOGIN_ON_GET = True
SOCIALACCOUNT_PROVIDERS = {
    "github": {
        # Only public profile data is needed; 'repo' is not required.
        "SCOPE": ["user:read"],
    },
    "google": {
        "SCOPE": ["profile", "email"],
    },
}

# Tokens are handed to the frontend by fragment exchange, not query string.
LOGIN_REDIRECT_URL = "/api/auth/social/success/"
LOGOUT_REDIRECT_URL = FRONTEND_URL

# ==============================================================
# THIRD-PARTY API DEFAULTS
# ==============================================================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
SITE_URL = os.getenv("SITE_URL", "http://localhost:8000")