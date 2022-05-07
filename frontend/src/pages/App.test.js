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

//import '@testing-library/jest-dom';
const puppeteer = require('puppeteer-core');
const stocks = require('../fetching/simulation/data/api_stocks.json');
const bonds = require('../fetching/simulation/data/api_bonds.json');


const host = 'http://localhost:3000';


jest.setTimeout(100000);


const launchOptions = {
  headless: false, 
  executablePath: '/usr/bin/chromium',
};


const g = {
  browser: null,
  path: null
};


function exit(msg) {
  process.stderr.write(msg + '\n');
  g.browser.close().then(() => {
    process.exit(1);
  })
}


beforeAll(async () => {
  // Doesn't wait the async function
  /*
  const r = await fetch(host + '/api/tickers/S/');
  g.tickers = await r.json();
  */
  g.browser = await puppeteer.launch(launchOptions);
  g.page = await g.browser.newPage();

  g.path = null;

  g.page.on('error', err => {
    exit(`${g.path} ${err}`);
    //throw new Error(`${g.path} ${err}`);
  });

  g.page.on('pageerror', err => {
    exit(`${g.path} ${err}`);
    //throw new Error(`${g.path} ${err}`);
  });

  g.page.on('console', async msg => {
    const type = await msg.type();
    if (type !== 'error')
      return;
    exit(`${g.path} Console Error`);
  })

});


afterAll(async () => {
  await g.browser.close();
});


// the same as with the backend, 
// iterating over all ~1500 tickers is a bit harsh,
// using mock data with some zeroed fields and missing reposts
// would be more optimal

describe('Test Equity pages', () => {
  test.each(stocks.S)(
    "Equity Ticker %s",
    async (s) => {
      //if (s <= 'CBU')
        //return;

      g.path = `/equity/${s}/`;

      await g.page.goto(host + g.path,
        { waitUntil: [ 'networkidle0'] });
    }
  );
});


function pickRandom(a) {
  return a[Math.floor(Math.random() * a.length)];
}

const maxTickers = 10;

describe('Test Portfolio pages', () => {
  const a = stocks.S;
  const randTickers = [];
  const testParams = [];
  // it's okay to have douplicates
  for (let i = 1; i < maxTickers; i++)
    randTickers.push(pickRandom(a))

  for (let i = 1; i < randTickers.length; i++) {
    const t = randTickers.slice(0, i).join(',')
    testParams.push(t)
  }
  test.each(testParams)(
    "Portfolio url %s",
    async (p) => {
      g.path = `/portfolio-tools?t=${p}`;

      await g.page.goto(host + g.path,
        { waitUntil: [ 'networkidle0'] });
    }
  );
});


describe('Test Fixed Income pages', () => {
  test.each(bonds.B)(
    "Fixed Income Ticker %s",
    async (s) => {
      g.path = `/fixed-income/${s}/`;

      await g.page.goto(host + g.path,
        { waitUntil: [ 'networkidle0'] });
    }
  );
});
