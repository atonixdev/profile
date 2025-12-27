from datetime import timedelta

from django.db.models import Count
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Device, TelemetryRecord, AutomationJob
from .permissions import ReadOnlyOrAuthenticatedWrite
from .serializers import DeviceSerializer, TelemetryRecordSerializer, AutomationJobSerializer


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
