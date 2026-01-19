from __future__ import annotations

from http.cookies import SimpleCookie
from typing import Optional

from asgiref.sync import sync_to_async
from django.contrib.auth.models import AnonymousUser


def _get_header(scope, header_name: bytes) -> Optional[bytes]:
    for k, v in scope.get('headers') or []:
        if k == header_name:
            return v
    return None


def _get_cookie(scope, name: str) -> Optional[str]:
    raw = _get_header(scope, b'cookie')
    if not raw:
        return None
    try:
        cookie = SimpleCookie()
        cookie.load(raw.decode('utf-8'))
        morsel = cookie.get(name)
        return morsel.value if morsel else None
    except Exception:
        return None


@sync_to_async
def _get_user_from_token(raw_token: str):
    try:
        from django.contrib.auth import get_user_model
        from rest_framework_simplejwt.authentication import JWTAuthentication
    except Exception:
        return AnonymousUser()

    try:
        auth = JWTAuthentication()
        validated = auth.get_validated_token(raw_token)
        user = auth.get_user(validated)
        return user
    except Exception:
        return AnonymousUser()


class JwtCookieAuthMiddleware:
    """Authenticate Channels WebSocket connections via SimpleJWT cookie.

    Uses the same HttpOnly cookie name as DRF: access_token.
    """

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        if scope.get('type') == 'websocket':
            token = _get_cookie(scope, 'access_token')
            if token:
                scope['user'] = await _get_user_from_token(token)
            else:
                scope['user'] = AnonymousUser()
        return await self.inner(scope, receive, send)
