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

remote() {
  ip=$1
  cmd=$2
  ssh ubuntu@$ip $cmd
}

replace_var() {
  var=$1
  val=$2
  path=$3
  sed -i -e "s/${var}=.*$/${var}=${val}/" $path
}

idx=0
cat ./output.json | jq -r '.computes_public_ips.value[]' | while read pub; do
  priv=$(cat ./output.json | jq -r ".computes_private_ips.value[$idx]")
  subnet=$(echo $priv | sed -e 's/\.[0-9]*$/.0/g')
  replace_var SUBNET "$subnet\/24" ./partials/setup_docker.sh
  replace_var SUBNET "$subnet\/24" ./partials/swarm_ports.sh
  replace_var SUBNET "$subnet\/24" ./partials/master_registry.sh

  if [ "$idx" -eq '0' ]; then
    replace_var MASTER_IP $priv ./partials/master_swarm.sh
  fi;

  remote $pub 'bash -s' < ./partials/setup_docker.sh
  remote $pub 'bash -s' < ./partials/swarm_ports.sh


  if [ "$idx" -eq '0' ]; then
    echo this is master
    remote $pub 'bash -s' < ./partials/master_registry.sh
    remote $pub 'bash -s' < ./partials/master_swarm.sh
  else
    echo this is slave
    # Manually:
    # docker swarm join \
    #  --token <token from master output> \
    #  <addr from master output>
  fi;

  cd ../../backend/oracle/
  tar -c ./client | ssh ubuntu@${pub} 'tar -x'
  cd -
  remote $pub 'bash -s' < ./partials/create_volume.sh

  idx=$((idx+1))
done
