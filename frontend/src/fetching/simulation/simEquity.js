/****************************************************************************
**
** This file is part of the Mishurov Finance website
**
** Copyright (C) 2021 Alexander Mishurov
**
** GNU General Public License Usage
** This file may be used under the terms of the GNU
** General Public License version 3. The licenses are as published by
** the Free Software Foundation and appearing in the file LICENSE.GPL3
** included in the packaging of this file. Please review the following
** information to ensure the GNU General Public License requirements will
** be met: https://www.gnu.org/licenses/gpl-3.0.html.
**
****************************************************************************/

import overviewIBM from './data/overview_av_IBM.json';
import cashflowIBM from './data/cashflow_av_IBM.json';
import incomeIBM from './data/income_av_IBM.json';
import balanceIBM from './data/balance_av_IBM.json';
//import optionsIBM from './data/options_yahoo_IBM.json';
import optionsLatestIBM from './data/options_latest_yahoo_IBM.json';
import dailyIBM from './data/daily_av_IBM.json';

import { toPercent, formatCount } from '../../components/common/utils';

import * as eq from './mapEquity.js'

const NUM_YEARS = 5;
const NUM_QUARTERS = 4 * NUM_YEARS;


export function generateAverage(startDate, mult) {
  const average = [];
  const date = new Date(startDate);

  for (let i = 0; i < NUM_QUARTERS; i++) {
    average.push({
      date: date.getTime(),
      value: Math.random() * mult,
    });
    date.setMonth(date.getMonth() - 3);
  }

  return average;
}

// https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=IBM&apikey=demo
// https://www.alphavantage.co/query?function=BALANCE_SHEET&symbol=IBM&apikey=demo
export function ratios(t) {
  const incomes = incomeIBM['quarterlyReports'].slice(0, NUM_QUARTERS)
  const balances = balanceIBM['quarterlyReports'].slice(0, NUM_QUARTERS)

  const startDate = new Date(
    Date.parse(incomes[0].fiscalDateEnding));

  const keys = ['ROA', 'ROE', 'current', 'cash'];
  const colors = ['#965d89', '#6c689e', '#5272a8', '#5e738c'];
  const multipliers = [0.05, 0.1, 2, 1];
  const averages = {}
  for (let i = 0; i < keys.length; i++)
    averages[keys[i]] = generateAverage(startDate, multipliers[i]);

  const mapped = eq.mapToRatios({incomes, balances, averages});
  const items = {}
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    items[k] = [
      {
        color: colors[i],
        name: 'IBM',
        data: mapped[k].firm,
      },
      {
        color: '#999',
        name: 'Industry Average',
        data: mapped[k].average,
      }
    ];
  }

  const ratios = [
    {
      title: 'Profitability Ratios',
      items: [
        {
          subTitle: 'Return on Assets',
          data: items.ROA,
        },
        {
          subTitle: 'Return on Equity',
          data: items.ROE,
        },
      ],
    },
    {
      title: 'Liquidity Ratios',
      items: [
        {
          subTitle: 'Current Ratio',
          data: items.current,
        },
        {
          subTitle: 'Cash Ratio',
          data: items.cash,
        },
      ],
    },
  ];

  return {ratios};
}


// https://www.alphavantage.co/query?function=CASH_FLOW&symbol=IBM&apikey=demo
export function cashflows(ticker) {
  const reports = cashflowIBM['quarterlyReports'].slice(0, NUM_QUARTERS)
  const flows = eq.mapToFCF(reports)
  const cashflows = [
    {
      title: 'Free Cash Flow to the Firm',
      data: flows.FCFF,
      shapeGradient: '#b29fc4,#9f70cc',
      toolTipBgColor: '#866d9e',
    },
    {
      title: 'Free Cash Flow to Equity',
      data: flows.FCFE,
      shapeGradient: '#9ba3bf,#5b91c9',
      toolTipBgColor: '#6078a8',
    }
  ];
  return {cashflows};
}
//https://query2.finance.yahoo.com/v7/finance/options/IBM
//https://query2.finance.yahoo.com/v7/finance/options/IBM?date=1674172800
//https://finance.yahoo.com/quote/IBM/options
export function options(ticker) {
  return eq.extractOptions(optionsLatestIBM);
}

// https://www.alphavantage.co/query?function=OVERVIEW&symbol=IBM&apikey=demo
export function overview(ticker) {
  const header = {
    ticker: overviewIBM.Symbol,
    name: overviewIBM.Name,
    exchange: overviewIBM.Exchange,
    sector: overviewIBM.Sector,
    industry: overviewIBM.Industry,
  }
  const items = {
    'EPS': overviewIBM.EPS,
    'P/E': overviewIBM.PERatio,
    'Div Yield': toPercent(overviewIBM.DividendYield),
    'Market Cap': formatCount(overviewIBM.MarketCapitalization),
    'Book Value': overviewIBM.BookValue,
    'EBITDA': formatCount(overviewIBM.EBITDA),
    'Gross Profit': formatCount(overviewIBM.GrossProfitTTM),
    'Revenue': formatCount(overviewIBM.RevenueTTM),
    'Revenue Per Share': formatCount(overviewIBM.RevenuePerShareTTM),
  }
  return {header, items, updatedAt: new Date()};
}


export function technicals(ticker) {
  return {
    'Insider Own' : overviewIBM.PercentInsiders + '%',
    'Inst Own' : overviewIBM.PercentInstitutions + '%',
    'Short Ratio' : overviewIBM.ShortRatio,
    '1-Year Beta' : overviewIBM.Beta,
    '52 Week High' : overviewIBM['52WeekHigh'],
    '52 Week Low' : overviewIBM['52WeekLow'],
  };
}


function parseDaily(data) {
  const ticker = data['Meta Data']['2. Symbol']
  const obj = data['Time Series (Daily)'];
  const series = [];
  for (const [key, value] of Object.entries(obj)) {
    series.push({
      d: new Date(key),
      o: parseFloat(value['1. open']),
      h: parseFloat(value['2. high']),
      l: parseFloat(value['3. low']),
      c: parseFloat(value['4. close']),
      v: parseInt(value['6. volume']),
    });
  }
  series.reverse();
  return {ticker, series};
}

const seriesDaily = parseDaily(dailyIBM);

export function daily(ticker) {
  return seriesDaily;
}


export function texts() {
  return {
    notes: [
      'The asset summary data, financial statements and some technical-analysis data are scheduled for weekly updates during weekends.',
      'Daily prices are scheduled for nightly updates on business days.',
      'The data shown can be imprecise due to using the different sources of the financial data.',
    ]
  };
}
