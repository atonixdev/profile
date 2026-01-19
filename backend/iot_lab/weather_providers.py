from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta

import requests

from django.utils import timezone
from django.utils.dateparse import parse_datetime


@dataclass(frozen=True)
class NormalizedForecastRow:
    forecast_time: timezone.datetime
    metrics: dict
    raw: dict


def _as_float(value):
    try:
        return float(value) if value is not None else None
    except Exception:
        return None


def fetch_openweather_5day_3h(*, lat: float, lon: float, api_key: str, hours: int = 72, timeout_s: int = 20):
    """Fetch OpenWeather 5 day / 3 hour forecast and return normalized rows.

    This uses https://api.openweathermap.org/data/2.5/forecast (works widely; no paid One Call required).
    """

    now = timezone.now()
    until = now + timedelta(hours=max(1, min(int(hours or 72), 7 * 24)))

    url = 'https://api.openweathermap.org/data/2.5/forecast'
    params = {
        'lat': lat,
        'lon': lon,
        'appid': api_key,
        'units': 'metric',
    }

    resp = requests.get(url, params=params, timeout=timeout_s)
    resp.raise_for_status()
    data = resp.json() if resp.content else {}

    items = data.get('list') or []
    if not isinstance(items, list):
        items = []

    rows: list[NormalizedForecastRow] = []

    for row in items[:1000]:
        if not isinstance(row, dict):
            continue

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

        pop_raw = row.get('pop')
        try:
            pop_pct = float(pop_raw) * 100.0 if pop_raw is not None else None
        except Exception:
            pop_pct = None

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

        rows.append(
            NormalizedForecastRow(
                forecast_time=dt,
                metrics=metrics,
                raw=row if isinstance(row, dict) else {},
            )
        )

    return data, rows
