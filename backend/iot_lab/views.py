from datetime import timedelta

import secrets

from django.db.models import Count
from django.contrib.auth.hashers import make_password
from django.db import transaction
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status as drf_status
from rest_framework.exceptions import ValidationError

from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.permissions import AllowAny

from .models import (
    Device,
    TelemetryRecord,
    AutomationJob,
    DeviceToken,
    DeviceCommand,
    DeviceCommandLog,
    Alert,
    SecurityEvent,
    DeviceLease,
    WorkflowTemplate,
    AiInsight,
    FarmSite,
    WeatherForecast,
    IrrigationZone,
    IrrigationEvent,
    AgriField,
    AgriNode,
    AgriSensor,
    IrrigationRule,
)
from .permissions import ReadOnlyOrAuthenticatedWrite, AuthenticatedReadOnlyOrAdminWrite
from .serializers import (
    DeviceSerializer,
    TelemetryRecordSerializer,
    AutomationJobSerializer,
    DeviceTokenSerializer,
    DeviceCommandSerializer,
    DeviceCommandCreateSerializer,
    DeviceCommandLogSerializer,
    AlertSerializer,
    SecurityEventSerializer,
    DeviceLeaseSerializer,
    WorkflowTemplateSerializer,
    AiInsightSerializer,
    FarmSiteSerializer,
    WeatherForecastSerializer,
    IrrigationZoneSerializer,
    IrrigationEventSerializer,
    AgriFieldSerializer,
    AgriNodeSerializer,
    AgriSensorSerializer,
    IrrigationRuleSerializer,
)

from .realtime import publish_command_status, publish_telemetry_record, publish_network_update
from .automation_engine import run_job, run_jobs_for_event, AutomationContext
from .agent_auth import authenticate_agent
from .agri_utils import enqueue_irrigation_for_zone


def _parse_int(value, default: int) -> int:
    try:
        return int(value)
    except Exception:
        return default


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

        # Fire any telemetry-driven automations
        try:
            run_jobs_for_event(event_type='telemetry', telemetry=record, actor=self.request.user if self.request.user.is_authenticated else None)
        except Exception:
            # Avoid breaking telemetry ingestion if an automation fails.
            pass

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
        ctx = AutomationContext(event_type='manual')
        try:
            result = run_job(job, ctx, actor=request.user if request.user.is_authenticated else None)
            job.refresh_from_db(fields=['last_run_at', 'last_run_status'])
            return Response({'detail': 'Automation executed', 'id': job.id, 'last_run_at': job.last_run_at, 'last_run_status': job.last_run_status, 'result': result})
        except Exception as e:
            job.refresh_from_db(fields=['last_run_at', 'last_run_status'])
            return Response({'detail': str(e), 'id': job.id, 'last_run_at': job.last_run_at, 'last_run_status': job.last_run_status}, status=drf_status.HTTP_400_BAD_REQUEST)


class AlertViewSet(viewsets.ModelViewSet):
    serializer_class = AlertSerializer
    permission_classes = [ReadOnlyOrAuthenticatedWrite]

    def get_queryset(self):
        qs = Alert.objects.select_related('device').all()
        device_id = self.request.query_params.get('device')
        if device_id:
            qs = qs.filter(device_id=device_id)
        return qs.order_by('-created_at', '-id')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        row = self.get_object()
        row.resolved_at = timezone.now()
        row.save(update_fields=['resolved_at'])
        return Response({'detail': 'resolved', 'id': row.id, 'resolved_at': row.resolved_at})


class SecurityEventViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SecurityEventSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        qs = SecurityEvent.objects.select_related('device').all()
        device_id = self.request.query_params.get('device')
        if device_id:
            qs = qs.filter(device_id=device_id)
        return qs.order_by('-created_at', '-id')


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
        # Optional per-device policy enforcement.
        req_user = self.request.user if self.request.user.is_authenticated else None
        kind = serializer.validated_data.get('kind')
        device = serializer.validated_data.get('device')

        # Default safety policy: risky commands require staff.
        if kind in {DeviceCommand.Kind.RUN_PYTHON, DeviceCommand.Kind.REBOOT}:
            if not (req_user and req_user.is_staff):
                SecurityEvent.objects.create(
                    device=device,
                    event_type='command_blocked',
                    message='Risky command requires admin privileges',
                    metadata={'kind': kind},
                    created_by=req_user,
                )
                raise ValidationError({'detail': 'This command requires admin privileges'})

        policy = (device.metadata or {}).get('policy') if device else None
        allowed_kinds = None
        if isinstance(policy, dict):
            allowed_kinds = policy.get('allowed_kinds')

        if allowed_kinds is not None:
            if not isinstance(allowed_kinds, list) or kind not in allowed_kinds:
                SecurityEvent.objects.create(
                    device=device,
                    event_type='command_blocked',
                    message='Command kind blocked by device policy',
                    metadata={'kind': kind, 'allowed_kinds': allowed_kinds},
                    created_by=req_user,
                )
                raise ValidationError({'detail': 'Command blocked by device policy'})

        cmd = serializer.save(requested_by=req_user)
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


