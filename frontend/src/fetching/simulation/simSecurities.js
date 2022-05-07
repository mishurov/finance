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

import stocksTinkoff from './data/tinkoff_28-12-20_stocks.json';

/*
[
  ['MTSC', 'MTS Systems Corp'],
  ['INTC', 'Intel Corporation'],
  ['TCS', 'TCS Group (Tinkoff Bank holder)']
]
*/
export function stocks(q) {
  const instruments = stocksTinkoff['payload']['instruments'];
  const result = instruments.filter(i => {
    return i.currency === 'USD' && i.ticker.startsWith(q);
  });

  return { stocks: result.map(i => [i.ticker, i.name]) };
}


export function bonds() {
  return { bonds: [
    ['Credit Bank of Moscow', 'XS1589106910'],
    ['The Arab Republic of Egypt', 'EGPT0329'],
    ['VTB Perp', 'VTBPERP']
  ]};
}

