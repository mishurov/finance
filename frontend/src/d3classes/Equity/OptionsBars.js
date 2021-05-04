/****************************************************************************
**
** This file is part of the Mishurov Finance website
**
** Copyright (C) 2021 Alexander Mishurov
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


class OptionsBars {
  color = 'steelblue';
  thickness = 0.5;
  maxWidth = 15;

  constructor(svg, grid) {
    this.grid = grid;
    this.bars = svg.append('g')
      .classed('optionBars', true);
  }

  redraw() {
    const data = this.bars.selectAll('line').data();
    if (!data || !data.length)
      return;

    const floor = this.grid.y(0);

    const barWidth = Math.min(
      this.grid.widthX() / data.length * this.thickness,
      this.maxWidth);

    this.bars.selectAll('line')
      .attr('stroke', this.color)
      .attr('stroke-width', barWidth)
      .attr('x1', (d, i) => this.grid.x(i))
      .attr('x2', (d, i) => this.grid.x(i))
      .attr('y1', floor)
      .attr('y2', d => this.grid.y(d.volume));
  }

  setData(data, color) {
    this.color = color;
    this.bars.selectAll('line').data(data).join('line');
  }
}


export default OptionsBars;
