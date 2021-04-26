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

import json
from time import time
from datetime import timedelta
from elasticsearch_dsl import connections
from django.core.management.base import BaseCommand
from django.conf import settings
from ...search import SecurityDoc
from ...models.concrete import Security


class Command(BaseCommand):
    help = 'Rebuilds Elasticsearch index'

    def handle(self, *args, **options):
        total = 0
        start = time()
        connections.create_connection(hosts=[settings.ES_HOST])
        SecurityDoc.init()
        for s in Security.objects.filter(type='S'):
            SecurityDoc(_id=s.id, ticker=s.ticker, name=s.name).save()
            total += 1
        SecurityDoc._index.refresh()
        self.stdout.write(self.style.SUCCESS('Successfully rebuilt ES index'))

        elapsed = str(timedelta(seconds=time() - start))
        return json.dumps({'Security indices built': total, 'Elapsed': elapsed},
                          indent=4)
