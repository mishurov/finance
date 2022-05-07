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

from django.core import serializers
from .base import JsonGetView, TickerViewMixin, JsonGetTextView
from ..models.concrete import BondOverview


BOND_MAPPING = {
    'name': 'name',
    'lastPrice': 'last_price',
    'lastTrade': 'last_trade',
    'maturityDate': 'maturity_date',
    'couponDate': 'coupon_date',
    'couponPeriod': 'coupon_period',
    'couponRate': 'coupon_rate',
    'couponValue': 'coupon_value',
    'lotSize': 'lot_size',
    'lotValue': 'lot_value',
    'issueVolume': 'issue_volume',
}

serializer = serializers.get_serializer("python")()


class OverviewView(TickerViewMixin, JsonGetView):
    def get_ticker_data(self, ticker, *args, **kwargs):
        bo = BondOverview.objects.filter(ticker__ticker=ticker).first()
        if bo is None:
            return {}
        bo = serializer.serialize([bo])[0]['fields']
        ret = {'ticker': ticker}
        for k, v in BOND_MAPPING.items():
            ret[k] = bo[v]
        return ret


class TextsView(JsonGetTextView):
    page = 'F'
    keys = ['notes']
