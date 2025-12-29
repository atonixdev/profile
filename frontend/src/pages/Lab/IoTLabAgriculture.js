import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { iotLabService } from '../../services';

const IoTLabAgriculture = () => {
  const outlet = useOutletContext?.() || {};
  const theme = outlet?.theme || 'light';

  const [sites, setSites] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState('');

  const [zones, setZones] = useState([]);
  const [events, setEvents] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [recommendations, setRecommendations] = useState(null);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [durationMinutesByZone, setDurationMinutesByZone] = useState({});

  const panelClass = theme === 'dark' ? 'bg-white/5 border border-white/10 rounded-lg p-6' : 'bg-white rounded-lg shadow-md p-6';
  const titleClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const labelClass = theme === 'dark' ? 'text-gray-200' : 'text-gray-700';
  const mutedClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const inputClass = theme === 'dark'
    ? 'w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white outline-none placeholder:text-gray-400'
    : 'w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-900 outline-none';
  const selectClass = theme === 'dark'
    ? 'w-full md:max-w-xl px-3 py-2 border border-white/10 bg-white/5 text-white rounded-lg'
    : 'w-full md:max-w-xl px-3 py-2 border border-gray-300 rounded-lg';
  const buttonClass = theme === 'dark'
    ? 'px-4 py-2 border border-white/10 rounded-lg font-semibold hover:bg-white/10 text-white disabled:opacity-60'
    : 'px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-60';

  const formatApiError = (e, fallback) => {
    const status = e?.response?.status;
    const data = e?.response?.data;
    if (typeof data === 'string') {
      const looksLikeHtml = data.trim().startsWith('<!DOCTYPE') || data.trim().startsWith('<html');
      return `${fallback}${status ? ` (HTTP ${status})` : ''}${looksLikeHtml ? ' (received HTML, check /api proxy)' : ''}`;
    }
    if (data?.detail) return String(data.detail);
    if (data?.error) return String(data.error);
    if (status) return `${fallback} (HTTP ${status})`;
    return e?.message || fallback;
  };

  const loadSites = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await iotLabService.listFarmSites();
      const list = res.data?.results || res.data || [];
      const arr = Array.isArray(list) ? list : [];
      setSites(arr);
      if (arr.length > 0) {
        setSelectedSiteId(String(arr[0].id));
      } else {
        setSelectedSiteId('');
      }
    } catch (e) {
      setError(formatApiError(e, 'Failed to load farm sites'));
      setSites([]);
      setSelectedSiteId('');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSiteData = useCallback(async (siteId) => {
    if (!siteId) {
      setZones([]);
      setEvents([]);
      setForecast([]);
      setRecommendations(null);
      return;
    }

    setBusy(true);
    setError('');
    try {
      const [zonesRes, eventsRes, forecastRes, recRes] = await Promise.all([
        iotLabService.listIrrigationZones({ site: siteId }),
        iotLabService.listIrrigationEvents({ site: siteId }),
        iotLabService.listWeatherForecasts({ site: siteId }),
        iotLabService.getFarmRecommendations(siteId, { hours: 6 }),
      ]);

      const z = zonesRes.data?.results || zonesRes.data || [];
      const e = eventsRes.data?.results || eventsRes.data || [];
      const f = forecastRes.data?.results || forecastRes.data || [];

      setZones(Array.isArray(z) ? z : []);
      setEvents(Array.isArray(e) ? e : []);
      setForecast(Array.isArray(f) ? f : []);
      setRecommendations(recRes?.data || null);
    } catch (e) {
      setError(formatApiError(e, 'Failed to load agriculture data'));
      setZones([]);
      setEvents([]);
      setForecast([]);
      setRecommendations(null);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    loadSites();
  }, [loadSites]);

  useEffect(() => {
    loadSiteData(selectedSiteId);
  }, [selectedSiteId, loadSiteData]);

  const selectedSite = useMemo(() => {
    if (!selectedSiteId) return null;
    return sites.find((s) => String(s.id) === String(selectedSiteId)) || null;
  }, [sites, selectedSiteId]);

  const forecastNext = useMemo(() => {
    const items = Array.isArray(forecast) ? [...forecast] : [];
    items.sort((a, b) => String(a.forecast_time || '').localeCompare(String(b.forecast_time || '')));
    const now = new Date();
    const upcoming = items.filter((row) => {
      const t = row?.forecast_time ? new Date(row.forecast_time) : null;
      return t && t.getTime() >= now.getTime();
    });
    return upcoming.slice(0, 12);
  }, [forecast]);

  const recByZoneId = useMemo(() => {
    const map = {};
    const list = recommendations?.zones;
    if (Array.isArray(list)) {
      for (const row of list) {
        if (row?.zone_id != null) map[String(row.zone_id)] = row;
      }
    }
    return map;
  }, [recommendations]);

  const startIrrigation = useCallback(async (zoneId) => {
    const minutes = Number(durationMinutesByZone[String(zoneId)] || 10);
    const durationSeconds = Math.max(5, Math.min(6 * 60 * 60, Math.round(minutes * 60)));

    setBusy(true);
    setError('');
    try {
      await iotLabService.irrigateZone(zoneId, { duration_seconds: durationSeconds });
      await loadSiteData(selectedSiteId);
    } catch (e) {
      setError(formatApiError(e, 'Failed to queue irrigation command'));
    } finally {
      setBusy(false);
    }
  }, [durationMinutesByZone, loadSiteData, selectedSiteId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${titleClass}`}>Agriculture</h1>
        <p className={mutedClass}>Weather-aware irrigation control (MVP): forecasts + soil moisture + manual zone irrigation.</p>
      </div>

      <div className={panelClass}>
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
          <div className="min-w-0">
            <div className={`text-sm font-semibold ${labelClass}`}>Farm Site</div>
            <div className={`text-xs ${mutedClass}`}>Create sites/zones in Django Admin (staff) or via API.</div>
          </div>
          <div className="w-full md:max-w-xl">
            <select
              className={selectClass}
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              disabled={loading || busy}
            >
              <option value="">Select a site…</option>
              {sites.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="mt-4 text-sm text-red-500">{error}</div>}
        {selectedSite && (
          <div className={`mt-4 text-sm ${mutedClass}`}>
            Location: {selectedSite.latitude}, {selectedSite.longitude} ({selectedSite.timezone || 'UTC'})
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={panelClass}>
          <div className={`text-lg font-bold ${titleClass}`}>Weather Forecast (next 12 hours)</div>
          <div className={`text-xs ${mutedClass} mt-1`}>From backend-stored hourly forecast rows.</div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  <th className="text-left py-2 pr-4">Time</th>
                  <th className="text-left py-2 pr-4">Temp (°C)</th>
                  <th className="text-left py-2 pr-4">Humidity (%)</th>
                  <th className="text-left py-2 pr-4">Rain Prob (%)</th>
                  <th className="text-left py-2">Rain (mm)</th>
                </tr>
              </thead>
              <tbody>
                {forecastNext.length === 0 ? (
                  <tr>
                    <td colSpan="5" className={`py-3 ${mutedClass}`}>No forecast stored yet. Run the backend command: <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}>python manage.py fetch_agri_weather --site {selectedSiteId || '<id>'}</span></td>
                  </tr>
                ) : (
                  forecastNext.map((row) => (
                    <tr key={row.id} className={theme === 'dark' ? 'border-t border-white/10' : 'border-t border-gray-100'}>
                      <td className="py-2 pr-4">{row.forecast_time ? new Date(row.forecast_time).toLocaleString() : ''}</td>
                      <td className="py-2 pr-4">{row?.metrics?.temperature_c ?? ''}</td>
                      <td className="py-2 pr-4">{row?.metrics?.relative_humidity ?? ''}</td>
                      <td className="py-2 pr-4">{row?.metrics?.precipitation_probability ?? ''}</td>
                      <td className="py-2">{row?.metrics?.precipitation_mm ?? ''}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={panelClass}>
          <div className={`text-lg font-bold ${titleClass}`}>Recommendations (next 6 hours)</div>
          <div className={`text-xs ${mutedClass} mt-1`}>Rule v1: irrigate if soil below target min AND rain probability is not high.</div>

          <div className="mt-4 space-y-3">
            {!recommendations ? (
              <div className={mutedClass}>No recommendation data.</div>
            ) : (
              <>
                <div className={`text-sm ${mutedClass}`}>Max rain probability: {recommendations.max_rain_probability ?? 'n/a'}</div>
                <div className={`text-sm ${mutedClass}`}>Max temperature: {recommendations.max_temp_c ?? 'n/a'}</div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={panelClass}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className={`text-lg font-bold ${titleClass}`}>Irrigation Zones</div>
            <div className={`text-xs ${mutedClass} mt-1`}>Triggers a timed GPIO relay or Arduino serial command via the IoT command queue.</div>
          </div>
          <button className={buttonClass} type="button" disabled={busy || loading} onClick={() => loadSiteData(selectedSiteId)}>Refresh</button>
        </div>

        <div className="mt-4 space-y-4">
          {zones.length === 0 ? (
            <div className={mutedClass}>No zones configured for this site.</div>
          ) : (
            zones.map((z) => {
              const rec = recByZoneId[String(z.id)];
              const defaultMinutes = durationMinutesByZone[String(z.id)] ?? 10;
              return (
                <div key={z.id} className={theme === 'dark' ? 'border border-white/10 rounded-lg p-4' : 'border border-gray-200 rounded-lg p-4'}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="min-w-0">
                      <div className={`font-semibold ${titleClass}`}>{z.name}</div>
                      <div className={`text-xs ${mutedClass}`}>Device: {z.device_name || '—'} • Actuator: {z.actuator_kind}</div>
                      <div className={`text-xs ${mutedClass}`}>Target min/max: {z.target_moisture_min ?? '—'} / {z.target_moisture_max ?? '—'}</div>
                      {rec && (
                        <div className={`text-xs mt-2 ${mutedClass}`}>
                          Soil ({rec.soil_moisture_metric}): {rec.soil_moisture ?? 'n/a'} • Recommend: {rec.recommend_irrigation ? 'Yes' : 'No'} ({rec.reason})
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-32">
                        <label className={`block text-xs mb-1 ${labelClass}`}>Minutes</label>
                        <input
                          className={inputClass}
                          value={defaultMinutes}
                          onChange={(e) => setDurationMinutesByZone((prev) => ({ ...prev, [String(z.id)]: e.target.value }))}
                          disabled={busy}
                        />
                      </div>
                      <button
                        type="button"
                        className={buttonClass}
                        disabled={busy || !z.device}
                        onClick={() => startIrrigation(z.id)}
                        title={!z.device ? 'Assign a device to this zone first' : 'Queue irrigation'}
                      >
                        Start irrigation
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className={panelClass}>
        <div className={`text-lg font-bold ${titleClass}`}>Irrigation History</div>
        <div className={`text-xs ${mutedClass} mt-1`}>Most recent irrigation events for this site.</div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                <th className="text-left py-2 pr-4">When</th>
                <th className="text-left py-2 pr-4">Zone</th>
                <th className="text-left py-2 pr-4">Status</th>
                <th className="text-left py-2">Duration (s)</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan="4" className={`py-3 ${mutedClass}`}>No irrigation events yet.</td>
                </tr>
              ) : (
                events.slice(0, 20).map((ev) => (
                  <tr key={ev.id} className={theme === 'dark' ? 'border-t border-white/10' : 'border-t border-gray-100'}>
                    <td className="py-2 pr-4">{ev.requested_at ? new Date(ev.requested_at).toLocaleString() : ''}</td>
                    <td className="py-2 pr-4">{ev.zone_name || ev.zone}</td>
                    <td className="py-2 pr-4">{ev.status}</td>
                    <td className="py-2">{ev.planned_duration_seconds ?? ''}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IoTLabAgriculture;
