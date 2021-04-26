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

from django.conf import settings
from django.urls import path

from .views import home, securities, equity, fixed_income, portfolio_tools, crawl

StocksView = (securities.StocksViewElastic if settings.USE_ELASTIC_COMPLETER
              else securities.StocksView)

urlpatterns = [
    path('texts/', home.TextsView.as_view(), name='home_texts'),
    path('stocks/', StocksView.as_view(), name='securities_stocks'),
    path('bonds/', securities.BondsView.as_view(), name='securities_bonds'),
    path('fixed/texts/', fixed_income.TextsView.as_view(),
         name='fixed_income_texts'),
    path('fixed/<ticker>/overview/', fixed_income.OverviewView.as_view(),
         name='fixed_income_overview'),
    path('portfolio/texts/', portfolio_tools.TextsView.as_view(),
         name='portfolio_tools_texts'),
    path('portfolio/daily/', portfolio_tools.DailyView.as_view(),
         name='portfolio_tools_daily'),
    path('equity/texts/', equity.TextsView.as_view(), name='equity_texts'),
    path('equity/<ticker>/daily/', equity.DailyView.as_view(),
         name='equity_daily'),
    path('equity/<ticker>/options/', equity.OptionsView.as_view(),
         name='equity_options'),
    path('equity/<ticker>/technicals/', equity.TechnicalsView.as_view(),
         name='equity_technicals'),
    path('equity/<ticker>/overview/', equity.OverviewView.as_view(),
         name='equity_overview'),
    path('equity/<ticker>/cashflows/', equity.FreeCashFlowsView.as_view(),
         name='equity_cashflows'),
    path('equity/<ticker>/ratios/', equity.RatiosView.as_view(),
         name='equity_ratios'),
]

if settings.USE_WEB_CRAWL:
    urlpatterns += [
        path('crawl/<schema>/', crawl.CrawlView.as_view(), name='crawl'),
    ]

if settings.DEBUG:
    urlpatterns += [
        path('tickers/<t>/', securities.dev_all,
             name='securities_stocks_all'),
    ]
