from rest_framework import serializers

from .models import (
    MediaAsset, MediaBundle, MediaBundleAsset,
    SocialAccount, SocialAuditLog, SocialPost, SocialPostTarget,
    SocialAnalyticsSnapshot,
)


class SocialAccountSerializer(serializers.ModelSerializer):
    token_healthy = serializers.SerializerMethodField()

    class Meta:
        model  = SocialAccount
        fields = [
            'id', 'platform', 'account_type', 'account_external_id',
            'account_name', 'account_handle', 'avatar_url', 'status',
            'token_healthy', 'created_at', 'updated_at',
        ]
        read_only_fields = fields

    def get_token_healthy(self, obj):
        try:
            return not obj.token.is_expired and obj.token.access_token_enc != ''
        except Exception:
            return False


class MediaAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model  = MediaAsset
        fields = [
            'id', 'original_filename', 'mime_type', 'size_bytes',
            'width', 'height', 'duration_seconds', 'storage_path', 'created_at',
        ]
        read_only_fields = ['id', 'hash', 'created_at', 'updated_at']

    def validate_mime_type(self, value):
        allowed = {
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/quicktime', 'video/webm',
        }
        if value not in allowed:
            raise serializers.ValidationError(f'Unsupported media type: {value}')
        return value


class MediaBundleAssetSerializer(serializers.ModelSerializer):
    asset = MediaAssetSerializer(read_only=True)

    class Meta:
        model  = MediaBundleAsset
        fields = ['id', 'asset', 'position']


class MediaBundleSerializer(serializers.ModelSerializer):
    bundle_assets = MediaBundleAssetSerializer(many=True, read_only=True)

    class Meta:
        model  = MediaBundle
        fields = ['id', 'name', 'bundle_assets', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class SocialPostTargetSerializer(serializers.ModelSerializer):
    class Meta:
        model  = SocialPostTarget
        fields = [
            'id', 'social_account', 'platform', 'platform_post_id',
            'status', 'error_code', 'error_message', 'published_at',
            'created_at', 'updated_at',
        ]
        read_only_fields = fields


class SocialPostSerializer(serializers.ModelSerializer):
    targets = SocialPostTargetSerializer(many=True, read_only=True)

    class Meta:
        model  = SocialPost
        fields = [
            'id', 'title', 'body', 'media_bundle', 'status',
            'scheduled_at', 'published_at', 'targets', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'status', 'published_at', 'created_at', 'updated_at']


class SocialPostCreateSerializer(serializers.Serializer):
    title              = serializers.CharField(max_length=255, required=False, allow_blank=True)
    body               = serializers.CharField(min_length=1)
    media_bundle_id    = serializers.UUIDField(required=False, allow_null=True)
    target_account_ids = serializers.ListField(child=serializers.UUIDField(), min_length=1)
    scheduled_at       = serializers.DateTimeField(required=False, allow_null=True)


class SocialAnalyticsSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model  = SocialAnalyticsSnapshot
        fields = [
            'id', 'platform', 'snapshot_date',
            'impressions', 'reach', 'clicks', 'likes',
            'comments', 'shares', 'saves', 'video_views', 'created_at',
        ]
        read_only_fields = fields


class SocialAuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model  = SocialAuditLog
        fields = ['id', 'action', 'entity_type', 'entity_id', 'metadata', 'ip_address', 'created_at']
        read_only_fields = fields
