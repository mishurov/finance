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

import { useState } from 'react';
import { useLocation } from "wouter";
import ReactGA from 'react-ga';

import TickerInputPane from '../components/common/TickerInputPane';
import Overview from '../components/Equity/Overview';
import CashFlows from '../components/Equity/CashFlows';
import Ratios from '../components/Equity/Ratios';
import Options from '../components/Equity/Options';
import Technicals from '../components/Equity/Technicals';

import { MENU_EQUITY } from './menu';

import { EMPTY, formatDateStr } from '../components/common/utils';

import FailureOverlay from '../components/common/FailureOverlay';
import { useFetch, fetchStates } from '../fetching/useFetch';
import { fetchEquity } from '../fetching/api';

import '../css/Equity.css';

const WINDOW_TITLE = 'Equity';
const TEXT_SELECT = "Select a ticker ↑ to load firm's financials"

const resource = fetchEquity();


const headerKeys = ['ticker', 'name', 'exchange', 'sector', 'industry'];
const headerInit = {};
for (const k of headerKeys)
  headerInit[k] = EMPTY;


function Equity(props) {

  const [, setLocation] = useLocation();

  const { ticker } = props.params;

  const [header, setHeader] = useState(headerInit);
  const [items, setItems] = useState(null);
  const [notes, setNotes] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [texts, setTexts] = useState({});

  const overviewFetching = useFetch(async function() {
    ReactGA.pageview(window.location.pathname);

    setHeader(headerInit);
    setItems(null);
    setNotes(null);

    if (ticker) {
      document.title = WINDOW_TITLE + ' - ' + ticker;
      const o = await resource.overview(ticker);
      if (o.updatedAt)
        setUpdatedAt(o.updatedAt)
      if (o.header)
        setHeader(o.header);
      if (o.items)
        setItems(o.items);
      if (o.notes)
        setNotes(o.notes);
    } else {
      document.title = WINDOW_TITLE;
    }
  }, [ticker]);

  const textsFetching = useFetch(async function() {
    setTexts(await resource.texts());
  }, []);

  function tickerOnSelect(value) {
    setLocation(MENU_EQUITY[0] + '/' + value);
  }

  return (
    <div className='Equity'>
      <TickerInputPane onSelect={tickerOnSelect}/>
      <div className='Security-title'>
        {props.params.ticker ? (
          <>
            <span className='Equity-ticker'>
              {props.params.ticker}
            </span>
            <span className={overviewFetching + ' Equity-exchange'}>
             {header.exchange}
            </span>
            <span className={overviewFetching + ' Equity-name'}>
              {header.name}
            </span>
          </>
        ) : (
          <span className='Item-empty'>{TEXT_SELECT}</span>
        )}
      </div>

      {notes && (<p className='firmNotes'>
        <span className='firmWarn'>Warning! </span>
        {notes}
      </p>)}

      <Overview fetching={overviewFetching} header={header} items={items} />
      <p className='updatedAt'>
        <span className='updatedAtLabel'>Last update: </span>
        {formatDateStr(updatedAt)}
      </p>
      <CashFlows ticker={ticker} />
      <Ratios ticker={ticker} />
      <Options ticker={ticker} />
      <Technicals ticker={ticker}/>

      <div className={textsFetching + ' FooterText'}>
        {textsFetching === fetchStates.FAILURE && <FailureOverlay/>}
        <h6 className='notes'>Notes</h6>
        {texts && <p className='notes'
          dangerouslySetInnerHTML={{ __html: texts.notes }}/>}
      </div>
    </div>
  );
}


export default Equity;
