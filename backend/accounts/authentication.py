from __future__ import annotations

from rest_framework.authentication import CSRFCheck
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.authentication import JWTAuthentication


def _enforce_csrf(request) -> None:
    check = CSRFCheck(request)
    check.process_request(request)
    reason = check.process_view(request, None, (), {})
    if reason:
        raise PermissionDenied(f"CSRF Failed: {reason}")


class CookieJWTAuthentication(JWTAuthentication):
    """JWT auth that also accepts an access token from an HttpOnly cookie.

    This allows the frontend to avoid localStorage tokens.
    """

    access_cookie_name = "access_token"

    def authenticate(self, request):
        # Prefer standard Authorization header for backwards compatibility
        header = self.get_header(request)
        if header is not None:
            return super().authenticate(request)

        raw_token = request.COOKIES.get(self.access_cookie_name)
        if not raw_token:
            return None

        validated_token = self.get_validated_token(raw_token)
        user = self.get_user(validated_token)

        if request.method not in ("GET", "HEAD", "OPTIONS", "TRACE"):
            _enforce_csrf(request)

        return user, validated_token
