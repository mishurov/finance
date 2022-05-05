# /**************************************************************************
#
#  This file is part of the Mishurov Finance website
#
#  Copyright (C) 2021 Alexander Mishurov
#
#  GNU General Public License Usage
#  This file may be used under the terms of the GNU
#  General Public License version 3. The licenses are as published by
#  the Free Software Foundation and appearing in the file LICENSE.GPL3
#  included in the packaging of this file. Please review the following
#  information to ensure the GNU General Public License requirements will
#  be met: https://www.gnu.org/licenses/gpl-3.0.html.
#
# **************************************************************************/
import os
import sys
import base64
import json
from pathlib import Path

import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

from .oracle import tns_to_easyconn


SECRETS_PATH = '/var/run/secrets'
SECRETS = {
    'CREDENTIALS': 'credentials.json',
    'WALLET': 'cwallet.sso',
    'TNSNAMES': 'tnsnames.ora',
}

for k, v in SECRETS.items():
    if not os.path.exists(os.path.join(SECRETS_PATH, v)) and os.environ.get(k):
        content = base64.b64decode(os.environ.get(k).encode('ascii'))
        with open(os.path.join(SECRETS_PATH, v), 'wb') as f:
            f.write(content)

with open('/etc/configs/django.json', 'r') as f:
    conf = json.load(f)

with open(os.path.join(SECRETS_PATH, SECRETS['CREDENTIALS']), 'r') as f:
    creds = json.load(f)

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = creds['SECRET_KEY']


def env_bool(var):
    val = os.environ.get(var)
    return conf[var] if val is None else val == 'true'


DEBUG = env_bool('DEBUG')
MEMCACHED = env_bool('MEMCACHED')
USE_ELASTIC_COMPLETER = conf['USE_ELASTIC_COMPLETER']
USE_WEB_CRAWL = conf['USE_WEB_CRAWL']
EXPOSE_ADMIN = DEBUG or conf['EXPOSE_ADMIN']
LOCAL_DB = DEBUG and os.environ.get('LOCAL_DB') == 'true'
LOCAL_REDIS = os.environ.get('LOCAL_REDIS') == 'true'

if not DEBUG:
    ALLOWED_HOSTS = creds['ALLOWED_HOSTS']

if USE_WEB_CRAWL:
    DATA_UPLOAD_MAX_MEMORY_SIZE = 10485760
    ALLOWED_HOSTS += [creds['CRAWLER_HOST']]


ADMINS = [
    ('Alexander Mishurov', 'alexander.m.mishurov@gmail.com'),
]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_celery_results',
    'django_celery_beat',
    'analytics.apps.AnalyticsConfig',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

if USE_WEB_CRAWL:
    MIDDLEWARE += ['jwt_auth.middleware.JwtMiddleware']

ROOT_URLCONF = 'finance.urls'

if MEMCACHED:
    SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
    CACHE_MIDDLEWARE_SECONDS = 3600

    MIDDLEWARE = [
        'django.middleware.cache.UpdateCacheMiddleware',
    ] + MIDDLEWARE + [
        'django.middleware.cache.FetchFromCacheMiddleware',
    ]

    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.memcached.PyMemcacheCache',
            'LOCATION': 'memcached:11211',
        }
    }


TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
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

WSGI_APPLICATION = 'finance.wsgi.application'


DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CONNSTRINGS = tns_to_easyconn(SECRETS_PATH)

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.oracle',
        'NAME': CONNSTRINGS['tp'],
        'USER': creds['DB_USER'],
        'PASSWORD': creds['DB_PASSWORD'],
        'HOST': '',
        'PORT': '',
        'OPTIONS': {
            'threaded': True,
        },
        'TEST': {
            'CREATE_DB': False,
            'CREATE_USER': False,
            'MIGRATE': False,  # doesn't work
            'USER': creds['DB_USER'],
            'PASSWORD': creds['DB_PASSWORD'],
        }
    }
}

if LOCAL_DB:
    DATABASES['production'] = DATABASES['default'].copy()
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'django',
        'USER': 'django',
        'PASSWORD': 'password',
        'HOST': 'db',
        'PORT': 5432,
    }

if 'test' in sys.argv[1:]:
    class DisableMigrations(object):
        def __contains__(self, item):
            return True

        def __getitem__(self, item):
            return None

    MIGRATION_MODULES = DisableMigrations()


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


LANGUAGE_CODE = 'en-uk'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_true': {
            '()': 'django.utils.log.RequireDebugTrue',
        },
    },
    'handlers': {
        'console': {
            'filters': ['require_debug_true'],
            'class': 'logging.StreamHandler',
        },
        'debug_file': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/django/debug.log',
            'maxBytes': 100000,
            'backupCount': 2,
        },
        'error_file': {
            'level': 'ERROR',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/django/error.log',
            'maxBytes': 100000,
            'backupCount': 2,
        },
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler',
        }
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
        },
        'django.request': {
            'handlers': [],  # ['mail_admins'], Sentry
            'level': 'ERROR',
        },
        'logfile_debug': {
            'handlers': ['debug_file'],
            'level': 'DEBUG',
        },
        'logfile_error': {
            'handlers': ['error_file'],
            'level': 'ERROR',
        },
    }
}

STATIC_URL = '/static/'

CSRF_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_SECURE = not DEBUG

# Email
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = creds['EMAIL_HOST']
EMAIL_PORT = creds['EMAIL_PORT']
EMAIL_HOST_USER = creds['EMAIL_HOST_USER']
EMAIL_HOST_PASSWORD = creds['EMAIL_HOST_PASSWORD']
EMAIL_USE_SSL = True


# Celery
CELERY_BROKER_URL = 'redis://localhost:6379/0' if LOCAL_REDIS else 'redis://redis:6379/0'
CELERY_RESULT_BACKEND = 'django-db'

# Sentry
if not DEBUG:
    sentry_sdk.init(
        dsn=creds['SENTRY_URL'],
        integrations=[DjangoIntegration()],

        # Set traces_sample_rate to 1.0 to capture 100%
        # of transactions for performance monitoring.
        # We recommend adjusting this value in production.
        traces_sample_rate=1.0,

        # If you wish to associate users to errors (assuming you are using
        # django.contrib.auth) you may enable sending PII data.
        send_default_pii=True
    )

# JWT
JWT_SECRET_KEY = creds['JWT_SECRET_KEY']
JWT_ALGORITHM = creds['JWT_ALGORITHM']

# Object Storage
OCI_CUSTOMER_ACCESS_KEY = creds['OCI_CUSTOMER_ACCESS_KEY']
OCI_CUSTOMER_SECRET_KEY = creds['OCI_CUSTOMER_SECRET_KEY']
OCI_STORAGE_NAMESPACE = creds['OCI_STORAGE_NAMESPACE']
OCI_REGION = creds['OCI_REGION']

# Elasticsearch
ES_HOST = 'es'
