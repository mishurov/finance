# based on https://github.com/jpadilla/django-jwt-auth

from datetime import datetime, timedelta
import jwt
from django.conf import settings


def jwt_payload(user):
    return {
        'user_id': user.pk,
        'email': user.email,
        'username': user.username,
        'exp': datetime.utcnow() + timedelta(seconds=900)
    }


def jwt_get_user_id_from_payload(payload):
    user_id = payload.get('user_id')
    return user_id


def jwt_encode(payload):
    return jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        settings.JWT_ALGORITHM
    )


def jwt_decode(token):
    options = {
        'verify_exp': True,
    }
    leeway = 0

    return jwt.decode(
        token,
        key=settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM, ],
        options=options,
        leeway=leeway
    )


def get_authorization_header(request):
    auth = request.META.get('HTTP_AUTHORIZATION', b'')

    if isinstance(auth, type('')):
        auth = auth.encode('iso-8859-1')

    return auth
