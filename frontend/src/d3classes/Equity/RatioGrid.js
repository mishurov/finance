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
import { scaleUtc } from 'd3-scale';
import { utcFormat } from 'd3-time-format';
import { utcMonth, utcYear, utcMonths } from 'd3-time';
import { bisector } from 'd3-array';

import Grid from '../common/Grid';
import RoundYMixin from '../common/RoundYMixin';


function minMax1(d, acc=[Infinity, -Infinity]) {
  return d.reduce((a, v) =>
    [Math.min(a[0], v.value), Math.max(a[1], v.value)], acc);
}

function minMax(d) {
  return d.reduce((a, v) => minMax1(v, a), [Infinity, -Infinity]);
}


class RatioGrid extends RoundYMixin(Grid) {
  tickXWidth = 35;
  ticksY = 5;

  bisect = bisector(d => d.date);
  intervals = [1, 2, 5, 10];

  createScaleX() {
    const domainX = [new Date('2015-10-5'), new Date('2021-10-5')];
    this.x = scaleUtc().domain(domainX);
  }

  configureTicksX() {
    const that = this;
    this.axisX.tickFormat(function(d) {
      let ret = that.x.tickFormat(d)(d);
      if (ret === utcFormat('%B')(d))
        ret = utcFormat('%b')(d);
      select(this).classed('year', ret === utcFormat('%Y')(d))
      return ret;
    });
    this.axisX.ticks(this.ticksX());
  }

  ticksX() {
    const lastD = this.x.domain().length - 1;
    const lastR = this.x.range().length - 1;
    const months = utcMonths(this.x.domain()[0], this.x.domain()[lastD]);
    const num = Math.floor((this.x.range()[lastR] - this.x.range()[0]) / this.tickXWidth);
    let every = Math.max(1, Math.ceil(months.length / num));
    if (every > 6)
      return utcYear.every(Math.ceil(every / 12))
    else
      return utcMonth.every(every > 4 ? 6 : every);
  }

  updateYWithData(data) {
    const domainX = this.x.domain();

    const slices = [];
    for (const d of data) {
      const l = this.bisect.center(d, domainX[0]);
      const r = this.bisect.center(d, domainX[1]) + 1;
      slices.push(d.slice(l, r));
    }

    const [min, max] = minMax(slices);

    if (min === max)
      return;

    this.roundYdomain(min, max, 0)
  }
}


export default RatioGrid;
