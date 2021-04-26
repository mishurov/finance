# /**************************************************************************
#
#  This file is part of the Mishurov Finance website
#
#  Copyright (C) 2021 Alexander Mishurov
#
#  GNU General Public License Usage
#  This file may be used under the terms of the GNU
#  General Public License version 3. The licenses are as published by
#  the Free Software Foundation and appearing in the file LICENSE.GPL3
#  included in the packaging of this file. Please review the following
#  information to ensure the GNU General Public License requirements will
#  be met: https://www.gnu.org/licenses/gpl-3.0.html.
#
# **************************************************************************/

from .base import DailyPricesView, JsonGetTextView


TICKERS_PARAM = 't'


class DailyView(DailyPricesView):
    def get_data(self, *args, **kwargs):
        tickers = kwargs.get(TICKERS_PARAM)
        ret = {'daily': []}
        if tickers is None or not len(tickers):
            return ret
        tickers = tickers[0].split(',')
        ret['daily'] = self.get_prices(tickers, True)
        return ret


class TextsView(JsonGetTextView):
    page = 'P'
    keys = ['notes']