class DeviceLeaseViewSet(viewsets.ModelViewSet):
    serializer_class = DeviceLeaseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = DeviceLease.objects.select_related('device', 'user')
        if self.request.user and self.request.user.is_staff:
            return qs.order_by('-started_at', '-id')
        return qs.filter(user=self.request.user).order_by('-started_at', '-id')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def acquire(self, request):
        """Acquire a lease for a device.

        Payload:
          - device (optional): exact device id
          - device_type (optional)
          - minutes (optional): TTL minutes (default 60)
        """
        device_id = request.data.get('device')
        device_type = (request.data.get('device_type') or '').strip()

        minutes = request.data.get('minutes', 60)
        try:
            minutes = int(minutes)
        except (TypeError, ValueError):
            minutes = 60
        minutes = max(5, min(minutes, 24 * 60))

        now = timezone.now()
        expires_at = now + timedelta(minutes=minutes)

        with transaction.atomic():
            devices_qs = Device.objects.select_for_update().filter(is_active=True)
            if device_id:
                devices_qs = devices_qs.filter(id=device_id)
            if device_type:
                devices_qs = devices_qs.filter(device_type=device_type)

            # Exclude devices with an active (unended + unexpired) lease.
            active_lease_device_ids = (
                DeviceLease.objects.select_for_update()
                .filter(ended_at__isnull=True, expires_at__gt=now)
                .values_list('device_id', flat=True)
            )
            devices_qs = devices_qs.exclude(id__in=list(active_lease_device_ids))

            device = devices_qs.order_by('id').first()
            if not device:
                return Response({'detail': 'No available device'}, status=drf_status.HTTP_409_CONFLICT)

            lease = DeviceLease.objects.create(
                device=device,
                user=request.user,
                expires_at=expires_at,
                metadata={'requested_device_type': device_type} if device_type else {},
            )

        return Response(DeviceLeaseSerializer(lease).data, status=drf_status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def release(self, request, pk=None):
        lease = self.get_object()
        if not (request.user.is_staff or lease.user_id == request.user.id):
            return Response({'detail': 'Forbidden'}, status=drf_status.HTTP_403_FORBIDDEN)
        if lease.ended_at:
            return Response({'detail': 'already ended', 'id': lease.id})
        lease.ended_at = timezone.now()
        lease.save(update_fields=['ended_at'])
        return Response({'detail': 'ended', 'id': lease.id, 'ended_at': lease.ended_at})


class WorkflowTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = WorkflowTemplateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = WorkflowTemplate.objects.select_related('device', 'created_by')
        if self.request.user and self.request.user.is_staff:
            return qs.order_by('-updated_at', '-id')
        return qs.filter(created_by=self.request.user).order_by('-updated_at', '-id')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def run(self, request, pk=None):
        tmpl = self.get_object()
        device_id = request.data.get('device')
        device = None

        if device_id:
            device = Device.objects.filter(id=device_id).first()
        elif tmpl.device_id:
            device = tmpl.device

        if not device:
            return Response({'detail': 'device is required (either template.device or payload device)'}, status=drf_status.HTTP_400_BAD_REQUEST)
        if not device.is_active and not request.user.is_staff:
            return Response({'detail': 'Device not available'}, status=drf_status.HTTP_409_CONFLICT)

        steps = tmpl.steps or []
        if not isinstance(steps, list):
            return Response({'detail': 'invalid steps'}, status=drf_status.HTTP_400_BAD_REQUEST)

        risky = {DeviceCommand.Kind.RUN_PYTHON, DeviceCommand.Kind.REBOOT}
        allowed_kinds = {k for k, _ in DeviceCommand.Kind.choices}

        created_ids = []
        for step in steps:
            if not isinstance(step, dict):
                return Response({'detail': 'invalid workflow step'}, status=drf_status.HTTP_400_BAD_REQUEST)
            kind = step.get('kind')
            payload = step.get('payload') or {}

            if kind not in allowed_kinds:
                return Response({'detail': f'Unsupported kind: {kind}'}, status=drf_status.HTTP_400_BAD_REQUEST)
            if kind in risky and not request.user.is_staff:
                return Response({'detail': f'Command kind requires admin privileges: {kind}'}, status=drf_status.HTTP_403_FORBIDDEN)
            if not isinstance(payload, dict):
                return Response({'detail': 'step payload must be an object'}, status=drf_status.HTTP_400_BAD_REQUEST)

            cmd = DeviceCommand.objects.create(
                device=device,
                kind=kind,
                payload=payload,
                requested_by=request.user,
            )
            created_ids.append(cmd.id)

            publish_command_status(
                cmd.id,
                {
                    'id': cmd.id,
                    'device': cmd.device_id,
                    'kind': cmd.kind,
                    'payload': cmd.payload,
                    'status': cmd.status,
                    'queued_at': cmd.queued_at.isoformat() if cmd.queued_at else None,
                    'source': 'workflow_template',
                    'workflow_template_id': tmpl.id,
                },
            )

        return Response({'detail': 'queued', 'workflow_template_id': tmpl.id, 'device': device.id, 'command_ids': created_ids})


class AiInsightViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AiInsightSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = AiInsight.objects.select_related('device')
        if not (self.request.user and self.request.user.is_staff):
            qs = qs.filter(device__is_active=True)

        device_id = self.request.query_params.get('device')
        if device_id:
            qs = qs.filter(device_id=device_id)
        return qs.order_by('-created_at', '-id')


class FarmSiteViewSet(viewsets.ModelViewSet):
    serializer_class = FarmSiteSerializer
    permission_classes = [AuthenticatedReadOnlyOrAdminWrite]

    def get_queryset(self):
        qs = FarmSite.objects.select_related('default_device', 'created_by')
        if self.request.user and self.request.user.is_staff:
            return qs.order_by('-updated_at', '-id')
        # Keep farm locations private by default.
        return qs.filter(created_by=self.request.user).order_by('-updated_at', '-id')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)

    @action(detail=True, methods=['get'])
    def recommendations(self, request, pk=None):
        """Very simple irrigation recommendation (v1 rules).

        Returns per-zone status based on latest telemetry + next-hours rain probability.
        """
        site = self.get_object()

        hours = _parse_int(request.query_params.get('hours'), 6)
        hours = max(1, min(hours, 48))

        now = timezone.now()
        horizon = now + timedelta(hours=hours)

        forecast_qs = WeatherForecast.objects.filter(site=site, forecast_time__gte=now, forecast_time__lte=horizon)
        rain_probs = []
        temps = []
        for row in forecast_qs[:500]:
            m = row.metrics or {}
            rp = m.get('precipitation_probability')
            t = m.get('temperature_c')
            try:
                if rp is not None:
                    rain_probs.append(float(rp))
            except Exception:
                pass
            try:
                if t is not None:
                    temps.append(float(t))
            except Exception:
                pass

        max_rain_prob = max(rain_probs) if rain_probs else None
        max_temp_c = max(temps) if temps else None

        zones = IrrigationZone.objects.select_related('device').filter(site=site, is_active=True).order_by('id')
        out = []

        for zone in zones:
            device_id = zone.device_id
            moisture = None
            last_ts = None
            if device_id:
                rec = (
                    TelemetryRecord.objects.filter(device_id=device_id)
                    .only('timestamp', 'metrics')
                    .order_by('-timestamp', '-id')
                    .first()
                )
                if rec:
                    last_ts = rec.timestamp
                    try:
                        moisture = (rec.metrics or {}).get(zone.soil_moisture_metric)
                    except Exception:
                        moisture = None

            # v1: recommend irrigation if below min and rain prob not high.
            recommend = False
            reason = 'insufficient data'

            try:
                moisture_f = float(moisture) if moisture is not None else None
            except Exception:
                moisture_f = None

            if moisture_f is not None and zone.target_moisture_min is not None:
                recommend = moisture_f < float(zone.target_moisture_min)
                reason = 'soil below target minimum' if recommend else 'soil above target minimum'

            if recommend and max_rain_prob is not None:
                if float(max_rain_prob) >= 60.0:
                    recommend = False
                    reason = 'rain likely soon'

            out.append(
                {
                    'zone_id': zone.id,
                    'zone_name': zone.name,
                    'device_id': zone.device_id,
                    'soil_moisture': moisture,
                    'soil_moisture_metric': zone.soil_moisture_metric,
                    'last_telemetry_at': last_ts.isoformat() if last_ts else None,
                    'target_moisture_min': zone.target_moisture_min,
                    'target_moisture_max': zone.target_moisture_max,
                    'recommend_irrigation': bool(recommend),
                    'reason': reason,
                }
            )

        return Response(
            {
                'site_id': site.id,
                'hours': hours,
                'max_rain_probability': max_rain_prob,
                'max_temp_c': max_temp_c,
                'zones': out,
            }
        )


class WeatherForecastViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = WeatherForecastSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = WeatherForecast.objects.select_related('site')
        site_id = self.request.query_params.get('site')
        if site_id:
            qs = qs.filter(site_id=site_id)

        provider = (self.request.query_params.get('provider') or '').strip()
        if provider:
            qs = qs.filter(provider=provider)

        return qs.order_by('-forecast_time', '-id')


class IrrigationZoneViewSet(viewsets.ModelViewSet):
    serializer_class = IrrigationZoneSerializer
    permission_classes = [AuthenticatedReadOnlyOrAdminWrite]

    def get_queryset(self):
        qs = IrrigationZone.objects.select_related('site', 'device')
        site_id = self.request.query_params.get('site')
        if site_id:
            qs = qs.filter(site_id=site_id)
        if self.request.user and self.request.user.is_staff:
            return qs.order_by('-updated_at', '-id')
        return qs.filter(site__created_by=self.request.user).order_by('-updated_at', '-id')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def status(self, request, pk=None):
        zone = self.get_object()
        rec = None
        if zone.device_id:
            rec = (
                TelemetryRecord.objects.filter(device_id=zone.device_id)
                .only('timestamp', 'metrics')
                .order_by('-timestamp', '-id')
                .first()
            )

        moisture = None
        if rec:
            try:
                moisture = (rec.metrics or {}).get(zone.soil_moisture_metric)
            except Exception:
                moisture = None

        last_event = IrrigationEvent.objects.filter(zone=zone).order_by('-requested_at', '-id').first()

        return Response(
            {
                'zone_id': zone.id,
                'device_id': zone.device_id,
                'soil_moisture_metric': zone.soil_moisture_metric,
                'soil_moisture': moisture,
                'last_telemetry_at': rec.timestamp.isoformat() if rec and rec.timestamp else None,
                'last_event': IrrigationEventSerializer(last_event).data if last_event else None,
            }
        )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def irrigate(self, request, pk=None):
        """Manual irrigation trigger for a zone.

        Payload:
          - duration_seconds (optional): default 600
        """
        zone = self.get_object()
        if not (request.user.is_staff or zone.site.created_by_id == request.user.id):
            return Response({'detail': 'Forbidden'}, status=drf_status.HTTP_403_FORBIDDEN)

        duration = _parse_int(request.data.get('duration_seconds'), 600)
        duration = max(5, min(duration, 6 * 60 * 60))

        if not zone.device_id:
            return Response({'detail': 'Zone has no device assigned'}, status=drf_status.HTTP_400_BAD_REQUEST)

        try:
            result = enqueue_irrigation_for_zone(
                zone=zone,
                duration_seconds=duration,
                requested_by=request.user,
                source='manual',
            )
        except ValueError as e:
            return Response({'detail': str(e)}, status=drf_status.HTTP_400_BAD_REQUEST)

        cmd = result.command
        event = result.event

        publish_command_status(
            cmd.id,
            {
                'id': cmd.id,
                'device': cmd.device_id,
                'kind': cmd.kind,
                'payload': cmd.payload,
                'status': cmd.status,
                'queued_at': cmd.queued_at.isoformat() if cmd.queued_at else None,
                'source': 'irrigation_zone',
                'irrigation_zone_id': zone.id,
                'irrigation_event_id': event.id,
            },
        )

        return Response({'detail': 'queued', 'event': IrrigationEventSerializer(event).data, 'command_id': cmd.id}, status=drf_status.HTTP_201_CREATED)


