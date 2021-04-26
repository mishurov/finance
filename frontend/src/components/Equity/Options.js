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

const resource = fetchEquity();


function toPercent(d) {
  return (d * 100).toFixed(2) + '%'
}


function Option(props) {
  const { type, option } = props;

  return (
    <tr>
      <th scope='row'>{type}</th>
      <td>{formatDateStr(option.expiration)}</td>
      <td>{option.strike}</td>
      <td>{option.lastPrice}</td>
      <td>{formatDateStr(option.lastTrade)}</td>
      <td>{toPercent(option.impliedVolatility)}</td>
      <td>{option.volume}</td>
      <td>{option.contractSymbol}</td>
    </tr>
  );
}


function Options(props) {
  const [options, setOptions] = useState(null);

  const fetching = useFetch(async function() {
    setOptions(null);
    if (props.ticker) {
      const data = await resource.options(props.ticker)
      if (data.call || data.put)
        setOptions(data);
    }
  }, [props.ticker]);

  if (fetching !== fetchStates.SUCCESS || !options)
    return null;

  return (
    <div className='Equity-options'>
      <h2>Options</h2>
      <p className='subheadOptions'>Farthest max volume contracts</p>
      <table>
        <thead>
          <tr>
            <th></th>
            <th scope='col'>Expiration</th>
            <th scope='col'>Strike</th>
            <th scope='col'>Price</th>
            <th scope='col'>Last Trade</th>
            <th scope='col'>Impl Volat</th>
            <th scope='col'>Volume</th>
            <th scope='col'>Contract Name</th>
          </tr>
        </thead>
        <tbody>
          {options.call && <Option type='Call' option={options.call} />}
          {options.put && <Option type='Put' option={options.put} />}
        </tbody>
      </table>
    </div>
  );
}


export default Options;
