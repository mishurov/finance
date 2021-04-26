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

import { Link, useLocation } from "wouter";
import '../../css/Header.css';
import logo from '../../images/logoCircle.svg';
import { MENU_ITEMS } from '../../pages/menu';


function Header() {
  const [location] = useLocation();

  if (location === '/')
    return null;

  return (
  <header className="Header">
    <Link href="/">
      <a href="/">
        <img src={logo} alt="logo" />
      </a>
    </Link>
    {MENU_ITEMS.map((item, idx) =>
      <Link href={item[0]} key={idx}>
          <a href={item[0]}
            className={location.match(new RegExp(item[0] + '/?$')) ? 'active': ''}>
            {item[1]}
          </a>
      </Link>
    )}
  </header>
  );
}

export default Header;
