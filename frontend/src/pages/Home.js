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
import { Link } from "wouter";
import ReactGA from 'react-ga';

import FailureOverlay from '../components/common/FailureOverlay';
import { useFetch, fetchStates } from '../fetching/useFetch';
import { fetchHome } from '../fetching/api';

import { MENU_ITEMS } from './menu';

import logo from '../images/logoLigature.svg';
import github from '../images/GitHubMark.svg';
import '../css/Home.css';

const WINDOW_TITLE = 'Finance';

const resource = fetchHome();


function Home() {
  const [texts, setTexts] = useState(null);

  const textsFetching = useFetch(async function() {
    ReactGA.pageview(window.location.pathname);
    document.title = WINDOW_TITLE;
    const data = await resource.texts()
    if (data)
      setTexts(data);
  }, []);

  return (
  <div className="Home">
    <header className="Home-Header">
      <img src={logo} alt="logo" />
      <span>finance</span>
    </header>
    <div className="Home-Menu">
      {MENU_ITEMS.map((item, idx) =>
        <Link href={item[0]} key={idx}>
          <a href={item[0]} className="Home-Menu-Item">{item[1]}</a>
        </Link>
      )}
      <a href="https://github.com/mishurov/finance" className="Home-Menu-Item">
        <img src={github} alt="github" />
      </a>
    </div>
    <div className={textsFetching + ' Home-Description'}>
      {textsFetching === fetchStates.FAILURE && <FailureOverlay/>}
      {texts ? (<>
        <p className='description'
          dangerouslySetInnerHTML={{ __html: texts.description }} />
        <h6 className='examples'>Examples</h6>
        <ul>
          {texts.links.map((l, i) => 
            <li key={l.href}>
              <Link href={l.href}>
                <a href={l.href}>{l.text}</a>
              </Link>
            </li>
          )}
        </ul>
      </>) : <span className='loading'>'Loading...'</span>}
    </div>
  </div>
  );
}

export default Home;