class AgriFieldViewSet(viewsets.ModelViewSet):
    serializer_class = AgriFieldSerializer
    permission_classes = [AuthenticatedReadOnlyOrAdminWrite]

    def get_queryset(self):
        qs = AgriField.objects.select_related('site', 'created_by')
        site_id = self.request.query_params.get('site')
        if site_id:
            qs = qs.filter(site_id=site_id)

        if self.request.user and self.request.user.is_staff:
            return qs.order_by('-updated_at', '-id')
        return qs.filter(site__created_by=self.request.user).order_by('-updated_at', '-id')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)


class AgriNodeViewSet(viewsets.ModelViewSet):
    serializer_class = AgriNodeSerializer
    permission_classes = [AuthenticatedReadOnlyOrAdminWrite]

    def get_queryset(self):
        qs = AgriNode.objects.select_related('field', 'field__site', 'device', 'created_by')
        field_id = self.request.query_params.get('field')
        if field_id:
            qs = qs.filter(field_id=field_id)
        site_id = self.request.query_params.get('site')
        if site_id:
            qs = qs.filter(field__site_id=site_id)

        if self.request.user and self.request.user.is_staff:
            return qs.order_by('-updated_at', '-id')
        return qs.filter(field__site__created_by=self.request.user).order_by('-updated_at', '-id')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)

    @action(detail=True, methods=['post'], permission_classes=[AllowAny], url_path='telemetry')
    def telemetry(self, request, pk=None):
        """Ingest node telemetry using device-token auth.

        This is an agriculture-friendly alias for the generic agent telemetry endpoint.
        The device token must belong to the node's mapped Device.

        Payload:
          - timestamp: optional ISO string
          - metrics: dict
          - raw_text: optional string
        """
        node = self.get_object()
        auth = authenticate_agent(request)
        if auth.device.id != node.device_id:
            return Response({'detail': 'Token does not match node device'}, status=403)

        # Reuse TelemetryRecord creation logic from the viewset.
        ts_raw = request.data.get('timestamp')
        metrics = request.data.get('metrics') or {}
        raw_text = request.data.get('raw_text') or ''

        timestamp = timezone.now()
        if ts_raw:
            try:
                timestamp = timezone.datetime.fromisoformat(str(ts_raw).replace('Z', '+00:00'))
                if timezone.is_naive(timestamp):
                    timestamp = timezone.make_aware(timestamp, timezone=timezone.utc)
            except Exception:
                timestamp = timezone.now()

        rec = TelemetryRecord.objects.create(
            device_id=node.device_id,
            timestamp=timestamp,
            metrics=metrics if isinstance(metrics, dict) else {},
            raw_text=str(raw_text)[:20000],
            created_by=None,
        )

        Device.objects.filter(id=node.device_id).update(last_seen_at=timestamp, status=Device.Status.ONLINE)

        try:
            run_jobs_for_event(event_type='telemetry', telemetry=rec, actor=None)
        except Exception:
            pass

        try:
            publish_telemetry_record(
                rec.device_id,
                {
                    'id': rec.id,
                    'device': rec.device_id,
                    'device_name': getattr(node.device, 'name', None) if hasattr(node, 'device') else None,
                    'timestamp': rec.timestamp.isoformat() if rec.timestamp else None,
                    'metrics': rec.metrics,
                    'raw_text': rec.raw_text,
                    'created_at': rec.created_at.isoformat() if rec.created_at else None,
                    'agri_node_id': node.id,
                },
            )
        except Exception:
            pass

        publish_network_update({'reason': 'agri_node_telemetry', 'device_id': rec.device_id, 'telemetry_id': rec.id, 'agri_node_id': node.id})
        return Response({'detail': 'ok', 'agri_node_id': node.id, 'device_id': node.device_id, 'telemetry_id': rec.id})


