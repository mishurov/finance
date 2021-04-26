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

from django.test import TestCase, Client
from django.urls import reverse
from .models.concrete import Security
from .views.portfolio_tools import TICKERS_PARAM


class TickerTestCase(TestCase):
    def setup_tickers(self, t_type):
        qs = Security.objects.filter(type=t_type).values('ticker')
        self.tickers = [s['ticker'] for s in qs]
        self.c = Client()

    def check_response(self, url_name, t=None, params=''):
        kwargs = {}
        if t is not None:
            kwargs = {'ticker': t}
        url = reverse(url_name, kwargs=kwargs)
        url += params
        response = self.c.get(url)
        self.assertEqual(response.status_code, 200)


class FixedIncomeTestCase(TickerTestCase):
    def setUp(self):
        self.setup_tickers('B')

    def test_overview(self):
        for t in self.tickers:
            self.check_response('fixed_income_overview', t=t)


# iterating over all ~1500 tickers is a bit harsh,
# using mock data with some zeroed fields and missing reposts
# would be more optimal
class EquityTestCase(TickerTestCase):
    def setUp(self):
        self.setup_tickers('S')

    def test_views(self):
        for t in self.tickers:
            self.check_response('equity_ratios', t=t)
            self.check_response('equity_options', t=t)
            self.check_response('equity_technicals', t=t)
            self.check_response('equity_overview', t=t)
            self.check_response('equity_cashflows', t=t)
            self.check_response('equity_daily', t=t)


class PortfolioToolsTestCase(TickerTestCase):
    def setUp(self):
        self.setup_tickers('S')

    def test_daily(self):
        for t in self.tickers:
            self.check_response(
                'portfolio_tools_daily', params=f'?{TICKERS_PARAM}={t}')


class TextItemsTestCase(TestCase):
    def setUp(self):
        self.c = Client()

    def test_texts(self):
        text_url_names = ['home_texts', 'fixed_income_texts',
                          'portfolio_tools_texts', 'equity_texts']
        for n in text_url_names:
            response = self.c.get(reverse(n))
            self.assertEqual(response.status_code, 200)
