from __future__ import annotations

import json
from datetime import timedelta
from typing import Any, Dict, List, Optional

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.utils import timezone

from .models import Device, DeviceCommand, DeviceCommandLog, TelemetryRecord
from .realtime import command_group, device_group, telemetry_group, network_group


class _AuthRequiredConsumer(AsyncWebsocketConsumer):
    """Base consumer that requires a logged-in Django user (session/cookie auth)."""

    async def connect(self):
        user = self.scope.get('user')
        if not user or not getattr(user, 'is_authenticated', False):
            await self.close(code=4401)
            return
        await super().connect()


class CommandStreamConsumer(_AuthRequiredConsumer):
    """Stream command status + logs in real-time.

    WS path: /ws/iot-lab/commands/<command_id>/
    Messages:
      - {type: "init", command: {...}, logs: [...]}
      - {type: "status", command: {...}}
      - {type: "log", log: {...}}
    """

    command_id: Optional[int] = None
    group: Optional[str] = None

    async def connect(self):
        await super().connect()
        try:
            self.command_id = int(self.scope['url_route']['kwargs']['command_id'])
        except Exception:
            await self.close(code=4400)
            return

        self.group = command_group(self.command_id)
        await self.channel_layer.group_add(self.group, self.channel_name)
        await self.accept()

        init = await self._build_init(self.command_id)
        await self.send(text_data=json.dumps(init))

    async def disconnect(self, code):
        if self.group:
            try:
                await self.channel_layer.group_discard(self.group, self.channel_name)
            except Exception:
                pass

    async def receive(self, text_data=None, bytes_data=None):
        # No client->server messages in phase-1
        return

    async def iot_command_status(self, event: Dict[str, Any]):
        payload = event.get('payload') or {}
        await self.send(text_data=json.dumps({'type': 'status', 'command': payload}))

    async def iot_command_log(self, event: Dict[str, Any]):
        payload = event.get('payload') or {}
        await self.send(text_data=json.dumps({'type': 'log', 'log': payload}))

    @database_sync_to_async
    def _build_init(self, command_id: int) -> Dict[str, Any]:
        cmd = DeviceCommand.objects.select_related('device').filter(id=command_id).first()
        if not cmd:
            return {'type': 'init', 'command': None, 'logs': []}

        logs_qs = DeviceCommandLog.objects.filter(command_id=command_id).order_by('id')[:200]
        logs = [
            {
                'id': l.id,
                'stream': l.stream,
                'message': l.message,
                'ts': l.ts.isoformat() if l.ts else None,
            }
            for l in logs_qs
        ]

        command = {
            'id': cmd.id,
            'device': cmd.device_id,
            'device_name': cmd.device.name if cmd.device_id else None,
            'kind': cmd.kind,
            'payload': cmd.payload,
            'status': cmd.status,
            'queued_at': cmd.queued_at.isoformat() if cmd.queued_at else None,
            'delivered_at': cmd.delivered_at.isoformat() if cmd.delivered_at else None,
            'started_at': cmd.started_at.isoformat() if cmd.started_at else None,
            'finished_at': cmd.finished_at.isoformat() if cmd.finished_at else None,
            'exit_code': cmd.exit_code,
            'stdout': cmd.stdout,
            'stderr': cmd.stderr,
            'error': cmd.error,
        }

        return {'type': 'init', 'command': command, 'logs': logs}


class DeviceStreamConsumer(_AuthRequiredConsumer):
    """Stream device heartbeat/status updates.

    WS path: /ws/iot-lab/devices/<device_id>/
    Messages:
      - {type: "init", device: {...}}
      - {type: "device", device: {...}}
    """

    device_id: Optional[int] = None
    group: Optional[str] = None

    async def connect(self):
        await super().connect()
        try:
            self.device_id = int(self.scope['url_route']['kwargs']['device_id'])
        except Exception:
            await self.close(code=4400)
            return

        self.group = device_group(self.device_id)
        await self.channel_layer.group_add(self.group, self.channel_name)
        await self.accept()

        init = await self._build_init(self.device_id)
        await self.send(text_data=json.dumps(init))

    async def disconnect(self, code):
        if self.group:
            try:
                await self.channel_layer.group_discard(self.group, self.channel_name)
            except Exception:
                pass

    async def receive(self, text_data=None, bytes_data=None):
        return

    async def iot_device_update(self, event: Dict[str, Any]):
        payload = event.get('payload') or {}
        await self.send(text_data=json.dumps({'type': 'device', 'device': payload}))

    @database_sync_to_async
    def _build_init(self, device_id: int) -> Dict[str, Any]:
        d = Device.objects.filter(id=device_id).first()
        if not d:
            return {'type': 'init', 'device': None}
        return {
            'type': 'init',
            'device': {
                'id': d.id,
                'name': d.name,
                'device_type': d.device_type,
                'location': d.location,
                'status': d.status,
                'last_seen_at': d.last_seen_at.isoformat() if d.last_seen_at else None,
                'metadata': d.metadata,
                'is_active': d.is_active,
            },
        }


