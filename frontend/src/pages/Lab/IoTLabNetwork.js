import React, { useCallback, useEffect, useState } from 'react';
import { iotLabService } from '../../services';

const Stat = ({ label, value }) => (
  <div className="border border-gray-200 rounded-lg p-4">
    <div className="text-xs text-gray-500 font-semibold">{label}</div>
    <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
  </div>
);

const IoTLabNetwork = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await iotLabService.getNetworkSummary();
      setSummary(res.data || null);
    } catch (e) {
      setError(formatApiError(e, 'Failed to load network health'));
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const devices = summary?.devices || {};
  const telemetry = summary?.telemetry || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Network Health</h1>
        <p className="text-gray-600 mt-1">Quick snapshot of device connectivity and telemetry volume.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900">Summary</h2>
          <button
            type="button"
            onClick={load}
            className="px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50"
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-gray-600">Loading…</div>
        ) : !summary ? (
          <div className="text-gray-600">No data.</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Stat label="Devices Total" value={devices.total ?? '—'} />
              <Stat label="Devices Online" value={devices.online ?? '—'} />
              <Stat label="Devices Offline" value={devices.offline ?? '—'} />
              <Stat label="Online Window (min)" value={summary.online_window_minutes ?? '—'} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Stat label="Telemetry (last hour)" value={telemetry.last_hour_count ?? '—'} />
              <Stat label="Telemetry (last 24h)" value={telemetry.last_day_count ?? '—'} />
            </div>

            <div className="text-xs text-gray-500">
              Captured: {summary.captured_at ? new Date(summary.captured_at).toLocaleString() : '—'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IoTLabNetwork;
