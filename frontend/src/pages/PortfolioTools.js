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

import { useState, useRef } from 'react';
import { useLocation } from "wouter";
import ReactGA from 'react-ga';

import TickerInputPane from '../components/common/TickerInputPane';
import TickerItem from '../components/PortfolioTools/TickerItem';

import FrontierPlot from '../components/PortfolioTools/FrontierPlot';
import { Portfolios, Assets } from '../components/PortfolioTools/FrontierBlocks';
import FailureOverlay from '../components/common/FailureOverlay';

import MarkowitzModel from '../processing/MarkowitzModel'
import { prepDaily, mapMissing } from '../processing/portfolio'
import { useFetch, fetchStates } from '../fetching/useFetch';
import { fetchPortfolio } from '../fetching/api';

import { MENU_PORTFOLIO_TOOLS, PARAM_TICKERS } from './menu';

import '../css/PortfolioTools.css';
import magnifierPlus from '../images/magnifierPlus.svg';

const WINDOW_TITLE = 'Portfolio Tools';

const TEXT_ADD = 'Add tickers ↑ to construct the portfolio';

const resource = fetchPortfolio();



function PortfolioTools(props) {

  const [, setLocation] = useLocation();

  const [tickers, setTickers] = useState(tickersFromLocation());
  const [missing, setMissing] = useState([]);
  const [texts, setTexts] = useState({});

  const [frontierData, setFrontierData] = useState({optimal: {}});
  const [portfolio, setPortfolio] = useState({});
  const [colors, setColors] = useState({});
  const [portColor, setPortColor] = useState('');

  const textsFetching = useFetch(async function() {
    const data = await resource.texts();
    setTexts(data);
  }, []);

  const markRef = useRef(new MarkowitzModel());

  const pricesFetching = useFetch(async function() {
    ReactGA.pageview(window.location.pathname + window.location.search);

    let data = { daily: [] }
    if (tickers.length) {
      document.title = WINDOW_TITLE + ' - ' + tickers
        .join(', ').substring(0, 25) + '...';
      data = await resource.daily(tickers);
    } else {
      document.title = WINDOW_TITLE;
    }

    data.daily = prepDaily(data.daily);
    setMissing(mapMissing(tickers, data.daily));

    let computed = {}
    try {
      computed = markRef.current.compute(data.daily);
    } catch (e) {
      computed = {'msg': e.message}
    }

    setFrontierData(computed);
    setPortfolio({});
  }, [tickers]);

  function onDragEnd(r) {
    const p = markRef.current.computePortfolio(r);
    setPortfolio(p);
  }

  function tickersFromLocation() {
    const params = new URLSearchParams(window.location.search);
    const t = params.get(PARAM_TICKERS);
    return t ? t.split(',') : [];
  }

  function setNewLocation() {
    let next = MENU_PORTFOLIO_TOOLS[0];
    if (tickers.length)
      next += '?' + PARAM_TICKERS + '=' + tickers.join(',');
    setLocation(next);
    setTickers(tickersFromLocation());
  }

  function securityOnSelect(value) {
    if (tickers.indexOf(value) > -1)
      return;
    tickers.push(value);
    setNewLocation(tickers);
  }

  function onItemClose(index) {
    tickers.splice(index, 1);
    setNewLocation(tickers);
  }

  return (
    <div className='PortfolioTools'>
      <div className='PortfolioTools-InputBar'>
      <TickerInputPane
        label='Add Equity'
        iconPath={magnifierPlus}
        onSelect={securityOnSelect}/>
      </div>
      <div className='PortfolioTools-ItemsBar'>
        {!tickers.length && <span className='Item-empty'>{TEXT_ADD}</span>}
        {tickers.map((t, i) =>
          <TickerItem
            key={t}
            index={i}
            ticker={t}
            missing={missing.includes(t)}
            percentage={15}
            onClose={onItemClose}
          />
        )}
      </div>
      <div className={pricesFetching + ' FrontierBlocks'}>
        <div className='FrontierPlotContainer'>
          {pricesFetching === fetchStates.FAILURE && <FailureOverlay/>}
          {frontierData.msg && <FailureOverlay text={frontierData.msg}/>}
          <h2>Efficient Frontier</h2>
          <FrontierPlot
            onDragEnd={onDragEnd}
            data={frontierData}
            portfolio={portfolio}
            width={600}
            height={400}
            setColors={setColors}
            setPortColor={setPortColor}
          />
        </div>
        <div className='FrontierFigures'>
          <Portfolios
            selected={portfolio}
            optimal={frontierData 
              && frontierData.assetsPts
              && frontierData.assetsPts.length > 1
              && frontierData.optimal}
            colors={colors}
            portColor={portColor}
          />
          <Assets
            pts={frontierData && frontierData.assetsPts}
            colors={colors}
          />
        </div>
      </div>
      <div className={textsFetching + ' FooterText'}>
        {textsFetching === fetchStates.FAILURE && <FailureOverlay/>}
        <h6 className='notes'>Notes</h6>
        {texts && <p className='notes'
          dangerouslySetInnerHTML={{ __html: texts.notes }}/>}
      </div>
    </div>
  );
}


export default PortfolioTools;
