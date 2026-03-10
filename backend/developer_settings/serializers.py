from rest_framework import serializers
from django.utils import timezone

from .models import UserSSHKey, UserGPGKey
from .key_utils import parse_ssh_public_key, parse_gpg_public_key


class UserSSHKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSSHKey
        fields = [
            'id', 'title', 'public_key', 'fingerprint', 'algorithm',
            'created_at', 'expires_at', 'last_used_at', 'status',
        ]
        read_only_fields = [
            'id', 'fingerprint', 'algorithm', 'created_at', 'last_used_at', 'status',
        ]

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Title is required.")
        if len(value) > 255:
            raise serializers.ValidationError("Title must be 255 characters or fewer.")
        return value

    def validate(self, attrs):
        public_key = attrs.get('public_key', '').strip()
        if not public_key:
            raise serializers.ValidationError({'public_key': 'Public key is required.'})

        try:
            algorithm, fingerprint = parse_ssh_public_key(public_key)
        except ValueError as exc:
            raise serializers.ValidationError({'public_key': str(exc)})

        user = self.context['request'].user

        if user.ssh_keys.filter(status=UserSSHKey.STATUS_ACTIVE).count() >= 20:
            raise serializers.ValidationError(
                'SSH key limit reached. Maximum 20 active keys per account.'
            )

        if user.ssh_keys.filter(fingerprint=fingerprint).exists():
            raise serializers.ValidationError(
                {'public_key': 'This SSH key is already registered on your account.'}
            )

        expires_at = attrs.get('expires_at')
        if expires_at and expires_at <= timezone.now():
            raise serializers.ValidationError(
                {'expires_at': 'Expiration date must be in the future.'}
            )

        attrs['algorithm'] = algorithm
        attrs['fingerprint'] = fingerprint
        attrs['public_key'] = public_key
        return attrs


class UserGPGKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserGPGKey
        fields = [
            'id', 'public_key', 'key_id', 'fingerprint', 'primary_user_id',
            'created_at', 'expires_at', 'status',
        ]
        read_only_fields = [
            'id', 'key_id', 'fingerprint', 'primary_user_id',
            'expires_at', 'created_at', 'status',
        ]

    def validate(self, attrs):
        public_key = attrs.get('public_key', '').strip()
        if not public_key:
            raise serializers.ValidationError({'public_key': 'Public key is required.'})

        try:
            parsed = parse_gpg_public_key(public_key)
        except ValueError as exc:
            raise serializers.ValidationError({'public_key': str(exc)})

        user = self.context['request'].user

        if user.gpg_keys.filter(
            status__in=[UserGPGKey.STATUS_UNVERIFIED, UserGPGKey.STATUS_VERIFIED]
        ).count() >= 10:
            raise serializers.ValidationError(
                'GPG key limit reached. Maximum 10 active keys per account.'
            )

        if user.gpg_keys.filter(fingerprint=parsed['fingerprint']).exists():
            raise serializers.ValidationError(
                {'public_key': 'This GPG key is already registered on your account.'}
            )

        attrs['public_key'] = public_key
        attrs.update(parsed)
        return attrs
