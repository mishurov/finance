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

import FailureOverlay from '../common/FailureOverlay';
import { fetchStates } from '../../fetching/useFetch';

import Chunks from '../common/Chunks';

export const NUM_ROWS = 3;

function Overview(props) {
  const { fetching, header, items } = props;

  return (
    <div className={fetching + ' Equity-OverviewContainer'}>
      {fetching === fetchStates.FAILURE && <FailureOverlay/>}
      <div className='Equity-industry'>
        {header.sector + ' - ' + header.industry}
      </div>
      <Chunks
        className='Equity-overview'
        numRows={NUM_ROWS}
        items={items}/>
    </div>
  )
}


export default Overview;
