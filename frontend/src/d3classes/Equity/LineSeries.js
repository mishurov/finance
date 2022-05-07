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

import { line } from 'd3-shape';


class LineSeries {
  constructor(svg, clipId) {
    this.group = svg.append('g')
      .classed('lineSeries', true);

    if (clipId)
      this.group
        .attr("clip-path", `url(#${clipId})`);

  }

  redraw(x, y, t) {
    const plotLine = line()
      .x(d => x(d.date))
      .y(d => y(d.value));

    const pathes = this.group.selectAll('path');
    if (!t)
      pathes.attr('transform', `translate(0,0) scale(1)`)
    else
      pathes.attr('transform', `translate(${t.x},0) scale(${t.k},1)`)

    pathes
      .transition()
        .attr('d', d => plotLine(d.data));
  }

  setData(data) {
    this.group
      .selectAll('path')
      .data(data)
      .join('path')
        .attr('vector-effect', 'non-scaling-stroke')
        .attr('fill', 'none')
        .attr('stroke-width', 2)
        .attr('stroke-linecap', 'round')
        .attr('stroke', d => d.color);
  }
}

export default LineSeries;
