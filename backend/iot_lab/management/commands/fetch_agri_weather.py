from __future__ import annotations

from datetime import timedelta

import requests

from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from iot_lab.models import FarmSite, WeatherForecast


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

            # OpenWeather 5 day / 3 hour forecast (works broadly; One Call 3.0 requires a paid plan).
            url = 'https://api.openweathermap.org/data/2.5/forecast'
            params = {
                'lat': site.latitude,
                'lon': site.longitude,
                'appid': api_key,
                'units': 'metric',
            }

            self.stdout.write(f"Fetching forecast: {url} site={site.id} hours={hours} provider={provider}")
            resp = requests.get(url, params=params, timeout=20)
            resp.raise_for_status()
            data = resp.json() if resp.content else {}

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

            items = data.get('list') or []
            if not isinstance(items, list):
                items = []

            WeatherForecast.objects.filter(
                site=site,
                provider=provider,
                forecast_time__gte=now - timedelta(hours=3),
                forecast_time__lte=until,
            ).delete()

            created = 0
            fetched_at = timezone.now()

            for row in items[:1000]:
                if not isinstance(row, dict):
                    continue

                # dt is unix seconds; dt_txt is also available.
                dt = None
                if row.get('dt') is not None:
                    try:
                        dt = timezone.datetime.fromtimestamp(int(row['dt']), tz=timezone.utc)
                    except Exception:
                        dt = None
                if not dt and row.get('dt_txt'):
                    dt = parse_datetime(str(row.get('dt_txt')))
                    if dt and timezone.is_naive(dt):
                        dt = timezone.make_aware(dt, timezone=timezone.utc)

                if not dt:
                    continue
                if dt < now - timedelta(hours=3) or dt > until:
                    continue

                main = row.get('main') or {}
                wind = row.get('wind') or {}
                rain = row.get('rain') or {}
                snow = row.get('snow') or {}
                clouds = row.get('clouds') or {}
                weather_arr = row.get('weather') or []
                weather0 = weather_arr[0] if isinstance(weather_arr, list) and weather_arr else {}

                # OpenWeather pop is 0..1. Normalize to 0..100 to match Open-Meteo.
                pop_raw = row.get('pop')
                try:
                    pop_pct = float(pop_raw) * 100.0 if pop_raw is not None else None
                except Exception:
                    pop_pct = None

                def _as_float(v):
                    try:
                        return float(v) if v is not None else None
                    except Exception:
                        return None

                rain_mm = _as_float((rain or {}).get('3h')) if isinstance(rain, dict) else None
                if rain_mm is None:
                    rain_mm = _as_float((rain or {}).get('1h')) if isinstance(rain, dict) else None

                snow_mm = _as_float((snow or {}).get('3h')) if isinstance(snow, dict) else None
                if snow_mm is None:
                    snow_mm = _as_float((snow or {}).get('1h')) if isinstance(snow, dict) else None

                prec_mm = None
                if rain_mm is not None or snow_mm is not None:
                    prec_mm = (rain_mm or 0.0) + (snow_mm or 0.0)

                metrics = {
                    'temperature_c': main.get('temp'),
                    'feels_like_c': main.get('feels_like'),
                    'temp_min_c': main.get('temp_min'),
                    'temp_max_c': main.get('temp_max'),

                    'relative_humidity': main.get('humidity'),
                    'pressure_hpa': main.get('pressure'),
                    'sea_level_hpa': main.get('sea_level'),
                    'ground_level_hpa': main.get('grnd_level'),

                    'precipitation_probability': pop_pct,
                    'precipitation_mm': prec_mm,
                    'rain_mm': rain_mm,
                    'snow_mm': snow_mm,

                    'wind_speed_mps': wind.get('speed'),
                    'wind_deg': wind.get('deg'),
                    'wind_gust_mps': wind.get('gust'),

                    'clouds_pct': clouds.get('all') if isinstance(clouds, dict) else None,
                    'visibility_m': row.get('visibility'),

                    'weather_main': weather0.get('main') if isinstance(weather0, dict) else None,
                    'weather_description': weather0.get('description') if isinstance(weather0, dict) else None,
                    'weather_icon': weather0.get('icon') if isinstance(weather0, dict) else None,
                }

                WeatherForecast.objects.create(
                    site=site,
                    provider=provider,
                    fetched_at=fetched_at,
                    forecast_time=dt,
                    metrics=metrics,
                    raw=row if isinstance(row, dict) else {},
                )
                created += 1

            self.stdout.write(self.style.SUCCESS(f"Stored {created} forecasts (3h cadence) for site={site.id} provider={provider}"))
            return

        self.stderr.write(self.style.ERROR(f"Unsupported provider: {provider}"))
        return
