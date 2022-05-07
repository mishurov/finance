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

import { mean } from 'd3-array';
import { max, min } from 'd3-array';


export function sma(period, data, value) {
  const val = value !== undefined ? value : d => d ? d.c : null;
  const defined = d => d != null;
  const acc = vals => vals && mean(vals);
  return sliding(period, val, data, defined, acc);
}


export function stoch(periodK, periodD, smooth, data) {
  const close = d => d ? d.c : null,
    high = d => d ? d.h : null,
    low = d => d ? d.l : null;
  const defined = d => close(d) != null && high(d) != null && low(d) != null;

  const acc = values => {
    const maxH = values && max(values, high);
    const minL = values && min(values, low);
    const kval = values && (
      100 * (close(values[values.length - 1]) - minL) / (maxH - minL));
    return isNaN(kval) ? undefined : kval;
  }

  const kwin = (data) => sliding(periodK, v => v, data, defined, acc)

  const kvals = sma(smooth, kwin(data), d => d);
  const dvals = sma(periodD, kvals, d => d);

  return kvals.map((k, i) => ({ k: k, d: dvals[i] }));
}


function sliding(period, value, data, defined, acc) {
  const windowData = data.slice(0, period).map(value);
  return data.map((d, i) => {
    if (i >= period) {
      windowData.shift();
      windowData.push(value(d, i));
    }
    if (i < period - 1 || windowData.some(d => !defined(d))) {
      return acc(undefined, i);
    }
    return acc(windowData, i);
  });
}
