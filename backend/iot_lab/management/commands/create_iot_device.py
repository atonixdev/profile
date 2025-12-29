from __future__ import annotations

import secrets

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand

from iot_lab.models import Device, DeviceToken


class Command(BaseCommand):
    help = "Create an IoT device and mint a device token (printed once)."

    def add_arguments(self, parser):
        parser.add_argument("--name", required=True)
        parser.add_argument("--device-type", default="raspberry_pi")
        parser.add_argument("--location", default="")
        parser.add_argument("--label", default="agent")
        parser.add_argument("--created-by", default="")

    def handle(self, *args, **options):
        name = options["name"].strip()
        device_type = (options["device_type"] or "").strip()
        location = (options["location"] or "").strip()
        label = (options["label"] or "").strip()
        created_by_username = (options["created_by"] or "").strip()

        created_by = None
        if created_by_username:
            User = get_user_model()
            created_by = User.objects.filter(username=created_by_username).first()
            if not created_by:
                self.stderr.write(f"User not found: {created_by_username}")

        device = Device.objects.create(
            name=name,
            device_type=device_type,
            location=location,
            status=Device.Status.UNKNOWN,
            is_active=True,
            created_by=created_by,
        )

        plain = secrets.token_urlsafe(32)
        token = DeviceToken.objects.create(
            device=device,
            label=label,
            token_hash=make_password(plain),
            created_by=created_by,
        )

        self.stdout.write("Created device:")
        self.stdout.write(f"  id: {device.id}")
        self.stdout.write(f"  name: {device.name}")
        self.stdout.write(f"  type: {device.device_type}")
        self.stdout.write(f"  location: {device.location}")
        self.stdout.write("\nDevice token (store securely; shown once):")
        self.stdout.write(f"  device_id: {device.id}")
        self.stdout.write(f"  token_id: {token.id}")
        self.stdout.write(f"  token: {plain}")
