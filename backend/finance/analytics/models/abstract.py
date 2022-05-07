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

"""To reuse in the crawler project for the second database
"""
from django.utils import timezone
from django.db import models


DATE_FORMAT = '%Y-%m-%d'


class AbstractSecurity(models.Model):
    TYPES = (
        ('B', 'Bond'),
        ('S', 'Stock'),
    )
    ticker = models.CharField('ticker', max_length=200)
    name = models.CharField('name', max_length=200)
    exchange = models.CharField('exchange', max_length=200, blank=True)
    currency = models.CharField('currency', max_length=200)
    type = models.CharField('type', max_length=1, choices=TYPES)

    class Meta:
        abstract = True
        verbose_name_plural = "securities"
        ordering = ['ticker']

    def __str__(self):
        return self.ticker


class AbstractCandle(models.Model):
    TYPES = (
        ('D', 'Daily'),
        ('W', 'Weekly'),
        ('M', 'Monthly'),
    )
    type = models.CharField('type', max_length=1, choices=TYPES)
    ticker = models.ForeignKey('Security', on_delete=models.CASCADE)
    time = models.DateTimeField('time')
    open = models.FloatField('open', default=0)
    close = models.FloatField('close', default=0)
    high = models.FloatField('high', default=0)
    low = models.FloatField('low', default=0)
    volume = models.PositiveBigIntegerField('volume', default=0)

    class Meta:
        abstract = True

    def __str__(self):
        return '{} {}'.format(
            self.ticker.ticker,
            self.time.strftime(DATE_FORMAT)
        )


class AbstractBondOverview(models.Model):
    ticker = models.ForeignKey('Security', on_delete=models.CASCADE)
    name = models.CharField('name', max_length=200)
    currency = models.CharField('currency', max_length=200)
    last_price = models.FloatField('last price, %', default=0)
    last_trade = models.DateTimeField('last trade date', blank=True, null=True)
    maturity_date = models.DateTimeField('maturity date')
    coupon_date = models.DateTimeField('coupon date', blank=True, null=True)
    coupon_period = models.PositiveBigIntegerField('coupon period', default=0)
    coupon_rate = models.FloatField('coupon rate, %', default=0)
    coupon_value = models.FloatField('coupon value', default=0)
    lot_size = models.PositiveBigIntegerField('lot size', default=0)
    lot_value = models.FloatField('lot value', default=0)
    issue_volume = models.PositiveBigIntegerField('issue volume', default=0)

    class Meta:
        abstract = True

    def __str__(self):
        return self.ticker.ticker


class AbstractOption(models.Model):
    TYPES = (
        ('C', 'Call'),
        ('P', 'Put'),
    )
    type = models.CharField('type', max_length=1, choices=TYPES)
    ticker = models.ForeignKey('Security', on_delete=models.CASCADE)
    name = models.CharField('name', max_length=200)
    expiration = models.DateTimeField('expiration date')
    strike = models.FloatField('strike price', default=0)
    last_price = models.FloatField('last contract price', default=0)
    last_trade = models.DateTimeField('last trade date', blank=True, null=True)
    implied_volatility = models.FloatField('implied volatility', default=0)
    exists = models.BooleanField('exists', default=True)
    volume = models.PositiveBigIntegerField('volume', default=0)

    class Meta:
        abstract = True

    def __str__(self):
        return self.name


class AbstractFirmOverview(models.Model):
    name = models.CharField('name', max_length=200)
    ticker = models.ForeignKey('Security', on_delete=models.CASCADE)
    sector = models.CharField('sector', max_length=200)
    industry = models.CharField('industry', max_length=200)
    shares_outstanding = models.PositiveBigIntegerField('shares outstanding')
    book_value = models.FloatField('book value', default=0)
    dividend_yield = models.FloatField('dividend yield', default=0)
    eps = models.FloatField('eps', default=0)
    ev = models.BigIntegerField('enterprise value', default=0)
    ev_ebitda = models.FloatField('EV/EBITDA', default=0)
    insider_ownership = models.FloatField('insider ownership, %', default=0)
    institutional_ownership = models.FloatField('institutional ownership, %', default=0)
    beta = models.FloatField('1-year beta', default=0)
    week52_high = models.FloatField('52 week high', default=0)
    week52_low = models.FloatField('52 week low', default=0)
    short_ratio = models.FloatField('short ratio', default=0)
    updated_at = models.DateTimeField('updated at', default=timezone.now)
    is_snp = models.BooleanField('is in S&P500', default=False)
    notes = models.TextField('notes', blank=True)

    class Meta:
        abstract = True

    def __str__(self):
        return self.ticker.ticker


class FinancialStatement(models.Model):
    ticker = models.ForeignKey('Security', on_delete=models.CASCADE)
    fiscal_date = models.DateTimeField('fiscal date')

    class Meta:
        abstract = True

    def __str__(self):
        return '{} {}'.format(
            self.ticker.ticker,
            self.fiscal_date.strftime(DATE_FORMAT)
        )


class AbstractIncomeStatement(FinancialStatement):
    net_income = models.BigIntegerField('net income', default=0)
    cost_of_revenue = models.BigIntegerField('cost of revenue', default=0)
    total_revenue = models.BigIntegerField('total revenue', default=0)
    gross_profit = models.BigIntegerField('gross profit', default=0)

    class Meta:
        abstract = True


class AbstractBalanceSheet(FinancialStatement):
    total_assets = models.BigIntegerField('total assets', default=0)
    total_liabilities = models.BigIntegerField('total liabilities', default=0)
    total_stock_equity = models.BigIntegerField('total stock equity', default=0)
    total_current_assets = models.BigIntegerField('total current assets', default=0)
    total_current_liabilities = models.BigIntegerField('total current liabilities', default=0)
    inventory = models.BigIntegerField('inventory', default=0)
    cash = models.BigIntegerField('cash', default=0)

    class Meta:
        abstract = True


class AbstractCashFlow(FinancialStatement):
    operating_cashflow = models.BigIntegerField('operating cashflow', default=0)
    investing_cashflow = models.BigIntegerField('investing cashflow', default=0)
    financing_cashflow = models.BigIntegerField('financing cashflow', default=0)
    capital_expenditures = models.BigIntegerField('capital expenditures', default=0)
    net_borrowings = models.BigIntegerField('net borrowings', default=0)

    class Meta:
        abstract = True