class AgriSensorViewSet(viewsets.ModelViewSet):
    serializer_class = AgriSensorSerializer
    permission_classes = [AuthenticatedReadOnlyOrAdminWrite]

    def get_queryset(self):
        qs = AgriSensor.objects.select_related('node', 'node__field', 'node__field__site', 'zone', 'created_by')
        node_id = self.request.query_params.get('node')
        if node_id:
            qs = qs.filter(node_id=node_id)
        zone_id = self.request.query_params.get('zone')
        if zone_id:
            qs = qs.filter(zone_id=zone_id)
        site_id = self.request.query_params.get('site')
        if site_id:
            qs = qs.filter(node__field__site_id=site_id)

        if self.request.user and self.request.user.is_staff:
            return qs.order_by('-created_at', '-id')
        return qs.filter(node__field__site__created_by=self.request.user).order_by('-created_at', '-id')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)


class IrrigationRuleViewSet(viewsets.ModelViewSet):
    serializer_class = IrrigationRuleSerializer
    permission_classes = [AuthenticatedReadOnlyOrAdminWrite]

    def get_queryset(self):
        qs = IrrigationRule.objects.select_related('zone', 'zone__site', 'created_by')
        zone_id = self.request.query_params.get('zone')
        if zone_id:
            qs = qs.filter(zone_id=zone_id)
        site_id = self.request.query_params.get('site')
        if site_id:
            qs = qs.filter(zone__site_id=site_id)

        if self.request.user and self.request.user.is_staff:
            return qs.order_by('-updated_at', '-id')
        return qs.filter(zone__site__created_by=self.request.user).order_by('-updated_at', '-id')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)


class IrrigationEventViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = IrrigationEventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = IrrigationEvent.objects.select_related('zone', 'zone__site', 'device', 'command')
        site_id = self.request.query_params.get('site')
        if site_id:
            qs = qs.filter(zone__site_id=site_id)
        zone_id = self.request.query_params.get('zone')
        if zone_id:
            qs = qs.filter(zone_id=zone_id)

        if self.request.user and self.request.user.is_staff:
            return qs.order_by('-requested_at', '-id')
        return qs.filter(requested_by=self.request.user).order_by('-requested_at', '-id')
