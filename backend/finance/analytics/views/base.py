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

from django.views import View
from django.http import JsonResponse
from ..models.concrete import TextItem, Candle


class JsonGetView(View):
    http_method_names = ['get']

    def get_data(self, *args, **kwargs):
        return {}

    def get(self, request, *args, **kwargs):
        params = self.request.GET
        kwargs.update(params)
        data = self.get_data(*args, **kwargs)

        return JsonResponse(data)


class JsonGetTextView(JsonGetView):
    page = None
    keys = []

    def get_data(self, *args, **kwargs):
        ret = {}
        if not self.page or not self.keys:
            return ret
        texts = TextItem.objects.filter(page=self.page, key__in=self.keys)
        if not texts.exists():
            return ret
        for t in texts:
            ret[t.key] = t.text
        return ret


class TickerViewMixin:
    def get_ticker_data(self, ticker, *args, **kwargs):
        return {}

    def get_data(self, *args, **kwargs):
        ticker = kwargs.pop('ticker')
        if not ticker:
            return {}
        return self.get_ticker_data(ticker, *args, **kwargs)


CANDLE_LIMIT = 100


class DailyPricesView(JsonGetView):
    def get_prices(self, tickers, only_close=False):
        daily = []
        fields = ['ticker__ticker', 'time', 'close']
        if not only_close:
            fields += ['open', 'low', 'high', 'volume']
        candles = Candle.objects.select_related('ticker').filter(
            ticker__ticker__in=tickers).order_by(
            'ticker', 'time').values(*fields)
        if not only_close:
            length = candles.count()
            start = 0
            if length > CANDLE_LIMIT:
                start = length - CANDLE_LIMIT
            candles = candles[start:]
        for c in candles:
            t = c['ticker__ticker']
            prices = next(
                (p for p in daily if p.get('ticker') == t), None)
            if not prices:
                prices = {'ticker': t, 'series': []}
                daily.append(prices)
            candle = {'d': c['time'].isoformat()}
            close = c['close']
            if only_close:
                candle['ac'] = close
            else:
                candle['c'] = close
                candle['o'] = c['open']
                candle['l'] = c['low']
                candle['h'] = c['high']
                candle['v'] = c['volume']
            prices['series'].append(candle)

        return daily
