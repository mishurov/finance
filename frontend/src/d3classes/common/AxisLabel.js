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

class AxisLabel {
  constructor(svg, axisGroup, position='bottom', text, gap = 3) {
    this.gap = gap;
    this.position = position;
    this.axisGroup = axisGroup;
    const baseline = this.position === 'bottom' || this.position === 'right' ?
      'hanging' : 'auto';

    this.text = svg.append('text')
      .classed('AxisLabel', true)
      .attr('dominant-baseline', baseline)
      .text(text);

    this.transform();
  }

  setText(text) {
    this.text.text(text);
  }

  transform() {
    const t = { x: 0, y: 0 };
    let r = 0;

    const textW = this.text.node().getComputedTextLength();
    const axisBBox = this.axisGroup.node().getBBox();
    const axisMat = this.axisGroup.node().transform.baseVal[0].matrix;

    if (this.position === 'bottom' || this.position === 'top') {
        t.x = axisBBox.x + axisBBox.width / 2 - textW / 2;
        if (this.position === 'bottom')
          t.y = axisBBox.height + axisBBox.y + axisMat.f + this.gap;
        else
          t.y = axisMat.f + axisBBox.y - this.gap;
    } else {
        r = -90;
        t.y = axisBBox.y + axisBBox.height / 2 + textW / 2;
        if (this.position === 'left')
          t.x = axisMat.e + axisBBox.x - this.gap;
        else
          t.x = axisBBox.width + axisBBox.x + axisMat.e + this.gap;
    }

    this.text.attr('transform', `translate(${t.x},${t.y}) rotate(${r})`)
  }
}


export default AxisLabel;
