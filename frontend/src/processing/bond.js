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

import newtonRaphson from './newtonRaphson';
import { NA, formatDateStr } from '../components/common/utils';


export function overview(b) {
  if (!b.lotValue)
    return {};

  const items = {
    'Previous Quote': b.lastPrice ? b.lastPrice + '%' : NA,
    'Quote Date': formatDateStr(b.lastTrade),
    'Face Value, $': b.lotValue && b.lotSize ? b.lotValue * b.lotSize : NA,
    'Maturity Date': formatDateStr(b.maturityDate),
    'Coupon Rate': b.couponRate ? b.couponRate + '%' : NA,
    'Coupon Value, $': b.couponValue ? b.couponValue : NA,
    'Coupon Period, days': b.couponPeriod ? b.couponPeriod : NA,
    'Coupon Date': formatDateStr(b.couponDate),
  }

  return {
    name: b.name,
    ticker: b.ticker,
    items,
  }
}

function bond0ModDur(T, rate) {
  return T / Math.pow((1 + rate / 2), 2 * T + 1);
}

function bond0Convexity(T, rate) {
  return (Math.pow(T, 2) + (T / 2)) / Math.pow(1 + (rate / 2), 2 * T + 2);
}

function bondMacDur(npr, pmt, mkt, par, price) {
  let t = 1, sum = 0, pv, wt;

  for (t = 1; t <= npr; t++) {
    let cashflow = par * pmt;

    if (t === npr)
      cashflow += par;

    pv = cashflow / Math.pow(1 + mkt, t);
    wt = pv / price;
    sum += wt * t;
  }
  return sum;
};


function bondConvexity(npr, pmt, ytm, price, par) {
  let sum = 0;
  for (let t = 1; t <= npr; t++) {
    const denominator = 1 * Math.pow(1 + ytm, t + 2);
    const numerator = 1 * (t * (1 + t));
    sum += numerator / denominator;
  }

  const factor = (pmt * par) / price,
    marketAdjust = par / price,
    multiplier = (npr * (npr + 1))  /  Math.pow(1 + ytm, npr + 2),
    first = factor * sum,
    second = marketAdjust * multiplier;
  return first + second;
}


function bondYtm(price, par, T, coup, freq=2, guess=0.05) {
  const periods = T * freq,
    coupon = coup / 100 * par / freq

  const dt = []
  for (let i = 1; i <= periods; i++)
    dt.push(i / freq)

  const ytm_func = (y) => {
    const sum = dt.reduce(
      (a, t) => a + coupon / (1 + y / freq) ** (freq * t), 0
    );
    const t = dt[dt.length - 1];
    return sum + par / (1 + y/ freq) ** (freq * t) - price
  }

  return newtonRaphson(ytm_func, guess)
}


export function derived(b) {
  if (!b.lotValue || !b.lastPrice || !b.maturityDate || !b.couponRate
      || !b.couponValue || !b.couponPeriod)
    return {};

  let par = b.lotValue * b.lotSize,
    price = b.lastPrice / 100 * par,
    T = (new Date(b.maturityDate).getFullYear()
      - new Date(Date.now()).getFullYear()),
    rate = b.couponRate,
    val = b.couponValue, // or par * (rate / 100) / freq,
    freq = Math.round(365 / b.couponPeriod);

  const cy = val * freq / price;

  let ytm = 0,
    macaulay = T,
    modified = T,
    convexity = 0;

  if (freq === 0 || rate === 0) {
    ytm = Math.pow(par / price, 1 / T) - 1;
    modified = bond0ModDur(T, ytm);
    convexity = bond0Convexity(T, ytm);
  } else {
    ytm = bondYtm(price, par, T, rate, freq);
    const npr = T * freq;
    const pmt = (rate / 100) / freq;
    macaulay = bondMacDur(npr, pmt, ytm / freq, par, price) / freq;
    modified = macaulay / (1 + (ytm / freq));
    convexity = bondConvexity(npr, pmt, ytm / freq, price, par)
      / Math.pow(freq, 2);
  }

  return {
    freq, price, val, T, par, cy, ytm, macaulay, modified, convexity
  }
}
