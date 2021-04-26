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

import { select } from 'd3-selection';
import { utcFormat } from 'd3-time-format';
import Grid from '../common/Grid';
import RoundYMixin from '../common/RoundYMixin';


const formatDay = utcFormat("%d"),
  formatMonth = utcFormat("%b"),
  formatYear = utcFormat("%Y");


function minMaxC(d, acc=[Infinity, -Infinity, -Infinity]) {
  return d.reduce((a, v) =>
    [Math.min(a[0], v.l), Math.max(a[1], v.h), Math.max(a[2], v.v)], acc);
}


class CandleGrid extends RoundYMixin(Grid) {
  tickXWidth = 35;
  ticksY = 5;

  updateYWithData(data) {
    const domainX = this.x.domain();

    const l = Math.max(0, Math.round(domainX[0]));
    const r = Math.round(domainX[1]) + 1;

    const [minP, maxP, maxV] = minMaxC(data.slice(l, r));

    if (minP === maxP)
      return;

    const fracP = 0.10;

    this.roundYdomain(minP, maxP, fracP)

    return maxV;
  }


  configureTicksX() {
    const that = this;
    this.axisX.tickFormat(function(d, i) {
      if (!that.dates || !that.dates.length)
        return ' ';
      const date = that.dates[Math.round(d)];
      if (!date)
        return ' ';
      let fmt = formatDay;
      if (i > 0) {
        if (that.prevDate.getFullYear() !== date.getFullYear())
          fmt = formatYear;
        else if (that.prevDate.getUTCMonth() !== date.getUTCMonth())
          fmt = formatMonth;
      }
      select(this).classed('year', fmt === formatYear || fmt === formatMonth)
      that.prevDate = date;
      return fmt(date);
    });

    this.axisX.ticks(7);
  }

  updateX() {
    super.updateX();
    if (!this.dates || !this.dates.length)
      return;
    const invert = this.x.invert;
    this.x.numInvert = invert;
    this.x.invert = (v) => this.dates[Math.round(invert(v))];
  }

  setDomainX(dates) {
    this.dates = dates.map(d => new Date(d));
    super.setDomainX([0, dates.length - 1]);
  }
}


export default CandleGrid;
