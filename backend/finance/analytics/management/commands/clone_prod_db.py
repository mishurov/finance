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

from django.conf import settings
from django.db.models import Model
from django.core.management.base import BaseCommand, CommandError
from ...models import concrete as models


def get_model_names(module):
    ret = []
    for name, cls in module.__dict__.items():
        is_model = isinstance(cls, type) and issubclass(cls, Model)
        if not is_model or name in ['FinancialStatement', 'Security', 'cls']:
            continue
        ret.append(name)
    return ret


MODEL_NAMES = ['Security'] + get_model_names(models)


class Command(BaseCommand):
    help = 'Clears models and copies data from the production database'

    # needs primary key resync
    # python manage.py sqlsequencereset analytics | python manage.py dbshell

    def handle(self, *args, **options):
        if not settings.LOCAL_DB or not settings.DATABASES.get('production'):
            raise CommandError('No production database or it is default')

        for n in reversed(MODEL_NAMES):
            model = getattr(models, n)
            self.stdout.write(self.style.WARNING(f'clearing {n}...'))
            qs = model.objects.using('default').all()
            qs.delete()

        for n in MODEL_NAMES:
            model = getattr(models, n)
            self.stdout.write(f'copying {n}...')
            qs = model.objects.using('production').all()
            model.objects.using('default').bulk_create(qs)
            self.stdout.write(self.style.SUCCESS(f'{n} copied'))

        self.stdout.write(self.style.SUCCESS('Success'))
