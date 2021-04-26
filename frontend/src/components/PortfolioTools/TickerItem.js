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

import PropTypes from 'prop-types';

import '../../css/TickerItem.css';
import crossCircle from '../../images/crossCircle.svg';

const propTypes = {
  ticker: PropTypes.string,
  index: PropTypes.number,
  percentage: PropTypes.number,
  onClose: PropTypes.func,
  missing: PropTypes.bool,
};

const defaultProps = {
  ticker: '',
  index: -1,
  percentage: 0,
  onClose: (index) => {},
  missing: false
};


function TickerItem(props) {
  return (
    <span className={'TickerItem' + (props.missing ? ' missing' : '')}>
      <span className='TickerItem-Label'>
        {props.ticker}
      </span>
      <button
        onClick={() => { props.onClose(props.index); }}
        className='TickerItem-Close'>
        <img src={crossCircle} alt='close' />
      </button>
    </span>
  );
}


TickerItem.propTypes = propTypes;
TickerItem.defaultProps = defaultProps;

export default TickerItem;
