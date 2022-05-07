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

#!/bin/sh

set -e

SUBNET=10.1.21.0/24
MASTER_IP=10.1.21.135

open_http() {
  port=$1
  sudo iptables -I INPUT 6 -i ens3 -p tcp -s $SUBNET --dport $port \
    -m conntrack --ctstate NEW,ESTABLISHED -j ACCEPT
}

sudo apt update
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

echo \
  "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

sudo usermod -aG docker $USER

sudo curl -L \
  "https://github.com/docker/compose/releases/download/1.29.0/docker-compose-$(uname -s)-$(uname -m)" -o \
    /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

echo '{"insecure-registries":["registry.local:32000"]}' \
  | sudo tee /etc/docker/daemon.json
echo "$MASTER_IP registry.local" | sudo tee -a /etc/hosts

sudo service docker restart

open_http 30080
sudo netfilter-persistent save
