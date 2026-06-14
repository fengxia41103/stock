# -*- coding: utf-8 -*-

import os
from pathlib import Path

DJANGO_DEBUG = bool(int(os.environ.get("DJANGO_DEBUG") or 0))
DATABASE = os.environ.get("MYSQL_DATABASE")
DEPLOY_TYPE = os.environ.get("DEPLOY_TYPE", "dev")
DB_USER = os.environ.get("DJANGO_DB_USER")
DB_PWD = os.environ.get("DJANGO_DB_PWD")
DB_HOST = os.environ.get("DJANGO_DB_HOST")
DB_PORT = os.environ.get("DJANGO_DB_PORT")
REDIS_HOST = os.environ.get("DJANGO_REDIS_HOST")

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get(
    "DJANGO_SECRET_KEY", "s+3msph#0v4o=fvu^*i!42hrp^w5(j6sr#kis@)=8^q3p3=+*m"
)

DEBUG = DJANGO_DEBUG
ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sites",
    # Third-party
    "rest_framework",
    "rest_framework.authtoken",
    "django_filters",
    "corsheaders",
    "django_celery_results",
    # Local
    "stock.apps.StockConfig",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "fin.urls"
WSGI_APPLICATION = "fin.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": DATABASE,
        "USER": DB_USER,
        "PASSWORD": DB_PWD,
        "HOST": DB_HOST,
        "PORT": DB_PORT,
    }
}

LANGUAGE_CODE = "en-us"
USE_TZ = True
TIME_ZONE = "UTC"
USE_I18N = True

STATIC_URL = "/static/"
STATIC_ROOT = "/var/www/static"
STATICFILES_DIRS = [BASE_DIR / "static"]

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ]
        },
    }
]

SITE_ID = 1

# DRF
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 200,
}

# Celery
CELERY_BROKER_URL = f"redis://{REDIS_HOST}:6379/0"
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_RESULT_BACKEND = "django-db"

# CORS
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_HEADERS = ["*"]

DEFAULT_AUTO_FIELD = "django.db.models.AutoField"
