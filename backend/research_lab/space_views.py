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
NASA_EPIC_NATURAL_IMAGES_URL = 'https://api.nasa.gov/EPIC/api/natural/images'
NASA_TECHTRANSFER_PATENT_URL = 'https://api.nasa.gov/techtransfer/patent/'

EONET_EVENTS_URL = 'https://eonet.gsfc.nasa.gov/api/v3/events'
NASA_IMAGES_SEARCH_URL = 'https://images-api.nasa.gov/search'
TECHPORT_PROJECTS_URL = 'https://techport.nasa.gov/api/projects'

EXOPLANET_TAP_SYNC_URL = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync'
JPL_SSD_CAD_URL = 'https://ssd-api.jpl.nasa.gov/cad.api'

CELESTRAK_GP_URL = 'https://celestrak.org/NORAD/elements/gp.php'
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


def _get_text(url: str, params: dict, timeout_s: int = 15) -> str:
    resp = requests.get(url, params=params, timeout=timeout_s)
    resp.raise_for_status()
    return resp.text


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


@api_view(['GET'])
@permission_classes([AllowAny])
def eonet_events(request):
    """Earth Observatory Natural Event Tracker (EONET) events summary."""
    status = request.query_params.get('status', 'open')
    limit = request.query_params.get('limit', '10')
    try:
        limit_n = max(1, min(50, int(limit)))
    except ValueError:
        return Response({'detail': 'Invalid limit. Use an integer 1..50.'}, status=400)

    params = {
        'status': status,
        'limit': limit_n,
    }

    key = _cache_key('eonet', params)
    cached = cache.get(key)
    if cached is not None:
        return Response(cached)

    try:
        data = _get_json(EONET_EVENTS_URL, params)
    except requests.RequestException as exc:
        return Response({'detail': 'Upstream EONET request failed', 'error': str(exc)}, status=502)

    events = (data or {}).get('events') or []
    items = []
    for ev in events[:limit_n]:
        items.append(
            {
                'id': ev.get('id'),
                'title': ev.get('title'),
                'link': ev.get('link'),
                'status': ev.get('status'),
                'categories': [c.get('title') for c in (ev.get('categories') or []) if isinstance(c, dict)],
                'geometries_count': len(ev.get('geometry') or []),
            }
        )

    payload = {
        'service': 'EONET',
        'status': status,
        'count': len(events),
        'items': items,
    }
    cache.set(key, payload, timeout=60 * 15)
    return Response(payload)


@api_view(['GET'])
@permission_classes([AllowAny])
def epic_latest(request):
    """NASA EPIC natural images list (summary)."""
    params = {'api_key': NASA_API_KEY}
    key = _cache_key('epic', params)
    cached = cache.get(key)
    if cached is not None:
        return Response(cached)

    try:
        data = _get_json(NASA_EPIC_NATURAL_IMAGES_URL, params)
    except requests.RequestException as exc:
        return Response({'detail': 'Upstream NASA EPIC request failed', 'error': str(exc)}, status=502)

    images = data or []
    items = []
    for img in images[:10]:
        items.append(
            {
                'identifier': img.get('identifier'),
                'caption': _truncate(img.get('caption', ''), 200),
                'image': img.get('image'),
                'date': img.get('date'),
            }
        )

    payload = {
        'service': 'EPIC',
        'count': len(images),
        'items': items,
    }
    cache.set(key, payload, timeout=60 * 60)
    return Response(payload)


@api_view(['GET'])
@permission_classes([AllowAny])
def exoplanet_sample(request):
    """Exoplanet Archive TAP sample query (small JSON dataset)."""
    query = request.query_params.get('query')
    if not query:
        query = (
            "select top 10 pl_name, hostname, disc_year, pl_orbper, pl_rade "
            "from ps where pl_name is not null order by disc_year desc"
        )

    params = {
        'query': query,
        'format': 'json',
    }

    key = _cache_key('exoplanet', params)
    cached = cache.get(key)
    if cached is not None:
        return Response(cached)

    try:
        data = _get_json(EXOPLANET_TAP_SYNC_URL, params, timeout_s=30)
    except requests.RequestException as exc:
        return Response({'detail': 'Upstream Exoplanet Archive request failed', 'error': str(exc)}, status=502)

    payload = {
        'service': 'Exoplanet Archive',
        'query': query,
        'count': len(data or []),
        'items': (data or [])[:10],
    }
    cache.set(key, payload, timeout=60 * 60 * 6)
    return Response(payload)


