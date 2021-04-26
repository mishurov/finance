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

export const EMPTY = '---';
export const NA = 'n/a';


export function initItemsDict(numRows) {
  const itemsInit = {};
  const itemsKeys = [...Array(numRows)].map((u, i) => String.fromCharCode(i + 97));
  for (const k of itemsKeys)
    itemsInit[k] = EMPTY;
  return itemsInit;
}


export function chunk(a, size) {
  if (size <= 0)
    return;
  let ret = [];
  for (let i = 0; i < a.length; i += size)
    ret.push(a.slice(i, i + size));
  return ret;
}


export function getLast(a) {
  const ret = {value: '', date: ''}
  if (a && a.length) {
    const last = a[a.length - 1];
    ret.value = formatCount(last.value)
    ret.date = new Date(last.date).toLocaleDateString('en-UK');
  }
  return ret;
}

export function toPercent(x) {
  return !isNaN(x) ? (x * 100).toFixed(2) + '%' : NA
}


export function formatCount(n){
  if (isNaN(n))
    return NA;
  let val = Math.abs(n), i = 0,
    suffix = ["", "K", "M", "B"];
  while(val >= 1000) {
    val = val/1000;
    i++;
  }
  val = n > 0 ? val : -val
  return val.toFixed(3) + suffix[i];
}


export function formatDateStr(d) {
  return d ? new Date(d).toLocaleDateString('en-UK') : NA
}


