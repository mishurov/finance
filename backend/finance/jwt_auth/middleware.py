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

from jwt.exceptions import ExpiredSignatureError, DecodeError
from django import http
from django.contrib.auth import get_user_model
from django.utils.encoding import force_str
from django.utils.deprecation import MiddlewareMixin

from .utils import (get_authorization_header, jwt_decode,
                    jwt_get_user_id_from_payload)

User = get_user_model()


class JwtMiddleware(MiddlewareMixin):
    def process_request(self, request):
        auth = get_authorization_header(request).split()

        if not auth or force_str(auth[0].lower()) != 'bearer':
            return None

        msg = None
        if len(auth) == 1:
            msg = 'Invalid Authorization header. No credentials provided.'
        elif len(auth) > 2:
            msg = ('Invalid Authorization header. Credentials string '
                   'should not contain spaces.')
        if msg:
            return http.HttpResponseBadRequest(msg)

        try:
            payload = jwt_decode(auth[1])
        except ExpiredSignatureError:
            msg = 'Signature has expired.'
        except DecodeError:
            msg = 'Error decoding signature.'
        if msg:
            return http.HttpResponseBadRequest(msg)

        user = None
        try:
            user_id = jwt_get_user_id_from_payload(payload)

            if user_id:
                user = User.objects.get(pk=user_id, is_active=True)
            else:
                msg = 'Invalid payload'
        except User.DoesNotExist:
            msg = 'Invalid signature'
        if msg:
            return http.HttpResponseBadRequest(msg)

        if user:
            request.user = user
