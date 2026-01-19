from __future__ import annotations

import math
import secrets
from dataclasses import dataclass
from datetime import timedelta
from typing import Any, Dict, Iterable, List, Optional, Tuple

from django.contrib.auth.hashers import make_password
from django.db import transaction
from django.utils import timezone

from .models import Alert, AutomationJob, Device, DeviceCommand, DeviceToken, SecurityEvent, TelemetryRecord
from .realtime import publish_alert


@dataclass(frozen=True)
class AutomationContext:
    event_type: str  # telemetry | heartbeat | manual | scheduler
    device: Optional[Device] = None
    telemetry: Optional[TelemetryRecord] = None
    now = None


def _now():
    return timezone.now()


def _get(d: Dict[str, Any], key: str, default=None):
    return d.get(key, default) if isinstance(d, dict) else default


def _coerce_float(value: Any) -> Optional[float]:
    try:
        if value is None:
            return None
        if isinstance(value, bool):
            return None
        return float(value)
    except Exception:
        return None


def _compare(op: str, left: float, right: float) -> bool:
    if op == 'gt':
        return left > right
    if op == 'gte':
        return left >= right
    if op == 'lt':
        return left < right
    if op == 'lte':
        return left <= right
    if op == 'eq':
        return left == right
    if op == 'neq':
        return left != right
    return False


def should_fire(job: AutomationJob, ctx: AutomationContext) -> bool:
    trigger = job.trigger or {}
    ttype = str(_get(trigger, 'type', '')).strip().lower()

    if not job.is_active:
        return False

    if ttype in ('', 'manual'):
        return ctx.event_type in ('manual', 'scheduler')

    if ttype == 'telemetry_threshold':
        if ctx.event_type != 'telemetry' or not ctx.telemetry:
            return False
        device_id = _get(trigger, 'device_id')
        if device_id is not None and int(device_id) != int(ctx.telemetry.device_id):
            return False
        metric = str(_get(trigger, 'metric', '')).strip()
        op = str(_get(trigger, 'op', 'gt')).strip().lower()
        threshold = _coerce_float(_get(trigger, 'value'))
        if not metric or threshold is None:
            return False
        val = _coerce_float(_get(ctx.telemetry.metrics or {}, metric))
        if val is None:
            return False
        return _compare(op, val, threshold)

    if ttype == 'device_offline':
        if ctx.event_type not in ('scheduler', 'manual'):
            return False
        minutes = int(_get(trigger, 'offline_minutes', 5) or 5)
        device_id = _get(trigger, 'device_id')
        if device_id is None:
            return False
        device = Device.objects.filter(id=device_id, is_active=True).first()
        if not device:
            return False
        last_seen = device.last_seen_at
        if not last_seen:
            return True
        return last_seen < _now() - timedelta(minutes=minutes)

    if ttype == 'interval':
        if ctx.event_type != 'scheduler':
            return False
        seconds = int(_get(trigger, 'seconds', 60) or 60)
        if not job.last_run_at:
            return True
        return job.last_run_at < _now() - timedelta(seconds=seconds)

    if ttype == 'anomaly_zscore':
        if ctx.event_type != 'telemetry' or not ctx.telemetry:
            return False
        metric = str(_get(trigger, 'metric', '')).strip()
        if not metric:
            return False
        device_id = _get(trigger, 'device_id')
        if device_id is not None and int(device_id) != int(ctx.telemetry.device_id):
            return False
        window = int(_get(trigger, 'window', 30) or 30)
        z = _coerce_float(_get(trigger, 'z', 3.0))
        if z is None:
            z = 3.0

        current = _coerce_float(_get(ctx.telemetry.metrics or {}, metric))
        if current is None:
            return False

        qs = (
            TelemetryRecord.objects.filter(device_id=ctx.telemetry.device_id)
            .order_by('-timestamp', '-id')
            .values_list('metrics', flat=True)[:window]
        )
        values: List[float] = []
        for m in qs:
            v = _coerce_float(_get(m or {}, metric))
            if v is not None:
                values.append(v)
        if len(values) < max(10, min(window, 10)):
            return False
        mean = sum(values) / len(values)
        var = sum((v - mean) ** 2 for v in values) / max(1, len(values) - 1)
        std = math.sqrt(var)
        if std <= 1e-9:
            return False
        score = abs((current - mean) / std)
        return score >= z

    return False


def _create_alert(*, device: Optional[Device], title: str, message: str, severity: str, category: str, metadata: Dict[str, Any], created_by=None) -> Alert:
    alert = Alert.objects.create(
        device=device,
        title=title,
        message=message or '',
        severity=severity,
        category=category or '',
        metadata=metadata or {},
        created_by=created_by,
    )
    publish_alert(
        {
            'id': alert.id,
            'device': alert.device_id,
            'title': alert.title,
            'message': alert.message,
            'severity': alert.severity,
            'category': alert.category,
            'metadata': alert.metadata,
            'created_at': alert.created_at.isoformat() if alert.created_at else None,
            'resolved_at': alert.resolved_at.isoformat() if alert.resolved_at else None,
        }
    )
    return alert


def _enqueue_command(*, device_id: int, kind: str, payload: Dict[str, Any], requested_by=None) -> DeviceCommand:
    cmd = DeviceCommand.objects.create(
        device_id=device_id,
        kind=kind,
        payload=payload or {},
        requested_by=requested_by,
    )
    return cmd


