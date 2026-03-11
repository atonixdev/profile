"""
AtonixDev Social Hub — API views.

OAuth flow, account management, post CRUD, media upload,
analytics, and audit trail.
"""
import hashlib
import logging
import os
import secrets
import uuid
from datetime import timedelta

from django.conf import settings
from django.core.files.storage import default_storage
from django.http import HttpResponseRedirect
from django.utils import timezone
from django.db.models import Q
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from config.crypto import encrypt_text, decrypt_text

from .models import (
    MediaAsset, MediaBundle, MediaBundleAsset,
    Platform, SocialAccount, SocialAnalyticsSnapshot,
    SocialAuditLog, SocialPost, SocialPostTarget, SocialToken,
)
from .serializers import (
    MediaAssetSerializer, MediaBundleSerializer,
    SocialAccountSerializer, SocialAnalyticsSnapshotSerializer,
    SocialAuditLogSerializer, SocialPostCreateSerializer,
    SocialPostSerializer,
)

logger = logging.getLogger(__name__)

# ── Helpers ────────────────────────────────────────────────────────────────

SUPPORTED_PLATFORMS = {p.value for p in Platform}

_PLATFORM_AUTH_URLS = {
    'linkedin':  'https://www.linkedin.com/oauth/v2/authorization',
    'facebook':  'https://www.facebook.com/v19.0/dialog/oauth',
    'instagram': 'https://www.facebook.com/v19.0/dialog/oauth',   # same as FB, scoped differently
    'twitter':   'https://twitter.com/i/oauth2/authorize',
    'tiktok':    'https://www.tiktok.com/v2/auth/authorize/',
    'youtube':   'https://accounts.google.com/o/oauth2/v2/auth',
}

_PLATFORM_SCOPES = {
    'linkedin':  'r_liteprofile w_member_social',
    'facebook':  'pages_show_list pages_manage_posts pages_read_engagement',
    'instagram': 'pages_show_list instagram_basic instagram_content_publish',
    'twitter':   'tweet.read tweet.write users.read',
    'tiktok':    'user.info.basic video.upload',
    'youtube':   'https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.upload',
}


def _get_client_id(platform: str) -> str:
    env_map = {
        'linkedin':  'LINKEDIN_CLIENT_ID',
        'facebook':  'FACEBOOK_CLIENT_ID',
        'instagram': 'FACEBOOK_CLIENT_ID',  # shares FB app
        'twitter':   'TWITTER_CLIENT_ID',
        'tiktok':    'TIKTOK_CLIENT_ID',
        'youtube':   'GOOGLE_CLIENT_ID',
    }
    return os.getenv(env_map.get(platform, ''), '')


def _get_redirect_uri(platform: str, request) -> str:
    base = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000').rstrip('/')
    return f'{base}/social/oauth/callback/{platform}'


def _write_audit(request, action: str, entity_type: str = '', entity_id=None, metadata: dict = None):
    try:
        x_fwd = request.META.get('HTTP_X_FORWARDED_FOR', '')
        ip = x_fwd.split(',')[0].strip() if x_fwd else request.META.get('REMOTE_ADDR', '')
        SocialAuditLog.objects.create(
            user=request.user,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            metadata=metadata or {},
            ip_address=ip,
        )
    except Exception:
        logger.exception('Failed to write social audit log for action=%s', action)


# ── OAuth ──────────────────────────────────────────────────────────────────

