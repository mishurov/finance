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

# terraform -chdir=../terraform output -json > ../scripts/output.json

CLIENT_PATH=~/Downloads/client
WALLET_PATH=$CLIENT_PATH/network/admin
SQL_PLUS=$CLIENT_PATH/sqlplus

export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$CLIENT_PATH


DB_USER='django'

idx=0
cat ./output.json | jq -r '.database_names.value[]' | while read db_name; do
    unzip -o wallet${IDX}.zip -d ${WALLET_PATH}/

    db_pass=$(echo $JSON | jq -r ".database_passwords.value[$IDX]")
    django_pass=$(echo $JSON | jq -r ".django_passwords.value[$IDX]")
    ${SQL_PLUS} ADMIN/"${db_pass}"@${db_name}_tp <<EOF
CREATE USER $DB_USER IDENTIFIED BY "${django_pass}";
GRANT CONNECT, RESOURCE, TABLESPACE TO $DB_USER;
GRANT UNLIMITED TABLESPACE TO $DB_USER;
EOF
    idx=$((idx+1))
done
