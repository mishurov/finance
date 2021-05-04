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

# terraform -chdir=../terraform output -json > ../scripts/output.json

# docker system prune -a

MASTER_IP=$(cat ./output.json | jq -r ".computes_public_ips.value[0]")
SLAVE_IP=$(cat ./output.json | jq -r ".computes_public_ips.value[1]")

APP_IMAGE=registry.local:32000/finance_app:1.1
CERT_IMAGE=registry.local:32000/finance_certbot:1.0


ssh -fnNL ./master.sock:/var/run/docker.sock ubuntu@${MASTER_IP}
export DOCKER_HOST=unix://$(pwd)/master.sock

cd ../swarm/

update_image() {
  image=$1
  docker-compose -f app-stack.yml build
  docker push $image
  if [ "$image" != "$CERT_IMAGE" ]; then
    # TODO: most likely it is not needed at all
    ssh ubuntu@${SLAVE_IP} "docker pull $image"
  fi;
}

update_app_image_service() {
  update_image $APP_IMAGE
  docker service update --image $APP_IMAGE app_stack_app
}

update_cert_image_service() {
  update_image $CERT_IMAGE
  docker service update --image $CERT_IMAGE app_stack_certbot
}

rotate_django_conf() {
  prev=$(docker config ls | grep 'app_stack_django' | awk '{print $2}')
  conf=app_stack_django_$(date +'%y-%m-%d_%H-%M')
  docker config create ${conf} ../../backend/configs/django.json
  docker service update \
    --config-rm ${prev} \
    --config-add source=${conf},target=/etc/django.json \
    app_stack_app
  docker config rm ${prev}
}

rotate_nginx_conf() {
  prev=$(docker config ls | grep 'app_stack_nginx' | awk '{print $2}')
  conf=app_stack_nginx_$(date +'%y-%m-%d_%H-%M')
  docker config create ${conf} ../configs/nginx.conf.template
  docker service update \
    --config-rm ${prev} \
    --config-add source=${conf},target=/etc/nginx/templates/default.conf.template \
    app_stack_nginx
  docker config rm ${prev}
}

rotate_app_credentials() {
  prev=$(docker secret ls | grep 'app_stack_credentials' | awk '{print $2}')
  secret=app_stack_credentials_$(date +'%y-%m-%d_%H-%M').json
  docker secret create ${secret} ../../backend/configs/credentials.json
  docker service update \
    --secret-rm ${prev} \
    --secret-add source=${secret},target=/var/run/secrets/credentials.json \
    app_stack_app
  docker secret rm ${prev}
}

rolling_restart() {
  docker service update --force \
    --update-parallelism 1 \
    --update-delay 30s app_stack_app
}

initial_deploy() {
  docker stack deploy -c ./registry-stack.yml registry_stack
  docker-compose -f app-stack.yml build
  sleep 10
  docker push $APP_IMAGE
  docker push $CERT_IMAGE
  docker stack deploy -c ./app-stack.yml app_stack
}


#initial_deploy
#update_app_image_service
update_cert_image_service
#rotate_django_conf
#rotate_app_credentials
#rotate_nginx_conf

pid=$(ps -x -o pid,cmd | grep '[s]sh -fnNL' | awk '{print $1}')
kill -QUIT $pid
wait
cd -
rm ./master.sock
