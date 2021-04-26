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

"""To reuse in the crawler project for the second database
"""

from django.contrib import admin
from django.db.models import Model
from . import base
from ..models import concrete, abstract


# Dynamically register the admin classes for the financial models
for abs_name, abs_cls in abstract.__dict__.items():
    is_model = isinstance(abs_cls, type) and issubclass(abs_cls, Model)
    if not is_model or abs_name in ['FinancialStatement']:
        continue
    name = abs_name.replace('Abstract', '')
    cls = getattr(concrete, name)
    admin.site.register(cls, getattr(base, name + 'Admin'))