@api_view(['GET'])
@permission_classes([AllowAny])
def nasa_images_search(request):
    """NASA Image and Video Library search summary."""
    q = (request.query_params.get('q') or 'nebula').strip()
    media_type = (request.query_params.get('media_type') or 'image').strip()

    params = {
        'q': q,
        'media_type': media_type,
        'page': 1,
    }

    key = _cache_key('nasa_images', params)
    cached = cache.get(key)
    if cached is not None:
        return Response(cached)

    try:
        data = _get_json(NASA_IMAGES_SEARCH_URL, params)
    except requests.RequestException as exc:
        return Response({'detail': 'Upstream NASA Images request failed', 'error': str(exc)}, status=502)

    collection = (data or {}).get('collection') or {}
    items = collection.get('items') or []
    meta = collection.get('metadata') or {}
    total_hits = meta.get('total_hits')

    simplified = []
    for it in items[:10]:
        data0 = ((it or {}).get('data') or [{}])[0] if isinstance((it or {}).get('data'), list) else {}
        links0 = ((it or {}).get('links') or [{}])[0] if isinstance((it or {}).get('links'), list) else {}
        simplified.append(
            {
                'title': data0.get('title'),
                'nasa_id': data0.get('nasa_id'),
                'date_created': data0.get('date_created'),
                'media_type': data0.get('media_type'),
                'preview_href': links0.get('href'),
            }
        )

    payload = {
        'service': 'NASA Image and Video Library',
        'query': q,
        'media_type': media_type,
        'total_hits': total_hits,
        'items': simplified,
    }

    cache.set(key, payload, timeout=60 * 30)
    return Response(payload)


@api_view(['GET'])
@permission_classes([AllowAny])
def techport_projects(request):
    """Techport projects (lightweight summary)."""
    updated_since = request.query_params.get('updatedSince')
    params = {}
    if updated_since:
        params['updatedSince'] = updated_since

    key = _cache_key('techport', params)
    cached = cache.get(key)
    if cached is not None:
        return Response(cached)

    try:
        data = _get_json(TECHPORT_PROJECTS_URL, params, timeout_s=30)
    except requests.RequestException as exc:
        return Response({'detail': 'Upstream Techport request failed', 'error': str(exc)}, status=502)

    projects = (data or {}).get('projects') or []
    items = []
    for p in projects[:10]:
        items.append(
            {
                'id': p.get('id'),
                'title': p.get('title'),
                'startDate': p.get('startDate'),
                'endDate': p.get('endDate'),
                'statusDescription': p.get('statusDescription'),
            }
        )

    payload = {
        'service': 'Techport',
        'count': len(projects),
        'items': items,
    }
    cache.set(key, payload, timeout=60 * 60)
    return Response(payload)


@api_view(['GET'])
@permission_classes([AllowAny])
def techtransfer_patents(request):
    """NASA TechTransfer patents search (summary)."""
    q = (request.query_params.get('q') or 'robot').strip()

    params = {
        'engine': 'search',
        'q': q,
        'api_key': NASA_API_KEY,
    }

    key = _cache_key('techtransfer', params)
    cached = cache.get(key)
    if cached is not None:
        return Response(cached)

    try:
        data = _get_json(NASA_TECHTRANSFER_PATENT_URL, params, timeout_s=30)
    except requests.RequestException as exc:
        return Response({'detail': 'Upstream NASA TechTransfer request failed', 'error': str(exc)}, status=502)

    # TechTransfer API format: { "count": <int>, "results": [ [..fields..], ... ] }
    results = (data or {}).get('results') or []
    payload = {
        'service': 'TechTransfer',
        'query': q,
        'count': (data or {}).get('count', len(results)),
        'results_preview': results[:5],
    }
    cache.set(key, payload, timeout=60 * 60 * 6)
    return Response(payload)


