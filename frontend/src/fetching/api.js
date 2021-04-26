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

import * as urls from './urls'
//import fetchCurrent from './simulation/simFetch';
const fetchCurrent = fetch;


const textCaches = {}

function cachedRequest(url, key, cache) {
  const entry = textCaches[key];
  if (entry)
    return entry;
  return sendRequest(url)
    .then(json => {
      textCaches[key] = json;
      return new Promise((r, ) => r(json))
    });
}

export function fetchHome() {
  return {
    texts: function() {
      return cachedRequest(urls.HOME_TEXTS, 'home', textCaches);
    },
  };
}


export function fetchFixed() {
  return {
    overview: function(ticker) {
      return sendRequest(urls.FIXED_OVERVIEW(ticker));
    },
    texts: function() {
      return cachedRequest(urls.FIXED_TEXTS, 'fixed', textCaches);
    },
  };
}


export function fetchEquity() {
  return {
    texts: function() {
      return cachedRequest(urls.EQUITY_TEXTS, 'equity', textCaches);
    },
    overview: function(ticker) {
      return sendRequest(urls.EQUITY_OVERVIEW(ticker));
    },
    technicals: function(ticker) {
      return sendRequest(urls.EQUITY_TECHNICALS(ticker));
    },
    cashflows: function(ticker) {
      return sendRequest(urls.EQUITY_CASHFLOWS(ticker));
    },
    ratios: function(ticker) {
      return sendRequest(urls.EQUITY_RATIOS(ticker));
    },
    options: function(ticker) {
      return sendRequest(urls.EQUITY_OPTIONS(ticker));
    },
    daily: function(ticker) {
      return sendRequest(urls.EQUITY_DAILY(ticker));
    },
  };
}


const portfolioCache = {
  entries: {},
  add: function(a) {
    for (const {ticker, series} of a) {
      this.entries[ticker] = series;
    }
  },
  get: function(tickers) {
    const cached = [],
      uncached = [];
    for (const t of tickers) {
      const entry = this.entries[t];
      if (entry)
        cached.push({ticker: t, series: entry});
      else
        uncached.push(t);
    }
    return [cached, uncached];
  }
};

export function fetchPortfolio() {
  return {
    texts: function() {
      return cachedRequest(urls.PORTFOLIO_TEXTS, 'portfolio', textCaches);
    },
    daily: function(tickers) {
      const [cached, uncached] = portfolioCache.get(tickers);
      if (!uncached.length)
        return { daily: cached };
      let params = {};
      params[urls.PARAM_TICKER] = uncached;
      params = new URLSearchParams(params).toString();
      return sendRequest(urls.PORTFOLIO_DAILY + '?' + params)
        .then(json => {
          portfolioCache.add(json.daily);
          json.daily = json.daily.concat(cached);
          return new Promise((r, ) => r(json))
        });
    },
  }
};


const securitiesCache = {};

export function fetchSecurities() {
  return {
    stocks: function(q) {
      const url = `${urls.SEARCH_STOCKS}?${urls.PARAM_QUERY}=${encodeURI(q)}`;
      return cachedRequest(url, q, securitiesCache);
    },
    bonds: function() {
      return cachedRequest(urls.LOAD_BONDS, '_bonds_all', securitiesCache);
    },
  }
};


export const aborters = [];

async function sendRequest(url) {
  const c = new AbortController();
  aborters.push(c);

  const response = await fetchCurrent(url, {signal: c.signal});
  if (!response.ok) {
    throw new TypeError(response.statusText);
  }
  return response.json()
}
