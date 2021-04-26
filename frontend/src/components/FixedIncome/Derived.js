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

import Chunks from '../common/Chunks';
import { NA } from '../common/utils';

export const NUM_ROWS = 3;


function buildItems(d) {
  return {
    'Convexity':
      <span className='convexity'>
        {d.convexity ? (d.convexity).toFixed(2) : NA}
      </span>,
    'Modified Duration':
      <span className='modified'>
        {d.modified ? (d.modified).toFixed(2) : NA}
      </span>,
    'Macaulay Duration': d.macaulay ? (d.macaulay).toFixed(2) : NA,
    'Yield to Maturity': d.ytm ? (d.ytm * 100).toFixed(2) + '%' : NA,
    'Current Yield': d.cy ? (d.cy * 100).toFixed(2) + '%' : NA,
  }
}


function Derived(props) {
  const { derived } = props;

  return (
    <Chunks
      className='FixedIncome-derived'
      numRows={NUM_ROWS}
      items={derived && Object.keys(derived).length ? buildItems(derived) : null}
    />
  )
}


export default Derived;