@api_view(['GET'])
@permission_classes([AllowAny])
def ssd_cneos_close_approach(request):
    """JPL SSD/CNEOS Close-Approach Data (CAD) API summary."""
    dist_max = request.query_params.get('dist_max') or '0.05'
    limit = request.query_params.get('limit') or '10'
    try:
        limit_n = max(1, min(50, int(limit)))
    except ValueError:
        return Response({'detail': 'Invalid limit. Use an integer 1..50.'}, status=400)

    params = {
        'dist-max': dist_max,
        'limit': limit_n,
        'sort': 'date',
    }

    key = _cache_key('cneos_cad', params)
    cached = cache.get(key)
    if cached is not None:
        return Response(cached)

    try:
        data = _get_json(JPL_SSD_CAD_URL, params, timeout_s=30)
    except requests.RequestException as exc:
        return Response({'detail': 'Upstream JPL SSD/CNEOS request failed', 'error': str(exc)}, status=502)

    fields = (data or {}).get('fields') or []
    rows = (data or {}).get('data') or []

    payload = {
        'service': 'SSD/CNEOS (CAD)',
        'fields': fields,
        'count': len(rows),
        'rows_preview': rows[:10],
    }
    cache.set(key, payload, timeout=60 * 60)
    return Response(payload)


@api_view(['GET'])
@permission_classes([AllowAny])
def tle_25544(request):
    """Two-line element set for ISS (NORAD 25544) via CelesTrak."""
    params = {
        'CATNR': request.query_params.get('catnr') or '25544',
        'FORMAT': 'TLE',
    }

    key = _cache_key('tle', params)
    cached = cache.get(key)
    if cached is not None:
        return Response(cached)

    try:
        text = _get_text(CELESTRAK_GP_URL, params, timeout_s=15)
    except requests.RequestException as exc:
        return Response({'detail': 'Upstream TLE request failed', 'error': str(exc)}, status=502)

    lines = [ln.strip() for ln in (text or '').splitlines() if ln.strip()]
    payload = {
        'service': 'TLE',
        'norad_catnr': params['CATNR'],
        'name': lines[0] if len(lines) >= 3 else None,
        'line1': lines[1] if len(lines) >= 3 else None,
        'line2': lines[2] if len(lines) >= 3 else None,
        'raw': '\n'.join(lines[:3]) if lines else '',
        'source': 'celestrak.org',
    }

    cache.set(key, payload, timeout=60 * 30)
    return Response(payload)


@api_view(['GET'])
@permission_classes([AllowAny])
def gibs_info(request):
    return Response(
        {
            'service': 'GIBS',
            'type': 'WMTS',
            'wmts_endpoint': 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/wmts.cgi',
            'notes': 'GIBS serves map tiles (WMTS). Use the endpoint with a WMTS client to list layers and render tiles.',
        }
    )


@api_view(['GET'])
@permission_classes([AllowAny])
def trek_wmts_info(request):
    return Response(
        {
            'service': 'Vesta/Moon/Mars Trek WMTS',
            'type': 'WMTS',
            'notes': 'Trek imagery is provided via WMTS/WMS. Integrating it typically means embedding a map client and pointing it at the Trek WMTS capabilities URL for the body you want (Moon/Mars/Vesta).',
        }
    )


@api_view(['GET'])
@permission_classes([AllowAny])
def insight_info(request):
    return Response(
        {
            'service': 'InSight: Mars Weather Service',
            'available': False,
            'notes': 'NASA InSight weather API access has changed over time; some public endpoints were retired. If you have a specific current endpoint you want to use, share it and I will wire it in as a proxied integration.',
        }
    )


@api_view(['GET'])
@permission_classes([AllowAny])
def osdr_info(request):
    return Response(
        {
            'service': 'Open Science Data Repository (OSDR)',
            'available': False,
            'notes': 'OSDR provides datasets and metadata, but the public API varies. If you provide the exact OSDR API base URL you want, I can add a proxied endpoint and a dashboard module.',
        }
    )


@api_view(['GET'])
@permission_classes([AllowAny])
def ssc_info(request):
    return Response(
        {
            'service': 'Satellite Situation Center (SSC)',
            'available': False,
            'notes': 'SSC integration typically requires specific query formats and may require registration/auth. Share the SSC endpoint/spec you want (REST/SOAP), and I will implement a proxy + UI module.',
        }
    )
