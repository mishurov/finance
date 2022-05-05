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

# heroku login
# heroku container:login
docker build --target=heroku --tag=registry.heroku.com/finance-mishurov/web ../../backend/
# docker run --rm --publish=8000:8000 --env-file=./test.env --name=finance registry.heroku.com/finance-mishurov/web sleep 1d
# docker exec -it finance bash
# export DEBUG=true
# python manage.py runserver 0:8000
docker push registry.heroku.com/finance-mishurov/web
heroku container:release web -a finance-mishurov
# heroku ps:scale web=1 -a finance-mishurov
# heroku ps:scale worker=0 -a finance-mishurov
# heroku logs -t -a finance-mishurov
