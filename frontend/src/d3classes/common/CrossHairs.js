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
import { pointer } from 'd3-selection';

import '../../css/CrossHairs.css';

class CrossHairs {
  padding = 3;

  listens = false;

  constructor(svg, grid, hasX=true, hasY=true, className) {
    this.grid = grid;
    this.hasX = hasX;
    this.hasY = hasY;
    this.className = className
    if (this.hasX) {
      this.createGeo(svg, 'X');
      this.formatX = format('.2f');
    }
    if (this.hasY) {
      this.createGeo(svg, 'Y');
      this.formatY = format('.2f');
    }
  }

  createGeo(svg, axis) {
    this['group' + axis] = svg.append('g')
      .classed('crosshair', true);
    if (this.className)
      this['group' + axis].classed(this.className, true);
    this['line' + axis] = this['group' + axis].append('line')
      .attr('pointer-events', 'none')
      .attr('stroke', 'black');
    this['rect' + axis] = this['group' + axis].append('rect');
    this['text' + axis] = this['group' + axis].append('text')
      .attr('fill', 'white')
      .attr('dominant-baseline', 'middle');

  }

  onMouseMove(e) {
    const svg = e.target.nodeName === 'svg' ? e.target : e.target.previousSibling;
    const [ mx, my ] = pointer(e, svg);
    this.setPos(mx, my);
  }

  listenSelection(selection) {
    this.listens = true;
    selection.on('mousemove.ch', e => this.onMouseMove(e));
    selection.on('mouseout.ch', e => this.hide());
    selection.on('mouseover.ch', e => this.show());
  }

  contains(x, y) {
    const rangeX = this.grid.x.range(),
      rangeY = this.grid.y.range();
    return (x > rangeX[0]
        && x < rangeX[rangeX.length - 1]
        && y > rangeY[rangeY.length - 1]
        && y < rangeY[0] + this.grid.indiOffset());
  }

  resize() {
    if (this.hasX) {
      const rangeY = this.grid.y.range();
      this.lineX
        .attr('y1', rangeY[0] + this.grid.indiOffset())
        .attr('y2', rangeY[rangeY.length - 1]);
    }
    if (this.hasY) {
      const rangeX = this.grid.x.range();
      this.lineY
        .attr('x1', rangeX[0])
        .attr('x2', rangeX[rangeX.length - 1]);
    }
  }

  resizeLabels() {
    if (this.hasX) {
      const rangeY = this.grid.initY.range();
      const bboxX = this.textX.node().getBBox();
      const tickX = this.grid.axisX.tickSize();
      let tx, ty, rx, ry;
      tx = -bboxX.width / 2;
      rx = tx - this.padding;
      if (this.grid.orientX === 'bottom') {
        ty = rangeY[0] + this.grid.indiOffset() + tickX + bboxX.height / 2;
        ry = rangeY[0] + this.grid.indiOffset();
      } else {
        ty = rangeY[rangeY.length - 1] - bboxX.height / 2 - tickX;
        ry = rangeY[rangeY.length - 1] - tickX - bboxX.height - this.padding;
      }

      this.textX
        .attr('transform', `translate(${tx},${ty})`);
      this.rectX
        .attr('x', rx)
        .attr('y', ry)
        .attr('width', bboxX.width + this.padding * 2)
        .attr('height', tickX + bboxX.height + this.padding);
    }

    if (this.hasY) {
      const rangeX = this.grid.initX.range();
      const bboxY = this.textY.node().getBBox();
      const tickY = this.grid.axisY.tickSize();
      let tx, ty, rx, ry;
      ty = 0;
      ry = -bboxY.height / 2 - this.padding
      if (this.grid.orientY === 'left') {
        tx = rangeX[0] - bboxY.width - tickY;
        rx = tx - this.padding;
      } else {
        tx = rangeX[rangeX.length - 1] + tickY;
        rx = rangeX[rangeX.length - 1];
      }
      this.textY
        .attr('transform', `translate(${tx},${ty})`);
      this.rectY
        .attr('x', rx)
        .attr('y', ry)
        .attr('width', bboxY.width + tickY + this.padding)
        .attr('height', bboxY.height + this.padding * 1.5);
    }
  }

  setPos(x, y) {
    if (!this.contains(x, y)) {
      this.hide();
      return;
    } else {
      this.show();
    }

    if (this.discreteX && this.grid.x.numInvert)
      x = this.grid.x(Math.round(this.grid.x.numInvert(x)));

    if (this.hasX) {
      this.groupX.attr('transform', `translate(${x},0)`);
      const xVal = this.grid.x.invert(x);
      this.textX.text(xVal ? this.formatX(xVal) : 'n/a');
    }

    if (this.hasY) {
      this.groupY.attr('transform', `translate(0,${y})`);

      const grids = [this.grid, ...this.grid.indiGrids];
      let axis = this.grid.y;
      for (const g of grids) {
        if (y <= g.y.range()[0] && y >= g.y.range()[1]) {
          axis = g.y;
          break;
        }
      }
      const yVal = axis.invert(y);
      this.textY.text(this.formatY(yVal));
    }

    this.resizeLabels();
  }

  setColor(color) {
    if (this.hasX) this.setColorGeo('X', color);
    if (this.hasY) this.setColorGeo('Y', color);
  }

  setColorGeo(axis, color) {
      this['rect' + axis].attr('fill', color);
      this['line' + axis].attr('stroke', color);
  }

  show() {
    if (this.hasX) this.showGeo('X');
    if (this.hasY) this.showGeo('Y');
  }

  showGeo(axis) {
      this['group' + axis].node().removeAttribute('display');
  }

  hide() {
    if (this.hasX) this.hideGeo('X');
    if (this.hasY) this.hideGeo('Y');
  }

  hideGeo(axis) {
      this['group' + axis].attr('display', 'none');
  }
}

export default CrossHairs;
