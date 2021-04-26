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
import { line, curveCatmullRom } from 'd3-shape';
import { drag } from 'd3-drag';

import CrossHairs from '../common/CrossHairs';
import FrontierLabelMixin from './FrontierLabelMixin';


export function dist2(p1, p2) {
  const dx = p1.x - p2.x,
        dy = p1.y - p2.y;
  return dx * dx + dy * dy;
}


export function getClosest(path, pt) {
  const plen = path.getTotalLength();
  let closest,
    len = plen / 2,
    min = Infinity;

  let step = plen / 3;
  while (step > 1) {
    const b = len - step,
          a = len + step;
    let d, p;
    if (b >= 0 && (d = dist2(p = path.getPointAtLength(b), pt)) < min) {
      closest = p;
      len = b;
      min = d;
    } else if (a <= plen && (d = dist2(p = path.getPointAtLength(a), pt)) < min) {
      closest = p;
      len = a;
      min = d;
    } else {
      step /= 2;
    }
  }

  return closest;
}



class Frontier extends FrontierLabelMixin(class {}) {
  optimalR = 5;
  selectedR = 6;
  minW = 10;
  interactiveR = 20;
  margin = 6;

  neutralC = '#555'
  selected = null;

  dragText = '⬉ Drag along the line'
  selText = 'Selected'

  constructor(svg, grid, legend, assets) {
    super();

    this.grid = grid;
    this.legend = legend;
    this.assets = assets;
    this.minHair = new CrossHairs(svg, grid, false, true, 'min');
    this.hairs = new CrossHairs(svg, grid);

    this.plotLine = line()
      .curve(curveCatmullRom)
      .x(d => this.grid.x(d.variance))
      .y(d => this.grid.y(d.logret));

    this.path = svg.append('path')
      .classed('frontier', true)
      .attr('fill', 'none')
      .attr('stroke-linecap', 'round');

    this.circleInteractive = svg.append('circle')
      .classed('interactive', true)
      .attr('r', this.interactiveR);

    this.groupOptimal = svg.append('g')
      .attr('pointer-events', 'none')
      .classed('optimal', true);
    this.groupOptimal.append('circle')
      .attr('r', this.optimalR);
    this.appendLabel(this.groupOptimal, 'Optimal');

    this.groupSelected = svg.append('g')
      .attr('pointer-events', 'none')
      .classed('selected', true);
    this.groupSelected.append('circle')
      .attr('r', this.selectedR);
    this.appendLabel(this.groupSelected, '');

    const dragBehavior = drag()
      .on("drag", e => this.onDrag(e))
      .on("start", e => this.onDragStart(e))
      .on("end", e => this.onDragEnd(e));

    this.circleInteractive.call(dragBehavior);

    this.hide();
  }

  setThin() {
    this.path
      .attr('stroke-width', 0.5)
      .attr('stroke', '#3338');
  }

  setThick() {
    this.path
      .attr('stroke-width', 1.5)
      .attr('stroke', '#4449');
  }

  onDrag(e) {
    const p = getClosest(this.path.node(), e);
    this.circleInteractive
      .attr("transform", `translate(${p.x},${p.y})`);
    this.hairs.setPos(p.x, p.y);
  }

  onDragStart(e) {
    this.hairs.setColor('gray');
    this.hideSelected();
  }

  onDragEnd(e) {
    const mat = this.circleInteractive.node().transform.baseVal[0].matrix;
    if (this.dragEndCallback)
      this.dragEndCallback(this.grid.y.invert(mat.f));
  }

  reposition() {
    if (!this.path.datum())
      return;

    this.path
      .attr('d', d => this.plotLine(d));

    const min = this.path.datum()[0]
    if (min) {
      this.minHair.setPos(this.grid.x(min.variance),this.grid.y(min.logret))
      this.minHair.resize();
    } else {
      this.minHair.hide();
    }

    this.hairs.resize();
    this.redrawOptimal();
    this.redrawSelected();
  }

