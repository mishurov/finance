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

import CrossHairs from '../common/CrossHairs';


class Candles {
  incPColor = '#6ab058';
  decPColor = '#fa505b';
  incVColor = '#97c28c';
  decVColor = '#f7747d';
  wickW = 1;
  bodyW = 2;
  volumeW = 3;
  volumeFrac = 0.25;

  candles = [];

  constructor(svg, grid) {
    this.grid = grid;

    this.latest = new CrossHairs(svg, grid, false, true, 'latest');
    this.latest.hide();
  }

  getDraws() {
    const [min, max] = this.grid.x.domain();
    return [Math.max(0, Math.floor(min)), Math.ceil(max) + 1];
  }

  update(t) {
    for (const c of this.candles) {
      for (const k of ['o', 'h', 'l', 'c', 'v1'])
        c[k] = c['s' + k] * (1 - t) + c['t' + k] * t;
    }
  };

  drawClip(ctx) {
    const xRange = this.grid.x.range();
    const yRange = this.grid.y.range();
    ctx.beginPath();
    ctx.rect(xRange[0], yRange[0],
      xRange[1] - xRange[0], yRange[1] - yRange[0]);
    ctx.clip();
  }

  draw(ctx) {
    const t = this.grid.zoomX || { x: 0, k : 1 };
    ctx.save();
    this.drawClip(ctx);
    for (const c of this.candles.slice(...this.getDraws())) {
      ctx.strokeStyle = c.vColor;

      ctx.beginPath();
      ctx.moveTo(c.t, c.v1);
      ctx.lineTo(c.t, c.v2);
      ctx.lineWidth = 4.5 * t.k;
      ctx.stroke();

      ctx.strokeStyle = c.pColor;

      ctx.beginPath();
      ctx.moveTo(c.t, c.o);
      ctx.lineTo(c.t, c.c);
      ctx.lineWidth = 4 * t.k;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(c.t, c.h);
      ctx.lineTo(c.t, c.l);
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
  }

  getVolumeScale(maxV) {
    const domY = this.grid.y.domain(),
      scaleV = 1 / maxV * (domY[1] - domY[0]) * this.volumeFrac,
      bottomV = this.grid.y.range()[0];
    return [domY, scaleV, bottomV]
  }

  redraw(maxV) {
    const [ domY, scaleV, bottomV ] = this.getVolumeScale(maxV);

    for (let i = 0; i < this.data.length; i++) {
      const c = this.candles[i];
      const d = this.data[i];
      c.t = this.grid.x(d.i);
      for (const k of ['o', 'h', 'l', 'c']) {
        c['s' + k] = c[k];
        c['t' + k] = this.grid.y(d[k]);
      }
      c.sv1 = c.v1;
      c.tv1 = this.grid.y(d.v * scaleV + domY[0]);
      c.v2 = bottomV;
    }


    const latestTick = this.data[this.data.length - 1]
    if (latestTick.c > this.grid.y.domain()[0]
        && latestTick.c < this.grid.y.domain()[1]) {
      this.latest.show();
      this.latest.setPos(50, this.grid.y(latestTick.c));
    } else {
      this.latest.hide();
    }

    return [this.update.bind(this), this.draw.bind(this)];
  }

  setData(data, start, maxV) {
    const pColor = d => d.o < d.c ?
      this.incPColor : this.decPColor;
    const vColor = d => d.o < d.c ?
      this.incVColor : this.decVColor;

    this.data = data.slice(start);
    this.data = this.data.map((d, i) => {return {...d, i}})

    if (this.data && this.data.length) {
      this.latest.show();
      this.latest.resize();
      const latestTick = this.data[this.data.length - 1];
      this.latest.setColor(pColor(latestTick));

    } else {
      this.latest.hide();
    }

    const [ domY, scaleV, bottomV ] = this.getVolumeScale(maxV);
    this.candles = [];
    for (let i = 0; i < this.data.length; i++) {
      const d = this.data[i];
      const c = {};
      for (const k of ['o', 'h', 'l', 'c'])
        c[k] = this.grid.x(d[k])
      c.pColor = pColor(d);
      c.vColor = vColor(d);
      c.t = this.grid.x(d.i);
      c.v1 = this.grid.y(d.v * scaleV + domY[0]);
      c.v2 = bottomV;
      this.candles.push(c);
    }
  }

}

export default Candles;
