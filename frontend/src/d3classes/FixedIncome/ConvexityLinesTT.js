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

import { format } from 'd3-format';
import { line } from 'd3-shape';


class ToolTip {
  offsetY = -10;
  height = 30;
  format = format('.2f');
  margin = 7;

  constructor(svg, grid) {
    this.grid = grid;
    this.group = svg.append('g')
      .classed('tooltip', true)
      .attr('display', 'none')
      .attr('pointer-events', 'none');

    this.rect = this.group.append('rect')
      .attr('fill', '#fffc')
      .attr('y', this.offsetY)
      .attr('height', this.height);

    this.mod = this.group.append('text')
      .attr('dominant-baseline', 'hanging')
      .classed('modified', true)
      .attr('transform', `translate(0,${this.offsetY + this.height / 2})`)

    this.conv = this.group.append('text')
      .attr('dominant-baseline', 'hanging')
      .classed('convexity', true)
      .attr('transform', `translate(0,${this.offsetY})`)
  }

  hide() {
    this.group.attr('display', 'none');
  }

  setText(mod, conv) {
    this.mod.text(this.format(mod));
    this.conv.text(this.format(conv));

    const width = Math.max(
      this.mod.node().getComputedTextLength(),
      this.conv.node().getComputedTextLength()
    );
    this.rect.attr('width', width);
  }

  setPos(x, y) {
    this.group.node().removeAttribute('display');
    let nx = x + this.margin;
    const width = Number(this.rect.attr('width'));
    if (nx + width > this.grid.x.range()[1])
      nx = x - width - this.margin;
    this.group.attr('transform', `translate(${nx},${y})`);
  }
}


class ConvexirtyLinesTT {
  constructor(svg, grid) {
    this.grid = grid;

    this.group = svg.append('g')
      .attr("clip-path", `url(#${grid.clipId})`)
      .attr('pointer-events', 'none');

    this.mod = this.group.append('circle')
      .attr('r', 3)
      .attr('display', 'none')
      .classed('modified', true);

    this.conv = this.group.append('circle')
      .attr('r', 3)
      .attr('display', 'none')
      .classed('convexity', true);

    this.toolTip = new ToolTip(svg, grid);

    this.plotLine = line()
      .x(d => this.grid.x(d.x))
      .y(d => this.grid.y(d.y));
  }

  redraw() {
    const pathes = this.group.selectAll('path');
    if (!pathes.data())
      return;
    pathes.attr('d', d => this.plotLine(d.points))
  }

  setData(data) {
    this.group.selectAll('path')
      .data(data)
      .join('path')
        .attr('class', d => d.className)
        .attr('stroke', 'gray')
        .attr('fill', 'none');
  }

  setText(mod, conv) {
    this.toolTip.setText(mod, conv);
  }

  setPos(x, modY, convY) {
    this.mod.node().removeAttribute('display');
    this.conv.node().removeAttribute('display');

    this.mod.attr('transform', `translate(${x},${modY})`);
    this.conv.attr('transform', `translate(${x},${convY})`);
    this.toolTip.setPos(x, convY);
  }

  hide() {
    this.toolTip.hide();
    this.mod.attr('display', 'none');
    this.conv.attr('display', 'none');
  }
}


export default ConvexirtyLinesTT
