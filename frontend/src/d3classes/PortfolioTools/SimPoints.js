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

class SimPoints {
  minR = 0.7;
  scaleF = 0.7;

  constructor(svg, grid, legend) {
    this.grid = grid;
    this.legend = legend;
    this.dots = svg.append('g')
      .classed('dots', true);
  }

  reposition() {
    this.dots.selectAll('circle')
      .attr('cx', d => this.grid.x(d.variance))
      .attr('cy', d => this.grid.y(d.logret))
  }

  setData(data) {
    this.dots.selectAll('circle')
      .data(data)
      .join('circle')
        .attr('fill', d => this.legend.getColor(d.ratio))
        .attr('r', d => this.minR + this.legend.normalize(d.ratio) * this.scaleF);
    this.reposition();
  }

}

export default SimPoints;
