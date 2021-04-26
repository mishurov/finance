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

import { MENU_FIXED_INCOME } from './menu';
import BondInputPane from '../components/FixedIncome/BondInputPane';
import ConvexityPlot from '../components/FixedIncome/ConvexityPlot';
import PvPlot from '../components/FixedIncome/PvPlot';
import Derived from '../components/FixedIncome/Derived';
import Chunks from '../components/common/Chunks';

import FailureOverlay from '../components/common/FailureOverlay';
import { useFetch, fetchStates } from '../fetching/useFetch';
import { fetchFixed } from '../fetching/api';

import * as bond from '../processing/bond';

import { EMPTY } from '../components/common/utils';

import '../css/FixedIncome.css';

const TEXT_SELECT = 'Select a ticker ↑ to load bond data';
const WINDOW_TITLE = 'Fixed Income';
const resource = fetchFixed();


function FixedIncome(props) {

  const [, setLocation] = useLocation();
  const { ticker } = props.params;

  const [overview, setOverview] = useState({});
  const [derived, setDerived] = useState(null);
  const [texts, setTexts] = useState({});

  const overviewFetching = useFetch(async function() {
    ReactGA.pageview(window.location.pathname);

    setOverview({});
    setDerived(null);

    if (ticker) {
      document.title = WINDOW_TITLE + ' - ' + ticker;
      const data = await resource.overview(ticker);
      if (data) {
        setOverview(bond.overview(data));
        setDerived(bond.derived(data));
      }
    } else {
      document.title = WINDOW_TITLE;
    }
  }, [ticker]);

  const textsFetching = useFetch(async function() {
    setTexts(await resource.texts());
  }, []);

  function bondOnSelect(value) {
    setLocation(MENU_FIXED_INCOME[0] + '/' + value);
  }

  return (
    <div className='FixedIncome'>
      <BondInputPane
        onSelect={bondOnSelect}
       />
      <div className={overviewFetching + ' FixedIncome-Content'}>
        {overviewFetching === fetchStates.FAILURE && <FailureOverlay/>}
        <div className='Security-title'>
          {props.params.ticker ? (
            <>
              <span className='FixedIncome-name'>
                {overview.name || EMPTY}
              </span>
              <span className='FixedIncome-ticker'>
                {overview.ticker || EMPTY}
              </span>
            </>
          ) : (
            <span className='Item-empty'>{TEXT_SELECT}</span>
          )}
        </div>
        <Chunks
          className='FixedIncome-overview'
          numRows={4}
          items={overview.items}/>
        <div className='FixedIncome-plots'>
          <div>
            <h3>Convexity</h3>
            <ConvexityPlot width={330} height={300} data={derived} />
            <Derived derived={derived} />
          </div>
          <div>
            <h3>Present Value</h3>
            <PvPlot width={350} height={300} data={derived} />
          </div>
        </div>
      </div>
      <div className={textsFetching + ' FooterText'}>
        {textsFetching === fetchStates.FAILURE && <FailureOverlay/>}
        <h6 className='notes'>Notes</h6>
        {texts && <p className='notes'
          dangerouslySetInnerHTML={{ __html: texts.notes }} />}
      </div>
    </div>
  );
}

export default FixedIncome;
