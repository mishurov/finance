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

import { select } from 'd3-selection';
import FrontierLabelMixin from './FrontierLabelMixin';


class AssetItems extends FrontierLabelMixin(class {}) {
  radius = 5;
  grid = null

  constructor(svg, grid) {
    super();
    this.grid = grid;
    this.group = svg.append('g')
      .classed('AssetItems', true);
  }

  onMouseOver(e) {
    let node = e.target.parentNode;
    for (var i = 0; i < 3; i++) {
      if (!node.attributes.class)
        return;
      if (node.attributes.class.nodeValue === 'item')
        break;
      node = node.parentNode;
    }
    if (node.attributes.class.nodeValue !== 'item')
      return;
    select(node).raise();
  }

  setData(data) {
    const selection = this.group
      .selectAll('g.item')
      .data(data, d => d.ticker);

    selection.exit().remove();

    const that = this;

    selection.enter().each(function(d, i) {
      const item = select(this).append('g')
        .classed('item', true)
        .on("mouseover", e => that.onMouseOver(e));
      item.append('circle')
        .attr('r', that.radius)
      that.appendLabel(item, d.ticker)
    });

    this.reposition();
  }

  reposition() {
    const that = this;
    this.group.selectAll('g.item').each(function(d, i) {
      const posX = that.grid.x(d.variance);
      const posY = that.grid.y(d.logret);
      const item = select(this)
        .attr('transform', `translate(${posX},${posY})`);
      that.repositionLabel(item, posX);
    });
  }

}


export default AssetItems;
