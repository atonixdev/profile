"""
Django settings for Personal Brand Hub project.
"""

import os
from pathlib import Path
from datetime import timedelta
from decouple import config, Csv

try:
    import dj_database_url
except Exception:  # pragma: no cover
    dj_database_url = None

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-this-in-production-1234567890')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=True, cast=bool)

# Host / origin settings
# In DEBUG, allow LAN testing (e.g. opening the site from a phone on the same Wi‑Fi).
# In production, keep an explicit allow-list.
_default_allowed_hosts = 'atonixdev.org,www.atonixdev.org,api.atonixdev.org,localhost,127.0.0.1,144.202.110.159'
_configured_allowed_hosts = config('ALLOWED_HOSTS', default=_default_allowed_hosts, cast=Csv())
ALLOWED_HOSTS = ['*'] if DEBUG else list(_configured_allowed_hosts)

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'csp',
    
    # Local apps
    'accounts',
    'portfolio',
    'services',
    'testimonials',
    'contact',
    'blog',
    'community',
    'activity',
    'chatbot_service',
    'research_lab',
    'ai_lab',
    'iot_lab',
    'self_lab',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'csp.middleware.CSPMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'activity.middleware.ActivityLoggingMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'config' / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database
# Prefer DATABASE_URL when provided (works for local dev + production), else fall back to DB_HOST-based Postgres,
# else fall back to SQLite.
DATABASE_URL = config('DATABASE_URL', default='').strip()

if DATABASE_URL and dj_database_url:
    DATABASES = {
        'default': dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=60,
        )
    }
elif config('DB_HOST', default=None):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': config('DB_NAME', default='personal_brand_hub'),
            'USER': config('DB_USER', default='postgres'),
            'PASSWORD': config('DB_PASSWORD', default='postgres'),
            'HOST': config('DB_HOST'),
            'PORT': config('DB_PORT', default='5432'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Session Configuration - Use file-based sessions for reliability
SESSION_ENGINE = 'django.contrib.sessions.backends.file'
SESSION_FILE_PATH = BASE_DIR / 'sessions'

# Password hashing
# Prefer Argon2 (strong + slow) when available; keep fallbacks for legacy hashes.
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.Argon2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
    'django.contrib.auth.hashers.ScryptPasswordHasher',
]

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'accounts.authentication.CookieJWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,

    # Rate limiting / brute-force protection
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
        'rest_framework.throttling.ScopedRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        # General API protection (tune as needed)
        'anon': config('DRF_THROTTLE_ANON', default='200/hour'),
        'user': config('DRF_THROTTLE_USER', default='1000/hour'),

        # Auth endpoints
        'login': config('DRF_THROTTLE_LOGIN', default='10/min'),
        'register': config('DRF_THROTTLE_REGISTER', default='5/min'),
    },
}

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# Optional: asymmetric JWT signing (recommended for production)
# Defaults to HS256 for backwards compatibility.
JWT_ALGORITHM = config('JWT_ALGORITHM', default='HS256')
if JWT_ALGORITHM and JWT_ALGORITHM != 'HS256':
    SIMPLE_JWT['ALGORITHM'] = JWT_ALGORITHM
    SIMPLE_JWT['SIGNING_KEY'] = config('JWT_SIGNING_KEY', default='')
    SIMPLE_JWT['VERIFYING_KEY'] = config('JWT_VERIFYING_KEY', default='')
    if not SIMPLE_JWT['SIGNING_KEY'] or not SIMPLE_JWT['VERIFYING_KEY']:
        if not DEBUG:
            raise RuntimeError('JWT_SIGNING_KEY and JWT_VERIFYING_KEY are required when using non-HS256 in production')

# Field-level encryption key (AES-256-GCM)
# Provide FIELD_ENCRYPTION_KEY_B64 in production.
FIELD_ENCRYPTION_KEY_B64 = os.getenv('FIELD_ENCRYPTION_KEY_B64', '')

