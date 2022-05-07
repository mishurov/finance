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

open_port() {
  proto=$1
  port=$2
  sudo iptables -I INPUT 6 -i ens3 -p $proto -s $SUBNET --dport $port -j ACCEPT
}

open_port tcp 2377
open_port tcp 7946
open_port udp 7946
open_port udp 4789
sudo netfilter-persistent save
