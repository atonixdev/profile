from django.contrib import admin
from .models import (
    SocialAccount, SocialToken, MediaAsset, MediaBundle,
    SocialPost, SocialPostTarget, SocialAnalyticsSnapshot, SocialAuditLog,
)


@admin.register(SocialAccount)
class SocialAccountAdmin(admin.ModelAdmin):
    list_display = ('account_name', 'platform', 'account_type', 'status', 'user', 'created_at')
    list_filter  = ('platform', 'status')
    search_fields = ('account_name', 'account_handle', 'user__username')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(SocialToken)
class SocialTokenAdmin(admin.ModelAdmin):
    list_display = ('social_account', 'expires_at', 'last_refresh_status', 'updated_at')
    readonly_fields = ('id', 'created_at', 'updated_at', 'access_token_enc', 'refresh_token_enc')


@admin.register(MediaAsset)
class MediaAssetAdmin(admin.ModelAdmin):
    list_display = ('original_filename', 'mime_type', 'size_bytes', 'user', 'created_at')
    search_fields = ('original_filename',)
    readonly_fields = ('id', 'hash', 'created_at', 'updated_at')


@admin.register(SocialPost)
class SocialPostAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'status', 'user', 'scheduled_at', 'published_at', 'created_at')
    list_filter  = ('status',)
    search_fields = ('title', 'body')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(SocialPostTarget)
class SocialPostTargetAdmin(admin.ModelAdmin):
    list_display = ('social_post', 'platform', 'status', 'published_at')
    list_filter  = ('platform', 'status')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(SocialAuditLog)
class SocialAuditLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'entity_type', 'entity_id', 'user', 'ip_address', 'created_at')
    list_filter  = ('action', 'entity_type')
    readonly_fields = ('id', 'created_at')
