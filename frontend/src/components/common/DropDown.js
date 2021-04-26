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

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import useHover from './useHover';

import '../../css/DropDown.css';

const EMPTY_TEXT = 'Empty';
const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_ESCAPE = 27;
const KEY_RETURN = 13;
const KEY_ENTER = 14;


const propTypes = {
  inputRef: PropTypes.shape({current: PropTypes.instanceOf(HTMLElement)}),
  onChange: PropTypes.func,
  onClick: PropTypes.func,
  onEnter: PropTypes.func,
  visible: PropTypes.bool,
  setVisible: PropTypes.func,
  options: PropTypes.array,
  emptyText: PropTypes.string,
};

const defaultProps = {
  onChange: (value) => {},
  onClick: (value) => {},
  onEnter: (value) => {},
  visible: false,
  setVisible: (value) => {},
  options: [],
  emptyText: EMPTY_TEXT,
};


function DropDown(props) {

  const [domRef, mouseOver] = useHover();
  const [selection, setSelection] = useState(-1);

  const options = props.options;

  function onBlur(e) {
    if (!props.visible)
      return;

    if (!mouseOver)
      props.setVisible(false);
  }

  function onKeyDown(e) {
    let next;

    switch (e.keyCode) {
    case KEY_ESCAPE:
      e.preventDefault();
      props.setVisible(false);
      break;
    case KEY_ENTER:
    case KEY_RETURN:
      e.preventDefault();
      props.setVisible(false);
      props.onEnter(selection);
      break;
    case KEY_UP:
      e.preventDefault();
      next = selection < 0 ? 0 : selection;
      next = (options.length + next - 1) % options.length;
      break;
    case KEY_DOWN:
      e.preventDefault();
      next = (selection + 1) % options.length;
      break;
    default:
      setSelection(-1);
      break;
    }

    if (next != null) {
      setSelection(next);
      props.onChange(next)
    }
  }

  useEffect(
    () => {
      const node = props.inputRef.current;

      if (node) {
        node.addEventListener('keydown', onKeyDown);
        node.addEventListener('blur', onBlur);

        return () => {
          node.removeEventListener('keydown', onKeyDown);
          node.removeEventListener('blur', onBlur);
        };
      }
    },
  );

  if (!props.visible) {
      return null;
  }

  if (options.length < 1)
    return (
      <div className='DropDown'>
        <p>{props.emptyText}</p>
      </div>
    );

  const helperOptions = options.map((item, index) => {
    const ticker = item[0],
          name = item[1];
    return (
      <tr className={index === selection ? 'active' : null}
          key={index}
          onClick={() => { props.onClick(index); }}
          onMouseEnter={() => { setSelection(index); }}
          onMouseLeave={() => { setSelection(-1); }}>
        <td className='ticker'>{ticker}</td>
        <td className='name'>{name}</td>
      </tr>
    );
  });

  return (
    <div className='DropDown' ref={domRef}>
      <table>
        <tbody>
        {helperOptions}
        </tbody>
      </table>
    </div>
  );
}


DropDown.propTypes = propTypes;
DropDown.defaultProps = defaultProps;

export default DropDown;
