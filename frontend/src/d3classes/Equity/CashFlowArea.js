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
import { area } from 'd3-shape';


class CashFlowArea {
  constructor(svg, colors) {
    const gradId = 'grad_' + new Date().getTime();
    this.gradient = svg.append('linearGradient')
      .attr('id', gradId)
      .attr('gradientTransform', 'rotate(270, 0.5, 0.5)');
    this.gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'black')
    this.gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'gray')

    this.group = svg.append('g')
    this.path = this.group.append('path')
      .classed('cashFlowArea', true)
      .attr('fill', `url("#${gradId}")`);

  }

  setColors(colors) {
    this.gradient.selectAll('stop').each(function(d, i) {
      select(this).attr('stop-color', colors[i]);
    });
  }

  setClip(clipId) {
    this.group
      .attr('clip-path', `url(#${clipId})`);
  }

  redraw(x, y, t) {
    if (!this.path.datum())
      return;

    if (!t)
      this.path.node().removeAttribute('transform');
    else
      this.path
        .attr('transform', `translate(${t.x},0) scale(${t.k},1)`)

    const plotArea = area()
      .x(d => x(d.date))
      .y0(d => y.range()[0])
      .y1(d => y(d.value));

    this.path
      .transition()
      .attr('d', plotArea);
  }

  setDatum(datum) {
    this.path.datum(datum)
  }
}


export default CashFlowArea;
