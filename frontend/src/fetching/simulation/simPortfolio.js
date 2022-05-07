/****************************************************************************
**
** This file is part of the Mishurov Finance website
**
** Copyright (C) 2022 Alexander Mishurov
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

import weeklyAPA from './data/weekly_av_APA.json';
import weeklyRCL from './data/weekly_av_RCL.json';
import weeklyINTC from './data/weekly_av_INTC.json';
import dailyAPA from './data/daily_av_APA.json';
import dailyRCL from './data/daily_av_RCL.json';
import dailyINTC from './data/daily_av_INTC.json';


const NUM_YEARS = 5;
const NUM_WEEKS = 51 * NUM_YEARS;


function parseSeries(data, key) {
  const ticker = data['Meta Data']['2. Symbol'];
  const series = [];
  const obj = data[key];
  let i = 0;
  for (const [key, value] of Object.entries(obj)) {
    if (i === NUM_WEEKS)
      break;
    series.push({
      d: new Date(key),
      ac: parseFloat(value['5. adjusted close'])
    });
    i++;
  }
  series.reverse();
  return { ticker, series };
}


function parseWeekly(data) {
  return parseSeries(data, 'Weekly Adjusted Time Series');
}

function parseDaily(data) {
  return parseSeries(data, 'Time Series (Daily)');
}


// https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY_ADJUSTED&symbol=IBM&apikey=demo
const seriesWeekly = {
  'APA': parseWeekly(weeklyAPA),
  'RCL': parseWeekly(weeklyRCL),
  'INTC': parseWeekly(weeklyINTC),
};

// https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=IBM&apikey=demo
const seriesDaily = {
  'APA': parseDaily(dailyAPA),
  'RCL': parseDaily(dailyRCL),
  'INTC': parseDaily(dailyINTC),
};

function series(tickers, type) {
  const ret = [];
  const obj = type === 'daily' ? seriesDaily : seriesWeekly;
  for (const t of tickers) {
    const s = obj[t];
    if (s) ret.push(s);
  }
  return {[type]: ret};
}


export function weekly(tickers) {
  return series(tickers, 'weekly');
}


export function daily(tickers) {
  return series(tickers, 'daily');
}


export function texts() {
  return {
    notes: [
      'The mean and the variance are computed using the daily log-returns of the non-adjusted daily closing prices in a one-year range.',
      'The portfolio points are randomly simulated, the weights are drown from a uniform distribution.',
      'The efficient frontier is computed using the numerical constrained optimisation, a JavaScript implementation of the dual method of Goldfarb and Idnani (1982, 1983) for solving quadratic programming problems.',
      'Daily prices are scheduled for nightly updates on business days.',
    ]
  };
}

