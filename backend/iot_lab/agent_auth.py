from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from django.contrib.auth.hashers import check_password
from django.utils import timezone
from rest_framework.exceptions import AuthenticationFailed

from .models import Device, DeviceToken, SecurityEvent


@dataclass
class AgentAuthResult:
    device: Device
    token: DeviceToken


def _get_header(request, name: str) -> str:
    # DRF normalizes headers into META as HTTP_<NAME>
    key = f"HTTP_{name.upper().replace('-', '_')}"
    return (request.META.get(key) or '').strip()


def authenticate_agent(request) -> AgentAuthResult:
    """Authenticate a device agent using headers.

    Expected headers:
      - X-Device-Id: <device id>
      - X-Device-Token: <plain token>

    Raises AuthenticationFailed on any issue.
    """

    device_id = _get_header(request, 'X-Device-Id')
    token_plain = _get_header(request, 'X-Device-Token')

    if not device_id or not token_plain:
        raise AuthenticationFailed('Missing device credentials')

    try:
        device_id_int = int(device_id)
    except ValueError as e:
        raise AuthenticationFailed('Invalid device id') from e

    device = Device.objects.filter(id=device_id_int, is_active=True).first()
    if not device:
        raise AuthenticationFailed('Unknown or inactive device')

    tokens = DeviceToken.objects.filter(device=device, revoked=False).order_by('-created_at')
    matched: Optional[DeviceToken] = None
    for t in tokens:
        if t.token_hash and check_password(token_plain, t.token_hash):
            matched = t
            break

    if not matched:
        try:
            SecurityEvent.objects.create(
                device=device,
                event_type='agent_auth_failed',
                message='Invalid device token presented',
                metadata={},
                created_by=None,
            )
        except Exception:
            pass
        raise AuthenticationFailed('Invalid device token')

    matched.last_used_at = timezone.now()
    matched.save(update_fields=['last_used_at'])

    return AgentAuthResult(device=device, token=matched)