class OAuthInitiateView(APIView):
    """
    POST /api/social/oauth/<platform>/initiate
    Returns a URL the frontend should redirect the user to.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, platform):
        platform = platform.lower()
        if platform not in SUPPORTED_PLATFORMS:
            return Response({'detail': f'Unsupported platform: {platform}'}, status=400)

        client_id = _get_client_id(platform)
        if not client_id:
            return Response({'detail': f'{platform} OAuth is not configured on this platform.'}, status=503)

        state = secrets.token_urlsafe(32)
        # Store state in session keyed per platform so callback can verify
        request.session[f'social_oauth_state_{platform}'] = state
        request.session.modified = True

        redirect_uri = _get_redirect_uri(platform, request)
        auth_url = _PLATFORM_AUTH_URLS[platform]
        scope = _PLATFORM_SCOPES[platform]

        # Build provider-specific URL params
        if platform in ('linkedin', 'facebook', 'instagram', 'twitter'):
            url = (
                f'{auth_url}?response_type=code'
                f'&client_id={client_id}'
                f'&redirect_uri={redirect_uri}'
                f'&scope={scope}'
                f'&state={state}'
            )
        elif platform == 'tiktok':
            url = (
                f'{auth_url}?client_key={client_id}'
                f'&response_type=code'
                f'&scope={scope}'
                f'&redirect_uri={redirect_uri}'
                f'&state={state}'
            )
        else:  # youtube / google
            url = (
                f'{auth_url}?response_type=code'
                f'&client_id={client_id}'
                f'&redirect_uri={redirect_uri}'
                f'&scope={scope}'
                f'&state={state}'
                f'&access_type=offline'
                f'&prompt=consent'
            )

        return Response({'oauth_url': url, 'platform': platform})


class OAuthCallbackView(APIView):
    """
    POST /api/social/oauth/<platform>/callback
    Frontend POSTs { code, state } after receiving the provider redirect.
    Backend exchanges code for token and stores the account.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, platform):
        platform = platform.lower()
        if platform not in SUPPORTED_PLATFORMS:
            return Response({'detail': f'Unsupported platform: {platform}'}, status=400)

        code  = request.data.get('code', '').strip()
        state = request.data.get('state', '').strip()

        if not code or not state:
            return Response({'detail': 'code and state are required.'}, status=400)

        # CSRF / state validation
        saved_state = request.session.get(f'social_oauth_state_{platform}')
        if not saved_state or saved_state != state:
            logger.warning('Social OAuth state mismatch for user=%s platform=%s', request.user.id, platform)
            return Response({'detail': 'Invalid or expired OAuth state. Please try again.'}, status=400)

        # Clear used state
        del request.session[f'social_oauth_state_{platform}']
        request.session.modified = True

        client_id = _get_client_id(platform)
        if not client_id:
            return Response({'detail': f'{platform} OAuth is not configured.'}, status=503)

        # ── Token exchange ────────────────────────────────────────
        # In a real deployment this would call the platform's token endpoint.
        # Here we create a placeholder account record — the token data structure
        # is complete and ready for a real HTTP exchange implementation.
        access_token  = f'placeholder_access_{platform}_{secrets.token_hex(16)}'
        expires_delta = timedelta(hours=1)

        # Create / update the social account record
        account, _ = SocialAccount.objects.update_or_create(
            user=request.user,
            platform=platform,
            account_external_id=f'pending_{request.user.id}_{platform}',
            defaults={
                'account_name':   request.user.get_full_name() or request.user.username,
                'account_handle': '',
                'status':         SocialAccount.Status.ACTIVE,
            },
        )

        # Store token (encrypted)
        SocialToken.objects.update_or_create(
            social_account=account,
            defaults={
                'access_token_enc':  encrypt_text(access_token),
                'refresh_token_enc': '',
                'expires_at':        timezone.now() + expires_delta,
                'scopes':            _PLATFORM_SCOPES.get(platform, '').split(),
                'last_refresh_status': SocialToken.RefreshStatus.SUCCESS,
                'last_refresh_attempt_at': timezone.now(),
            },
        )

        _write_audit(request, 'connect_account', 'social_account', account.id,
                     {'platform': platform})

        return Response(SocialAccountSerializer(account).data, status=201)


# ── Account Management ─────────────────────────────────────────────────────

class SocialAccountListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = SocialAccount.objects.filter(user=request.user).select_related('token')
        return Response(SocialAccountSerializer(qs, many=True).data)


class SocialAccountDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_account(self, pk, user):
        try:
            return SocialAccount.objects.get(pk=pk, user=user)
        except SocialAccount.DoesNotExist:
            return None

    def get(self, request, pk):
        account = self._get_account(pk, request.user)
        if not account:
            return Response({'detail': 'Not found.'}, status=404)
        return Response(SocialAccountSerializer(account).data)

    def delete(self, request, pk):
        account = self._get_account(pk, request.user)
        if not account:
            return Response({'detail': 'Not found.'}, status=404)
        platform = account.platform
        account.delete()
        _write_audit(request, 'disconnect_account', 'social_account', uuid.UUID(str(pk)),
                     {'platform': platform})
        return Response(status=204)


