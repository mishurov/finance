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

import { useState } from 'react';
import CashFlowPlot from './CashFlowPlot';

import { getLast } from '../common/utils';

import FailureOverlay from '../common/FailureOverlay';
import { useFetch, fetchStates } from '../../fetching/useFetch';

import { fetchEquity } from '../../fetching/api';

import { EMPTY } from '../common/utils';

const resource = fetchEquity();


function Plot(props) {
  const { title, data, shapeGradient, toolTipBgColor } = props;

  const last = getLast(data);

  return (
      <div>
        <p className='subhead'>
          {title}
          <span className='latestValue'>{last.value || 'No Data'}</span>
          <span className='latestDate'>{last.date}</span>
        </p>
        <CashFlowPlot
          shapeGradient={shapeGradient}
          toolTipBgColor={toolTipBgColor}
          data={data}
          width={300}
          height={200}
        />
      </div>
  );
}


const initFlows = [{
  title: EMPTY,
  data: null,
  shapeGradient: 'steelblue,brown',
  toolTipBgColor: 'steelblue',
}];


function CashFlows(props) {
  const [cashFlows, setCashFlows] = useState(initFlows);

  const fetching = useFetch(async function() {
    setCashFlows(initFlows);

    if (props.ticker) {
      const data = await resource.cashflows(props.ticker);
      if (data.cashflows)
        setCashFlows(data.cashflows);
    }

  }, [props.ticker]);

  return (
  <div className={fetching + ' Equity-CashFlows'}>
    {fetching === fetchStates.FAILURE && <FailureOverlay/>}
    <h2>Free Cash Flows</h2>
    <div className='Equity-FCF'>
      {cashFlows.map((cf, i) =>
        <Plot key={cf.title}
          title={cf.title} data={cf.data}
          shapeGradient={cf.shapeGradient}
          toolTipBgColor={cf.toolTipBgColor}/>
      )}
    </div>
  </div>
  )
}


export default CashFlows;
