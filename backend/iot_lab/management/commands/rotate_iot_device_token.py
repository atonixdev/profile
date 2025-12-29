from __future__ import annotations

import secrets

from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand
from django.db import transaction

from iot_lab.models import Device, DeviceToken, SecurityEvent


class Command(BaseCommand):
    help = "Rotate a device token (prints plaintext once). Intended for admin/operator workflows."

    def add_arguments(self, parser):
        parser.add_argument("device_id", type=int, help="Device id")
        parser.add_argument("--label", default="agent", help="Token label to rotate (default: agent)")
        parser.add_argument(
            "--keep-old",
            action="store_true",
            help="Do not revoke existing tokens with the same label.",
        )

    def handle(self, *args, **options):
        device_id = int(options["device_id"])
        label = str(options["label"] or "agent").strip() or "agent"
        revoke_old = not bool(options["keep_old"])

        device = Device.objects.filter(id=device_id).first()
        if not device:
            self.stderr.write(self.style.ERROR("Device not found"))
            raise SystemExit(1)

        plain = secrets.token_urlsafe(32)

        with transaction.atomic():
            if revoke_old:
                DeviceToken.objects.filter(device_id=device_id, label=label, revoked=False).update(revoked=True)
            DeviceToken.objects.create(device_id=device_id, label=label, token_hash=make_password(plain), created_by=None)

            SecurityEvent.objects.create(
                device=device,
                event_type="device_token_rotated",
                message="Device token rotated via management command",
                metadata={"label": label, "revoke_old": revoke_old},
                created_by=None,
            )

        # Print ONLY to stdout so operators can capture it once.
        self.stdout.write(self.style.SUCCESS(f"Rotated token for device_id={device_id} label={label}"))
        self.stdout.write(plain)
