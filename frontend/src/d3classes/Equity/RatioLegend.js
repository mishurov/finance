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


class RatioLegend {
  radius = 4;
  textGap = 5;
  itemGap = 20;

  constructor(svg) {
    this.group = svg.append('g')
      .classed('RatioLegend', true);
  }

  setPos(x, y) {
    this.group
      .attr('transform', `translate(${x},${y})`);
  }

  setData(data) {
    const selection = this.group
      .selectAll('g.legendItem')
      .data(data);

    selection.exit().remove();
    const that = this;

    selection.enter().each(function(d, i) {
      const item = select(this).append('g')
        .classed('legendItem', true)
      item.append('circle')
        .attr('r', that.radius);
      item.append('text')
        .attr('dominant-baseline', 'middle')
    });

    let offset = 0;
    this.group.selectAll('g.legendItem').each(function(d, i) {
      const item = select(this);
      item.select('circle')
        .attr('cx', offset)
        .attr('fill', d.color);

      offset += that.radius + that.textGap;

      const txt = item.select('text')
        .attr('x', offset)
        .text(d.name)

      offset += txt.node().getBBox().width + that.itemGap;
    });
  }
}


export default RatioLegend;
