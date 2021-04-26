# based on https://github.com/jpadilla/django-jwt-auth

from django import forms
from django.contrib.auth import authenticate

from .utils import jwt_payload, jwt_encode


class JSONWebTokenForm(forms.Form):
    username = forms.CharField()
    password = forms.CharField()

    def clean(self):
        cleaned_data = super(JSONWebTokenForm, self).clean()
        credentials = {
            'username': cleaned_data.get('username'),
            'password': cleaned_data.get('password')
        }

        if all(credentials.values()):
            user = authenticate(**credentials)

            if user:
                if not user.is_active:
                    msg = 'User account is disabled.'
                    raise forms.ValidationError(msg)

                payload = jwt_payload(user)

                self.object = {
                    'token': jwt_encode(payload)
                }
            else:
                msg = 'Unable to login with provided credentials.'
                raise forms.ValidationError(msg)
        else:
            msg = 'Must include "username" and "password"'
            raise forms.ValidationError(msg)
