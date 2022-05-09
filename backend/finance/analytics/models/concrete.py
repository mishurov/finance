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

from datetime import timedelta
from django.db import models
from django.db.models import (F, Q, ExpressionWrapper, Value, OuterRef,
                              Subquery, When, Case, Count, Avg, Window)
from django.db.models.functions import TruncQuarter, Cast
from . import abstract


NA = 'n/a'

# django.db.utils.OperationalError: ORA-03113: end-of-file on communication channel


def to_percent(x):
    return '{:.2f}'.format(float(x) * 100) + '%' if x else NA


def format_count(n):
    if not n:
        return NA
    n = float(n)
    val = abs(n)
    i = 0
    suffix = ["", "K", "M", "B", "T"]
    while val >= 1000:
        val = val / 1000
        i += 1
    val = val if n > 0 else -val
    return f'{val:.3f}' + suffix[i]


class TextItem(models.Model):
    PAGES = (
        ('H', 'Home'),
        ('E', 'Equity'),
        ('F', 'Fixed Income'),
        ('P', 'Portfolio Tools'),
    )
    key = models.CharField('key', max_length=200)
    page = models.CharField('page', max_length=1, choices=PAGES)
    text = models.TextField('text', blank=True)

    def __str__(self):
        page = next((p[1] for p in self.PAGES if p[0] == self.page), None)
        return f'{self.key} - {page}'


class Security(abstract.AbstractSecurity):
    @classmethod
    def annotate_industry(cls):
        overview_subq = FirmOverview.objects.filter(ticker=OuterRef('pk'))

        industry_tickers_subq = FirmOverview.objects.filter(
            industry=OuterRef('industry'), is_snp=True)

        industry_count_subq = industry_tickers_subq.values('industry').annotate(
            c=Count('*')
        ).values('c')

        return cls.objects.annotate(
            industry=Subquery(overview_subq.values_list('industry')[:1]),
            is_snp=Subquery(overview_subq.values_list('is_snp')[:1])
        ).annotate(
            industry_count=Subquery(industry_count_subq)
        ).values('industry', 'industry_count')


class Candle(abstract.AbstractCandle):
    pass


class BondOverview(abstract.AbstractBondOverview):
    pass


class Option(abstract.AbstractOption):
    pass


class FirmOverview(abstract.AbstractFirmOverview):
    def get_latest_candle(self):
        return Candle.objects.filter(ticker=self.ticker).order_by('-time').first()

    def get_latest_income(self):
        return IncomeStatement.objects.filter(
            ticker__ticker=self.ticker).order_by('-fiscal_date').first()

    @property
    def pe(self):
        candle = self.get_latest_candle()
        return f'{(candle.close / self.eps):.2f}' if candle and self.eps else NA

    @property
    def market_cap(self):
        candle = self.get_latest_candle()
        ret = NA
        if candle and self.shares_outstanding:
            ret = format_count(candle.close * self.shares_outstanding)
        return ret

    @property
    def gross_profit(self):
        income = self.get_latest_income()
        return format_count(income.gross_profit) if income else NA

    @property
    def revenue(self):
        income = self.get_latest_income()
        return format_count(income.total_revenue) if income else NA

    @property
    def revenue_per_share(self):
        income = self.get_latest_income()
        ret = NA
        if income and income.total_revenue and self.shares_outstanding:
            ret = f'{(income.total_revenue / self.shares_outstanding):.2f}'
        return ret


class IncomeStatement(abstract.AbstractIncomeStatement):
    pass


