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

import { format } from 'd3-format';
import { line } from 'd3-shape';

import IndiGrid from './IndiGrid';
import { stoch } from '../../processing/indi';


class Stochastic {
  left = 7;
  top = 17;
  padX = 10;
  maxLabelW = 25;
  format = format('.2f');

  kColor = 'steelblue';
  dColor = 'red';

  constructor(svgBg) {
    this.rect = svgBg.append('rect')
      .classed('stochRect', true)
      .attr('fill', '#ddd');

    this.plotLine = line()
      .x(d => this.parentGrid.x(d.i))
      .y(d => d.a !== undefined ? this.grid.y(d.a) :
        this.grid.y.range()[1]);
  }

  init(svg, grid) {
    this.parentGrid = grid;
    this.grid = new IndiGrid(svg, grid);
    grid.addIndiGrid(this.grid)

    this.labelGroup = svg.append('g')
      .classed('stochLabel', true)

    this.labelRect = this.labelGroup.append('rect')
      .attr('fill', 'grey')
      .classed('stochLabelRect', true);

    this.label = this.labelGroup.append('text')
      .classed('lbl', true)
      .attr('fill', 'black')

    this.valK = this.labelGroup.append('text')
      .classed('valK', true)
      .attr('fill', this.kColor)

    this.valD = this.labelGroup.append('text')
      .classed('valD', true)
      .attr('fill', this.dColor)
  }

  setSizeV(y1, y2) {
    this.grid.setSizeV(y1, y2);
    this.rect
      .attr('y', this.grid.y(80))
      .attr('height', this.grid.y(20) - this.grid.y(80));
  }

  updateSizeH(y1, y2) {
    this.grid.updateSizeH();
    const x = this.grid.x.range()[0] + this.left;
    const y = this.grid.y.range()[1] + this.top;
    this.labelGroup.attr('transform', `translate(${x},${y})`);
    const rangeX = this.grid.x.range();
    this.rect
      .attr('x', rangeX[0])
      .attr('width', rangeX[rangeX.length - 1] - rangeX[0]);
  }

  setIndex(index) {
    if (!this.data || !this.data.length)
      return;
    const [kPts, dPts] = this.data;
    if (kPts[index])
      this.valK.text(this.format(kPts[index].a));
    if (dPts[index])
      this.valD.text(this.format(dPts[index].a));
  }

  update(t) {}

  getDraws() {
    const [min, max] = this.parentGrid.x.domain();
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
    const colors = [this.kColor, this.dColor];
    for (let i = 0; i < this.data.length; i++) {
      const d = this.data[i];
      ctx.beginPath();
      this.plotLine.context(ctx)(d.slice(...draws));
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = colors[i];
      ctx.stroke();
    }
    ctx.restore();
  }


  redraw() {
    return [this.update.bind(this), this.draw.bind(this)];
  }

  setData(periodK, periodD, smooth, data, start=0) {
    if (!periodK) {
      this.labelGroup.attr('display', 'none');
      return;
    } else {
      this.labelGroup.node().removeAttribute('display');
    }

    const sd = stoch(periodK, periodD, smooth, data);

    const kPts = [], dPts = [];

    const sliced = sd.slice(start);
    for (let i = 0; i < sliced.length; i++) {
      const pt = sliced[i];
      kPts.push({ i, a: pt.k });
      dPts.push({ i, a: pt.d });
    }

    this.data = [kPts, dPts];

    this.label.text(`Stochastic ${periodK} ${periodD} ${smooth}`);
    const lW = this.label.node().getComputedTextLength();
    const lastX = lW + this.padX
    this.valK.attr('x', lastX);
    this.valD.attr('x', lastX + this.maxLabelW + this.padX);
    this.setIndex(data.slice(start).length - 1);

    const bbox = this.labelGroup.node().getBBox();
    this.labelRect
      .attr('x', bbox.x - 3)
      .attr('y', bbox.y)
      .attr('width', bbox.width + 6)
      .attr('height', bbox.height + 1)
  }
}

export default Stochastic;
