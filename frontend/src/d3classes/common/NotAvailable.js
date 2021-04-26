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

const NA = 'n/a';

class NotAvailable {
  constructor(svg, grid) {
    this.grid = grid;
    this.group = svg.append('g')
      .classed('not-available', true)
    this.rect = this.group.append('rect');
    this.text = this.group.append('text')
      .attr('dominant-baseline', 'middle')
      .attr('y', 7)
      .attr('fill', '#555')
      .text(NA)

    this.rect
      .attr('fill', '#ddd5')
      .attr('y', -6)
      .attr('height', 25)
      .attr('width', this.text.node().getComputedTextLength())
    this.hide();
  }

  hide() {
      this.group.attr('display', 'none');
  }

  show() {
      const rangeX = this.grid.x.range();
      const rangeY = this.grid.y.range();
      const width = Math.abs(rangeX[0] - rangeX[rangeX.length - 1])
      const height = Math.abs(rangeY[0] - rangeY[rangeY.length - 1])
      this.group.attr('transform', `translate(${width/2},${height/2})`)
      this.group.node().removeAttribute('display');
  }
}

export default NotAvailable;
