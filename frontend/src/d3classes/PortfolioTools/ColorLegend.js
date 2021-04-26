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

import { interpolateRgb } from 'd3-interpolate';
import { scaleLinear } from 'd3-scale';
import { axisLeft } from 'd3-axis';


class ColorLegend {
  createInterpolate() {
    this.interpolate = interpolateRgb('brown', 'steelblue');
  }

  constructor(svg, text, gap=5) {
    this.gap = gap;
    this.createInterpolate();

    this.group = svg.append('g')
      .classed('ColorLegend', true);

    this.gradId = 'grad_' + new Date().getTime();
    const gradient = this.group.append('linearGradient')
      .attr('id', this.gradId)
      .attr('gradientTransform', 'rotate(90)');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', this.interpolate(1))

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', this.interpolate(0))

    this.rect = this.group.append('rect')
      .attr('fill', `url("#${this.gradId}")`);

    this.scale = scaleLinear([0, 1]);
    this.axis = axisLeft()
      .tickSize(2)
      .scale(this.scale);

    this.axisGroup = this.group.append('g')
      .classed('colorAxis', true);

    this.axisGroup.call(this.axis);

    this.axisGroup.select('path')
      .attr('display', 'none');

    this.label = this.group.append('text')
      .attr('dominant-baseline', 'hanging')
      .text(text);

    const x = 185,
      y = 40,
      width = 10,
      height = 100;

    this.transform(x, y, width, height);
  }

  setDomain(domain) {
    this.scale.domain(domain)
    this.axisGroup.call(this.axis);
  }

  normalize(v) {
    const dist = this.scale.domain()[1] - this.scale.domain()[0];
    return (v - this.scale.domain()[0]) / dist;
  }

  getColor(v) {
    return this.interpolate(this.normalize(v));
  }

  transform(x, y, width, height) {
    this.group
      .attr('transform', `translate(${x},${y})`);
    this.rect
      .attr('width', width)
      .attr('height', height);

    this.scale.range([height, 0]);
    this.axisGroup
      .attr('transform', `translate(${0},0)`)
      .call(this.axis);

    const textW = this.label.node().getComputedTextLength(),
      textX = width + this.gap,
      textY = height / 2 + textW / 2;
    this.label
      .attr('transform', `translate(${textX},${textY}) rotate(-90)`);
  }

}

export default ColorLegend;
