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

import * as urls from '../urls';
import * as portfolio from './simPortfolio';
import * as equity from './simEquity';
import * as fixed from './simFixed';
import * as home from './simHome';
import * as securities from './simSecurities';

//const TIMEOUT = 3000;
const TIMEOUT = 3;


function getResponse(url) {
  let data;

  let toParse = '';
  if (url.startsWith('/api')) {
    toParse = 'http://apiserver.local' + url;
  } else {
    toParse = url;
  }

  const urlObj = new URL(toParse);
  const path = (toParse !== url ? '' : urlObj.origin) + urlObj.pathname,
      params = urlObj.searchParams;

  if (url.startsWith(urls.EQUITY_BASE)) {
    const p = path.substring(urls.EQUITY_BASE.length + 1, url.length);
    const [ticker, method] = p.split('/');
    switch ('/' + method) {
      case urls.OVERVIEW:
        data = equity.overview(ticker);
        break;
      case urls.TECHNICALS:
        data = equity.technicals(ticker);
        break;
      case urls.CASHFLOWS:
        data = equity.cashflows(ticker);
        break;
      case urls.RATIOS:
        data = equity.ratios(ticker);
        break;
      case urls.OPTIONS:
        data = equity.options(ticker);
        break;
      case urls.DAILY:
        data = equity.daily(ticker)
        break;
      default:
        if (path === urls.EQUITY_TEXTS)
          data = equity.texts();
        else
          return null;
    }
  } else if (url.startsWith(urls.FIXED_BASE)) {
    const p = path.substring(urls.FIXED_BASE.length + 1, url.length);
    const [ticker, method] = p.split('/');
    switch ('/' + method) {
      case urls.OVERVIEW:
        data = fixed.overview(ticker);
        break;
      default:
        if (path === urls.FIXED_TEXTS)
          data = fixed.texts();
        else
          return null;
      }
  } else {
    let tickers = []
    const param = params.get(urls.PARAM_TICKER)
    if (param)
      tickers = param.split(',');
    switch(path) {
      case urls.HOME_TEXTS:
        data = home.texts();
        break;
      case urls.LOAD_BONDS:
        data = securities.bonds();
        break;
      case urls.SEARCH_STOCKS:
        const query = params.get(urls.PARAM_QUERY).split(',');
        data = securities.stocks(query);
        break;
      case urls.PORTFOLIO_DAILY:
        data = portfolio.daily(tickers);
        break;
      case urls.PORTFOLIO_WEEKLY:
        data = portfolio.weekly(tickers);
        break;
      case urls.PORTFOLIO_TEXTS:
        data = portfolio.texts();
        break;
      default:
        return null;
    }
  }

  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    {type: 'application/json'}
  );

  return new Response(blob);
  //return new Response(blob, {status: 500, statusText: 'Server Error'});
}


export default function simFetch(url, params) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (params.signal && params.signal.aborted) {
        const e = new Error('Operation was aborted');
        e.name = 'AbortError'
        reject(e);
      }
      const r = getResponse(url);
      if (r)
        resolve(r);
      else
        reject(new TypeError('Simulation Not Found'));
    }, TIMEOUT);
  });
}
