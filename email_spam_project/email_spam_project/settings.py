"""Django settings for email_spam_project project."""

import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load local environment variables from `.env` (development convenience).
# Safe in production: if python-dotenv isn't installed or `.env` is absent, this is a no-op.
try:
    from dotenv import load_dotenv

    load_dotenv(BASE_DIR / ".env")
except Exception:
    pass


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/6.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
DEFAULT_SECRET_KEY = "django-insecure-oq$*&t&vabvlbuo4uod!urp85u%_t1kjh=(j=8i9$czq96rzz*"
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", DEFAULT_SECRET_KEY)

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get("DJANGO_DEBUG", "1") == "1"

_allowed_hosts_env = os.environ.get("ALLOWED_HOSTS", "")
ALLOWED_HOSTS = [h.strip() for h in _allowed_hosts_env.split(",") if h.strip()]
_render_hostname = os.environ.get("RENDER_EXTERNAL_HOSTNAME")
if _render_hostname:
    ALLOWED_HOSTS.append(_render_hostname)
if not ALLOWED_HOSTS:
    ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

CSRF_TRUSTED_ORIGINS = []
if _render_hostname:
    CSRF_TRUSTED_ORIGINS.append(f"https://{_render_hostname}")


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'spam_ui',
    'ai_ui',
    'email_spam_project.apps.EmailSpamProjectConfig',
]
SITE_ID = 1

LOGIN_REDIRECT_URL = "/"
LOGOUT_REDIRECT_URL = "/"

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
)
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'allauth.account.middleware.AccountMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'email_spam_project.urls'

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

WSGI_APPLICATION = 'email_spam_project.wsgi.application'


# Database
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

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
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

FRONTEND_DIST_DIR = BASE_DIR.parent / "frontend" / "out"

STATICFILES_DIRS = []
if FRONTEND_DIST_DIR.exists():
    STATICFILES_DIRS.append(FRONTEND_DIST_DIR)
    TEMPLATES[0]["DIRS"] = [FRONTEND_DIST_DIR]
    WHITENOISE_ROOT = FRONTEND_DIST_DIR

# External API used by the spam-check UI
SPAM_API_URL = 'https://spam-mail-api-l6cq.onrender.com/predict'

# Optional overrides for AI summary/response endpoints (defaults derived from SPAM_API_URL)
# AI_API_BASE_URL = 'https://spam-mail-api-l6cq.onrender.com/'
# SUMMARY_API_URL = 'https://spam-mail-api-l6cq.onrender.com/summary'
# AI_RESPONSE_API_URL = 'https://spam-mail-api-l6cq.onrender.com/ai-response'

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# --- Google OAuth (django-allauth) ---
# IMPORTANT:
# - Configure Google OAuth client on Google Cloud Console
# - Add redirect URI: https://<your-domain>/accounts/google/login/callback/
# - For Render, set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET as env vars


def _getenv_first(*names: str) -> str | None:
    for name in names:
        value = os.environ.get(name)
        if value:
            return value
    return None


GOOGLE_CLIENT_ID = _getenv_first(
    "GOOGLE_CLIENT_ID",
    "GOOGLE_OAUTH_CLIENT_ID",
    "DJANGO_GOOGLE_CLIENT_ID",
)
GOOGLE_CLIENT_SECRET = _getenv_first(
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_OAUTH_CLIENT_SECRET",
    "DJANGO_GOOGLE_CLIENT_SECRET",
)

SOCIALACCOUNT_PROVIDERS = {
    "google": {
        "SCOPE": [
            "profile",
            "email",
            "https://www.googleapis.com/auth/gmail.readonly",
        ],
        "AUTH_PARAMS": {
            # Needed to receive a refresh token (so Gmail access keeps working)
            "access_type": "offline",
            "prompt": "consent",
        },
    }
}

# NOTE: Do not set `SOCIALACCOUNT_PROVIDERS['google']['APP'/'APPS']` here.
# allauth merges settings-backed apps with DB-backed SocialApp rows; having both
# configured results in MultipleObjectsReturned. Instead, we rely on
# `email_spam_project.oauth_bootstrap.bootstrap_google_socialapp()` to ensure a
# single SocialApp exists in the database and is linked to Site(id=1).


# Ensure tokens are persisted for Gmail access.
SOCIALACCOUNT_STORE_TOKENS = True

# Skip the intermediate "You are about to sign in... Continue" confirmation screen.
# This makes /accounts/google/login/?process=login redirect straight to Google.
SOCIALACCOUNT_LOGIN_ON_GET = True

# Avoid extra signup prompts for new social users.
SOCIALACCOUNT_AUTO_SIGNUP = True
