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

import { select, pointer } from 'd3-selection';
import { bisector } from 'd3-array';
import { utcFormat } from 'd3-time-format';
import { format } from 'd3-format';


function squareDist(p1, p2) {
  return (p1[0] - p2[0])**2 + (p1[1] - p2[1])**2;
}

class FinReportToolTips {
  radius = 3;
  gap = 5;
  padding = 4;
  paddingB = 2;

  width = 200;
  height = 200;
  margin = { t: 20, l: 30, b: 20, r: 30 };

  labelFormat = format('.4f');

  constructor(svg) {
    this.group = svg.append('g')
      .classed('toolTips', true);

    this.bisect = bisector(d => d.date);
  }

  layout(rect, valueLbl, dateLbl, d) {
    valueLbl.text(this.labelFormat(d.value));
    const valueBBox = {
      width: valueLbl.node().getComputedTextLength(),
      height: 12,
    }

    dateLbl.text(utcFormat('%d %b %Y')(d.date));
    const dateBBox = {
      width: dateLbl.node().getComputedTextLength(),
      height: 12,
    }

    const rectBBox = {
      x: 0, y: 0,
      width: valueBBox.width + this.gap + dateBBox.width + this.padding * 2,
      height: Math.max(valueBBox.height, dateBBox.height)
        + this.padding + this.paddingB,
    };

    rect.attr('width', rectBBox.width);
    rect.attr('height', rectBBox.height);
    valueLbl.attr('x', this.padding);
    valueLbl.attr('y', dateBBox.height / 2 + this.padding);
    dateLbl.attr('x', this.padding + valueBBox.width + this.gap);
    dateLbl.attr('y', dateBBox.height / 2 + this.padding);

    return rectBBox;
  }

  position(rectBBox, x, y) {
    const tipMargin = 7;
    let alignV = 'top';
    let alignH = 'center';

    const posTop = y - tipMargin - rectBBox.height;
    if (posTop < this.margin.t)
      alignV = 'bottom';
    const posCenter = x - rectBBox.width / 2;
    if (posCenter < this.margin.l)
      alignH = 'left';
    else if (x + rectBBox.width / 2 > this.width - this.margin.r)
      alignH = 'right';

    let gx, gy;
    if (alignV === 'top')
      gy = posTop;
    else
      gy = y + tipMargin;

    if (alignH === 'center')
      gx = posCenter;
    else if (alignH === 'left')
      gx = x;
    else
      gx = x - rectBBox.width;

    return [gx, gy];
  }

  onMouseMove(e, data, grid) {
    if (!data.length || !data[0])
      return;

    const svg = e.target.previousSibling;
    const [ mx , my ] = pointer(e, svg);
    const date = grid.x.invert(mx);

    grid.x.clamp(true);

    const dataPts = [], coords = [];

    for (const datum of data) {
      const index = this.bisect.center(datum, date),
        point = datum[index];
      dataPts.push(point);
      const x = grid.x(point.date);
      const y = grid.y(point.value);
      coords.push([x, y]);
    }

    grid.x.clamp(false);

    let min = {dist: 999999, i: -1};
    for (let i = 0; i < coords.length; i++) {
      const dist = squareDist([mx, my], coords[i]);
      if (dist < min.dist) {
        min.dist = dist;
        min.i = i;
      }
    }

    const that = this;

    this.group.selectAll('g.toolTipItem').each(function(d, i) {
      const item = select(this);
      if (i === min.i) {
        const [x, y] = coords[i];
        item.select('circle')
          .attr('transform', `translate(${x},${y})`);
        if (item.attr('hovered') !== i) {
          item.attr('hovered', i)
          const g = item.select('g.toolTipGroup'),
            rect = g.select('rect'),
            valueLbl = g.select('text.toolTipValue'),
            dateLbl = g.select('text.toolTipDate');
          const bbox = that.layout(rect, valueLbl, dateLbl, dataPts[i]);
          const [gx, gy] = that.position(bbox, x, y);
          g.attr('transform', `translate(${gx},${gy})`);
          item.node().removeAttribute('display');
        }
      } else {
        item.node().setAttribute('display', 'none');
      }
    });
  }

  hideAll() {
    this.group.selectAll('g.toolTipItem').each(function(d, i) {
      this.setAttribute('display', 'none');
    })
  }

  setBounds(width, height, margin) {
    this.width = width;
    this.height = height;
    this.margin = margin;
  }

  setData(data) {
    const selection = this.group
      .selectAll('g.toolTipItem')
      .data(data);

    selection.exit().remove();

    const that = this;

    selection.enter().each(function(d, i) {
      const item = select(this).append('g')
        .classed('toolTipItem', true)
      item.append('circle')
        .attr('r', that.radius)
        .classed('toolTipCircle', true);
      const g = item.append('g')
        .classed('toolTipGroup', true);
      g.append('rect');
      g.append('text')
        .attr('dominant-baseline', 'middle')
        .classed('toolTipValue', true);
      g.append('text')
        .attr('dominant-baseline', 'middle')
        .classed('toolTipDate', true);
    });

    this.group.selectAll('g.toolTipItem').each(function(d, i) {
      const item = select(this);
      item.select('circle')
        .attr('fill', d.color);
      item.select('rect')
        .attr('fill', d.color);
    })
  }
}



export default FinReportToolTips;
