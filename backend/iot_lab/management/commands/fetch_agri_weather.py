from __future__ import annotations

from datetime import timedelta

import requests

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from iot_lab.models import FarmSite, WeatherForecast


class Command(BaseCommand):
    help = "Fetch hourly weather forecasts for a FarmSite and store them. (MVP: Open-Meteo)"

    def add_arguments(self, parser):
        parser.add_argument("--site", type=int, required=True, help="FarmSite id")
        parser.add_argument("--hours", type=int, default=72, help="Number of hours ahead to fetch")
        parser.add_argument("--provider", type=str, default="open_meteo", help="Forecast provider label")

    def handle(self, *args, **options):
        site_id = int(options["site"])
        hours = max(1, min(int(options["hours"] or 72), 7 * 24))
        provider = (options.get("provider") or "open_meteo").strip() or "open_meteo"

        site = FarmSite.objects.filter(id=site_id).first()
        if not site:
            self.stderr.write(self.style.ERROR("FarmSite not found"))
            return

        if provider != "open_meteo":
            self.stderr.write(self.style.ERROR("Only provider=open_meteo is implemented in MVP"))
            return

        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": site.latitude,
            "longitude": site.longitude,
            "hourly": "temperature_2m,relative_humidity_2m,precipitation_probability,precipitation",
            "timezone": "UTC",
            "forecast_days": 7,
        }

        self.stdout.write(f"Fetching forecast: {url} site={site.id} hours={hours}")
        resp = requests.get(url, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json() if resp.content else {}

        hourly = data.get("hourly") or {}
        times = hourly.get("time") or []
        temps = hourly.get("temperature_2m") or []
        hums = hourly.get("relative_humidity_2m") or []
        pop = hourly.get("precipitation_probability") or []
        prec = hourly.get("precipitation") or []

        now = timezone.now()
        until = now + timedelta(hours=hours)

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
