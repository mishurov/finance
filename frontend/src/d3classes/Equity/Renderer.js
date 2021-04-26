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

import { timer } from 'd3-timer';
import { easeCubic } from 'd3-ease';


class Renderer {
  ease = easeCubic;
  duration = 150;
  step = 100;

  constructor(canvas) {
    this.dpi = window.devicePixelRatio;
    this.canvas = canvas.node();
    this.timer = timer(() => {});
  }

  callback(elapsed, updateFuncs, drawFuncs) {
    let t = 1;
    for (let i = 0; i < updateFuncs.length; i++) {
      const duration = this.duration + i * this.step;
      t = Math.min(1, this.ease(elapsed / duration));
      updateFuncs[i](t);
    }

    this.draw(drawFuncs);

    if (t >= 1)
      this.timer.stop();
  }

  draw(drawFuncs) {
    const ctx = this.canvas.getContext("2d");
    ctx.save();
    ctx.scale(this.dpi, this.dpi);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (const f of drawFuncs)
      f(ctx);
    ctx.restore();
  }

  render(updateFuncs, drawFuncs) {
    //this.draw(drawFuncs);
    this.timer.restart(elapsed => {
      this.callback(elapsed, updateFuncs, drawFuncs)
    });

  }
}

export default Renderer;
