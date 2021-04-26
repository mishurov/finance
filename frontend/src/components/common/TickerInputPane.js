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
import PropTypes from 'prop-types';

import DropDown from './DropDown';

import { useFetch, fetchStates } from '../../fetching/useFetch';
import { fetchSecurities } from '../../fetching/api';

import '../../css/InputPane.css';
import magnifier from '../../images/magnifier.svg';
import cross from '../../images/cross.svg';

const resource = fetchSecurities();

const LABEL = 'Ticker'
const PLACEHOLDER = 'Search'

const NOT_FOUND_TEXT = 'No matching stocks found'
const LOADING_TEXT = 'Loading stocks...'
const ERROR_TEXT = 'Failed to load data'

const propTypes = {
  label: PropTypes.string,
  iconPath: PropTypes.string,
  onSelect: PropTypes.func,
};

const defaultProps = {
  label: LABEL,
  iconPath: magnifier,
  onSelect: (value) => {},
};


function TickerInputPane(props) {

  const inputRef = useRef(null);
  const [dropDownVisible, setDropDownVisibile] = useState(false);
  const [options, setOptions] = useState([]);
  const [value, setValue] = useState('');
  const [query, setQuery] = useState('');

  const stockFetching = useFetch(async function() {
    const data = query.length ? await resource.stocks(query) : [];
    setOptions(data.stocks);
  }, [query]);

  function onIconClick(e) {
    if (value.length < 1)
      return;
    props.onSelect(value);
    e.preventDefault();
  }

  function onCrossClick(e) {
    setValue('');
    setDropDownVisibile(false);
    e.preventDefault();
  }

  function onFocus(e) {
    e.target.select();
    setDropDownVisibile(!!value.length);
    e.preventDefault();
  }

  function onChange(e) {
    const v = e.target.value.toUpperCase();
    setValue(v);
    setQuery(v);
    setDropDownVisibile(!!v.length);
  }

  function onDropDownChange(index) {
    const selectedValue = options[index][0];
    setValue(selectedValue);
  }

  function onDropDownEnter(index) {
    const item = options[index];
    const v = item ? item : value;
    setDropDownVisibile(false);
    props.onSelect(v);
  }

  function onDropDownClick(index) {
    const selectedValue = options[index][0];
    setValue(selectedValue);
    setDropDownVisibile(false);
    props.onSelect(selectedValue);
  }

  let emptyText = NOT_FOUND_TEXT;
  if (stockFetching === fetchStates.LOADING)
      emptyText = LOADING_TEXT;
  else if (stockFetching === fetchStates.FAILURE)
      emptyText = ERROR_TEXT;

  return (
    <div className='InputPane'>
      <span className='InputPane-Label InputPane-TickerLabel'>
        {props.label}
      </span>
      <span className='InputPane-Input'>
        <input type='text'
          ref={inputRef}
          placeholder={PLACEHOLDER}
          onChange={onChange}
          onFocus={onFocus}
          value={value}/>
          <DropDown
            onChange={onDropDownChange}
            onClick={onDropDownClick}
            onEnter={onDropDownEnter}
            inputRef={inputRef}
            visible={dropDownVisible}
            setVisible={setDropDownVisibile}
            options={options}
            emptyText={emptyText}
          />
      </span>
      {value && <button
        onClick={onCrossClick}
        className='InputPane-Cross'>
        <img src={cross} alt='cross' />
      </button>}
      <button
        onClick={onIconClick}
        className='InputPane-Search'>
        <img src={props.iconPath} alt='magnifier' />
      </button>
    </div>
  );
}


TickerInputPane.propTypes = propTypes;
TickerInputPane.defaultProps = defaultProps;

export default TickerInputPane;
