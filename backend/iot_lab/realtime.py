from __future__ import annotations

from typing import Any, Dict, Optional


def device_group(device_id: int) -> str:
    return f"iot_device_{int(device_id)}"


def command_group(command_id: int) -> str:
    return f"iot_command_{int(command_id)}"


def telemetry_group(device_id: int) -> str:
    return f"iot_telemetry_{int(device_id)}"


def network_group() -> str:
    return "iot_network"


def alerts_group() -> str:
    return "iot_alerts"


def _send(group: str, message: Dict[str, Any]) -> None:
    """Best-effort group_send from sync code (views).

    No-op if Channels isn't configured or the layer isn't available.
    """

    try:
        from asgiref.sync import async_to_sync
        from channels.layers import get_channel_layer
    except Exception:
        return

    layer = get_channel_layer()
    if not layer:
        return

    async_to_sync(layer.group_send)(group, message)


def publish_device_update(device_id: int, payload: Dict[str, Any]) -> None:
    _send(
        device_group(device_id),
        {
            'type': 'iot.device_update',
            'payload': payload,
        },
    )


def publish_command_status(command_id: int, payload: Dict[str, Any]) -> None:
    _send(
        command_group(command_id),
        {
            'type': 'iot.command_status',
            'payload': payload,
        },
    )


def publish_command_log(command_id: int, payload: Dict[str, Any]) -> None:
    _send(
        command_group(command_id),
        {
            'type': 'iot.command_log',
            'payload': payload,
        },
    )


def publish_telemetry_record(device_id: int, payload: Dict[str, Any]) -> None:
    _send(
        telemetry_group(device_id),
        {
            'type': 'iot.telemetry_record',
            'payload': payload,
        },
    )


def publish_network_update(payload: Dict[str, Any]) -> None:
    _send(
        network_group(),
        {
            'type': 'iot.network_update',
            'payload': payload,
        },
    )


def publish_alert(payload: Dict[str, Any]) -> None:
    _send(
        alerts_group(),
        {
            'type': 'iot.alert',
            'payload': payload,
        },
    )
