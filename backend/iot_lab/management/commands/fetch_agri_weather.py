from __future__ import annotations

from datetime import timedelta

import requests

from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from iot_lab.models import FarmSite, WeatherForecast
from iot_lab.weather_providers import fetch_openweather_5day_3h


class Command(BaseCommand):
    help = "Fetch weather forecasts for a FarmSite and store them (providers: open_meteo, openweather)."

    def add_arguments(self, parser):
        parser.add_argument("--site", type=int, required=True, help="FarmSite id")
        parser.add_argument("--hours", type=int, default=72, help="Number of hours ahead to fetch")
        parser.add_argument("--provider", type=str, default="open_meteo", help="Forecast provider label")
        parser.add_argument(
            "--api-key",
            type=str,
            default="",
            help="Provider API key override (recommended: set OPENWEATHER_API_KEY env var instead).",
        )

    def handle(self, *args, **options):
        site_id = int(options["site"])
        hours = max(1, min(int(options["hours"] or 72), 7 * 24))
        provider = (options.get("provider") or "open_meteo").strip() or "open_meteo"
        api_key_override = (options.get('api_key') or '').strip()

        site = FarmSite.objects.filter(id=site_id).first()
        if not site:
            self.stderr.write(self.style.ERROR("FarmSite not found"))
            return

        now = timezone.now()
        until = now + timedelta(hours=hours)

        if provider == 'open_meteo':
            url = "https://api.open-meteo.com/v1/forecast"
            params = {
                "latitude": site.latitude,
                "longitude": site.longitude,
                "hourly": "temperature_2m,relative_humidity_2m,precipitation_probability,precipitation",
                "timezone": "UTC",
                "forecast_days": 7,
            }

            self.stdout.write(f"Fetching forecast: {url} site={site.id} hours={hours} provider={provider}")
            resp = requests.get(url, params=params, timeout=15)
            resp.raise_for_status()
            data = resp.json() if resp.content else {}

            hourly = data.get("hourly") or {}
            times = hourly.get("time") or []
            temps = hourly.get("temperature_2m") or []
            hums = hourly.get("relative_humidity_2m") or []
            pop = hourly.get("precipitation_probability") or []
            prec = hourly.get("precipitation") or []

            # Clear existing forecasts for this window/provider to keep the table bounded.
            WeatherForecast.objects.filter(
                site=site,
                provider=provider,
                forecast_time__gte=now - timedelta(hours=1),
                forecast_time__lte=until,
            ).delete()

            created = 0
            fetched_at = timezone.now()

            for idx, t in enumerate(times):
                dt = parse_datetime(str(t))
                if not dt:
                    continue
                if timezone.is_naive(dt):
                    dt = timezone.make_aware(dt, timezone=timezone.utc)

                if dt < now - timedelta(hours=1) or dt > until:
                    continue

                metrics = {
                    "temperature_c": temps[idx] if idx < len(temps) else None,
                    "relative_humidity": hums[idx] if idx < len(hums) else None,
                    "precipitation_probability": pop[idx] if idx < len(pop) else None,
                    "precipitation_mm": prec[idx] if idx < len(prec) else None,
                }

                WeatherForecast.objects.create(
                    site=site,
                    provider=provider,
                    fetched_at=fetched_at,
                    forecast_time=dt,
                    metrics=metrics,
                )
                created += 1

            self.stdout.write(self.style.SUCCESS(f"Stored {created} hourly forecasts for site={site.id} provider={provider}"))
            return

        if provider == 'openweather':
            api_key = api_key_override or getattr(settings, 'OPENWEATHER_API_KEY', '')
            api_key = str(api_key or '').strip()
            if not api_key:
                self.stderr.write(self.style.ERROR('Missing OpenWeather API key. Set OPENWEATHER_API_KEY env var or pass --api-key.'))
                return

            self.stdout.write(
                f"Fetching forecast: openweather site={site.id} hours={hours} provider={provider}"
            )
            data, rows = fetch_openweather_5day_3h(
                lat=site.latitude,
                lon=site.longitude,
                api_key=api_key,
                hours=hours,
            )

            # Save city metadata (once per fetch) to the site for easy display.
            try:
                city = data.get('city')
                if isinstance(city, dict):
                    meta = dict(site.metadata or {})
                    meta['openweather_city'] = city
                    site.metadata = meta
                    site.save(update_fields=['metadata'])
            except Exception:
                pass

            WeatherForecast.objects.filter(
                site=site,
                provider=provider,
                forecast_time__gte=now - timedelta(hours=3),
                forecast_time__lte=until,
            ).delete()

            created = 0
            fetched_at = timezone.now()

            for r in rows:
                WeatherForecast.objects.create(
                    site=site,
                    provider=provider,
                    fetched_at=fetched_at,
                    forecast_time=r.forecast_time,
                    metrics=r.metrics,
                    raw=r.raw,
                )
                created += 1

            self.stdout.write(self.style.SUCCESS(f"Stored {created} forecasts (3h cadence) for site={site.id} provider={provider}"))
            return

        self.stderr.write(self.style.ERROR(f"Unsupported provider: {provider}"))
        return
