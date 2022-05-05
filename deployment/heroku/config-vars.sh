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

# heroku login

BASE64='base64 -w 0'
SECRETS='../../backend/secrets'
APP='finance-mishurov'
TEST_ENV_FILE='./test.env'

CREDENTIALS=$($BASE64 $SECRETS/credentials.json)
WALLET=$($BASE64 $SECRETS/cwallet.sso)
TNSNAMES=$($BASE64 $SECRETS/tnsnames.ora)

#echo "CREDENTIALS=\"$CREDENTIALS\"
#WALLET=\"$WALLET\"
#TNSNAMES=\"$TNSNAMES\"" > $TEST_ENV_FILE

heroku config:set "CREDENTIALS=$CREDENTIALS" -a $APP
heroku config:set "WALLET=$WALLET" -a $APP
heroku config:set "TNSNAMES=$TNSNAMES" -a $APP
