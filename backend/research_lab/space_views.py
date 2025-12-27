import datetime

import requests
from decouple import config
from django.core.cache import cache
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


NASA_API_KEY = config('NASA_API_KEY', default='DEMO_KEY').strip()

NASA_APOD_URL = 'https://api.nasa.gov/planetary/apod'
NASA_NEO_FEED_URL = 'https://api.nasa.gov/neo/rest/v1/feed'
NASA_DONKI_NOTIFICATIONS_URL = 'https://api.nasa.gov/DONKI/notifications'
ISS_NOW_URL = 'https://api.wheretheiss.at/v1/satellites/25544'


def _parse_date(value: str) -> datetime.date:
    return datetime.date.fromisoformat(value)


def _truncate(text: str, limit: int = 500) -> str:
    if not text:
        return ''
    text = str(text)
    if len(text) <= limit:
        return text
    return text[: limit - 1] + '…'


def _cache_key(prefix: str, params: dict) -> str:
    stable = '&'.join(f'{k}={params[k]}' for k in sorted(params.keys()))
    return f'space:{prefix}:{stable}'


def _get_json(url: str, params: dict, timeout_s: int = 15):
    resp = requests.get(url, params=params, timeout=timeout_s)
    resp.raise_for_status()
    try:
        return resp.json()
    except ValueError as exc:
        raise requests.RequestException(f"Invalid JSON response: {exc}") from exc


@api_view(['GET'])
@permission_classes([AllowAny])
def apod(request):
    date_str = request.query_params.get('date')
    params = {'api_key': NASA_API_KEY}
    if date_str:
        try:
            _parse_date(date_str)
        except ValueError:
            return Response({'detail': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)
        params['date'] = date_str

    key = _cache_key('apod', params)
    cached = cache.get(key)
    if cached is not None:
        return Response(cached)

    try:
        data = _get_json(NASA_APOD_URL, params)
        print(f"APOD data received: {data.get('title', 'no title')}")
    except requests.RequestException as exc:
        print(f"APOD request failed: {exc}")
        return Response({'detail': 'Upstream NASA APOD request failed', 'error': str(exc)}, status=502)

    payload = {
        'date': data.get('date'),
        'title': data.get('title'),
        'explanation': data.get('explanation'),
        'media_type': data.get('media_type'),
        'url': data.get('url'),
        'hdurl': data.get('hdurl'),
        'copyright': data.get('copyright'),
    }
    cache.set(key, payload, timeout=60 * 60)  # 1 hour
    return Response(payload)


@api_view(['GET'])
@permission_classes([AllowAny])
def iss_now(request):
    key = 'space:iss_now'
    cached = cache.get(key)
    if cached is not None:
        return Response(cached)

    try:
        data = _get_json(ISS_NOW_URL, params={})
    except requests.RequestException as exc:
        return Response({'detail': 'Upstream ISS request failed', 'error': str(exc)}, status=502)

    payload = {
        'name': data.get('name'),
        'timestamp': data.get('timestamp'),
        'latitude': data.get('latitude'),
        'longitude': data.get('longitude'),
        'altitude_km': data.get('altitude'),
        'velocity_km_h': data.get('velocity'),
    }
    cache.set(key, payload, timeout=15)  # near real-time
    return Response(payload)


@api_view(['GET'])
@permission_classes([AllowAny])
def neo_summary(request):
    start_date_str = request.query_params.get('start_date')
    end_date_str = request.query_params.get('end_date')

    today = datetime.date.today()
    start_date = today
    end_date = today

    try:
        if start_date_str:
            start_date = _parse_date(start_date_str)
        if end_date_str:
            end_date = _parse_date(end_date_str)
    except ValueError:
        return Response({'detail': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)

    if end_date < start_date:
        return Response({'detail': 'end_date must be >= start_date'}, status=400)

    if (end_date - start_date).days > 7:
        return Response({'detail': 'Date range too large. Max 7 days.'}, status=400)

    params = {
        'api_key': NASA_API_KEY,
        'start_date': start_date.isoformat(),
        'end_date': end_date.isoformat(),
    }

    key = _cache_key('neo', params)
    cached = cache.get(key)
    if cached is not None:
        return Response(cached)

    try:
        data = _get_json(NASA_NEO_FEED_URL, params)
    except requests.RequestException as exc:
        return Response({'detail': 'Upstream NASA NEO request failed', 'error': str(exc)}, status=502)

    by_date = data.get('near_earth_objects', {}) or {}
    day_counts = {}
    total = 0
    hazardous = 0

    for date_key, objects in by_date.items():
        objects = objects or []
        day_counts[date_key] = len(objects)
        total += len(objects)
        for obj in objects:
            if obj.get('is_potentially_hazardous_asteroid'):
                hazardous += 1

    payload = {
        'start_date': params['start_date'],
        'end_date': params['end_date'],
        'total_near_earth_objects': total,
        'potentially_hazardous_count': hazardous,
        'daily_counts': day_counts,
    }

    cache.set(key, payload, timeout=60 * 60 * 12)  # 12 hours
    return Response(payload)


@api_view(['GET'])
@permission_classes([AllowAny])
def donki_summary(request):
    start_date_str = request.query_params.get('start_date')
    end_date_str = request.query_params.get('end_date')

    today = datetime.date.today()
    start_date = today - datetime.timedelta(days=7)
    end_date = today

    try:
        if start_date_str:
            start_date = _parse_date(start_date_str)
        if end_date_str:
            end_date = _parse_date(end_date_str)
    except ValueError:
        return Response({'detail': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)

    if end_date < start_date:
        return Response({'detail': 'end_date must be >= start_date'}, status=400)

    params = {
        'api_key': NASA_API_KEY,
        'startDate': start_date.isoformat(),
        'endDate': end_date.isoformat(),
    }

    key = _cache_key('donki', params)
    cached = cache.get(key)
    if cached is not None:
        return Response(cached)

    try:
        data = _get_json(NASA_DONKI_NOTIFICATIONS_URL, params)
    except requests.RequestException as exc:
        return Response({'detail': 'Upstream NASA DONKI request failed', 'error': str(exc)}, status=502)

    items = []
    for item in (data or [])[:5]:
        items.append(
            {
                'messageType': item.get('messageType'),
                'messageID': item.get('messageID'),
                'messageURL': item.get('messageURL'),
                'messageIssueTime': item.get('messageIssueTime'),
                'messageBody': _truncate(item.get('messageBody', ''), 500),
            }
        )

    payload = {
        'start_date': start_date.isoformat(),
        'end_date': end_date.isoformat(),
        'count': len(data or []),
        'items': items,
    }

    cache.set(key, payload, timeout=60 * 60 * 6)  # 6 hours
    return Response(payload)
