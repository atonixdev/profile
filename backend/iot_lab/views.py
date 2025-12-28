from datetime import timedelta

import secrets

from django.db.models import Count
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status as drf_status

from rest_framework.permissions import IsAdminUser

from .models import Device, TelemetryRecord, AutomationJob, DeviceToken, DeviceCommand, DeviceCommandLog
from .permissions import ReadOnlyOrAuthenticatedWrite
from .serializers import (
    DeviceSerializer,
    TelemetryRecordSerializer,
    AutomationJobSerializer,
    DeviceTokenSerializer,
    DeviceCommandSerializer,
    DeviceCommandCreateSerializer,
    DeviceCommandLogSerializer,
)

from .realtime import publish_command_status, publish_telemetry_record, publish_network_update


class DeviceViewSet(viewsets.ModelViewSet):
    serializer_class = DeviceSerializer
    permission_classes = [ReadOnlyOrAuthenticatedWrite]

    def get_queryset(self):
        qs = Device.objects.all()
        if not (self.request.user and self.request.user.is_staff):
            qs = qs.filter(is_active=True)
        return qs.order_by('-updated_at', '-id')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)


class TelemetryRecordViewSet(viewsets.ModelViewSet):
    serializer_class = TelemetryRecordSerializer
    permission_classes = [ReadOnlyOrAuthenticatedWrite]

    def get_queryset(self):
        qs = TelemetryRecord.objects.select_related('device')
        if not (self.request.user and self.request.user.is_staff):
            qs = qs.filter(device__is_active=True)

        device_id = self.request.query_params.get('device')
        if device_id:
            qs = qs.filter(device_id=device_id)

        return qs

    def perform_create(self, serializer):
        record = serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)
        # Update device heartbeat/status
        Device.objects.filter(id=record.device_id).update(last_seen_at=record.timestamp, status=Device.Status.ONLINE)

        publish_telemetry_record(
            record.device_id,
            {
                'id': record.id,
                'device': record.device_id,
                'device_name': getattr(record.device, 'name', None) if hasattr(record, 'device') else None,
                'timestamp': record.timestamp.isoformat() if record.timestamp else None,
                'metrics': record.metrics,
                'raw_text': record.raw_text,
                'created_at': record.created_at.isoformat() if record.created_at else None,
            },
        )

        publish_network_update({'reason': 'telemetry_created', 'device_id': record.device_id, 'telemetry_id': record.id})


class AutomationJobViewSet(viewsets.ModelViewSet):
    serializer_class = AutomationJobSerializer
    permission_classes = [ReadOnlyOrAuthenticatedWrite]

    def get_queryset(self):
        qs = AutomationJob.objects.all()
        if not (self.request.user and self.request.user.is_staff):
            qs = qs.filter(is_active=True)
        return qs.order_by('-updated_at', '-id')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)

    @action(detail=True, methods=['post'])
    def run(self, request, pk=None):
        job = self.get_object()
        job.last_run_at = timezone.now()
        job.last_run_status = AutomationJob.LastRunStatus.SUCCEEDED
        job.save(update_fields=['last_run_at', 'last_run_status'])
        return Response({'detail': 'Automation executed', 'id': job.id, 'last_run_at': job.last_run_at, 'last_run_status': job.last_run_status})


class NetworkViewSet(viewsets.ViewSet):
    permission_classes = [ReadOnlyOrAuthenticatedWrite]

    @action(detail=False, methods=['get'])
    def summary(self, request):
        now = timezone.now()
        online_window_minutes = 5
        online_window = now - timedelta(minutes=online_window_minutes)

        devices_qs = Device.objects.filter(is_active=True)
        total = devices_qs.count()
        online = devices_qs.filter(last_seen_at__gte=online_window).count()
        offline = max(total - online, 0)

        telemetry_last_hour = TelemetryRecord.objects.filter(timestamp__gte=now - timedelta(hours=1)).count()
        telemetry_last_day = TelemetryRecord.objects.filter(timestamp__gte=now - timedelta(days=1)).count()

        return Response(
            {
                'captured_at': now.isoformat(),
                'online_window_minutes': online_window_minutes,
                'devices': {
                    'total': total,
                    'online': online,
                    'offline': offline,
                },
                'telemetry': {
                    'last_hour_count': telemetry_last_hour,
                    'last_day_count': telemetry_last_day,
                },
            }
        )


class DeviceTokenViewSet(viewsets.ModelViewSet):
    """Admin-only endpoint to mint device tokens (plaintext returned once)."""

    serializer_class = DeviceTokenSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return DeviceToken.objects.select_related('device').order_by('-created_at', '-id')

    def create(self, request, *args, **kwargs):
        device_id = request.data.get('device')
        label = (request.data.get('label') or '').strip()

        if not device_id:
            return Response({'detail': 'device is required'}, status=drf_status.HTTP_400_BAD_REQUEST)

        device = Device.objects.filter(id=device_id).first()
        if not device:
            return Response({'detail': 'Device not found'}, status=drf_status.HTTP_404_NOT_FOUND)

        plain = secrets.token_urlsafe(32)
        token = DeviceToken.objects.create(
            device=device,
            label=label,
            token_hash=make_password(plain),
            created_by=request.user,
        )

        data = DeviceTokenSerializer(token).data
        data['token'] = plain
        return Response(data, status=drf_status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def revoke(self, request, pk=None):
        token = self.get_object()
        token.revoked = True
        token.save(update_fields=['revoked'])
        return Response({'detail': 'revoked', 'id': token.id})


class DeviceCommandViewSet(viewsets.ModelViewSet):
    permission_classes = [ReadOnlyOrAuthenticatedWrite]

    def get_serializer_class(self):
        if self.action == 'create':
            return DeviceCommandCreateSerializer
        return DeviceCommandSerializer

    def get_queryset(self):
        qs = DeviceCommand.objects.select_related('device')
        device_id = self.request.query_params.get('device')
        if device_id:
            qs = qs.filter(device_id=device_id)
        return qs.order_by('-queued_at', '-id')

    def perform_create(self, serializer):
        cmd = serializer.save(requested_by=self.request.user if self.request.user.is_authenticated else None)
        publish_command_status(
            cmd.id,
            {
                'id': cmd.id,
                'device': cmd.device_id,
                'kind': cmd.kind,
                'payload': cmd.payload,
                'status': cmd.status,
                'queued_at': cmd.queued_at.isoformat() if cmd.queued_at else None,
            },
        )

    @action(detail=True, methods=['get'])
    def logs(self, request, pk=None):
        cmd = self.get_object()
        after_id = request.query_params.get('after_id')
        limit = request.query_params.get('limit')

        qs = DeviceCommandLog.objects.filter(command=cmd).order_by('id')
        if after_id:
            try:
                qs = qs.filter(id__gt=int(after_id))
            except ValueError:
                pass
        if limit:
            try:
                qs = qs[: int(limit)]
            except ValueError:
                qs = qs[:500]
        else:
            qs = qs[:500]

        return Response(DeviceCommandLogSerializer(qs, many=True).data)