# ── Post CRUD ─────────────────────────────────────────────────────────────

class SocialPostListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        status_filter = request.query_params.get('status')
        qs = SocialPost.objects.filter(user=request.user).prefetch_related('targets')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return Response(SocialPostSerializer(qs, many=True).data)

    def post(self, request):
        ser = SocialPostCreateSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=400)

        vd = ser.validated_data

        # Validate target accounts belong to user
        account_ids = vd['target_account_ids']
        accounts = SocialAccount.objects.filter(id__in=account_ids, user=request.user, status=SocialAccount.Status.ACTIVE)
        if accounts.count() != len(account_ids):
            return Response({'detail': 'One or more account IDs are invalid or disconnected.'}, status=400)

        # Validate media bundle if provided
        bundle = None
        if vd.get('media_bundle_id'):
            try:
                bundle = MediaBundle.objects.get(id=vd['media_bundle_id'], user=request.user)
            except MediaBundle.DoesNotExist:
                return Response({'detail': 'Media bundle not found.'}, status=400)

        post_status = (
            SocialPost.Status.SCHEDULED if vd.get('scheduled_at')
            else SocialPost.Status.DRAFT
        )

        post = SocialPost.objects.create(
            user=request.user,
            title=vd.get('title', ''),
            body=vd['body'],
            media_bundle=bundle,
            status=post_status,
            scheduled_at=vd.get('scheduled_at'),
        )

        for account in accounts:
            SocialPostTarget.objects.create(
                social_post=post,
                social_account=account,
                platform=account.platform,
            )

        _write_audit(request, 'create_post', 'social_post', post.id,
                     {'status': post_status, 'platforms': [a.platform for a in accounts]})

        return Response(SocialPostSerializer(post).data, status=201)


class SocialPostDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_post(self, pk, user):
        try:
            return SocialPost.objects.get(pk=pk, user=user)
        except SocialPost.DoesNotExist:
            return None

    def get(self, request, pk):
        post = self._get_post(pk, request.user)
        if not post:
            return Response({'detail': 'Not found.'}, status=404)
        return Response(SocialPostSerializer(post).data)

    def patch(self, request, pk):
        post = self._get_post(pk, request.user)
        if not post:
            return Response({'detail': 'Not found.'}, status=404)
        if post.status not in (SocialPost.Status.DRAFT, SocialPost.Status.SCHEDULED):
            return Response({'detail': 'Only draft or scheduled posts can be edited.'}, status=409)

        allowed = {'title', 'body', 'scheduled_at'}
        for field in allowed:
            if field in request.data:
                setattr(post, field, request.data[field])
        if post.scheduled_at and post.status == SocialPost.Status.DRAFT:
            post.status = SocialPost.Status.SCHEDULED
        post.save()

        _write_audit(request, 'update_post', 'social_post', post.id)
        return Response(SocialPostSerializer(post).data)

    def delete(self, request, pk):
        post = self._get_post(pk, request.user)
        if not post:
            return Response({'detail': 'Not found.'}, status=404)
        if post.status == SocialPost.Status.PUBLISHING:
            return Response({'detail': 'Cannot delete a post that is currently being published.'}, status=409)
        post.delete()
        _write_audit(request, 'delete_post', 'social_post', uuid.UUID(str(pk)))
        return Response(status=204)


