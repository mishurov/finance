# /**************************************************************************
#
#  This file is part of the Mishurov Finance website
#
#  Copyright (C) 2022 Alexander Mishurov
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

from celery import Celery
from celery.signals import task_failure
from django.core.mail import mail_admins

# set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'finance.settings')

app = Celery('finance')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()


@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')


@task_failure.connect()
def celery_task_failure_email(**kwargs):
    subject = 'Finance Error: {sender.name} ({task_id})'.format(**kwargs)
    message = (
        "Task: {sender.name}\n"
        "ID: {task_id}\n"
        "Args: {args}\n"
        "Kwargs: {kwargs}\n"
        "{exception!r}\n"
        "{einfo}"
    ).format(**kwargs)

    mail_admins(subject, message)


# celery -A finance beat -l INFO --scheduler django_celery_beat.schedulers:DatabaseScheduler
# celery -A finance worker -l INFO
