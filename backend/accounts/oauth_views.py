"""
OAuth 2.0 Authentication Views — GitHub, GitLab, LinkedIn, Google

Flow:
  1. GET  /api/auth/oauth/{provider}/init/      → returns {auth_url}
  2. User is redirected to provider, authenticates there
  3. Provider redirects to FRONTEND /oauth/callback?code=...&state=...
  4. POST /api/auth/oauth/callback/             → {provider, code, state}
                                               → returns {access, refresh, user}
"""

from __future__ import annotations

import logging
import time
from urllib.parse import urlencode

import requests
from django.conf import settings
from django.contrib.auth.models import User
from django.core import signing
from django.db import IntegrityError, transaction
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from community.models import CommunityMember

from .models import Profile

# Reuse the same cookie helpers as CookieLoginView
from .auth_views import ACCESS_COOKIE, REFRESH_COOKIE, _cookie_params

logger = logging.getLogger(__name__)

# ── Provider configuration ────────────────────────────────────────────────────

_PROVIDERS: dict[str, dict] = {
    'github': {
        'auth_url':   'https://github.com/login/oauth/authorize',
        'token_url':  'https://github.com/login/oauth/access_token',
        'user_url':   'https://api.github.com/user',
        'emails_url': 'https://api.github.com/user/emails',
        'scope':      'user:email read:user',
        'client_id_key':     'GITHUB_CLIENT_ID',
        'client_secret_key': 'GITHUB_CLIENT_SECRET',
        'redirect_uri_key':  'GITHUB_REDIRECT_URI',
    },
    'gitlab': {
        'auth_url':  'https://gitlab.com/oauth/authorize',
        'token_url': 'https://gitlab.com/oauth/token',
        'user_url':  'https://gitlab.com/api/v4/user',
        'scope':     'read_user email',
        'client_id_key':     'GITLAB_CLIENT_ID',
        'client_secret_key': 'GITLAB_CLIENT_SECRET',
        'redirect_uri_key':  'GITLAB_REDIRECT_URI',
    },
    'linkedin': {
        'auth_url':  'https://www.linkedin.com/oauth/v2/authorization',
        'token_url': 'https://www.linkedin.com/oauth/v2/accessToken',
        'user_url':  'https://api.linkedin.com/v2/userinfo',
        'scope':     'openid profile email',
        'client_id_key':     'LINKEDIN_CLIENT_ID',
        'client_secret_key': 'LINKEDIN_CLIENT_SECRET',
        'redirect_uri_key':  'LINKEDIN_REDIRECT_URI',
    },
    'google': {
        'auth_url':  'https://accounts.google.com/o/oauth2/v2/auth',
        'token_url': 'https://oauth2.googleapis.com/token',
        'user_url':  'https://www.googleapis.com/oauth2/v3/userinfo',
        'scope':     'openid email profile',
        'client_id_key':     'GOOGLE_CLIENT_ID',
        'client_secret_key': 'GOOGLE_CLIENT_SECRET',
        'redirect_uri_key':  'GOOGLE_REDIRECT_URI',
    },
}

_STATE_SALT = 'atonix-oauth-state'
_STATE_MAX_AGE = 600  # 10 minutes


# ── Helpers ───────────────────────────────────────────────────────────────────

def _cfg(key: str, default: str = '') -> str:
    return getattr(settings, key, default) or default


def _build_auth_url(provider: str, state: str) -> str:
    cfg = _PROVIDERS[provider]
    params = {
        'client_id':    _cfg(cfg['client_id_key']),
        'redirect_uri': _cfg(cfg['redirect_uri_key']),
        'scope':        cfg['scope'],
        'state':        state,
        'response_type': 'code',
    }
    if provider == 'google':
        params['access_type'] = 'online'
        params['prompt'] = 'select_account'
    return f"{cfg['auth_url']}?{urlencode(params)}"