  show() {
    for (const a of ['circleInteractive', 'groupSelected', 'groupOptimal'])
      this.showMember(a);
  }

  hide() {
    for (const a of ['circleInteractive', 'groupSelected', 'groupOptimal'])
      this.hideMember(a);
  }

  showSelected() {
    this.showMember('groupSelected');
  }

  hideSelected() {
    this.hideMember('groupSelected');
  }

  hideMember(name) {
    this[name].attr('display', 'none');
  }

  showMember(name) {
    this[name].node().removeAttribute('display');
  }


  setData(data) {
    this.path.datum(data.frontPts);

    if (data.assetsPts.length < 1) {
      this.hide();
      this.hairs.hide();
      return;
    } else if (data.assetsPts.length < 2) {
      this.hide();
    } else {
      this.show();
    }


    if (data.assetsPts.length === 2)
      this.setThin();
    else
      this.setThick();

    this.groupOptimal.datum(data.optimal.pt);
    this.selected = null;

    this.reposition();
  }

  setSelected(selected) {
    this.selected = selected;
    this.showSelected();
    this.redrawSelected();
  }

  redrawSelected() {
    const pt = this.selected ? this.selected : this.groupOptimal.datum(),
      x = this.grid.x(pt.variance),
      y = this.grid.y(pt.logret),
      color = this.legend.getColor(pt.ratio);

    this.circleInteractive.attr('transform', `translate(${x},${y})`);
    this.groupSelected.attr('transform', `translate(${x},${y})`);
    this.groupSelected.select('circle').attr('fill', color);

    let offsetY = 0, rectColor = color, text = this.selText;
    if (!this.selected) {
      const bbox = this.groupOptimal.select('g > rect').node().getBBox();
      offsetY = bbox.height + 2;
      rectColor = this.neutralC;
      text = this.dragText;
    }
    this.groupSelected.select('g > text').text(text);
    this.repositionLabel(this.groupSelected, x, offsetY);
    this.groupSelected.select('g > rect').attr('fill', rectColor);

    this.hairs.setColor(color);
    this.hairs.show();
    this.hairs.setPos(x, y);
  }

  redrawOptimal() {
    let posX, color;

    this.groupOptimal
      .attr('transform', d => {
        const x = (posX = this.grid.x(d.variance));
        const y = this.grid.y(d.logret);
        return `translate(${x},${y})`
      }).select('circle')
          .attr('fill', d => (color = this.legend.getColor(d.ratio)));

    this.groupOptimal.select('g > rect').attr('fill', color);
    this.repositionLabel(this.groupOptimal, posX);
    this.repositionToAssets();
  }

  intersect(r1, r2) {
    return !(r2.x > r1.x + r1.width ||
           r2.x + r2.width < r1.x ||
           r2.y > r2.y + r2.height ||
           r2.y + r2.height < r1.y);
  }

  repositionToAssets() {
    // reposition optimal label if it intersects with an asset label
    const optMat = this.groupOptimal.node().transform.baseVal[0].matrix;
    const optBbox = this.groupOptimal.select('g > rect').node().getBBox();
    optBbox.x += optMat.e;
    optBbox.y += optMat.f;
    const that = this;
    let prevWidth = 0;
    this.assets.group.selectAll('g.item').each(function(d, i) {
      const mat = this.transform.baseVal[0].matrix;
      const bbox = select(this).select('rect').node().getBBox();
      bbox.x += mat.e;
      bbox.y += mat.f;
      if (that.intersect(bbox, optBbox)) {
        const gMat = select(this).select('g.label').node()
          .transform.baseVal[0].matrix;
        const labelMat = that.groupOptimal.select('g.label').node()
          .transform.baseVal[0].matrix;
        if (bbox.width <= prevWidth)
          return;
        const x = labelMat.e + (gMat.e > 0 ? bbox.width : -bbox.width);
        const y = labelMat.f;
        that.groupOptimal.select('g.label')
          .attr('transform', `translate(${x},${y})`)
        return;
      }
    })
  }

}


export default Frontier;
