from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Optional, Tuple

from django.db import transaction

from .models import DeviceCommand, IrrigationEvent, IrrigationZone


@dataclass(frozen=True)
class EnqueueIrrigationResult:
    command: DeviceCommand
    event: IrrigationEvent


def enqueue_irrigation_for_zone(
    *,
    zone: IrrigationZone,
    duration_seconds: int,
    requested_by=None,
    source: str = 'manual',
    metadata: Optional[dict[str, Any]] = None,
) -> EnqueueIrrigationResult:
    """Create a DeviceCommand + IrrigationEvent for a zone.

    This is used by both manual API triggers and rule engine commands.
    """

    duration_seconds = int(duration_seconds)

    if not zone.device_id:
        raise ValueError('Zone has no device assigned')

    payload = dict(zone.actuator_config or {})

    if zone.actuator_kind == IrrigationZone.ActuatorKind.GPIO_WRITE:
        if 'pin' not in payload:
            raise ValueError('actuator_config.pin is required for gpio_write')
        payload.setdefault('value', 1)
        payload['duration_seconds'] = duration_seconds
        kind = DeviceCommand.Kind.GPIO_WRITE
    else:
        if 'message' not in payload:
            payload['message'] = f"IRRIGATE {zone.id} {duration_seconds}"
        kind = DeviceCommand.Kind.ARDUINO_SERIAL

    meta = {'source': source}
    if isinstance(metadata, dict):
        meta.update(metadata)

    with transaction.atomic():
        cmd = DeviceCommand.objects.create(
            device_id=zone.device_id,
            kind=kind,
            payload=payload,
            requested_by=requested_by,
        )

        event = IrrigationEvent.objects.create(
            zone=zone,
            device_id=zone.device_id,
            command=cmd,
            status=IrrigationEvent.Status.QUEUED,
            requested_by=requested_by,
            planned_duration_seconds=duration_seconds,
            metadata=meta,
        )

    return EnqueueIrrigationResult(command=cmd, event=event)