def _exchange_code(provider: str, code: str) -> str:
    """Exchange authorization code for access token. Returns token string."""
    cfg = _PROVIDERS[provider]
    payload = {
        'grant_type':    'authorization_code',
        'code':          code,
        'redirect_uri':  _cfg(cfg['redirect_uri_key']),
        'client_id':     _cfg(cfg['client_id_key']),
        'client_secret': _cfg(cfg['client_secret_key']),
    }
    headers = {'Accept': 'application/json'}

    for attempt in range(2):
        try:
            resp = requests.post(cfg['token_url'], data=payload, headers=headers, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            token = data.get('access_token', '')
            if token:
                return token
            # Some providers return error in 200 body
            error = data.get('error_description') or data.get('error') or 'No access_token in response'
            logger.warning('OAuth[%s] token exchange body error (attempt %d): %s', provider, attempt + 1, error)
        except requests.RequestException as exc:
            logger.warning('OAuth[%s] token exchange request failed (attempt %d): %s', provider, attempt + 1, exc)
        if attempt == 0:
            time.sleep(0.5)

    raise RuntimeError(f'Token exchange failed for {provider} after 2 attempts')


def _fetch_profile(provider: str, access_token: str) -> dict:
    """Fetch user profile from provider and return normalized dict."""
    cfg = _PROVIDERS[provider]
    bearer = {'Authorization': f'Bearer {access_token}'}
    token_header = {'Authorization': f'token {access_token}'}  # GitHub style

    if provider == 'github':
        headers = token_header
    else:
        headers = bearer

    resp = requests.get(cfg['user_url'], headers=headers, timeout=10)
    resp.raise_for_status()
    data = resp.json()

    if provider == 'github':
        email = data.get('email')
        if not email:
            # Fetch primary verified email from emails API
            er = requests.get(cfg['emails_url'], headers=headers, timeout=10)
            if er.ok:
                primary = next(
                    (e for e in er.json() if e.get('primary') and e.get('verified')),
                    None,
                )
                email = primary['email'] if primary else None
        return {
            'provider':    'github',
            'provider_id': str(data['id']),
            'email':       email or '',
            'name':        data.get('name') or data.get('login', ''),
            'avatar_url':  data.get('avatar_url', ''),
            'verified':    bool(email),
            'username':    data.get('login', ''),
        }

    if provider == 'gitlab':
        return {
            'provider':    'gitlab',
            'provider_id': str(data['id']),
            'email':       data.get('email', ''),
            'name':        data.get('name') or data.get('username', ''),
            'avatar_url':  data.get('avatar_url', ''),
            'verified':    bool(data.get('confirmed_at')),
            'username':    data.get('username', ''),
        }

    if provider == 'linkedin':
        name = f"{data.get('given_name', '')} {data.get('family_name', '')}".strip()
        return {
            'provider':    'linkedin',
            'provider_id': data.get('sub', ''),
            'email':       data.get('email', ''),
            'name':        name or data.get('name', ''),
            'avatar_url':  data.get('picture', ''),
            'verified':    bool(data.get('email_verified', False)),
            'username':    '',
        }

    if provider == 'google':
        name = f"{data.get('given_name', '')} {data.get('family_name', '')}".strip()
        return {
            'provider':    'google',
            'provider_id': data.get('sub', ''),
            'email':       data.get('email', ''),
            'name':        name or data.get('name', ''),
            'avatar_url':  data.get('picture', ''),
            'verified':    bool(data.get('email_verified', False)),
            'username':    '',
        }

    raise ValueError(f'Unknown provider: {provider}')


def _get_or_create_user(profile_data: dict) -> tuple[User, bool]:
    """
    Return (user, created).
    - Match by provider+provider_id first (most reliable)
    - Fall back to email match (account linking)
    - Otherwise create new user
    """
    provider    = profile_data['provider']
    provider_id = profile_data['provider_id']
    email       = (profile_data.get('email') or '').strip().lower()
    name        = profile_data.get('name', '')
    avatar_url  = profile_data.get('avatar_url', '')
    verified    = profile_data.get('verified', False)

    # 1. Match by provider + provider_id
    existing = Profile.objects.filter(
        oauth_provider=provider, oauth_provider_id=provider_id
    ).select_related('user').first()
    if existing:
        if avatar_url and existing.oauth_avatar != avatar_url:
            existing.oauth_avatar = avatar_url
            existing.save(update_fields=['oauth_avatar'])
        return existing.user, False

    # 2. Match by email (link provider to existing account)
    if email:
        try:
            user = User.objects.get(email__iexact=email)
            profile, _ = Profile.objects.get_or_create(
                user=user,
                defaults={
                    'full_name': name or user.username,
                    'title':     'Community Member',
                    'bio':       '',
                    'about':     '',
                    'email':     email,
                    'skills':    [],
                    'is_active': True,
                },
            )
            profile.oauth_provider    = provider
            profile.oauth_provider_id = provider_id
            profile.oauth_email       = email
            profile.oauth_avatar      = avatar_url
            profile.oauth_verified    = verified
            profile.save()
            return user, False
        except User.DoesNotExist:
            pass

    # 3. Create new user
    parts      = name.split(' ', 1)
    first_name = parts[0] if parts else ''
    last_name  = parts[1] if len(parts) > 1 else ''

    raw_base = profile_data.get('username') or (email.split('@')[0] if email else provider)
    base     = ''.join(c for c in raw_base if c.isalnum() or c in '_-')[:28] or provider
    username = base
    counter  = 1
    while User.objects.filter(username=username).exists():
        username = f'{base}{counter}'
        counter += 1

    with transaction.atomic():
        user = User.objects.create_user(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
        )
        user.set_unusable_password()
        user.save()

        Profile.objects.create(
            user=user,
            full_name=name or username,
            title='Community Member',
            bio='',
            about='',
            email=email,
            skills=[],
            is_active=True,
            oauth_provider=provider,
            oauth_provider_id=provider_id,
            oauth_email=email,
            oauth_avatar=avatar_url,
            oauth_verified=verified,
        )
        CommunityMember.objects.get_or_create(
            user=user,
            defaults={'role': 'member', 'bio': '', 'location': '', 'is_active': True},
        )

    return user, True


# ── Views ─────────────────────────────────────────────────────────────────────

class OAuthInitView(APIView):
    """
    GET /api/auth/oauth/<provider>/init/
    Returns { auth_url } — frontend redirects user there.
    """
    permission_classes = [AllowAny]

    def get(self, request, provider: str):
        provider = provider.lower()
        if provider not in _PROVIDERS:
            return Response({'detail': 'Unsupported provider.'}, status=status.HTTP_400_BAD_REQUEST)

        if not _cfg(_PROVIDERS[provider]['client_id_key']):
            return Response(
                {'detail': f'{provider.title()} OAuth is not configured on this platform.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        # Sign a state token with provider + timestamp (validated on callback)
        state = signing.dumps({'provider': provider, 'ts': time.time()}, salt=_STATE_SALT)
        auth_url = _build_auth_url(provider, state)
        return Response({'auth_url': auth_url, 'state': state})


class OAuthCallbackView(APIView):
    """
    POST /api/auth/oauth/callback/
    Body: { provider, code, state }
    Returns: { access, refresh, user, created, provider }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        provider = (request.data.get('provider') or '').lower().strip()
        code     = (request.data.get('code')     or '').strip()
        state    = (request.data.get('state')    or '').strip()

        if provider not in _PROVIDERS:
            return Response({'detail': 'Unsupported provider.'}, status=status.HTTP_400_BAD_REQUEST)
        if not code:
            return Response({'detail': 'Authorization code is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not state:
            return Response({'detail': 'State parameter is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate signed state
        try:
            state_data = signing.loads(state, salt=_STATE_SALT, max_age=_STATE_MAX_AGE)
        except signing.SignatureExpired:
            return Response({'detail': 'OAuth session expired. Please try again.'}, status=status.HTTP_400_BAD_REQUEST)
        except signing.BadSignature:
            return Response({'detail': 'Invalid state parameter.'}, status=status.HTTP_400_BAD_REQUEST)

        if state_data.get('provider') != provider:
            return Response({'detail': 'Provider mismatch in state.'}, status=status.HTTP_400_BAD_REQUEST)

        if not _cfg(_PROVIDERS[provider]['client_id_key']):
            return Response(
                {'detail': f'{provider.title()} OAuth is not configured on this platform.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        # Exchange code for access token
        try:
            access_token = _exchange_code(provider, code)
        except RuntimeError as exc:
            logger.warning('OAuth[%s] token exchange failed: %s', provider, exc)
            return Response(
                {'detail': 'Failed to authenticate with provider. Please try again.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except Exception:
            logger.exception('OAuth[%s] unexpected token exchange error', provider)
            return Response({'detail': 'Authentication error. Please try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Fetch user profile from provider
        try:
            profile_data = _fetch_profile(provider, access_token)
        except requests.HTTPError as exc:
            logger.warning('OAuth[%s] profile fetch failed: %s', provider, exc)
            return Response(
                {'detail': 'Could not retrieve your profile. Please try again.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except Exception:
            logger.exception('OAuth[%s] profile fetch unexpected error', provider)
            return Response({'detail': 'Authentication error. Please try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if not profile_data.get('provider_id'):
            return Response({'detail': 'Provider returned an incomplete profile.'}, status=status.HTTP_502_BAD_GATEWAY)

        # Get or create user
        try:
            user, created = _get_or_create_user(profile_data)
        except IntegrityError:
            return Response(
                {'detail': 'Account conflict. Please sign in with your existing account.'},
                status=status.HTTP_409_CONFLICT,
            )
        except Exception:
            logger.exception('OAuth[%s] user resolution error', provider)
            return Response({'detail': 'Account error. Please try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Issue JWT tokens — set same HttpOnly cookies as CookieLoginView
        refresh = RefreshToken.for_user(user)
        access  = str(refresh.access_token)

        resp = Response(
            {
                'user': {
                    'id':         user.id,
                    'username':   user.username,
                    'email':      user.email,
                    'first_name': user.first_name,
                    'last_name':  user.last_name,
                    'is_staff':   user.is_staff,
                },
                'created':  created,
                'provider': provider,
            },
            status=status.HTTP_200_OK,
        )
        params = _cookie_params()
        resp.set_cookie(
            ACCESS_COOKIE, access,
            max_age=int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()),
            **params,
        )
        resp.set_cookie(
            REFRESH_COOKIE, str(refresh),
            max_age=int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()),
            **params,
        )
        return resp
