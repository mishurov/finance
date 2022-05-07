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

import CandlePlot from './CandlePlot';

import FailureOverlay from '../common/FailureOverlay';
import { useFetch, fetchStates } from '../../fetching/useFetch';
import { fetchEquity } from '../../fetching/api';

import Chunks from '../common/Chunks';

const resource = fetchEquity();

const NUM_ROWS = 3;


function Technicals(props) {
  const [daily, setDaily] = useState(null);
  const [technicals, setTechnicals] = useState(null);

  const fetchingDaily = useFetch(async function() {
    setDaily(null)
    if (props.ticker) {
      const data = await resource.daily(props.ticker)
      if (data)
        setDaily(data)
    }
  }, [props.ticker]);

  const fetchingTechnicals = useFetch(async function() {
    setTechnicals(null);
    if (props.ticker) {
      const data = await resource.technicals(props.ticker)
      if (Object.keys(data).length)
        setTechnicals(data);
    }
  }, [props.ticker]);

  return (
  <div className='Equity-TechicalsContainer'>
    <div className={fetchingTechnicals}>
      {fetchingTechnicals === fetchStates.FAILURE && <FailureOverlay/>}
      <h2>Technicals</h2>
      <Chunks
        className='Equity-technicals'
        numRows={NUM_ROWS}
        items={technicals}/>
    </div>
    <div className={fetchingDaily}>
      {fetchingDaily === fetchStates.FAILURE && <FailureOverlay/>}
      <CandlePlot data={daily} width={470} height={420}/>
    </div>
  </div>
  )
}


export default Technicals
