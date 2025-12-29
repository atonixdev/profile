import React, { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { iotLabService } from '../../services';

const IoTLabAgriEvents = () => {
  const outlet = useOutletContext?.() || {};
  const theme = outlet?.theme || 'light';

  const [sites, setSites] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState('');

  const [events, setEvents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const panelClass = theme === 'dark' ? 'bg-white/5 border border-white/10 rounded-lg p-6' : 'bg-white rounded-lg shadow-md p-6';
  const titleClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const mutedClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const labelClass = theme === 'dark' ? 'text-gray-200' : 'text-gray-700';
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
      setSelectedSiteId(arr[0] ? String(arr[0].id) : '');
    } catch (e) {
      setError(formatApiError(e, 'Failed to load farm sites'));
      setSites([]);
      setSelectedSiteId('');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadEvents = useCallback(async (siteId) => {
    if (!siteId) {
      setEvents([]);
      return;
    }

    setBusy(true);
    setError('');
    try {
      const res = await iotLabService.listIrrigationEvents({ site: siteId });
      const list = res.data?.results || res.data || [];
      setEvents(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(formatApiError(e, 'Failed to load irrigation events'));
      setEvents([]);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    loadSites();
  }, [loadSites]);

  useEffect(() => {
    loadEvents(selectedSiteId);
  }, [selectedSiteId, loadEvents]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${titleClass}`}>Agriculture • Events</h1>
        <p className={mutedClass}>Irrigation event history and status (queued/running/succeeded/failed).</p>
      </div>

      <div className={panelClass}>
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
          <div className="min-w-0">
            <div className={`text-sm font-semibold ${labelClass}`}>Farm Site</div>
            <div className={`text-xs ${mutedClass}`}>Filter irrigation events by site.</div>
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

        <div className="mt-4 flex items-center justify-end">
          <button className={buttonClass} type="button" disabled={busy || loading} onClick={() => loadEvents(selectedSiteId)}>
            Refresh
          </button>
        </div>
      </div>

      <div className={panelClass}>
        <div className={`text-lg font-bold ${titleClass}`}>Irrigation Events</div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                <th className="text-left py-2 pr-4">Requested</th>
                <th className="text-left py-2 pr-4">Zone</th>
                <th className="text-left py-2 pr-4">Status</th>
                <th className="text-left py-2 pr-4">Duration (s)</th>
                <th className="text-left py-2">Device</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan="5" className={`py-3 ${mutedClass}`}>No irrigation events.</td>
                </tr>
              ) : (
                events.map((ev) => (
                  <tr key={ev.id} className={theme === 'dark' ? 'border-t border-white/10' : 'border-t border-gray-100'}>
                    <td className="py-2 pr-4">{ev.requested_at ? new Date(ev.requested_at).toLocaleString() : ''}</td>
                    <td className="py-2 pr-4">{ev.zone_name || ev.zone}</td>
                    <td className="py-2 pr-4">{ev.status}</td>
                    <td className="py-2 pr-4">{ev.planned_duration_seconds ?? ''}</td>
                    <td className="py-2">{ev.device_name || ev.device || ''}</td>
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

export default IoTLabAgriEvents;
