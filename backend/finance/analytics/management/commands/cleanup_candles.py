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

import sys
import json
from time import time
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.core.serializers.base import ProgressBar
from ...models.concrete import (Security, Candle)


class Command(BaseCommand):
    help = 'Removes old candles'

    def handle(self, *args, **options):
        total = 0
        start = time()
        qss = Security.objects.filter(type='S')
        progress_bar = ProgressBar(sys.stdout, qss.count())
        count = 0
        for s in qss.iterator():
            count += 1
            progress_bar.update(count)
            qsc = Candle.objects.filter(
                ticker=s, type='D').order_by('-time')[252:]
            if not qsc.exists():
                continue
            ids = [vl[0] for vl in qsc.values_list('id')]
            qscd = Candle.objects.filter(id__in=ids)
            qscd.delete()
            total += len(ids)

        self.stdout.write('\n')
        self.stdout.write(self.style.SUCCESS('Success'))
        elapsed = str(timedelta(seconds=time() - start))

        return json.dumps({'Candles removed': total, 'Elapsed': elapsed},
                          indent=4)
