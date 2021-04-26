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

import { Fragment } from 'react';
import { toPercent } from '../common/utils';


function Block(props) {
  return (
    <div className={props.className}>
      <h3>{props.header}</h3>
      {props.children}
    </div>
  )
}

function Item(props) {
  const color = props.color ? {color: props.color} : {};
  return (
    <>
      <h4 style={color}>{props.title}</h4>
      {props.data && props.data.weights && (
        <>
          <dl className='weights'>
            {props.data.weights.map((w, i) => (
              <Fragment key={w.ticker}>
                <dt>{w.ticker}</dt>
                <dd>{toPercent(w.value)}</dd>
              </Fragment>
            ))}
          </dl>
        </>
      )}
      {props.data && props.data.pt && !isNaN(props.data.pt.logret) ?
        (<dl className='figures'>
          <dt>Log Return</dt>
          <dd>{toPercent(props.data.pt.logret)}</dd>
          <dt>Variance</dt>
          <dd>{toPercent(props.data.pt.variance)}</dd>
          <dt>μ/σ Ratio</dt>
          <dd>{props.data.pt.ratio.toFixed(2)}</dd>
        </dl>)
        : (<p className='nodata'>No data</p>)
      }
    </>
  )

}

export function Portfolios(props) {
  return(
  <Block className={props.className} header='Potfolios'>
    <div className='portfolios'>
      <Item title='Selected' data={props.selected} color={props.portColor}/>
      <Item title='Optimal' data={props.optimal} color={props.colors.optimal}/>
    </div>
  </Block>
  );
}


export function Assets(props) {
  return(
  <Block className={props.className} header='Assets'>
    <div className='assets'>
    {props.pts && props.pts.map((pt, i) =>
      <div key={pt.ticker}>
        <Item
          title={pt.ticker}
          data={{pt}}
          color={props.colors.assets && props.colors.assets[i]}/>
      </div>
    )}
    </div>
    {(!props.pts || !props.pts.length) && <p className='nodata'>No data</p>}
  </Block>
  );
}
