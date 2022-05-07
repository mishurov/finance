# /**************************************************************************
#
#  This file is part of the Mishurov Finance website
#
#  Copyright (C) 2022 Alexander Mishurov
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

import xml.etree.ElementTree as ET
from .base import JsonGetTextView


class TextsView(JsonGetTextView):
    page = 'H'
    keys = ['description', 'links']

    def get_data(self, *args, **kwargs):
        """Parses links from the text field, text example:
        <a href='/equity/IBM'>IBM Equity</a>
        <a href='/fixed-income/XS0316524130'>Gaz Capital Bond</a>
        """
        ret = super().get_data(*args, **kwargs)

        links = ret.get('links')
        ret['links'] = []
        if links is None:
            return ret
        for a in ET.fromstring(f'<r>{links}</r>'):
            ret['links'].append({
                'href': a.get('href'),
                'text': a.text,
            })
        return ret
