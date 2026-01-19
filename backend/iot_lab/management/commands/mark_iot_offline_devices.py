from __future__ import annotations

from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from iot_lab.models import Alert, Device
from iot_lab.realtime import publish_device_update


class Command(BaseCommand):
    help = "Mark IoT devices offline if they haven't been seen within a time window."

    def add_arguments(self, parser):
        parser.add_argument("--minutes", type=int, default=5, help="Minutes since last_seen_at to consider offline.")
        parser.add_argument(
            "--create-alerts",
            action="store_true",
            help="Create an Alert when a device transitions to offline.",
        )

    def handle(self, *args, **options):
        minutes = max(1, int(options["minutes"] or 5))
        create_alerts = bool(options["create_alerts"])

        now = timezone.now()
        cutoff = now - timedelta(minutes=minutes)

        qs = Device.objects.filter(is_active=True)

        newly_offline = []
        for device in qs:
            last_seen = device.last_seen_at
            is_offline = (last_seen is None) or (last_seen < cutoff)
            if is_offline and device.status != Device.Status.OFFLINE:
                device.status = Device.Status.OFFLINE
                device.save(update_fields=["status", "updated_at"])
                newly_offline.append(device)

                publish_device_update(
                    device.id,
                    {
                        "id": device.id,
                        "status": device.status,
                        "last_seen_at": device.last_seen_at.isoformat() if device.last_seen_at else None,
                        "metadata": device.metadata,
                    },
                )

                if create_alerts:
                    Alert.objects.create(
                        device=device,
                        title="Device offline",
                        message=f"Device '{device.name}' has not checked in for {minutes} minutes.",
                        severity=Alert.Severity.WARNING,
                        category="device",
                        metadata={"offline_minutes": minutes, "last_seen_at": device.last_seen_at.isoformat() if device.last_seen_at else None},
                        created_by=None,
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f"Checked {qs.count()} devices. Newly offline: {len(newly_offline)} (window={minutes}m)."
            )
        )
