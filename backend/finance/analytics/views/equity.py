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

import collections
from django.db.models import Q
from .base import (JsonGetView, TickerViewMixin, DailyPricesView,
                   JsonGetTextView)
from ..models.concrete import (Security, Option, FirmOverview, CashFlow,
                               BalanceSheet, FinancialVisual, NA, to_percent)


def convert_date(d):
    return int(d.timestamp()) * 1000


class RatiosView(TickerViewMixin, JsonGetView):
    def get_ticker_data(self, ticker, *args, **kwargs):
        ind_data = Security.annotate_industry().filter(ticker=ticker).first()
        industry = (ind_data['industry'] if ind_data
                    and ind_data['industry_count'] is not None
                    and ind_data['industry_count'] > 1 else None)
        qs = BalanceSheet.annotate_ratios(industry)
        ratios = {
            'roa': [],
            'roe': [],
            'current_ratio': [],
            'cash_ratio': [],
        }
        averages = collections.defaultdict(list)
        query = Q(ticker__ticker=ticker)
        if industry:
            query |= Q(industry=industry, is_snp=True)
        for r in qs.filter(query):
            if r['ticker__ticker'] != ticker:
                continue
            date = convert_date(r['fiscal_date'])
            for k, v in ratios.items():
                if not r[k]:
                    continue
                v.append({'date': date, 'value': r[k]})
                avg = r.get(f'avg_{k}')
                if not avg:
                    continue
                averages[k].append({'date': date, 'value': avg})

        visuals = FinancialVisual.objects.filter(
            key__in=ratios.keys(), visible=True).order_by('-type', 'key')

        ret = collections.defaultdict(list)
        for v in visuals:
            r = ratios[v.key]
            data = [{
                'name': ticker,
                'color': v.primary_color1,
                'data': r
            }]
            ret[v.type_verbose].append({
                'subTitle': v.name,
                'data': data
            })
            a = averages.get(v.key, [])
            if not a:
                continue
            data.append({
                'color': v.secondary_color,
                'name': 'Industry Average',
                'data': a,
            })

        return {'ratios': [{'title': k, 'items': v} for k, v in ret.items()]}


class FreeCashFlowsView(TickerViewMixin, JsonGetView):
    def get_ticker_data(self, ticker, *args, **kwargs):
        flows = {'fcff': [], 'fcfe': []}
        annotated = CashFlow.annotate_free_cashflows().filter(
            ticker__ticker=ticker)
        for f in annotated:
            date = convert_date(f['fiscal_date'])
            for k, v in flows.items():
                if (f[k]):
                    v.append({'date': date, 'value': f[k]})

        ret = []
        visuals = FinancialVisual.objects.filter(
            key__in=flows.keys(), visible=True).order_by('-key')
        for v in visuals:
            ret.append({
                'title': v.name,
                'data': flows[v.key],
                'shapeGradient': f'{v.primary_color1},{v.primary_color2}',
                'toolTipBgColor': v.secondary_color
            })

        return {'cashflows': ret}


def map_exchange(t):
    if t.exchange == 'NYQ':
        return 'NYSE'
    elif t.exchange in ['NCM', 'NGM', 'NMS']:
        return 'Nasdaq'
    else:
        return t


HEADER_MAPPING = {
    'ticker': lambda x: x.ticker.ticker,
    'name': lambda x: x.name,
    'exchange': lambda x: map_exchange(x.ticker),
    'sector': lambda x: x.sector,
    'industry': lambda x: x.industry,
}

ITEM_MAPPING = {
    'EPS': lambda x: x.eps or NA,
    'P/E': lambda x: x.pe,
    'Div Yield': lambda x: to_percent(x.dividend_yield),
    'Market Cap': lambda x: x.market_cap,
    'Book Value': lambda x: x.book_value or NA,
    'EV / EBITDA': lambda x: x.ev_ebitda or NA,
    'Gross Profit': lambda x: x.gross_profit,
    'Revenue': lambda x: x.revenue,
    'Revenue Per Share': lambda x: x.revenue_per_share,
}


class OverviewView(TickerViewMixin, JsonGetView):
    def get_ticker_data(self, ticker, *args, **kwargs):
        fo = FirmOverview.objects.select_related().filter(
            ticker__ticker=ticker).first()
        if not fo:
            return {}
        header = {}
        for k, v in HEADER_MAPPING.items():
            header[k] = v(fo)
        items = {}
        for k, v in ITEM_MAPPING.items():
            items[k] = v(fo)
        notes = fo.notes if fo.notes.strip() else None
        return {
            'header': header,
            'items': items,
            'notes': notes,
            'updatedAt': fo.updated_at
        }


TECH_MAPPING = {
    'Insider Own': lambda x: to_percent(x.insider_ownership),
    'Inst Own': lambda x: to_percent(x.institutional_ownership),
    'Short Ratio': lambda x: x.short_ratio or NA,
    '1-Year Beta': lambda x: f'{x.beta:.2f}' if x.beta else NA,
    '52 Week High': lambda x: x.week52_high or NA,
    '52 Week Low': lambda x: x.week52_low or NA,
}


class TechnicalsView(TickerViewMixin, JsonGetView):
    def get_ticker_data(self, ticker, *args, **kwargs):
        fo = FirmOverview.objects.filter(ticker__ticker=ticker).first()
        if not fo:
            return {}
        ret = {}
        for k, v in TECH_MAPPING.items():
            ret[k] = v(fo)
        return ret


OPTION_MAPPING = {
    'expiration': lambda x: x.expiration.isoformat(),
    'strike': lambda x: x.strike,
    'lastPrice': lambda x: x.last_price,
    'lastTrade': lambda x: x.last_trade,
    'impliedVolatility': lambda x: x.implied_volatility,
    'volume': lambda x: x.volume,
    'contractSymbol': lambda x: x.name,
}


class OptionsView(TickerViewMixin, JsonGetView):
    def get_ticker_data(self, ticker, *args, **kwargs):
        call = put = None
        for o in Option.objects.filter(ticker__ticker=ticker, exists=True):
            opt = {}
            for k, v in OPTION_MAPPING.items():
                opt[k] = v(o)
            if o.type == 'C':
                call = opt
            elif o.type == 'P':
                put = opt
        return {'call': call, 'put': put} if call or put else {}


class DailyView(TickerViewMixin, DailyPricesView):
    def get_ticker_data(self, ticker, *args, **kwargs):
        daily = self.get_prices([ticker])
        if not daily or not daily[0].get('series'):
            return {}
        return daily[0]


class TextsView(JsonGetTextView):
    page = 'E'
    keys = ['notes']
