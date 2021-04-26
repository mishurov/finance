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

const FrontierLabelMixin = Base => class extends Base
{
  paddingH = 3;
  paddingV = 1.5;
  margin = 4;
  offsetY = 2;

  appendLabel(item, text) {
      const g = item.append('g')
        .classed('label', true);
      g.append('rect');
      g.append('text')
        .attr('dominant-baseline', 'middle')
        .text(text);
  }

  repositionLabel(item, x, gy=0) {
      const g = item.select('g.label')
      const rect = g.select('rect');
      const text = g.select('text');
      const bbox = text.node().getBBox();
      const width = bbox.width + this.paddingH * 2;
      let gx;
      if (x + this.margin + width > this.grid.x.range()[1])
        gx = -this.margin - width;
      else
        gx = this.margin + this.paddingH * 2;
      gy += this.offsetY;
      rect
        .attr('width', bbox.width + this.paddingH * 2)
        .attr('height', bbox.height + this.paddingV * 2)
        .attr('x', bbox.x - this.paddingH)
        .attr('y', bbox.y - this.paddingV)
      g.attr('transform', `translate(${gx},${gy})`);
  }
}



export default FrontierLabelMixin
