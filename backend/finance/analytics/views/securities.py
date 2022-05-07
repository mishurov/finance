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

from elasticsearch_dsl import connections
from elasticsearch_dsl.query import MultiMatch
from fast_autocomplete.loader import AutoComplete
from fast_autocomplete.loader import WordValue
from django.http import JsonResponse
from django.conf import settings
from .base import JsonGetView
from ..models.concrete import Security
from ..search import SecurityDoc
from ..object_storage import load_json, save_json, exists


QUERY_PARAM = 'q'

AC_OCI_BUCKET = 'securities'
AC_OCI_OBJ_NAME = 'stocks-autocomplete.json'

completer = None


class StocksView(JsonGetView):

    def get_or_create_synonyms(self):
        try:
            has_syn = exists(AC_OCI_BUCKET, AC_OCI_OBJ_NAME)
        except Exception:
            has_syn = False
        if has_syn:
            try:
                r = load_json(AC_OCI_BUCKET, AC_OCI_OBJ_NAME)
            except Exception:
                r = None
            if r is not None:
                return r

        stock_synonyms = {}

        for s in Security.objects.filter(type='S').values('ticker', 'name'):
            stock_synonyms[s['ticker']] = [s['name']]
        try:
            save_json(AC_OCI_BUCKET, AC_OCI_OBJ_NAME, stock_synonyms)
        except Exception:
            pass

        return stock_synonyms

    def get_completer(self):
        global completer
        if completer is None:
            stock_synonyms = self.get_or_create_synonyms()
            stock_words = {k: WordValue(context={}, display=v[0], count=1)
                           for k, v in stock_synonyms.items()}
            completer = AutoComplete(
                words=stock_words, synonyms=stock_synonyms)

        return completer

    def get_data(self, *args, **kwargs):
        query = kwargs.get(QUERY_PARAM)
        if query is None or not len(query):
            return {'stocks': []}
        query = query[0]
        r = self.get_completer().search(word=query, max_cost=3, size=15)
        stocks = {}
        for words in r:
            for w in words:
                t = w.upper()
                if stocks.get(t) is None:
                    stocks[t] = self.get_completer().words[t].display
        stocks = [[k, v] for k, v in stocks.items()]
        return {'stocks': stocks}


bonds = []


class BondsView(JsonGetView):
    def get_data(self, *args, **kwargs):
        global bonds
        if not bonds:
            bonds = list(Security.objects.filter(
                type='B').values_list('name', 'ticker'))
        return {'bonds': bonds}


if settings.USE_ELASTIC_COMPLETER:
    connections.create_connection(hosts=[settings.ES_HOST])


class StocksViewElastic(JsonGetView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def get_data(self, *args, **kwargs):
        query = kwargs[QUERY_PARAM][0]
        search = SecurityDoc.search()
        search.query = MultiMatch(
            query=query,
            type='bool_prefix',
            fields=['ticker', 'ticker._2gram', 'ticker._3gram',
                    'name', 'name._2gram', 'name._3gram']
        )
        response = search.execute()
        ret = [[r.ticker, r.name] for r in response]
        return {'stocks': ret}


def dev_all(request, t):
    qs = Security.objects.filter(type=t).order_by('ticker').values('ticker')
    r = JsonResponse({t: [s['ticker'] for s in qs]})
    r["Access-Control-Allow-Origin"] = "*"
    return r
