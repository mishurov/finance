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

export function prepDaily(daily) {
    const ret = daily.filter(x => x && x.ticker && x.series.length > 2);
    const minLen = Math.min(...ret.map(x => x.series.length));
    return ret.map(x => {
      x.series = x.series.slice(0, minLen);
      return x;
    });
}

export function mapMissing(tickers, daily) {
    const recieved = daily.map(x => x.ticker);
    return tickers.filter(x => !recieved.includes(x));
}