class BalanceSheet(abstract.AbstractBalanceSheet):
    @classmethod
    def net_income_subq(cls):
        return IncomeStatement.objects.filter(
            ticker=OuterRef('ticker'), fiscal_date=OuterRef('fiscal_date')
        ).values_list('net_income')[:1]

    @classmethod
    def overview_subq(cls):
        return FirmOverview.objects.filter(ticker=OuterRef('ticker'))

    @classmethod
    def wrap_float(cls, expr):
        return ExpressionWrapper(expr, output_field=models.FloatField())

    @classmethod
    def cast_float(cls, name):
        return Cast(name, models.FloatField())

    @classmethod
    def wrap_cond(cls, cond, expr):
        return Case(When(cond, then=0), default=expr,
                    output_field=models.FloatField())

    @classmethod
    def annotate_ratios(cls, compute_averages=True):
        mapping = {
            'roa':
                cls.cast_float('net_income') / cls.cast_float('total_assets'),
            'roe':
                cls.cast_float('net_income') / cls.cast_float('total_stock_equity'),
            'current_ratio':
                (cls.cast_float('total_current_assets')
                    / cls.cast_float('total_current_liabilities')),
            'cash_ratio':
                (cls.cast_float('cash')
                    / cls.cast_float('total_current_liabilities')),
        }

        predicates = {
            'roa': Q(net_income=0) | Q(total_assets=0),
            'roe': Q(net_income=0) | Q(total_stock_equity=0),
            'current_ratio':
                Q(total_current_assets=0) | Q(total_current_liabilities=0),
            'cash_ratio': Q(cash=0) | Q(total_current_liabilities=0),
        }

        ratio_annotations = {}
        for k, v in mapping.items():
            ratio_annotations[k] = cls.wrap_cond(
                predicates[k], cls.wrap_float(v)
            )
        qs = cls.objects.annotate(
            net_income=Subquery(cls.net_income_subq()),
        ).annotate(**ratio_annotations).order_by('fiscal_date')

        fields = ['ticker__ticker', 'fiscal_date']
        fields += list(ratio_annotations.keys())
        if not compute_averages:
            return qs.values(*fields)

        qs = qs.annotate(
            industry=Subquery(cls.overview_subq().values_list('industry')[:1]),
            is_snp=Subquery(cls.overview_subq().values_list('is_snp')[:1]),
            quarter=ExpressionWrapper(
                TruncQuarter('fiscal_date') + Value(timedelta(days=91)),
                output_field=models.DateTimeField()
            )
        )

        window = {
            'partition_by': [F('industry'), F('quarter')],
            'order_by': F('quarter').asc(),
        }
        avg_annotations = {}
        for k in mapping.keys():
            avg_annotations['avg_' + k] = Window(expression=Avg(k), **window)
        qs = qs.annotate(**avg_annotations)

        fields += ['quarter'] + list(avg_annotations.keys())
        return qs.values(*fields)


class CashFlow(abstract.AbstractCashFlow):
    @classmethod
    def wrap_bi(cls, num):
        return Value(num, output_field=models.BigIntegerField())

    @classmethod
    def annotate_free_cashflows(cls):
        fcff_cond = Q(operating_cashflow=0) | Q(capital_expenditures=0)
        fcfe_cond = fcff_cond | Q(net_borrowings=0)
        fcff_expr = F('operating_cashflow') + F('capital_expenditures')
        fcfe_expr = fcff_expr + F('net_borrowings')
        return cls.objects.annotate(
            fcff=Case(When(fcff_cond, then=cls.wrap_bi(0)), default=fcff_expr),
            fcfe=Case(When(fcfe_cond, then=cls.wrap_bi(0)), default=fcfe_expr),
        ).order_by('fiscal_date').values('fiscal_date', 'fcff', 'fcfe')


class FinancialVisual(models.Model):
    TYPES = (
        ('A', 'Activity Ratios'),
        ('L', 'Liquidity Ratios'),
        ('S', 'Solvency Ratios'),
        ('P', 'Profitability Ratios'),
        ('V', 'Valuation Ratios'),
        ('F', 'Free Cash Flows'),
    )
    type = models.CharField('type', max_length=1, choices=TYPES)
    name = models.CharField('name', max_length=200)
    key = models.CharField('key', max_length=200)
    primary_color1 = models.CharField(
        'primary color 1', max_length=200, default='steelblue',
        help_text="Firm's line chart color or area chart gradient 1")
    primary_color2 = models.CharField(
        'primary color 2', max_length=200, default='royalblue',
        help_text="Firm's area chart gradient 2")
    secondary_color = models.CharField(
        'secondary color', max_length=200, default='lightgray',
        help_text="Indstry average line chart color or tooltip color")
    visible = models.BooleanField('is visible', default=True)

    @property
    def type_verbose(self):
        return next((t[1] for t in self.TYPES if t[0] == self.type), None)

    def __str__(self):
        return self.name
