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

ARG uid=1001
ARG username=django
ARG appdir=/app

FROM python:3.9-slim-buster as base


FROM base as build

COPY ./requirements/precompile.txt /

RUN apt-get update && \
    apt-get install -y \
        zlib1g-dev \
        libpq-dev \
        gcc && \
    pip install -r precompile.txt


FROM base as dev

ARG uid
ARG username
ARG appdir

COPY ./requirements/*.txt ${appdir}/
COPY --from=build /root/.cache /root/.cache

RUN groupadd -g ${uid} ${username} && \
    useradd -r -u ${uid} -d ${appdir} \
    -g ${username} ${username} && \
    mkdir /var/run/supervisor /var/log/django && \
    chown ${username}:${username} /var/run/supervisor && \
    chown ${username}:${username} /var/log/django && \
    apt-get update && \
    apt-get install -y \
        libaio1 \
        libpq5 \
        postgresql-client

WORKDIR ${appdir}
RUN pip install -r ./precompile.txt && \
    pip install -r ./all.txt && \
    rm ./precompile.txt ./all.txt


FROM dev as prod
ARG username
ARG appdir

COPY ./finance /app

WORKDIR ${appdir}
USER ${username}
CMD gunicorn -c /etc/configs/gunicorn.conf.py
