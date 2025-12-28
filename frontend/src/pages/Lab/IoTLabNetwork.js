import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { iotLabService } from '../../services';
import { API_BASE_URL } from '../../services/apiClient';

const IoTLabNetwork = () => {
  const outlet = useOutletContext();
  const theme = outlet?.theme || 'light';

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const wsRef = useRef(null);
  const wsConnectedRef = useRef(false);

  const wsBaseUrl = useMemo(() => {
    try {
      const apiUrl = new URL(API_BASE_URL);
      const wsProtocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${wsProtocol}//${apiUrl.host}`;
    } catch (e) {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${wsProtocol}//${window.location.host}`;
    }
  }, []);

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

  const closeWs = useCallback(() => {
    try {
      if (wsRef.current) wsRef.current.close();
    } catch (e) {
      // ignore
    }
    wsRef.current = null;
    wsConnectedRef.current = false;
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    closeWs();

    const url = `${wsBaseUrl}/ws/iot-lab/network/`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    const fallbackTimer = window.setTimeout(() => {
      if (!wsConnectedRef.current) {
        load();
      }
    }, 1200);

    ws.onopen = () => {
      wsConnectedRef.current = true;
    };

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if ((msg.type === 'init' || msg.type === 'update') && msg.summary) {
          setSummary(msg.summary);
          setLoading(false);
        }
      } catch (e) {
        // ignore
      }
    };

    ws.onerror = () => {
      // let fallback handle it
    };

    ws.onclose = () => {
      wsConnectedRef.current = false;
    };

    return () => {
      window.clearTimeout(fallbackTimer);
      closeWs();
    };
  }, [closeWs, load, wsBaseUrl]);

  const devices = summary?.devices || {};
  const telemetry = summary?.telemetry || {};

  const headerMutedClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const panelClass = theme === 'dark' ? 'bg-white/5 border border-white/10 rounded-lg p-6' : 'bg-white rounded-lg shadow-md p-6';
  const titleClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const subtleTextClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const metaTextClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const refreshBtnClass = theme === 'dark'
    ? 'px-4 py-2 border border-white/10 rounded-lg font-semibold hover:bg-white/10 text-white'
    : 'px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50';

  const Stat = ({ label, value }) => (
    <div className={theme === 'dark' ? 'border border-white/10 bg-white/5 rounded-lg p-4' : 'border border-gray-200 rounded-lg p-4'}>
      <div className={`text-xs font-semibold ${metaTextClass}`}>{label}</div>
      <div className={`text-2xl font-bold mt-1 ${titleClass}`}>{value}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Network Health</h1>
        <p className={`${headerMutedClass} mt-1`}>Quick snapshot of device connectivity and telemetry volume.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className={panelClass}>
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className={`text-xl font-bold ${titleClass}`}>Summary</h2>
          <button
            type="button"
            onClick={load}
            className={refreshBtnClass}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className={subtleTextClass}>Loading…</div>
        ) : !summary ? (
          <div className={subtleTextClass}>No data.</div>
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

            <div className={`text-xs ${metaTextClass}`}>
              Captured: {summary.captured_at ? new Date(summary.captured_at).toLocaleString() : '—'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IoTLabNetwork;
