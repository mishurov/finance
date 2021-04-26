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

const ClipMixin = Base => class extends Base
{
  createClipRect(svg) {
    this.clipId = 'clip_' + new Date().getTime();
    this.clipArea = svg.append('defs')
      .append('clipPath')
        .attr('id', this.clipId)
        .append('rect');
    this.updateClipSize();
  }

  updateClipSize() {
    const lastX = this.x.range().length - 1;
    const lastY = this.y.range().length - 1;
    this.clipArea
      .attr('x', this.x.range()[0])
      .attr('y', this.y.range()[lastY])
      .attr('width', this.x.range()[lastX] - this.x.range()[0])
      .attr('height', this.y.range()[0] - this.y.range()[lastY]);
  }
}

export default ClipMixin;
