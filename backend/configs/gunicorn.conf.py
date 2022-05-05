import os
import multiprocessing
from uvicorn.workers import UvicornWorker

# gunicorn finance.asgi:application \
#  -k uvicorn.workers.UvicornWorker \
#  -b 0.0.0.0:8000 \
#  -w 3


class DjangoWorker(UvicornWorker):
    CONFIG_KWARGS = {'lifespan': 'off'}


wsgi_app = 'finance.asgi:application'
worker_class = '__config__.DjangoWorker'
bind = '0.0.0.0:' + os.environ.get('PORT', '8000')
#workers = multiprocessing.cpu_count() * 2 + 1
workers = 3
