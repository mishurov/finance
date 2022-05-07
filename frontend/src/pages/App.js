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

import { lazy, Suspense } from 'react';
import { Switch, Route } from "wouter";
import ReactGA from 'react-ga4';
import * as Sentry from "@sentry/react";
import Header from '../components/common/Header';
import NotFound from './NotFound';
import {
  MENU_EQUITY, MENU_FIXED_INCOME, MENU_PORTFOLIO_TOOLS
} from './menu';

import '../css/App.css';

const Home = lazy(() => import('./Home'));
const Equity = lazy(() => import('./Equity'));
const FixedIncome = lazy(() => import('./FixedIncome'));
const PortfolioTools = lazy(() => import('./PortfolioTools'));

const PROD = true;
//const PROD = false;

if (PROD) {
  try {
    const secrets = require('../secrets.js');
    ReactGA.initialize(secrets.ANALYTICS_KEY, {
      gaOptions: {
        cookieFlags: 'SameSite=None;Secure'
      }
    });
    Sentry.init({ dsn: secrets.SENTRY_DSN });
  } catch {}
}


function Fallback() {
  return <div className='SuspenseFallback'>Loading...</div>;
}


function App() {
  return (
  <div className='App'>
    <Header/>
    <Suspense fallback={<Fallback/>}>
      <Switch>
        <Route path='/' component={Home} />
        <Route path={MENU_EQUITY[0] + '/:ticker?'} component={Equity} />
        <Route path={MENU_FIXED_INCOME[0] + '/:ticker?'} component={FixedIncome} />
        <Route path={MENU_PORTFOLIO_TOOLS[0]} component={PortfolioTools} />
        <Route path='/health'>{() => 'Dream on!'}</Route>
        <Route path='/:rest*' component={NotFound} />
      </Switch>
    </Suspense>
    <div className='disclaimer'>
      The information on the Mishurov Finance website is provided for
      information only and does not constitute, and should not be construed as,
      investment advice or a recommendation to buy, sell, or otherwise transact
      in any investment including any products or services or an invitation,
      offer or solicitation to engage in any investment activity.
    </div>
    <div className='copyright'>
      Copyright © 2021 Alexander Mishurov. All rights reserved.
    </div>
  </div>
  );
}


export default App;
