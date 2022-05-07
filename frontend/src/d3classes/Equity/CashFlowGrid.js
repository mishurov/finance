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

import { format } from 'd3-format';
import RatioGrid from './RatioGrid';


class CashFlowGrid extends RatioGrid {
  configureTicksY() {
    this.axisY
      .ticks(5)
      .tickFormat(d => format(".4s")(d).replace('G', 'B'))
  }
}


export default CashFlowGrid;
