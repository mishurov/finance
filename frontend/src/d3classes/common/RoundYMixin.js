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

const RoundYMixin = Base => class extends Base {
  intervals = [1, 2, 5, 10];

  roundYdomain(min, max, frac) {
    const minTickInterval = (max - min) / this.ticksY,
      decimalMultiplier = Math.pow(10, Math.floor(Math.log10(minTickInterval))),
      normInterval = minTickInterval / decimalMultiplier;

    let closest;
    let minDiff = Infinity;
    for (let i = 0; i < 4; i++) {
      if (this.intervals[i] < normInterval)
        continue;
      let absDiff = Math.abs(normInterval - this.intervals[i]);
      if (absDiff <= minDiff) {
        minDiff = absDiff;
        closest = this.intervals[i];
      }
    }
    let tickInterval = closest * decimalMultiplier;
    let minDom = Math.floor(min / tickInterval) * tickInterval;
    let maxDom = Math.ceil(max / tickInterval) * tickInterval;

    const tickValues = []
    for (let val = minDom; val <= maxDom; val += tickInterval)
      tickValues.push(val);

    this.axisY.tickValues(tickValues);
    this.axisY.ticks(tickValues.length);

    const padP = frac ? (maxDom - minDom) * frac : 0;
    this.setDomainY([minDom - padP, maxDom + padP]);
  }
}

export default RoundYMixin;
