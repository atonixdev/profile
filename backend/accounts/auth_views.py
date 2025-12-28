from __future__ import annotations

import logging

from django.conf import settings
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from django.db import DatabaseError
from rest_framework import permissions, status
from rest_framework.authentication import BaseAuthentication
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer

from .jwt import EmailOrUsernameTokenObtainPairSerializer


logger = logging.getLogger(__name__)


ACCESS_COOKIE = "access_token"
REFRESH_COOKIE = "refresh_token"


def _cookie_params() -> dict:
    # In production behind HTTPS, cookies must be Secure.
    secure = bool(getattr(settings, 'SESSION_COOKIE_SECURE', (not settings.DEBUG)))
    params = {
        "httponly": True,
        "secure": secure,
        "samesite": "Lax",
        "path": "/",
    }
    domain = getattr(settings, 'COOKIE_DOMAIN', None)
    if domain:
        params["domain"] = domain
    return params


class CsrfView(APIView):
    permission_classes = [permissions.AllowAny]
    # IMPORTANT:
    # DRF runs authentication before permission checks. Our default auth backend
    # (`CookieJWTAuthentication`) loads the user from the database, which means
    # even this public endpoint will fail hard if the DB is unreachable.
    # CSRF token issuance should not depend on the DB.
    authentication_classes: list[type[BaseAuthentication]] = []

    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        # Ensure a CSRF cookie exists.
        token = get_token(request)
        return Response({"csrfToken": token}, status=status.HTTP_200_OK)


class CookieLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    @method_decorator(csrf_protect)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request):
        serializer = EmailOrUsernameTokenObtainPairSerializer(
            data=request.data, context={"request": request}
        )
        try:
            serializer.is_valid(raise_exception=True)
        except DatabaseError:
            logger.exception("Database error during cookie login")
            return Response(
                {"detail": "Login temporarily unavailable. Please try again."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        tokens = serializer.validated_data

        access = tokens.get("access")
        refresh = tokens.get("refresh")

        resp = Response({"message": "ok"}, status=status.HTTP_200_OK)
        params = _cookie_params()
        # Access token cookie (HttpOnly)
        resp.set_cookie(ACCESS_COOKIE, access, max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()), **params)
        # Refresh token cookie (HttpOnly)
        resp.set_cookie(REFRESH_COOKIE, refresh, max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()), **params)
        return resp


class CookieRefreshView(APIView):
    permission_classes = [permissions.AllowAny]

    @method_decorator(csrf_protect)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request):
        refresh = request.COOKIES.get(REFRESH_COOKIE)
        if not refresh:
            return Response({"detail": "No refresh token"}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = TokenRefreshSerializer(data={"refresh": refresh})
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        access = data.get("access")
        new_refresh = data.get("refresh")

        resp = Response({"message": "ok"}, status=status.HTTP_200_OK)
        params = _cookie_params()
        resp.set_cookie(ACCESS_COOKIE, access, max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()), **params)
        if new_refresh:
            resp.set_cookie(REFRESH_COOKIE, new_refresh, max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()), **params)
        return resp


class CookieLogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    @method_decorator(csrf_protect)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request):
        resp = Response({"message": "logged out"}, status=status.HTTP_200_OK)
        resp.delete_cookie(ACCESS_COOKIE, path="/")
        resp.delete_cookie(REFRESH_COOKIE, path="/")
        return resp
