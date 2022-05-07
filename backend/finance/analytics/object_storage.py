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

import time
import json
import xml.etree.ElementTree as ET
import httpx
from django.conf import settings
from .aws_signer import AwsSigner

ENDPOINT = 'https://{ns}.compat.objectstorage.{region}.oraclecloud.com'.format(
    ns=settings.OCI_STORAGE_NAMESPACE,
    region=settings.OCI_REGION,
)

signer = AwsSigner(
    settings.OCI_REGION,
    settings.OCI_CUSTOMER_ACCESS_KEY,
    settings.OCI_CUSTOMER_SECRET_KEY,
)

MAX_RETRIES = 3
RETRY_WAIT = 1


def request_retry(f):
    resp = None
    for i in range(0, MAX_RETRIES):
        try:
            r = f()
            r.raise_for_status()
        except Exception as e:
            if i < MAX_RETRIES - 1:
                time.sleep(RETRY_WAIT)
                continue
            else:
                raise(e)
        else:
            resp = r
            break
    if resp is None or resp.status_code not in [200, 204]:
        msg = 'OCI Object Storage Error: '
        msg += f'status: {r.status_code}' if r else 'response is None'
        raise ConnectionError(msg)
    return resp


def load_json(bucket, name):
    url = f'{ENDPOINT}/{bucket}/{name}'
    headers = signer.sign("GET", url)
    r = request_retry(lambda: httpx.get(url, headers=headers))
    return r.json()


def save_json(bucket, name, data):
    url = f'{ENDPOINT}/{bucket}/{name}'
    content = json.dumps(data).encode('utf-8')
    headers = {
        "Content-Type": "application/json",
        "Content-Length": str(len(content)),
    }
    headers.update(signer.sign("PUT", url, headers, content))
    request_retry(lambda: httpx.put(url, headers=headers, data=content))


def list_objects(bucket):
    url = f'{ENDPOINT}/{bucket}/'
    headers = signer.sign("GET", url)
    r = request_retry(lambda: httpx.get(url, headers=headers))
    root = ET.fromstring(r.text)
    xmlns = root.tag.replace('ListBucketResult', '')
    return [c.text for c in root.findall(f'./{xmlns}Contents/{xmlns}Key')]


def remove(bucket, name):
    url = f'{ENDPOINT}/{bucket}/{name}'
    headers = signer.sign("DELETE", url)
    request_retry(lambda: httpx.delete(url, headers=headers))


def exists(bucket, name):
    return name in list_objects(bucket)
