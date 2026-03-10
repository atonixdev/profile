import logging

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import UserSSHKey, UserGPGKey, AuditEvent
from .serializers import UserSSHKeySerializer, UserGPGKeySerializer

logger = logging.getLogger(__name__)


def _log(user, event_type, resource_type, resource_id='', metadata=None):
    """Write an immutable audit event. Failures are logged but never bubble up."""
    try:
        AuditEvent.objects.create(
            user=user,
            event_type=event_type,
            resource_type=resource_type,
            resource_id=str(resource_id),
            metadata=metadata or {},
        )
    except Exception:
        logger.exception("Failed to write audit event '%s'", event_type)


class SSHKeyViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSSHKeySerializer
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def get_queryset(self):
        return UserSSHKey.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        key = serializer.save(user=self.request.user)
        _log(
            self.request.user, 'ssh_key_created', 'ssh_key', key.id,
            {'fingerprint': key.fingerprint, 'title': key.title, 'algorithm': key.algorithm},
        )

    def perform_destroy(self, instance):
        _log(
            self.request.user, 'ssh_key_deleted', 'ssh_key', instance.id,
            {'fingerprint': instance.fingerprint, 'title': instance.title},
        )
        instance.delete()

    @action(detail=True, methods=['post'])
    def revoke(self, request, pk=None):
        key = self.get_object()
        if key.status == UserSSHKey.STATUS_REVOKED:
            return Response(
                {'detail': 'Key is already revoked.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        key.status = UserSSHKey.STATUS_REVOKED
        key.save(update_fields=['status', 'updated_at'])
        _log(
            request.user, 'ssh_key_revoked', 'ssh_key', key.id,
            {'fingerprint': key.fingerprint, 'title': key.title},
        )
        return Response(UserSSHKeySerializer(key).data)


class GPGKeyViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserGPGKeySerializer
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def get_queryset(self):
        return UserGPGKey.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        key = serializer.save(user=self.request.user)
        _log(
            self.request.user, 'gpg_key_created', 'gpg_key', key.id,
            {'fingerprint': key.fingerprint, 'key_id': key.key_id},
        )

    def perform_destroy(self, instance):
        _log(
            self.request.user, 'gpg_key_deleted', 'gpg_key', instance.id,
            {'fingerprint': instance.fingerprint, 'key_id': instance.key_id},
        )
        instance.delete()

    @action(detail=True, methods=['post'])
    def revoke(self, request, pk=None):
        key = self.get_object()
        if key.status == UserGPGKey.STATUS_REVOKED:
            return Response(
                {'detail': 'Key is already revoked.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        key.status = UserGPGKey.STATUS_REVOKED
        key.save(update_fields=['status', 'updated_at'])
        _log(
            request.user, 'gpg_key_revoked', 'gpg_key', key.id,
            {'fingerprint': key.fingerprint, 'key_id': key.key_id},
        )
        return Response(UserGPGKeySerializer(key).data)

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Mark a GPG key as verified (direct trust for initial implementation)."""
        key = self.get_object()
        if key.status == UserGPGKey.STATUS_VERIFIED:
            return Response(
                {'detail': 'Key is already verified.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if key.status == UserGPGKey.STATUS_REVOKED:
            return Response(
                {'detail': 'Revoked keys cannot be verified.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        key.status = UserGPGKey.STATUS_VERIFIED
        key.save(update_fields=['status', 'updated_at'])
        _log(
            request.user, 'gpg_key_verified', 'gpg_key', key.id,
            {'fingerprint': key.fingerprint, 'key_id': key.key_id},
        )
        return Response(UserGPGKeySerializer(key).data)