def _rotate_device_token(*, device_id: int, label: str, created_by=None, revoke_old: bool = True) -> str:
    plain = secrets.token_urlsafe(32)
    with transaction.atomic():
        if revoke_old:
            DeviceToken.objects.filter(device_id=device_id, label=label, revoked=False).update(revoked=True)
        DeviceToken.objects.create(
            device_id=device_id,
            label=label,
            token_hash=make_password(plain),
            created_by=created_by,
        )
    return plain


def execute_job(job: AutomationJob, ctx: AutomationContext, *, actor=None) -> Dict[str, Any]:
    action = job.action or {}
    atype = str(_get(action, 'type', '')).strip().lower()

    device: Optional[Device] = None
    if ctx.telemetry:
        device = ctx.telemetry.device
    elif ctx.device:
        device = ctx.device

    if atype == 'create_alert':
        severity = str(_get(action, 'severity', Alert.Severity.INFO)).lower()
        category = str(_get(action, 'category', 'automation'))
        title = str(_get(action, 'title', job.name))
        message = str(_get(action, 'message', job.description or ''))
        metadata = _get(action, 'metadata', {}) or {}
        alert = _create_alert(device=device, title=title, message=message, severity=severity, category=category, metadata=metadata, created_by=actor)
        return {'type': 'create_alert', 'alert_id': alert.id}

    if atype == 'enqueue_command':
        device_id = _get(action, 'device_id')
        if device_id is None and device:
            device_id = device.id
        if device_id is None:
            raise ValueError('enqueue_command requires device_id')
        kind = str(_get(action, 'kind', DeviceCommand.Kind.RUN_PYTHON))
        payload = _get(action, 'payload', {}) or {}
        cmd = _enqueue_command(device_id=int(device_id), kind=kind, payload=payload, requested_by=actor)
        return {'type': 'enqueue_command', 'command_id': cmd.id, 'device_id': cmd.device_id}

    if atype == 'workflow':
        steps = _get(action, 'steps', [])
        if not isinstance(steps, list) or not steps:
            raise ValueError('workflow requires steps[]')
        device_id = _get(action, 'device_id')
        if device_id is None and device:
            device_id = device.id
        if device_id is None:
            raise ValueError('workflow requires device_id')

        created: List[int] = []
        for step in steps:
            if not isinstance(step, dict):
                continue
            kind = str(_get(step, 'kind', DeviceCommand.Kind.RUN_PYTHON))
            payload = _get(step, 'payload', {}) or {}
            cmd = _enqueue_command(device_id=int(device_id), kind=kind, payload=payload, requested_by=actor)
            created.append(cmd.id)
        return {'type': 'workflow', 'device_id': int(device_id), 'command_ids': created}

    if atype == 'rotate_device_token':
        device_id = _get(action, 'device_id')
        if device_id is None and device:
            device_id = device.id
        if device_id is None:
            raise ValueError('rotate_device_token requires device_id')
        label = str(_get(action, 'label', 'auto-rotated')).strip() or 'auto-rotated'
        revoke_old = bool(_get(action, 'revoke_old', True))
        plain = _rotate_device_token(device_id=int(device_id), label=label, created_by=actor, revoke_old=revoke_old)
        # We intentionally do NOT return the plaintext token beyond the API call logs.
        return {'type': 'rotate_device_token', 'device_id': int(device_id), 'label': label, 'rotated': True}

    raise ValueError(f'Unknown automation action type: {atype or "(missing)"}')


def run_job(job: AutomationJob, ctx: AutomationContext, *, actor=None) -> Dict[str, Any]:
    if not should_fire(job, ctx):
        job.last_run_at = _now()
        job.last_run_status = AutomationJob.LastRunStatus.SKIPPED
        job.save(update_fields=['last_run_at', 'last_run_status'])
        return {'detail': 'skipped', 'id': job.id}

    job.last_run_at = _now()
    job.last_run_status = AutomationJob.LastRunStatus.RUNNING
    job.save(update_fields=['last_run_at', 'last_run_status'])

    try:
        with transaction.atomic():
            result = execute_job(job, ctx, actor=actor)
        job.last_run_status = AutomationJob.LastRunStatus.SUCCEEDED
        job.save(update_fields=['last_run_status'])
        return {'detail': 'executed', 'id': job.id, 'result': result}
    except Exception as e:
        SecurityEvent.objects.create(
            device=ctx.device or (ctx.telemetry.device if ctx.telemetry else None),
            event_type='automation_failed',
            message=str(e),
            metadata={'job_id': job.id, 'job_name': job.name},
            created_by=actor,
        )
        job.last_run_status = AutomationJob.LastRunStatus.FAILED
        job.save(update_fields=['last_run_status'])
        raise


def run_jobs_for_event(*, event_type: str, device: Optional[Device] = None, telemetry: Optional[TelemetryRecord] = None, actor=None) -> List[Tuple[int, str]]:
    ctx = AutomationContext(event_type=event_type, device=device, telemetry=telemetry)

    # Only consider active jobs; triggers will filter further.
    jobs = AutomationJob.objects.filter(is_active=True).order_by('id')

    results: List[Tuple[int, str]] = []
    for job in jobs:
        try:
            if should_fire(job, ctx):
                run_job(job, ctx, actor=actor)
                results.append((job.id, 'executed'))
        except Exception:
            results.append((job.id, 'failed'))
    return results
