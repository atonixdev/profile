from __future__ import annotations

from django.db import transaction
from django.utils import timezone
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .agent_auth import authenticate_agent
from .models import Device, DeviceCommand, DeviceCommandLog
from .realtime import publish_command_log, publish_command_status, publish_device_update, publish_network_update
from .automation_engine import run_jobs_for_event


class AgentHeartbeatView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        auth = authenticate_agent(request)
        device = auth.device

        status = (request.data.get('status') or '').strip() or Device.Status.ONLINE
        metrics = request.data.get('metrics') or {}
        meta = request.data.get('metadata') or {}

        # Merge metadata shallowly
        merged = dict(device.metadata or {})
        if isinstance(meta, dict):
            merged.update(meta)
        if isinstance(metrics, dict):
            merged['health'] = metrics

        Device.objects.filter(id=device.id).update(
            status=status,
            last_seen_at=timezone.now(),
            metadata=merged,
        )

        publish_device_update(
            device.id,
            {
                'id': device.id,
                'status': status,
                'last_seen_at': timezone.now().isoformat(),
                'metadata': merged,
            },
        )

        # Let Network Health update automatically.
        publish_network_update({'reason': 'device_heartbeat', 'device_id': device.id})

        # Fire any heartbeat-driven automations.
        try:
            run_jobs_for_event(event_type='heartbeat', device=device)
        except Exception:
            pass

        return Response({'detail': 'ok', 'device_id': device.id, 'status': status})


class AgentNextCommandView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        auth = authenticate_agent(request)
        device = auth.device

        cmd = (
            DeviceCommand.objects.filter(device=device, status=DeviceCommand.Status.QUEUED)
            .order_by('queued_at', 'id')
            .first()
        )

        if not cmd:
            return Response({'command': None})

        cmd.status = DeviceCommand.Status.DELIVERED
        cmd.delivered_at = timezone.now()
        cmd.save(update_fields=['status', 'delivered_at'])

        publish_command_status(
            cmd.id,
            {
                'id': cmd.id,
                'device': cmd.device_id,
                'kind': cmd.kind,
                'payload': cmd.payload,
                'status': cmd.status,
                'queued_at': cmd.queued_at.isoformat() if cmd.queued_at else None,
                'delivered_at': cmd.delivered_at.isoformat() if cmd.delivered_at else None,
            },
        )

        return Response(
            {
                'command': {
                    'id': cmd.id,
                    'device_id': cmd.device_id,
                    'kind': cmd.kind,
                    'payload': cmd.payload,
                    'status': cmd.status,
                    'queued_at': cmd.queued_at.isoformat() if cmd.queued_at else None,
                }
            }
        )


class AgentCommandStartView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, command_id: int):
        auth = authenticate_agent(request)
        device = auth.device

        cmd = DeviceCommand.objects.filter(id=command_id, device=device).first()
        if not cmd:
            return Response({'detail': 'Command not found'}, status=404)

        if cmd.status in {DeviceCommand.Status.SUCCEEDED, DeviceCommand.Status.FAILED, DeviceCommand.Status.CANCELED}:
            return Response({'detail': 'Command already finished', 'status': cmd.status}, status=409)

        cmd.status = DeviceCommand.Status.RUNNING
        cmd.started_at = timezone.now()
        cmd.save(update_fields=['status', 'started_at'])

        publish_command_status(
            cmd.id,
            {
                'id': cmd.id,
                'device': cmd.device_id,
                'status': cmd.status,
                'started_at': cmd.started_at.isoformat() if cmd.started_at else None,
            },
        )

        return Response({'detail': 'started', 'id': cmd.id})


class AgentCommandLogView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, command_id: int):
        auth = authenticate_agent(request)
        device = auth.device

        cmd = DeviceCommand.objects.filter(id=command_id, device=device).first()
        if not cmd:
            return Response({'detail': 'Command not found'}, status=404)

        stream = (request.data.get('stream') or 'log').strip()
        message = request.data.get('message')
        if message is None:
            return Response({'detail': 'message is required'}, status=400)

        # Basic size guard
        msg = str(message)
        if len(msg) > 5000:
            msg = msg[:5000] + '…'

        row = DeviceCommandLog.objects.create(command=cmd, stream=stream, message=msg)

        publish_command_log(
            cmd.id,
            {
                'id': row.id,
                'command': cmd.id,
                'stream': row.stream,
                'message': row.message,
                'ts': row.ts.isoformat() if row.ts else None,
            },
        )
        return Response({'detail': 'logged'})


class AgentCommandFinishView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, command_id: int):
        auth = authenticate_agent(request)
        device = auth.device

        cmd = DeviceCommand.objects.filter(id=command_id, device=device).first()
        if not cmd:
            return Response({'detail': 'Command not found'}, status=404)

        status = (request.data.get('status') or '').strip().lower()
        exit_code = request.data.get('exit_code')
        stdout = request.data.get('stdout') or ''
        stderr = request.data.get('stderr') or ''
        error = request.data.get('error') or ''

        final_status = DeviceCommand.Status.SUCCEEDED if status == 'succeeded' else DeviceCommand.Status.FAILED

        with transaction.atomic():
            cmd.status = final_status
            cmd.finished_at = timezone.now()
            cmd.exit_code = exit_code if isinstance(exit_code, int) else cmd.exit_code
            cmd.stdout = str(stdout)[:200000]
            cmd.stderr = str(stderr)[:200000]
            cmd.error = str(error)[:200000]
            cmd.save(update_fields=['status', 'finished_at', 'exit_code', 'stdout', 'stderr', 'error'])

        publish_command_status(
            cmd.id,
            {
                'id': cmd.id,
                'device': cmd.device_id,
                'status': cmd.status,
                'finished_at': cmd.finished_at.isoformat() if cmd.finished_at else None,
                'exit_code': cmd.exit_code,
                'stdout': cmd.stdout,
                'stderr': cmd.stderr,
                'error': cmd.error,
            },
        )

        publish_network_update({'reason': 'command_finished', 'device_id': cmd.device_id, 'command_id': cmd.id})

        return Response({'detail': 'finished', 'id': cmd.id, 'status': cmd.status})
