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

import json
import pkgutil
import httpx
from django.core.management import call_command
from .management import commands
from celery import shared_task


HEROKU_URL = 'http://finance-mishurov.herokuapp.com/api/texts'


COMMANDS_NAMES = []
for importer, modname, ispkg in pkgutil.iter_modules(commands.__path__):
    COMMANDS_NAMES.append(modname)


def create_task(name):
    def task(*args, **options):
        r = call_command(name, *args, **options)
        return json.loads(r)
    task.__name__ = name
    return shared_task(task)


# Dynamically create tasks for app's management commands
for n in COMMANDS_NAMES:
    vars()[n] = create_task(n)


# 0,12,24,36,48 * * * *
@shared_task(ignore_result=True)
def ping_heroku(*args, **options):
    httpx.head(HEROKU_URL)
