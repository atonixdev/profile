import React, { useEffect, useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Overlay from 'ol/Overlay';
import { fromLonLat } from 'ol/proj';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';

import { iotLabService } from '../../services';

const pickBestForecastRow = (rows) => {
  const list = Array.isArray(rows) ? rows : [];
  if (list.length === 0) return null;

  const now = new Date();

  // Prefer OpenWeather if present.
  const openWeather = list.filter((r) => String(r?.provider || '') === 'openweather');
  const candidates = openWeather.length ? openWeather : list;

  // Pick the nearest upcoming forecast; if none upcoming, pick the latest past.
  let bestUpcoming = null;
  let bestUpcomingDelta = Infinity;

  let bestPast = null;
  let bestPastTime = -Infinity;

  for (const r of candidates) {
    const t = r?.forecast_time ? new Date(r.forecast_time) : null;
    if (!t || Number.isNaN(t.getTime())) continue;

    const delta = t.getTime() - now.getTime();
    if (delta >= 0 && delta < bestUpcomingDelta) {
      bestUpcoming = r;
      bestUpcomingDelta = delta;
    }

    if (delta < 0 && t.getTime() > bestPastTime) {
      bestPast = r;
      bestPastTime = t.getTime();
    }
  }

  return bestUpcoming || bestPast || candidates[0];
};

const IoTLabWeatherMap = () => {
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const vectorSourceRef = useRef(null);
  const popupRef = useRef(null);
  const popupOverlayRef = useRef(null);

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sites, setSites] = useState([]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    try {
      const createPopupEl = () => {
        const el = document.createElement('div');
        el.style.minWidth = '240px';
        el.style.maxWidth = '320px';
        el.style.padding = '10px 12px';
        el.style.borderRadius = '10px';
        el.style.border = isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.12)';
        el.style.background = isDark ? 'rgba(10,15,31,0.92)' : 'rgba(255,255,255,0.95)';
        el.style.color = isDark ? '#fff' : '#111';
        el.style.boxShadow = isDark ? '0 16px 40px rgba(0,0,0,0.45)' : '0 12px 30px rgba(0,0,0,0.18)';
        return el;
      };

      // OpenStreetMap base + OpenWeather overlay proxied via backend.
      const baseLayer = new TileLayer({
        source: new OSM(),
      });

      const weatherOverlay = new TileLayer({
        opacity: 0.65,
        source: new XYZ({
          url: '/api/iot-lab/weather-tiles/precipitation_new/{z}/{x}/{y}.png',
          crossOrigin: 'anonymous',
        }),
      });

      const vectorSource = new VectorSource();
      vectorSourceRef.current = vectorSource;

      const markerLayer = new VectorLayer({
        source: vectorSource,
        style: new Style({
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({ color: isDark ? 'rgba(0,224,255,0.9)' : 'rgba(0,224,255,0.9)' }),
            stroke: new Stroke({ color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.35)', width: 2 }),
          }),
        }),
      });

      const map = new Map({
        target: containerRef.current,
        layers: [baseLayer, weatherOverlay, markerLayer],
        view: new View({
          center: fromLonLat([0, 20]),
          zoom: 2,
        }),
        controls: [],
      });

      const popupEl = createPopupEl();
      popupRef.current = popupEl;

      const overlay = new Overlay({
        element: popupEl,
        positioning: 'bottom-center',
        offset: [0, -12],
        stopEvent: true,
      });
      popupOverlayRef.current = overlay;
      map.addOverlay(overlay);

      map.on('singleclick', (evt) => {
        const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
        if (!feature) {
          overlay.setPosition(undefined);
          return;
        }

        const site = feature.get('site');
        const forecast = feature.get('forecast');

        const temp = forecast?.metrics?.temperature_c;
        const hum = forecast?.metrics?.relative_humidity;
        const pop = forecast?.metrics?.precipitation_probability;

        popupEl.innerHTML = `
          <div style="font-weight:700;margin-bottom:6px">${String(site?.name || 'Farm Site')}</div>
          <div style="font-size:12px;opacity:.85">${forecast?.forecast_time ? new Date(forecast.forecast_time).toLocaleString() : 'No forecast cached yet'}</div>
          <div style="margin-top:8px;font-size:12px">
            <div>Temp: <b>${temp ?? 'n/a'}</b> °C</div>
            <div>Humidity: <b>${hum ?? 'n/a'}</b>%</div>
            <div>Rain prob: <b>${pop ?? 'n/a'}</b>%</div>
          </div>
          <div style="margin-top:10px;font-size:12px;opacity:.85">Provider: ${forecast?.provider || 'n/a'}</div>
        `;

        overlay.setPosition(evt.coordinate);
      });

      mapRef.current = map;
    } catch (e) {
      setError(e?.message || 'Failed to initialize map');
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.setTarget(null);
        mapRef.current = null;
      }
    };
  }, [isDark]);

  const load = async () => {
    setBusy(true);
    setError('');

    try {
      const sitesRes = await iotLabService.listFarmSites();
      const list = sitesRes.data?.results || sitesRes.data || [];
      const arr = Array.isArray(list) ? list : [];
      setSites(arr);

      // Fetch forecasts per site (time-series; endpoint is unpaginated).
      const byId = {};
      await Promise.all(
        arr.map(async (s) => {
          try {
            const fRes = await iotLabService.listWeatherForecasts({ site: s.id });
            const fList = fRes.data?.results || fRes.data || [];
            const best = pickBestForecastRow(fList);
            byId[String(s.id)] = best;
          } catch {
            byId[String(s.id)] = null;
          }
        })
      );

      // Render markers.
      const map = mapRef.current;
      const vectorSource = vectorSourceRef.current;
      if (!map || !vectorSource) return;

      vectorSource.clear();

      const coords = [];
      for (const s of arr) {
        const lng = Number(s?.longitude);
        const lat = Number(s?.latitude);
        if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;

        const forecast = byId[String(s.id)];

        const point = new Point(fromLonLat([lng, lat]));
        const feature = new Feature({
          geometry: point,
          site: s,
          forecast,
        });
        vectorSource.addFeature(feature);

        coords.push([lng, lat]);
      }

      if (coords.length === 1) {
        map.getView().animate({ center: fromLonLat(coords[0]), zoom: 10, duration: 350 });
      }
    } catch (e) {
      const status = e?.response?.status;
      const data = e?.response?.data;
      if (typeof data === 'string') {
        const looksLikeHtml = data.trim().startsWith('<!DOCTYPE') || data.trim().startsWith('<html');
        setError(`Failed to load sites/weather${status ? ` (HTTP ${status})` : ''}${looksLikeHtml ? ' (received HTML, check /api proxy)' : ''}`);
      } else if (data?.detail) {
        setError(String(data.detail));
      } else {
        setError(e?.message || 'Failed to load sites/weather');
      }
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold font-['Poppins'] ${isDark ? 'text-white' : 'text-gray-900'}`}>IoT Weather Map</h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
            OpenStreetMap base + OpenWeather precipitation overlay (proxied through your backend).
          </p>
        </div>
        <Link
          to="/lab/iot"
          className={`px-4 py-2 rounded-lg font-semibold ${
            isDark
              ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
              : 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50'
          }`}
        >
          <FiArrowLeft className="inline mr-2" />
          IoT Lab
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} backdrop-blur-md border rounded-xl p-4 shadow-xl`}>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
            Sites: {sites.length}
          </div>
          <button
            type="button"
            onClick={load}
            disabled={busy}
            className={`px-4 py-2 rounded-lg font-semibold ${
              isDark
                ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-60'
                : 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 disabled:opacity-60'
            }`}
          >
            {busy ? 'Loading…' : 'Refresh'}
          </button>
        </div>
        <div ref={containerRef} className="w-full h-[520px] rounded-lg overflow-hidden" />
      </div>

    </div>
  );
};

export default IoTLabWeatherMap;
