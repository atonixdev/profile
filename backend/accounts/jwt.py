from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Profile

import pyotp


class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Allow JWT login with either username or email.

    The frontend login form accepts "Username or Email", but SimpleJWT by default
    expects a username. If the provided username looks like an email, we resolve
    it to the matching user's username.
    """

    def validate(self, attrs):
        supplied = attrs.get('username')
        if isinstance(supplied, str) and '@' in supplied:
            try:
                user = User.objects.get(email__iexact=supplied)
                attrs['username'] = user.get_username()
            except User.DoesNotExist:
                # Fall through to default error handling
                pass

        # If the user has MFA enabled, require a valid OTP.
        request = self.context.get('request')
        otp = None
        if request is not None:
            otp = request.data.get('otp')

        # Resolve target user if possible (only to check MFA flag; auth still handled by super().validate)
        target_user = None
        try:
            if isinstance(attrs.get('username'), str) and attrs.get('username'):
                target_user = User.objects.get(username=attrs.get('username'))
        except User.DoesNotExist:
            target_user = None

        if target_user is not None:
            profile = getattr(target_user, 'profile', None)
            if profile and getattr(profile, 'mfa_enabled', False):
                if not otp:
                    raise serializers.ValidationError({'otp': 'OTP required'}, code='otp_required')
                secret = getattr(profile, 'mfa_totp_secret', '') or ''
                secret = profile.get_totp_secret() if hasattr(profile, 'get_totp_secret') else secret
                if not secret:
                    raise serializers.ValidationError({'otp': 'MFA misconfigured. Contact support.'})
                totp = pyotp.TOTP(secret)
                if not totp.verify(str(otp), valid_window=1):
                    raise serializers.ValidationError({'otp': 'Invalid OTP'}, code='otp_invalid')

        return super().validate(attrs)


class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenObtainPairSerializer

    # Rate-limit login attempts to slow brute force
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'
