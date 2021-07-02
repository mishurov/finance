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
ARG username=certifier
ARG home=/home/certifier
ARG certbot=1.16.0
ARG ocicli=2.26.0

FROM python:3.9-slim-buster as base

FROM base as dev
ARG uid
ARG username
ARG home
ARG certbot
ARG ocicli

RUN apt update && \
    apt -y install cron && \
    groupadd -g ${uid} ${username} && \
    useradd -r -u ${uid} -d ${home} \
    -g ${username} ${username} && \
    mkdir -p /etc/letsencrypt \
             /var/log/letsencrypt \
             /var/lib/letsencrypt && \
    chown -R ${username}:${username} \
        /etc/letsencrypt \
        /var/log/letsencrypt \
        /var/lib/letsencrypt && \
    chmod gu+rw /var/run && \
    chmod gu+s /usr/sbin/cron && \
    touch /var/log/cron.log && \
    chown -R ${username}:${username} \
        /var/log/cron.log && \
    pip install certbot==${certbot} && \
    pip install oci-cli==${ocicli}

WORKDIR ${home}
USER ${username}

FROM dev as prod
ARG username
ARG home

COPY ./renew.sh ./crontab ${home}/

WORKDIR ${home}
USER ${username}
