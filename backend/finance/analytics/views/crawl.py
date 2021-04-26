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

import gzip
import json
from datetime import datetime
from django.http import JsonResponse, HttpResponseBadRequest
from django.views import View
from django.utils.encoding import force_str
from django.contrib.auth.mixins import LoginRequiredMixin
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.core.serializers.json import DjangoJSONEncoder
from django.views.decorators.cache import never_cache
from ..tasks import load_crawled
from ..object_storage import save_json


CRAWL_OCI_BUCKET = 'crawled'

TIME_FORMAT = '%Y-%m-%d_%H-%M-%S_%f'


@method_decorator([never_cache, csrf_exempt], name='dispatch')
class CrawlView(LoginRequiredMixin, View):
    raise_exception = True
    http_method_names = ['post']
    json_encoder_class = DjangoJSONEncoder

    def dispatch(self, request, *args, **kwargs):
        return super(CrawlView, self).dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        schema = kwargs.get('schema')
        if schema is None:
            return HttpResponseBadRequest('No schema')

        enc = request.headers.get('Content-Encoding')
        data = gzip.decompress(request.body) if enc == 'gzip' else request.body
        request_json = json.loads(force_str(data))

        now = datetime.utcnow()
        obj_name = f'{schema}_{now.strftime(TIME_FORMAT)}.json'
        save_json(CRAWL_OCI_BUCKET, obj_name, request_json)

        load_crawled.delay(schema)
        return JsonResponse({'status': 'OK'})
