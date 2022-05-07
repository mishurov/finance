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

export function mapToRatios(data) {
  const { incomes, balances, averages } = data;

  const keys = ['ROA', 'ROE', 'current', 'cash']
  const firms = {};
  for (const k of keys)
    firms[k] = [];

  for (let i = 0; i < incomes.length; i++) {
    const is = incomes[i];
    const bs = balances[i];
    const date = Date.parse(is.fiscalDateEnding);
    firms.ROA.push({ date,
      value: parseInt(is.netIncome) / parseInt(bs.totalAssets)
    });
    firms.ROE.push({ date,
      value: parseInt(is.netIncome) / parseInt(bs.totalShareholderEquity)
    });
    firms.current.push({ date,
      value: parseInt(bs.totalCurrentAssets) / parseInt(bs.totalCurrentLiabilities)
    });
    const cashAndInv = bs.cashAndShortTermInvestments;
    const cash = cashAndInv !== 'None' ? cashAndInv : bs.cash;
    firms.cash.push({ date,
      value: parseInt(cash) / parseInt(bs.totalCurrentLiabilities)
    });
  }

  const ret = {};
  for (const k of keys) {
    firms[k].reverse();
    averages[k].reverse();
    ret[k] = {
      firm: firms[k],
      average: averages[k],
    }
  }

  return ret;
}


export function mapToFCF(data) {
  const FCFF = [], FCFE = [];
  for (const st of data) {
    const date = Date.parse(st.fiscalDateEnding);
    FCFF.push({
      date,
      value: parseInt(st.operatingCashflow) - parseInt(st.capitalExpenditures),
    });
    FCFE.push({
      date,
      value: (parseInt(st.operatingCashflow)
        - parseInt(st.capitalExpenditures),
        + parseInt(st.netBorrowings)),
    });
  }
  FCFF.reverse();
  FCFE.reverse();
  return {FCFF, FCFE};
}

export function getLatestOptionDate(data) {
  if (!data.optionChain
      || data.optionChain.error
      || !data.optionChain.result.length
      || !data.optionChain.result[0].expirationDates.length)
    return null;

  const dates = data.optionChain.result[0].expirationDates;
  return Math.max.apply(null, dates);
}


export function extractOptions(data) {
  if (!data.optionChain
      || data.optionChain.error
      || !data.optionChain.result.length
      || !data.optionChain.result[0].options.length)
    return null;

  const convExp = (o) => {
    o.expiration = new Date(o.expiration * 1000)
    o.lastTrade = new Date(o.lastTradeDate * 1000)
  };

  const { calls, puts } = data.optionChain.result[0].options[0];

  calls.map(o => convExp(o));
  puts.map(o => convExp(o));

  return { calls, puts };
}
