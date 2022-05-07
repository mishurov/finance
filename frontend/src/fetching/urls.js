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

const BACKEND_HOST = '/api'

const FIXED = '/fixed'
const EQUITY = '/equity'
const PORTFOLIO = '/portfolio'

const TEXTS = '/texts'
const WEEKLY = '/weekly'
export const DAILY = '/daily'

export const PARAM_TICKER = 't';
export const PORTFOLIO_TEXTS = BACKEND_HOST + PORTFOLIO + TEXTS + '/';
export const PORTFOLIO_WEEKLY = BACKEND_HOST + PORTFOLIO + WEEKLY + '/';
export const PORTFOLIO_DAILY = BACKEND_HOST + PORTFOLIO + DAILY + '/';

export const EQUITY_TEXTS = BACKEND_HOST + EQUITY + TEXTS + '/';

export const OVERVIEW = '/overview'
export const TECHNICALS = '/technicals'
export const CASHFLOWS = '/cashflows'
export const RATIOS = '/ratios'
export const OPTIONS = '/options'

export const PARAM_DATE = 'date';
export const EQUITY_BASE = BACKEND_HOST + EQUITY;

export const EQUITY_OVERVIEW = (t) => `${EQUITY_BASE}/${t}${OVERVIEW}/`;
export const EQUITY_TECHNICALS = (t) => `${EQUITY_BASE}/${t}${TECHNICALS}/`;
export const EQUITY_CASHFLOWS = (t) => `${EQUITY_BASE}/${t}${CASHFLOWS}/`;
export const EQUITY_RATIOS = (t) => `${EQUITY_BASE}/${t}${RATIOS}/`;
export const EQUITY_OPTIONS = (t) => `${EQUITY_BASE}/${t}${OPTIONS}/`;
export const EQUITY_DAILY = (t) => `${EQUITY_BASE}/${t}${DAILY}/`;

export const FIXED_TEXTS = BACKEND_HOST + FIXED + TEXTS + '/';

export const FIXED_BASE = BACKEND_HOST + FIXED;
export const FIXED_OVERVIEW = (t) => `${FIXED_BASE}/${t}${OVERVIEW}/`;

export const HOME_TEXTS = BACKEND_HOST + TEXTS + '/';

const STOCKS = '/stocks'
const BONDS = '/bonds'

export const PARAM_QUERY = 'q';
export const SEARCH_STOCKS = BACKEND_HOST + STOCKS + '/';
export const LOAD_BONDS = BACKEND_HOST + BONDS + '/';
