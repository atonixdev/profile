from __future__ import annotations

from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from iot_lab.agri_utils import enqueue_irrigation_for_zone
from iot_lab.models import IrrigationEvent, IrrigationRule, TelemetryRecord, WeatherForecast


def _as_float(value):
    try:
        if value is None:
            return None
        return float(value)
    except Exception:
        return None


class Command(BaseCommand):
    help = 'Evaluate enabled irrigation rules and enqueue irrigation commands when conditions match.'

    def add_arguments(self, parser):
        parser.add_argument('--site', type=int, default=None, help='Only evaluate rules for a given farm site id')
        parser.add_argument('--zone', type=int, default=None, help='Only evaluate rules for a given irrigation zone id')
        parser.add_argument('--dry-run', action='store_true', help='Do not enqueue commands; only compute decisions')
        parser.add_argument('--hours', type=int, default=6, help='Weather lookahead window in hours (default: 6)')
        parser.add_argument('--verbose', action='store_true', help='Verbose output')

    def handle(self, *args, **options):
        site_id = options['site']
        zone_id = options['zone']
        dry_run = bool(options['dry_run'])
        hours = int(options['hours'] or 6)
        hours = max(1, min(hours, 48))
        verbose = bool(options['verbose'])

        qs = IrrigationRule.objects.select_related('zone', 'zone__site', 'zone__device').filter(enabled=True)
        if zone_id:
            qs = qs.filter(zone_id=zone_id)
        if site_id:
            qs = qs.filter(zone__site_id=site_id)

        now = timezone.now()
        horizon = now + timedelta(hours=hours)

        evaluated = 0
        irrigated = 0
        skipped = 0
        errored = 0

        for rule in qs.order_by('id'):
            evaluated += 1
            zone = rule.zone

            try:
                decision, reason, duration_seconds = self._evaluate_rule(rule=rule, now=now, horizon=horizon)

                if decision == 'irrigate' and not dry_run:
                    # Prevent repeated runs if a command is already queued/running recently.
                    if self._has_recent_active_event(zone_id=zone.id, now=now):
                        decision = 'skipped'
                        reason = 'recent irrigation already queued/running'
                    else:
                        enqueue_irrigation_for_zone(
                            zone=zone,
                            duration_seconds=duration_seconds,
                            requested_by=None,
                            source='rule',
                            metadata={'rule_id': rule.id, 'rule_name': rule.name},
                        )
                        irrigated += 1

                if decision != 'irrigate':
                    skipped += 1

                with transaction.atomic():
                    rule.last_evaluated_at = now
                    rule.last_decision = 'irrigated' if decision == 'irrigate' and not dry_run else decision
                    rule.last_decision_reason = reason
                    rule.save(update_fields=['last_evaluated_at', 'last_decision', 'last_decision_reason', 'updated_at'])

                if verbose:
                    self.stdout.write(f"rule={rule.id} zone={zone.id} decision={rule.last_decision} reason={reason}")

            except Exception as e:
                errored += 1
                rule.last_evaluated_at = now
                rule.last_decision = 'error'
                rule.last_decision_reason = str(e)
                rule.save(update_fields=['last_evaluated_at', 'last_decision', 'last_decision_reason', 'updated_at'])
                if verbose:
                    self.stderr.write(f"rule={rule.id} error={e}")

        self.stdout.write(
            self.style.SUCCESS(
                f"Irrigation rules evaluated={evaluated} irrigated={irrigated if not dry_run else 0} skipped={skipped} errors={errored} dry_run={dry_run}"
            )
        )

        if errored:
            raise SystemExit(2)

    def _has_recent_active_event(self, *, zone_id: int, now):
        recent = now - timedelta(hours=6)
        return IrrigationEvent.objects.filter(
            zone_id=zone_id,
            requested_at__gte=recent,
            status__in=[IrrigationEvent.Status.QUEUED, IrrigationEvent.Status.RUNNING],
        ).exists()

    def _evaluate_rule(self, *, rule: IrrigationRule, now, horizon):
        """Return (decision, reason, duration_seconds)."""

        zone = rule.zone
        conditions = rule.conditions or {}
        actions = rule.actions or {}

        duration_seconds = int(actions.get('duration_seconds') or actions.get('duration') or 600)
        duration_seconds = max(5, min(duration_seconds, 6 * 60 * 60))

        # Condition: within time window (local timezone handling is left to client/site; use server time for MVP)
        window = conditions.get('time_window')
        if isinstance(window, dict):
            start = str(window.get('start') or '').strip()
            end = str(window.get('end') or '').strip()
            if start and end:
                hhmm = now.strftime('%H:%M')
                if start <= end:
                    if not (start <= hhmm <= end):
                        return 'skipped', 'outside time window', duration_seconds
                else:
                    # window spans midnight
                    if not (hhmm >= start or hhmm <= end):
                        return 'skipped', 'outside time window', duration_seconds

        # Condition: min hours between runs
        min_hours = conditions.get('min_hours_between_runs')
        try:
            min_hours = float(min_hours) if min_hours is not None else None
        except Exception:
            min_hours = None

        if min_hours is not None:
            cutoff = now - timedelta(hours=float(min_hours))
            last = IrrigationEvent.objects.filter(zone=zone).order_by('-requested_at', '-id').first()
            if last and last.requested_at and last.requested_at >= cutoff:
                return 'skipped', 'min_hours_between_runs not elapsed', duration_seconds

        # Condition: max runs per day
        max_runs = conditions.get('max_runs_per_day')
        try:
            max_runs = int(max_runs) if max_runs is not None else None
        except Exception:
            max_runs = None

        if max_runs is not None:
            day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            runs_today = IrrigationEvent.objects.filter(zone=zone, requested_at__gte=day_start).count()
            if runs_today >= max_runs:
                return 'skipped', 'max_runs_per_day reached', duration_seconds

        # Condition: soil moisture
        soil_below = _as_float(conditions.get('soil_moisture_below'))
        soil_metric = str(conditions.get('soil_moisture_metric') or zone.soil_moisture_metric or 'soil_moisture')

        moisture_value = None
        if zone.device_id:
            rec = (
                TelemetryRecord.objects.filter(device_id=zone.device_id)
                .only('timestamp', 'metrics')
                .order_by('-timestamp', '-id')
                .first()
            )
            if rec:
                moisture_value = _as_float((rec.metrics or {}).get(soil_metric))

        if soil_below is not None:
            if moisture_value is None:
                return 'skipped', 'no soil moisture data', duration_seconds
            if moisture_value >= soil_below:
                return 'skipped', 'soil moisture above threshold', duration_seconds

        # Condition: rain probability max in next hours
        rain_prob_max = _as_float(conditions.get('rain_probability_max'))
        if rain_prob_max is not None:
            rows = WeatherForecast.objects.filter(site=zone.site, forecast_time__gte=now, forecast_time__lte=horizon)[:500]
            probs = []
            for row in rows:
                probs.append(_as_float((row.metrics or {}).get('precipitation_probability')))
            probs = [p for p in probs if p is not None]
            if probs and max(probs) > rain_prob_max:
                return 'skipped', 'rain likely soon', duration_seconds

        return 'irrigate', 'conditions met', duration_seconds
