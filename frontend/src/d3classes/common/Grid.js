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

import { scaleLinear } from 'd3-scale';
import { axisBottom, axisTop, axisLeft, axisRight } from 'd3-axis';

import ClipMixin from './ClipMixin';

import '../../css/Grid.css';


class Grid extends ClipMixin(class {}) {

  zoomX = null;
  zoomY = null;

  indiGrids = []

  constructor(svg, orientX='bottom', orientY='left') {
    super();

    const width = 200;
    const height = 200;
    const margin = { t: 40, l: 40, b: 40, r: 40 };

    this.orientX = orientX;
    this.orientY = orientY;

    this.createScaleX();
    this.createScaleY();
    this.initX = this.x.copy();
    this.initY = this.y.copy();
    this.setRanges(width, height, margin)

    this.createAxes();
    this.createAxesGeometry(svg);
    this.configureTicksX();
    this.configureTicksY();

    this.translateAxes();
    this.updateAxesGeometry();
    this.updateXGridLines();
    this.updateYGridLines();

    this.createClipRect(svg);
    this.updateClipSize()
  }

  addIndiGrid(grid) {
    this.indiGrids.push(grid)
  }

  indiOffset() {
    return this.indiGrids.reduce(
      (a, g) => a + (Math.abs(g.y.range()[0] - g.y.range()[1])), 0);
  }

  createScaleX() {
    const domainX = [0, 1];
    this.x = scaleLinear().domain(domainX)
  }

  createScaleY() {
    const domainY = [0, 1];
    this.y = scaleLinear().domain(domainY)
  }

  createAxes() {
    this.axisX = (this.orientX === 'bottom' ? axisBottom() : axisTop())
      .tickSize(5)
      .scale(this.x);
    this.axisY = (this.orientY === 'left' ? axisLeft() : axisRight())
      .tickSize(5)
      .scale(this.y);
  }

  createAxesGeometry(svg) {
    this.axisXgroup = svg.append('g')
      .attr('pointer-events', 'none')
      .classed('axisX', true);

    this.gridLineLastX = this.axisXgroup.append('line')
      .classed('gridLineLast', true);

    this.axisYgroup = svg.append('g')
      .attr('pointer-events', 'none')
      .classed('axisY', true);

    this.gridLineLastY = this.axisYgroup.append('line')
      .classed('gridLineLast', true);
  }

  configureTicksX() {
    this.axisX.ticks(5);
  }

  configureTicksY() {
    this.axisY.ticks(5);
  }

  setRanges(width, height, margin) {
    let anchorX, anchorY;
    if (this.zoomX)
      anchorX = this.x.invert(this.zoomX.x);
    if (this.zoomY)
      anchorY = this.x.invert(this.zoomY.y);

    this.initX.range([margin.l, width - margin.r]);
    this.initY.range([height - margin.b, margin.t]);
    this.x.range(this.initX.range());
    this.y.range(this.initY.range());

    if (this.zoomX) {
      this.zoomX.x = this.x(anchorX);
    } 
    if (this.zoomY)
      this.zoomY.y = this.x(anchorY);
  }

  updateAxisScales() {
    this.axisX.scale(this.x);
    this.axisY.scale(this.y);
  }

  updateAxesGeometry() {
    this.axisXgroup.call(this.axisX);
    this.axisYgroup.call(this.axisY);
  }

  updateXDomainPath() {
    // update z order so gridline wouldn't overlay domain path
    const domain = this.axisXgroup.select('path.domain')
    if (domain.empty())
      return;
    const d = domain.attr('d');
    domain.remove();
    this.axisYgroup.select('path.xDomain').remove();
    const lastX = this.x.range().length - 1;
    const lastY = this.y.range().length - 1;
    const t = [
      -this.x.range()[this.orientY === 'left' ? 0 : lastX],
      this.y.range()[this.orientX === 'bottom' ? 0 : lastY] + this.indiOffset()
    ];
    this.axisYgroup.append('path')
      .classed('xDomain', true)
      .attr('transform', `translate(${t[0]}, ${t[1]})`)
      .attr('d', d);
  }

  updateX() {
    this.x = this.zoomX ? this.zoomX.rescaleX(this.initX) : this.initX.copy();
  }
  updateY() {
    this.y = this.zoomY ? this.zoomY.rescaleY(this.initY) : this.initY.copy();
  }