# Blog signing keys (Ed25519) for integrity/authenticity of posts
BLOG_SIGNING_KEY_ID = os.getenv('BLOG_SIGNING_KEY_ID', 'v1')
BLOG_SIGNING_PRIVATE_KEY_B64 = os.getenv('BLOG_SIGNING_PRIVATE_KEY_B64', '')
BLOG_SIGNING_PUBLIC_KEY_B64 = os.getenv('BLOG_SIGNING_PUBLIC_KEY_B64', '')

# CORS Settings
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,https://atonixdev.org,https://www.atonixdev.org',
    cast=Csv()
)

# For LAN testing (phone/tablet hitting http://<LAN_IP>:3000), the backend will be on a different origin
# (http://<LAN_IP>:8000) and CORS would otherwise block requests.
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True

CORS_ALLOW_CREDENTIALS = True

# CSRF Trusted Origins (required for HTTPS with different origins)
CSRF_TRUSTED_ORIGINS = [
    'https://atonixdev.org',
    'https://www.atonixdev.org',
    'https://api.atonixdev.org',
]

if DEBUG:
    CSRF_TRUSTED_ORIGINS += [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3001',
    ]

# Security Settings
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    USE_X_FORWARDED_HOST = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    X_FRAME_OPTIONS = 'DENY'

# Cookie hardening (applies to session/csrf cookies; JWT is currently bearer-token based)
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = config('SESSION_COOKIE_SAMESITE', default='Lax')
CSRF_COOKIE_SAMESITE = config('CSRF_COOKIE_SAMESITE', default='Lax')
CSRF_COOKIE_HTTPONLY = False

# Content Security Policy (start in report-only to avoid breaking third-party assets)
CSP_REPORT_ONLY = config('CSP_REPORT_ONLY', default=True, cast=bool)
CSP_DEFAULT_SRC = ("'self'", 'https:', 'data:')
CSP_SCRIPT_SRC = ("'self'", 'https:', "'unsafe-inline'", "'unsafe-eval'")
CSP_STYLE_SRC = ("'self'", 'https:', "'unsafe-inline'")
CSP_IMG_SRC = ("'self'", 'https:', 'data:')
CSP_FONT_SRC = ("'self'", 'https:', 'data:')
CSP_CONNECT_SRC = ("'self'", 'https:', 'http:')
CSP_FRAME_ANCESTORS = ("'self'",)

# Activity tracking settings
ACTIVITY_TRACKING_ENABLED = config('ACTIVITY_TRACKING_ENABLED', default=True, cast=bool)
ACTIVITY_EXCLUDE_PATHS = config(
    'ACTIVITY_EXCLUDE_PATHS',
    default='/admin/,/static/,/media/',
    cast=Csv()
)
ACTIVITY_INCLUDE_APPS = config('ACTIVITY_INCLUDE_APPS', default='', cast=Csv())
ACTIVITY_EXCLUDE_APPS = config('ACTIVITY_EXCLUDE_APPS', default='', cast=Csv())

# Cache Configuration for Better Performance
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
        'TIMEOUT': 300,
        'OPTIONS': {
            'MAX_ENTRIES': 1000
        }
    }
}

# Cache Control Headers
CACHE_MIDDLEWARE_SECONDS = 600
CACHE_MIDDLEWARE_KEY_PREFIX = 'atonixdev'

# HTTP Cache Middleware
MIDDLEWARE += [
    'django.middleware.cache.UpdateCacheMiddleware',
    'django.middleware.cache.FetchFromCacheMiddleware',
]

# Set default caching headers for responses
DEFAULT_CACHE_HEADERS = {
    'public': True,
    'max_age': 3600,
}

# Hugging Face API Configuration
HUGGINGFACE_API_KEY = os.getenv(
    'HUGGINGFACE_API_KEY',
    'hf_YOUR_API_KEY_HERE'  # Replace with actual key
)

