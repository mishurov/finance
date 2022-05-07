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

import { select } from 'd3-selection';
import { line } from 'd3-shape';
import { format } from 'd3-format';
import { scaleLinear } from 'd3-scale';

import { sma } from '../../processing/indi';

class MovingAverages {
  left = 7;
  top = 17;
  lineH = 15;
  padX = 10;
  format = format('.2f');
  colors = [];

  constructor(svg, grid) {
    this.grid = grid;

    this.labels = svg.append('g')
      .classed('masLabels', true);
    this.rect = this.labels.append('rect')
      .classed('masLabelRect', true)
      .attr('fill', 'grey');


    this.interScale = scaleLinear();
    this.sDom = [];
    this.tDom = [];

    this.plotLine = line()
      .x(d => this.grid.x(d.i))
      .y(d => d.a !== undefined ? this.interScale(d.a) : this.grid.y.range()[1]);
  }

  update(t) {
    const newDomain = [];
    newDomain[0] = this.sDomain[0] * (1 - t) + this.tDomain[0] * t;
    newDomain[1] = this.sDomain[1] * (1 - t) + this.tDomain[1] * t;
    this.interScale.domain(newDomain);
  }

  getDraws() {
    const [min, max] = this.grid.x.domain();
    return [Math.max(0, Math.floor(min)), Math.ceil(max) + 1];
  }

  drawClip(ctx) {
    const xRange = this.grid.x.range();
    const yRange = this.grid.y.range();
    ctx.beginPath();
    ctx.rect(xRange[0], yRange[0],
      xRange[1] - xRange[0], yRange[1] - yRange[0]);
    ctx.clip();
  }

  draw(ctx) {
    ctx.save();
    this.drawClip(ctx);
    const draws = this.getDraws();
    for (let i = 0; i < this.geoData.length; i++) {
      const d = this.geoData[i].d;
      ctx.beginPath();
      this.plotLine.context(ctx)(d.slice(...draws));
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = this.colors[i];
      ctx.stroke();
    }
    ctx.restore();
  }

  redraw() {
    const x = this.grid.x.range()[0] + this.left;
    const y = this.grid.y.range()[1] + this.top;
    this.labels.attr('transform', `translate(${x},${y})`);

    this.interScale.range(this.grid.y.range());
    this.sDomain = this.interScale.domain();
    this.tDomain = this.grid.y.domain();
    return [this.update.bind(this), this.draw.bind(this)];
  }

  setIndex(i) {
    this.labels.selectAll('g > text.val')
      .text(d => d.d[i] ?
        this.format(d.d[i].a) :
        this.format(d.d[d.d.length - 1].a));
  }

  setData(params, colors, data, start=0) {
    this.geoData = params.map(p => {
      let averages = sma(p, data).slice(start);
      averages = averages.map((a, i) => {return { i, a }});
      return { p: p, d: averages };
    })
    this.interScale.domain(this.grid.y.domain());

    this.colors = colors;

    let prevY = 0;
    const that = this;
    this.labels.selectAll('g')
      .data(this.geoData)
      .join('g')
        .attr('class', d => `sma${d.p}`)
        .each(function(d, i) {
          const g = select(this);
          const lbl = g.append('text')
            .classed('lbl', true)
            .attr('fill', 'black')
            .attr('y', prevY)
            .attr('x', 0)
            .text(`SMA ${d.p}`);
          const latest = d.d[d.d.length - 1].a;
          const x = lbl.node().getComputedTextLength() + that.padX;
          g.append('text')
            .classed('val', true)
            .attr('fill', colors[i])
            .attr('y', prevY)
            .attr('x', x)
            .text(that.format(latest));
          prevY += that.lineH;
        });

    const bbox = this.geoData.length ?
      this.labels.node().getBBox() : {x: 0, y: 0, width: 0, height: 0};
    this.rect
      .attr('x', bbox.x - 3)
      .attr('y', bbox.y)
      .attr('width', bbox.width + 6)
      .attr('height', bbox.height + 1)
  }
}

export default MovingAverages;