  setSize(width, height, margin) {
    this.setRanges(width, height, margin);
    this.updateAxisScales();
    this.configureTicksX();
    this.configureTicksY();
    this.translateAxes();
    this.updateAxesGeometry();
    this.updateXGridLines();
    this.updateYGridLines();

    this.updateClipSize();
  }

  setDomainX(domain) {
    this.initX.domain(domain);
    this.updateX();
    this.axisX.scale(this.x);
    this.configureTicksX();
    this.axisXgroup.call(this.axisX);
    this.updateXGridLines();
  }

  setDomainY(domain) {
    this.initY.domain(domain);
    this.updateY();
    this.axisY.scale(this.y);
    this.configureTicksY();
    this.axisYgroup.call(this.axisY);
    this.updateYGridLines();
  }

  onZoom(transform) {
    this.onZoomX(transform);
    this.onZoomY(transform);
  }

  onZoomX(transform) {
    if (this.zoomX && this.zoomX.k !== transform.k)
      this.configureTicksX();

    this.zoomX = transform;
    this.updateX();
    this.axisX.scale(this.x);
    this.axisXgroup.call(this.axisX);
    this.updateXGridLines();
  }

  onZoomY(transform) {
    if (this.zoomY && this.zoomY.k !== transform.k)
      this.configureTicksY();

    this.zoomY = transform;
    this.updateY();
    this.configureTicksY();
    this.axisY.scale(this.y);
    this.axisYgroup.call(this.axisY);
    this.updateYGridLines();
  }

  translateAxes() {
    const lastX = this.x.range().length - 1;
    const lastY = this.y.range().length - 1;
    const axisXpos = [0, this.y.range()[this.orientX === 'bottom' ? 0 : lastY]];
    const axisYpos = [this.x.range()[this.orientY === 'left' ? 0 : lastX], 0];
    this.setAxesTranslate(axisXpos, axisYpos);
  }

  setAxesTranslate(axisXpos, axisYpos) {
    this.axisXgroup
      .attr('transform', `translate(${axisXpos[0]},${axisXpos[1] + this.indiOffset()})`)
    this.axisYgroup
      .attr('transform', `translate(${axisYpos[0]},${axisYpos[1]})`)
  }

  updateYGridLines() {
    let yGridX, yGridY;

    const lastX = this.x.range().length - 1;
    const lastY = this.y.range().length - 1;

    if (this.orientX === 'bottom') {
      yGridY = this.y.range()[lastY];
    } else {
      yGridY = this.y.range()[0];
    }

    if (this.orientY === 'left') {
      yGridX = this.x.range()[lastX] - this.x.range()[0];
    } else {
      yGridX = this.x.range()[0] - this.x.range()[lastX];
    }

    this.setYGridLinesRanges(yGridX, yGridY);

    this.updateXDomainPath();
  }

  updateXGridLines() {
    let xGridY, xGridX;

    const lastX = this.x.range().length - 1;
    const lastY = this.y.range().length - 1;

    if (this.orientX === 'bottom')
      xGridY = this.y.range()[lastY] - this.y.range()[0] - this.indiOffset();
    else
      xGridY = this.y.range()[0] - this.y.range()[lastY];

    if (this.orientY === 'left')
      xGridX = this.x.range()[lastX];
    else
      xGridX = this.x.range()[0];

    this.setXGridLinesRanges(xGridY, xGridX);
  }

  setXGridLinesRanges(xGridY, xGridX) {
    this.axisXgroup.select('line.gridLineLast')
      .attr('y1', xGridY)
      .attr('x1', xGridX)
      .attr('x2', xGridX);
    this.updateGridLines(this.axisXgroup, 'y1', xGridY);
  }

  setYGridLinesRanges(yGridX, yGridY) {
    this.axisYgroup.select('line.gridLineLast')
      .attr('x1', yGridX)
      .attr('y1', yGridY)
      .attr('y2', yGridY);
    this.updateGridLines(this.axisYgroup, 'x1', yGridX);
  }

  updateGridLines(selection, attr, bound) {
    selection.selectAll('.tick')
    .selectAll('line.gridLine').data(d => [d])
    .join('line')
      .classed('gridLine', true)
      .attr(attr, bound);
  }
}

export default Grid;
