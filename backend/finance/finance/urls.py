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

from django.conf import settings
from django.urls import include, path
from django.contrib import admin


urlpatterns = [
    path('api/', include('analytics.urls')),
]

if settings.USE_WEB_CRAWL:
    urlpatterns += [
        path('auth/', include('jwt_auth.urls')),
    ]

if settings.EXPOSE_ADMIN:
    urlpatterns += [
        path('admin/', admin.site.urls),
    ]
