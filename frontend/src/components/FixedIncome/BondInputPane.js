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

import { useState, useRef } from 'react';
import PropTypes from 'prop-types';

import DropDown from '../common/DropDown';

import { useFetch, fetchStates } from '../../fetching/useFetch';
import { fetchSecurities } from '../../fetching/api';

import '../../css/InputPane.css';
import arrowDown from '../../images/arrowDown.svg';


const resource = fetchSecurities();

const LABEL = 'Bond';
const PLACEHOLDER = 'Select ...';

const NOT_FOUND_TEXT = 'No bonds found'
const LOADING_TEXT = 'Loading bonds...'
const ERROR_TEXT = 'Failed to load bonds'

const propTypes = {
  label: PropTypes.string,
  iconPath: PropTypes.string,
  onSelect: PropTypes.func,
};

const defaultProps = {
  label: LABEL,
  iconPath: arrowDown,
  onSelect: (value) => {},
};


function BondInputPane(props) {
  const inputRef = useRef(null);
  const [dropDownVisible, setDropDownVisibile] = useState(false);
  const [options, setOptions] = useState([]);
  const [value, setValue] = useState('');

  const bondsFetching = useFetch(async function() {
    const data = await resource.bonds();
    setOptions(data.bonds);
  }, []);

  function onDropDownConfirm(index, confirmed) {
    const v = options[index][1];
    setValue(v);
    setDropDownVisibile(false);
    props.onSelect(v);
  }

  let emptyText = NOT_FOUND_TEXT;
  if (bondsFetching === fetchStates.LOADING)
      emptyText = LOADING_TEXT;
  else if (bondsFetching === fetchStates.FAILURE)
      emptyText = ERROR_TEXT;

  return (
    <div className='InputPane'>
      <span className='InputPane-Label'>
        {props.label}
      </span>
      <span className='InputPane-Input'>
        <button className={ (props.index < 0 ? 'placeholder' : '') + ' InputPane-Bond'}
          onClick={() => { setDropDownVisibile(!dropDownVisible); }}
          ref={inputRef}
        >
          {value ? value : PLACEHOLDER}
          <img src={props.iconPath} alt='arrowdown' />
        </button>
        <DropDown
          onClick={onDropDownConfirm}
          onEnter={onDropDownConfirm}
          inputRef={inputRef}
          visible={dropDownVisible}
          setVisible={setDropDownVisibile}
          options={options}
          emptyText={emptyText}
        />
      </span>
    </div>
  );
}


BondInputPane.propTypes = propTypes;
BondInputPane.defaultProps = defaultProps;

export default BondInputPane;