class TelemetryStreamConsumer(_AuthRequiredConsumer):
    """Stream telemetry events for a device.

    WS path: /ws/iot-lab/telemetry/<device_id>/
    Messages:
      - {type: "init", device: {...}, records: [...]}
      - {type: "record", record: {...}}
    """

    device_id: Optional[int] = None
    group: Optional[str] = None

    async def connect(self):
        await super().connect()
        try:
            self.device_id = int(self.scope['url_route']['kwargs']['device_id'])
        except Exception:
            await self.close(code=4400)
            return

        self.group = telemetry_group(self.device_id)
        await self.channel_layer.group_add(self.group, self.channel_name)
        await self.accept()

        init = await self._build_init(self.device_id)
        await self.send(text_data=json.dumps(init))

    async def disconnect(self, code):
        if self.group:
            try:
                await self.channel_layer.group_discard(self.group, self.channel_name)
            except Exception:
                pass

    async def receive(self, text_data=None, bytes_data=None):
        return

    async def iot_telemetry_record(self, event: Dict[str, Any]):
        payload = event.get('payload') or {}
        await self.send(text_data=json.dumps({'type': 'record', 'record': payload}))

    @database_sync_to_async
    def _build_init(self, device_id: int) -> Dict[str, Any]:
        d = Device.objects.filter(id=device_id).first()
        if not d:
            return {'type': 'init', 'device': None, 'records': []}

        # Last 50 telemetry points
        qs = TelemetryRecord.objects.filter(device_id=device_id).order_by('-timestamp', '-id')[:50]
        records = []
        for r in qs:
            records.append(
                {
                    'id': r.id,
                    'device': r.device_id,
                    'device_name': d.name,
                    'timestamp': r.timestamp.isoformat() if r.timestamp else None,
                    'metrics': r.metrics,
                    'raw_text': r.raw_text,
                    'created_at': r.created_at.isoformat() if r.created_at else None,
                }
            )

        return {
            'type': 'init',
            'device': {
                'id': d.id,
                'name': d.name,
                'device_type': d.device_type,
                'location': d.location,
                'status': d.status,
                'last_seen_at': d.last_seen_at.isoformat() if d.last_seen_at else None,
                'metadata': d.metadata,
            },
            'records': records,
        }


class NetworkStreamConsumer(_AuthRequiredConsumer):
    """Stream network summary updates.

    WS path: /ws/iot-lab/network/
    Messages:
      - {type: "init", summary: {...}}
      - {type: "update", summary: {...}}
    """

    group: str = network_group()

    async def connect(self):
        await super().connect()
        await self.channel_layer.group_add(self.group, self.channel_name)
        await self.accept()
        init = await self._build_summary()
        await self.send(text_data=json.dumps({'type': 'init', 'summary': init}))

    async def disconnect(self, code):
        try:
            await self.channel_layer.group_discard(self.group, self.channel_name)
        except Exception:
            pass

    async def receive(self, text_data=None, bytes_data=None):
        return

    async def iot_network_update(self, event: Dict[str, Any]):
        summary = await self._build_summary()
        await self.send(text_data=json.dumps({'type': 'update', 'summary': summary}))

    @database_sync_to_async
    def _build_summary(self) -> Dict[str, Any]:
        now = timezone.now()
        online_window_minutes = 5
        online_window = now - timedelta(minutes=online_window_minutes)

        devices_qs = Device.objects.filter(is_active=True)
        total = devices_qs.count()
        online = devices_qs.filter(last_seen_at__gte=online_window).count()
        offline = max(total - online, 0)

        telemetry_last_hour = TelemetryRecord.objects.filter(timestamp__gte=now - timedelta(hours=1)).count()
        telemetry_last_day = TelemetryRecord.objects.filter(timestamp__gte=now - timedelta(days=1)).count()

        return {
            'captured_at': now.isoformat(),
            'online_window_minutes': online_window_minutes,
            'devices': {'total': total, 'online': online, 'offline': offline},
            'telemetry': {'last_hour_count': telemetry_last_hour, 'last_day_count': telemetry_last_day},
        }
