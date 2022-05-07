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

import Grid from '../common/Grid';


class OptionsGrid extends Grid {

  minSpaceX = 35;

  widthX() {
    const xr = this.x.range();
    return xr[1] - xr[0];
  }

  configureTicksX() {
    const that = this;
    this.axisX.tickFormat(function(d, i) {
      if (!that.strikes || !that.strikes.length)
        return ' ';
      const strike = that.strikes[Math.round(d)];
      if (!strike)
        return ' ';
      return strike;
    });

    if (this.strikes && this.strikes.length) {
      const numBars = this.strikes.length;
      const widthX = this.widthX();
      const space = Math.max(widthX / numBars, this.minSpaceX);
      const numTicks = Math.round(widthX / space)
      this.axisX.ticks(numTicks);
    }
  }

  updateX() {
    super.updateX();
    if (!this.strikes || !this.strikes.length)
      return;
    const invert = this.x.invert;
    this.x.numInvert = invert;
    this.x.invert = (v) => this.strikes[Math.round(invert(v))];
  }

  setDomainX(data) {
    this.strikes = data.map(d => d.strike);
    super.setDomainX([-0.5, this.strikes.length - 0.5]);
  }
}


export default OptionsGrid;
