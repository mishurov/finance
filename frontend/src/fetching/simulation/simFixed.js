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

import columnsMOEX from './data/moex_columns.json';
import overviewGAZ from './data/moex_XS2124187571.json';


//https://iss.moex.com/iss/reference/
// not used https://iss.moex.com/iss/securities/XS2124187571.json?lang=en
//https://iss.moex.com/iss/engines/stock/markets/bonds/securities/columns.json?lang=en
//https://iss.moex.com/iss/engines/stock/markets/bonds/securities/XS2124187571.json?lang=en
export function overview(ticker) {
    let { columns, data } = columnsMOEX.securities;
    const nameIndex = columns.indexOf('name');
    const titleIndex = columns.indexOf('title');
    const typeIndex = columns.indexOf('type');

    const scheme = {};
    for (const row of data)
      scheme[row[nameIndex]] = [row[titleIndex], row[typeIndex]]

    const setType = (v, t) => {
      switch(t) {
        case 'date':
          return Date.parse(v) ? new Date(Date.parse(v)) : null;
        case 'number':
          return Number(v);
        case 'boolean':
          return !!Number(v);
        default:
          return v;
      }
    }

    ({ columns, data } = overviewGAZ.securities);
    const d = {};
    for (let i = 0; i < columns.length; i++) {
      const name = columns[i];
      const value = data[0][i];
      const column = scheme[name];
      d[column[0].trim()] = setType(value, column[1])
    }

    return {
      ticker: d['ISIN'],
      name: d['English Name'],
      lastPrice: d['Last Transaction Price of Previous Trading Day, percent of face value'],
      lastTrade: d['Last Trading Date'],
      maturityDate: d['Maturity Date, dd.mm.yy.'],
      couponDate: d['Coupon Date'],
      couponPeriod: d['Coupon Period'],
      couponRate: d['Coupon rate, %'],
      couponValue: d['Coupon value, in face value currency'],
      lotSize: d['Lot Size in Securities, Units'],
      lotValue: d['Lot face value, in face value currency'],
      issueVolume: d['Issue Volume, units'],
    }

}

export function texts() {
  return { notes: ['The bond data is scheduled for nightly updates'] };
}
