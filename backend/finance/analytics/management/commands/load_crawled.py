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
from collections import defaultdict
from itertools import islice
from datetime import datetime
from django.core.management.base import BaseCommand, CommandError
from django.core.serializers.base import ProgressBar
from ...views.crawl import CRAWL_OCI_BUCKET, TIME_FORMAT
from ...models.concrete import (Security, Candle, IncomeStatement, BalanceSheet,
                                CashFlow, Option, FirmOverview, BondOverview)
from ...object_storage import load_json, list_objects, remove


ORACLE_BATCH_SIZE = 400

MAPPING = {
    'securities': Security,
    'incomestatements': IncomeStatement,
    'balancesheets': BalanceSheet,
    'cashflows': CashFlow,
    'options': Option,
    'candles': Candle,
    'firmoverviews': FirmOverview,
    'bondoverviews': BondOverview,
}

UNIQUE_FIELD_NAMES = ['ticker', 'time', 'fiscal_date']

prefetched = None


def deserialize(data, fields, model_name):
    global prefetched
    for d in data:
        ret = {}
        unique = {}
        for f in fields:
            if d.get(f.name) is None:
                continue
            if f.name == 'ticker' and model_name != 'Security':
                value = prefetched[d[f.name]]
            else:
                value = f.to_python(d[f.name])
            if f.name in UNIQUE_FIELD_NAMES:
                unique[f.name] = value
            ret[f.name] = value
        yield ret, unique


def batch_update_or_create(model, objs, fields=None):
    length = len(objs)
    if not length:
        return
    if fields:
        model.objects.bulk_update(objs, fields, batch_size=length)
    else:
        model.objects.bulk_create(objs, batch_size=length)


def cmp_instance(o, q):
    for k, v in q.items():
        if getattr(o, k) != v:
            return False
    return True


def query_pop(lst, query):
    idx = next((i for i, o in enumerate(lst) if cmp_instance(o, query)), None)
    return None if idx is None else lst.pop(idx)


class Command(BaseCommand):
    help = 'Loads data from crawled JSON files'

    def add_arguments(self, parser):
        parser.add_argument('schema', nargs='?', type=str)

    def handle(self, *args, **options):
        global prefetched

        start = time()

        schema = options['schema']
        if schema is None:
            raise CommandError('No schema')

        all_obj_names = list_objects(CRAWL_OCI_BUCKET)
        obj_names = [o for o in all_obj_names if o.startswith(schema)]
        if not obj_names:
            raise CommandError(f'No objects for {schema}')
        obj_names.sort(key=lambda x: datetime.strptime(
            x, f'{schema}_{TIME_FORMAT}.json')
        )
        model = MAPPING.get(schema)
        if model is None:
            raise CommandError(f'No model for {schema}')

        fields = model._meta.get_fields()
        model_name = model._meta.object_name

        total = {
            model_name: {
                'created': 0,
                'updated': 0,
            }
        }
        for on in obj_names:
            data = load_json(CRAWL_OCI_BUCKET, on)
            if data is None or not isinstance(data, list):
                raise CommandError(f'Incorret data for {schema} in {on}')

            self.stdout.write(self.style.HTTP_INFO(f'Loading {schema}'))
            progress_bar = ProgressBar(sys.stdout, len(data))

            if model_name != 'Security' and prefetched is None:
                self.stdout.write('Prefetching tickers')
                tickers_qs = Security.objects.all()
                prefetched = {}
                for s in tickers_qs:
                    prefetched[s.ticker] = s

            objs = deserialize(data, fields, model_name)
            count = 0
            while True:
                batch = list(islice(objs, ORACLE_BATCH_SIZE))
                if not batch:
                    break

                uniques = defaultdict(list)
                for __, unique in batch:
                    count += 1
                    for k, v in unique.items():
                        uniques[k + '__in'].append(v)

                # self.stdout.write('Prefetching existing batch')
                existing = list(model.objects.filter(**uniques))

                objs_to_create = []
                objs_to_update = []
                d = None
                # self.stdout.write('Creating / Updating instances')
                for d, unique in batch:
                    instance = query_pop(existing, unique)
                    if instance is not None:
                        for attr, value in d.items():
                            setattr(instance, attr, value)
                        objs_to_update.append(instance)
                    else:
                        objs_to_create.append(model(**d))

                    progress_bar.update(count)

                batch_update_or_create(model, objs_to_create)
                batch_update_or_create(model, objs_to_update, d.keys())
                total[model_name]['created'] += len(objs_to_create)
                total[model_name]['updated'] += len(objs_to_update)

            self.stdout.write('\n')

            remove(CRAWL_OCI_BUCKET, on)

        self.stdout.write(self.style.SUCCESS(f'Successfully loaded {schema}'))

        total['Elapsed'] = str(timedelta(seconds=time() - start))

        return json.dumps(total, indent=4)