class SocialPostPublishView(APIView):
    """Force-publish a draft or scheduled post immediately."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            post = SocialPost.objects.get(pk=pk, user=request.user)
        except SocialPost.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)

        if post.status == SocialPost.Status.PUBLISHING:
            return Response({'detail': 'Already publishing.'}, status=409)
        if post.status == SocialPost.Status.PUBLISHED:
            return Response({'detail': 'Already published.'}, status=409)

        post.status = SocialPost.Status.PUBLISHING
        post.save(update_fields=['status', 'updated_at'])

        # In production this would enqueue the post for async dispatch.
        # For now we simulate immediate success:
        post.targets.filter(
            status__in=[SocialPostTarget.Status.PENDING, SocialPostTarget.Status.QUEUED]
        ).update(status=SocialPostTarget.Status.PUBLISHED, published_at=timezone.now())

        post.status = SocialPost.Status.PUBLISHED
        post.published_at = timezone.now()
        post.save(update_fields=['status', 'published_at', 'updated_at'])

        _write_audit(request, 'publish_post', 'social_post', post.id)
        return Response(SocialPostSerializer(post).data)


# ── Media ─────────────────────────────────────────────────────────────────

class MediaUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    _MAX_SIZE = 100 * 1024 * 1024  # 100 MB

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'detail': 'No file provided.'}, status=400)

        if file.size > self._MAX_SIZE:
            return Response({'detail': f'File exceeds {self._MAX_SIZE // (1024*1024)} MB limit.'}, status=400)

        mime_type = file.content_type or 'application/octet-stream'
        allowed_prefixes = ('image/', 'video/')
        if not any(mime_type.startswith(p) for p in allowed_prefixes):
            return Response({'detail': 'Only image and video files are supported.'}, status=400)

        # Hash for deduplication
        content = file.read()
        file_hash = hashlib.sha256(content).hexdigest()
        file.seek(0)

        # Check for duplicate
        existing = MediaAsset.objects.filter(hash=file_hash, user=request.user).first()
        if existing:
            return Response(MediaAssetSerializer(existing).data, status=200)

        ext = os.path.splitext(file.name)[1].lower()
        storage_key = f'social/media/{request.user.id}/{uuid.uuid4().hex}{ext}'
        default_storage.save(storage_key, file)

        asset = MediaAsset.objects.create(
            user=request.user,
            storage_path=storage_key,
            original_filename=file.name,
            mime_type=mime_type,
            size_bytes=file.size,
            hash=file_hash,
        )
        return Response(MediaAssetSerializer(asset).data, status=201)


class MediaAssetListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = MediaAsset.objects.filter(user=request.user)
        mime_filter = request.query_params.get('type')
        if mime_filter == 'image':
            qs = qs.filter(mime_type__startswith='image/')
        elif mime_filter == 'video':
            qs = qs.filter(mime_type__startswith='video/')
        return Response(MediaAssetSerializer(qs, many=True).data)


class MediaAssetDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            asset = MediaAsset.objects.get(pk=pk, user=request.user)
        except MediaAsset.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)
        if default_storage.exists(asset.storage_path):
            default_storage.delete(asset.storage_path)
        asset.delete()
        return Response(status=204)


# ── Analytics ─────────────────────────────────────────────────────────────

class PostAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, post_pk):
        try:
            post = SocialPost.objects.get(pk=post_pk, user=request.user)
        except SocialPost.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)

        snapshots = SocialAnalyticsSnapshot.objects.filter(
            post_target__social_post=post
        ).select_related('post_target')
        return Response(SocialAnalyticsSnapshotSerializer(snapshots, many=True).data)


class AnalyticsOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.db.models import Sum, Count
        qs = SocialAnalyticsSnapshot.objects.filter(post_target__social_post__user=request.user)

        date_from = request.query_params.get('from')
        date_to   = request.query_params.get('to')
        if date_from:
            qs = qs.filter(snapshot_date__gte=date_from)
        if date_to:
            qs = qs.filter(snapshot_date__lte=date_to)

        totals = qs.aggregate(
            total_impressions=Sum('impressions'),
            total_reach=Sum('reach'),
            total_clicks=Sum('clicks'),
            total_likes=Sum('likes'),
            total_comments=Sum('comments'),
            total_shares=Sum('shares'),
            total_video_views=Sum('video_views'),
        )

        by_platform = list(
            qs.values('platform').annotate(
                impressions=Sum('impressions'),
                clicks=Sum('clicks'),
                likes=Sum('likes'),
            )
        )

        post_count = SocialPost.objects.filter(
            user=request.user,
            status__in=[SocialPost.Status.PUBLISHED, SocialPost.Status.PARTIAL_PUBLISHED],
        ).count()

        return Response({
            'totals': totals,
            'by_platform': by_platform,
            'published_post_count': post_count,
        })


# ── Audit Log ─────────────────────────────────────────────────────────────

class SocialAuditLogListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = SocialAuditLog.objects.filter(user=request.user)
        action_filter = request.query_params.get('action')
        if action_filter:
            qs = qs.filter(action=action_filter)
        return Response(SocialAuditLogSerializer(qs[:200], many=True).data)
