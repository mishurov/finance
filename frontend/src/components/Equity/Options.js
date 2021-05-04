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
import { useFetch, fetchStates } from '../../fetching/useFetch';
import { fetchEquity } from '../../fetching/api';
import { formatDateStr } from '../common/utils'
import OptionsHistoPlot from './OptionsHistoPlot';
const resource = fetchEquity();


function toPercent(d) {
  return (d * 100).toFixed(2) + '%'
}


function OptionGroup(props) {
  if (!props.data.length)
    return null;

  const max = props.data.reduce((prev, current) => {
    return (prev.volume > current.volume) ? prev : current
  });

  return (<div className='optionGroup'>
    <h3>{props.title}</h3>
    <OptionsHistoPlot
      width={460} height={150}
      data={props.data}
      color={props.color}/>
    <p className='max'>
      Highest volume:
      <span className='name' style={{color: props.color}}>
        {max.contractSymbol}
      </span>
    </p>
    <table>
      <thead>
        <tr>
          <th>Strike</th>
          <th>Price</th>
          <th>Last Trade</th>
          <th>Impl Volat</th>
          <th>Volume</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{max.strike}</td>
          <td>{max.lastPrice}</td>
          <td>{formatDateStr(max.lastTrade)}</td>
          <td>{toPercent(max.impliedVolatility)}</td>
          <td>{max.volume}</td>
        </tr>
      </tbody>
    </table>
  </div>)
}


function Options(props) {
  const [calls, setCalls] = useState([]);
  const [puts, setPuts] = useState([]);
  const [expiration, setExpiration] = useState(null);

  const fetching = useFetch(async function() {
    setPuts([]);
    setCalls([]);
    setExpiration(null);
    if (props.ticker) {
      const data = await resource.options(props.ticker)
      if (data.calls.length)
        setCalls(data.calls);
      if (data.puts.length)
        setPuts(data.puts);
      const options = data.calls && data.calls.length ? data.calls : data.puts;
      if (options.length)
        setExpiration(options[0].expiration)
    }
  }, [props.ticker]);

  if (fetching !== fetchStates.SUCCESS || (!puts.length && !calls.length))
    return null;

  return (
    <div className='Equity-options'>
      <h2>Options</h2>
      <p className='subhead'>
        Strike-volume histograms on the latest expiration date:
        <span className='latestDate'>
          {formatDateStr(expiration)}
        </span>
      </p>
      <div className='optionGroups'>
        <OptionGroup title='Calls' data={calls} color='#627185'/>
        <OptionGroup title='Puts' data={puts} color='#75586b'/>
      </div>
    </div>
  );
}


export default Options;
