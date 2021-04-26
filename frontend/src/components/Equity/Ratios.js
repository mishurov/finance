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

import { useState } from 'react';
import RatioPlot from './RatioPlot';

import { getLast } from '../common/utils';

import FailureOverlay from '../common/FailureOverlay';
import { useFetch, fetchStates } from '../../fetching/useFetch';

import { fetchEquity } from '../../fetching/api';

import { EMPTY } from '../common/utils';

const resource = fetchEquity();


function Plot(props) {
  const { title, data } = props;

  const last = getLast(data && data.length && data[0].data);

  return (
    <div>
      <p className='subhead'>
        {title}
        <span className='latestValue'>{last.value || 'No Data'}</span>
        <span className='latestDate'>{last.date}</span>
      </p>
      <RatioPlot data={data} width={270} height={200} />
    </div>
  );
}


const initRatios = [{
  title: EMPTY,
  items: [{
    subTitle: EMPTY,
    data: [],
  }],
}];

function Ratios(props) {
  const [ratios, setRatios] = useState(initRatios);

  const fetching = useFetch(async function() {
    setRatios(initRatios);
    if (props.ticker) {
      const data = await resource.ratios(props.ticker);
      if (data.ratios)
        setRatios(data.ratios);
    }
  }, [props.ticker]);

  return (
    <div className={fetching + ' Equity-RatiosContainer'}>
      {fetching === fetchStates.FAILURE && <FailureOverlay/>}
      {ratios.map((bl, i) => (
        <div key={i}>
          <h2>{bl.title}</h2>
          <div key={i} className='Equity-ratios'>
          {bl.items.map((r, i) =>
              <Plot key={i} title={r.subTitle} data={r.data}/>
          )}
          </div>
        </div>
      ))}
    </div>
  );
}


export default Ratios;
