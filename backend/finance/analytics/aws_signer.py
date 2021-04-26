# based on https://github.com/iksteen/aws-request-signer
import datetime
import hashlib
import hmac
from urllib.parse import parse_qsl, urlencode, urlsplit


class AwsSigner:
    algorithm = "AWS4-HMAC-SHA256"

    def __init__(self, region, access_key_id, secret_access_key, service='s3'):
        self.region = region
        self.access_key_id = access_key_id
        self.secret_access_key = secret_access_key
        self.service = service

    def get_canonical_headers(self, host, headers):
        return sorted({
            'host': host,
            **{key.lower(): value for key, value in headers.items()},
        }.items())

    def get_signed_headers(self, headers):
        return ";".join([key for key, __ in headers])

    def get_credential_scope(self, timestamp):
        return timestamp[:8], self.region, self.service, 'aws4_request'

    def get_request_signature(self, method, path, query, headers,
                              signed_headers, content_hash, timestamp,
                              credential_scope):
        canonical_query = urlencode(sorted(query))
        canonical_request = '\n'.join((
            method,
            path,
            canonical_query,
            '\n'.join('{}:{}'.format(key, value) for key, value in headers),
            '',
            signed_headers,
            content_hash,
        ))
        string_to_sign = '\n'.join((
            self.algorithm,
            timestamp,
            '/'.join(credential_scope),
            hashlib.sha256(canonical_request.encode('utf-8')).hexdigest(),
        ))
        return self.sign_string(credential_scope, string_to_sign)

    def sign_string(self, credential_scope, string_to_sign):
        signing_key = ("AWS4" + self.secret_access_key).encode("utf-8")

        for element in credential_scope:
            signing_key = hmac.new(
                signing_key, element.encode("utf-8"), hashlib.sha256
            ).digest()

        return hmac.new(
            signing_key, string_to_sign.encode("utf-8"), hashlib.sha256
        ).hexdigest()

    def get_credential(self, credential_scope):
        return "/".join((self.access_key_id,) + credential_scope)

    def sign(self, method, url, headers=None, content=None):
        if content is None:
            content_hash = hashlib.sha256(b"").hexdigest()
        else:
            content_hash = hashlib.sha256(content).hexdigest()

        parsed_url = urlsplit(url)

        if headers is None:
            headers = {}

        timestamp = datetime.datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")

        extra_headers = {
            "x-amz-content-sha256": content_hash,
            "x-amz-date": timestamp
        }

        canonical_headers = self.get_canonical_headers(
            parsed_url.netloc, {**headers, **extra_headers}
        )

        signed_headers = self.get_signed_headers(canonical_headers)

        credential_scope = self.get_credential_scope(timestamp)

        signature = self.get_request_signature(
            method,
            parsed_url.path,
            parse_qsl(parsed_url.query, keep_blank_values=True),
            canonical_headers,
            signed_headers,
            content_hash,
            timestamp,
            credential_scope,
        )

        credential = self.get_credential(credential_scope)

        authorization_header = (
            "{algorithm} "
            "Credential={credential}, "
            "SignedHeaders={signed_headers}, "
            "Signature={signature}"
        ).format(
            algorithm=self.algorithm,
            credential=credential,
            signed_headers=signed_headers,
            signature=signature,
        )

        return {**extra_headers, "Authorization": authorization_header}
