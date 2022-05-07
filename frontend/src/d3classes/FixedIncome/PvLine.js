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

class PvLine {
  constructor(svg, grid) {
    this.path = svg.append('path')
      .classed('presentValue', true)
      .attr('stroke', 'black')
      .attr('fill', 'none')
      .attr('pointer-events', 'none');

    this.circle = svg.append('circle')
      .classed('curCircle', true)
      .attr('r', 3)
      .attr('display', 'none')
      .attr('pointer-events', 'none');

    this.plotLine = line()
      .x(d => grid.x(d.x))
      .y(d => grid.y(d.y));
  }

  redraw() {
    if (!this.path.datum())
      return;

    this.path.attr('d', d => this.plotLine(d))
  }

  setPos(x, y) {
    this.circle.node().removeAttribute('display');
    this.circle.attr('transform', `translate(${x},${y})`);
  }

  hideCirc() {
    this.circle.attr('display', 'none')
  }

  setData(data) {
    this.path.datum(data);
  }

}

export default PvLine;
