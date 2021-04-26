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

import re

con_re = re.compile(r'[a-z]+_([a-z]+) = (.*)')
vars_re = re.compile(r'\(([a-z_]+)=([\w\-\.]+)\)')

EASY_CONNECT_TPL = (
    '{protocol}://{host}:{port}/{service_name}?'
    'wallet_location={wallet_location}'
    '&retry_count={retry_count}&retry_delay={retry_delay}'
)


def tns_to_easyconn(wallet_location):
    conn_strings = {}
    lines = []
    with open(wallet_location + '/tnsnames.ora', 'r') as f:
        lines = f.readlines()

    for line in lines:
        if not line.strip():
            continue
        m = con_re.match(line)
        key = m.group(1)
        desc = m.group(2)
        params = vars_re.findall(desc)
        params = {k: v for k, v in params}
        params['wallet_location'] = wallet_location
        conn_strings[key] = EASY_CONNECT_TPL.format(**params)

    return conn_strings
