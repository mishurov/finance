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

import { Fragment } from 'react';
import { initItemsDict, chunk } from '../common/utils';


function Chunks(props) {
  const { numRows, className } = props;

  const items = props.items || initItemsDict(numRows);;
  const chunks = chunk(Object.keys(items), numRows);

  return (
    <div className={className + ' Security-dict'}>
      {chunks.map((ch, i) => (
        <dl key={i}>
          {ch.map((k, j) => (
            <Fragment key={j}>
              <dt>{k}</dt><dd>{items[k]}</dd>
            </Fragment>
          ))}
        </dl>
      ))}
    </div>
  )
}


export default Chunks;
