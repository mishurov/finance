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

import { useState, useEffect, useCallback } from 'react';

import { aborters } from './api'

export const fetchStates = {
  INITIAL: 'fetchIntial',
  LOADING: 'fetchLoading',
  SUCCESS: 'fetchSuccess',
  FAILURE: 'fetchFailure',
};


export function useFetch(callback, depenencies) {
  const [ loadState, setLoadState ] = useState(fetchStates.INITIAL);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedCallback = useCallback(callback, depenencies);

  useEffect(() => {
    setLoadState(fetchStates.LOADING);

    async function fetchData() {
      try {
        await memoizedCallback();
        setLoadState(fetchStates.SUCCESS);
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error(e);
          setLoadState(fetchStates.FAILURE);
        }
      }
    }

    const controllers = [];
    fetchData();
    while(aborters.length > 0)
      controllers.push(aborters.pop());

    return () => {
      for (const c of controllers)
        c.abort();
    }

  }, [memoizedCallback, setLoadState]);

  return loadState;
}

