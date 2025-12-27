from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


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

        return super().validate(attrs)


class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenObtainPairSerializer
