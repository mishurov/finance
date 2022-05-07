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

import { scaleLinear } from 'd3-scale';
import { axisRight } from 'd3-axis';

import ClipMixin from '../common/ClipMixin';

class IndiGrid extends ClipMixin(class {}) {
  constructor(svg, grid) {
    super();

    this.x = grid.x;
    this.initX = grid.initX;
    this.createScaleY();
    this.createDivider(svg);
    this.createAxes();
    this.createAxesGeometry(svg);
    this.setSizeV(50, 80);

    this.createClipRect(svg);
    this.updateClipSize()
  }

  createScaleY() {
    const domainY = [-10, 110];
    this.y = scaleLinear().domain(domainY)
  }

  createDivider(svg) {
    this.divider = svg.append('line')
      .classed('indiDivider', true)
      .attr('stroke', 'black');
  }

  createAxesGeometry(svg) {
    this.axisYgroup = svg.append('g')
      .classed('axisY', true)
      .classed('indi', true);
  }

  createAxes() {
    this.axisY = axisRight()
      .scale(this.y)
      .tickValues([0, 25, 50, 75, 100]);
  }


  setSizeV(offsetY, height) {
    this.y.range([offsetY + height, offsetY])
    this.axisYgroup.call(this.axisY);
    this.divider
      .attr('transform', `translate(0,${offsetY})`)
  }

  updateSizeH() {
    const rangeX = this.x.range();
    const posX = rangeX[rangeX.length - 1];
    this.axisYgroup
      .attr('transform', `translate(${posX},0)`)
    this.divider
      .attr('x1', rangeX[0])
      .attr('x2', posX)
    this.updateClipSize()
  }
}

export default IndiGrid;
