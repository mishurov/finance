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

#!/bin/sh

set -e

echo 'CERTBOT OLOLOLO'

exit 0

PATH='/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'

EMAIL='alexander@mishurov.co.uk'
DOMAIN='api.finance.mishurov.co.uk'
BALANCER_ID=$(cat /var/run/secrets/balancer.txt)
CERT_NAME='finance_'$(date +'%y-%m-%d_%H-%M')

echo $BALANCER_ID
certbot certonly -n \
  --agree-tos \
  --force-renewal \
  --email $EMAIL \
  --standalone \
  -d $DOMAIN

sleep 5

cd /etc/letsencrypt/live/$DOMAIN/

oci --config-file /var/run/secrets/config \
  lb certificate create \
  --load-balancer-id $BALANCER_ID \
  --certificate-name $CERT_NAME \
  --public-certificate-file ./fullchain.pem \
  --private-key-file ./privkey.pem

sleep 30

oci --config-file /var/run/secrets/config \
  lb listener update --force \
  --load-balancer-id $BALANCER_ID \
  --ssl-certificate-name $CERT_NAME \
  --listener-name balancer_listener-443 \
  --default-backend-set-name balancer_backend_set \
  --port 443 --protocol HTTP
