from __future__ import annotations

import secrets

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand

from iot_lab.models import Device, DeviceToken


class Command(BaseCommand):
    help = "Mint a new device token for an existing device (printed once)."

    def add_arguments(self, parser):
        parser.add_argument("device_id", type=int)
        parser.add_argument("--label", default="agent")
        parser.add_argument("--created-by", default="")

    def handle(self, *args, **options):
        device_id = int(options["device_id"])
        label = (options["label"] or "").strip()
        created_by_username = (options["created_by"] or "").strip()

        device = Device.objects.filter(id=device_id).first()
        if not device:
            self.stderr.write("Device not found")
            return

        created_by = None
        if created_by_username:
            User = get_user_model()
            created_by = User.objects.filter(username=created_by_username).first()
            if not created_by:
                self.stderr.write(f"User not found: {created_by_username}")

        plain = secrets.token_urlsafe(32)
        token = DeviceToken.objects.create(
            device=device,
            label=label,
            token_hash=make_password(plain),
            created_by=created_by,
        )

        self.stdout.write("Minted device token (store securely; shown once):")
        self.stdout.write(f"  device_id: {device.id}")
        self.stdout.write(f"  token_id: {token.id}")
        self.stdout.write(f"  token: {plain}")
