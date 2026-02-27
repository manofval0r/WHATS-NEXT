"""
Django settings for whats_next_backend project.
"""

from pathlib import Path
from datetime import timedelta
import os
from dotenv import load_dotenv
import dj_database_url

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# SECRET_KEY: Use env var for production, dev key for local testing
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

if DEBUG:
    # Local development: allow without SECRET_KEY env var
    SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'dev-insecure-key-for-local-testing-only-do-not-use-in-production')
else:
    # Production: REQUIRED environment variable
    if 'DJANGO_SECRET_KEY' not in os.environ:
        raise ValueError('DJANGO_SECRET_KEY environment variable is not set. This is required for security in production.')
    SECRET_KEY = os.getenv('DJANGO_SECRET_KEY')

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1,whats-next-backend.onrender.com').split(',')

# Automatically add Render URL to ALLOWED_HOSTS
if 'RENDER_EXTERNAL_URL' in os.environ:
    ALLOWED_HOSTS.append(os.environ['RENDER_EXTERNAL_URL'].replace('https://', '').rstrip('/'))

if DEBUG:
    ALLOWED_HOSTS = ['*']

# Application definition
INSTALLED_APPS = [  
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',  # Required for allauth
    'core',
    'rest_framework', 
    'rest_framework_simplejwt', 
    'corsheaders',
    'django_celery_results',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.github',
    'allauth.socialaccount.providers.google',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # Added for Render
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware', # Required for allauth
]

ROOT_URLCONF = 'whats_next_backend.urls'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
        'ai_endpoints': '10/hour',  # Special rate for expensive AI calls
    }
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=7),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=10),
}

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'whats_next_backend.wsgi.application'

# Database
DATABASES = {
    'default': dj_database_url.config(
        default='sqlite:///' + str(BASE_DIR / 'db.sqlite3'),
        conn_max_age=600
    )
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# CORS Configuration
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://whats-next-ate2.onrender.com",
]

# Add Render URL to CORS origins
if 'RENDER_EXTERNAL_URL' in os.environ:
    render_url = os.environ['RENDER_EXTERNAL_URL'].rstrip('/')
    CORS_ALLOWED_ORIGINS.append(render_url)

# Add custom CORS origins from env
if 'CORS_ALLOWED_ORIGINS' in os.environ:
    CORS_ALLOWED_ORIGINS.extend(os.environ['CORS_ALLOWED_ORIGINS'].split(','))
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://whats-next-ate2.onrender.com",
]

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'core.User'

# ==========================================
# CACHING (Redis → LocMem fallback)
# ==========================================
_REDIS_URL = os.getenv('CELERY_BROKER_URL', '')
if _REDIS_URL:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.redis.RedisCache',
            'LOCATION': _REDIS_URL,
            'TIMEOUT': 3600,  # 1 hour default
            'KEY_PREFIX': 'wn',
        }
    }
else:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'TIMEOUT': 3600,
        }
    }

# ==========================================
# CELERY CONFIGURATION
# ==========================================
CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = 'django-db'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60  # 30 minutes max for AI tasks

# ==========================================
# POSTHOG ANALYTICS
# ==========================================
POSTHOG_API_KEY = os.getenv('POSTHOG_API_KEY', '')
POSTHOG_HOST = os.getenv('POSTHOG_HOST', 'https://us.i.posthog.com')

# ==========================================
# AUTHENTICATION & OAUTH CONFIGURATION
# ==========================================
SITE_ID = 1

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

# Email Configuration
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_USERNAME_REQUIRED = True
ACCOUNT_AUTHENTICATION_METHOD = 'username_email'
ACCOUNT_EMAIL_VERIFICATION = 'none'  # Simplified for now

# Social Account Providers
SOCIALACCOUNT_LOGIN_ON_GET = True
SOCIALACCOUNT_PROVIDERS = {
    'github': {
        'SCOPE': [
            'user',
            'repo',
            'read:org',
        ],
    },
    'google': {
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
        }
    }
}

# Redirects
LOGIN_REDIRECT_URL = '/api/auth/social/success/'
LOGOUT_REDIRECT_URL = 'https://whats-next-ate2.onrender.com'

# PostHog Analytics
POSTHOG_API_KEY = os.environ.get('POSTHOG_API_KEY', '')
POSTHOG_HOST = os.environ.get('POSTHOG_HOST', 'https://us.i.posthog.com')