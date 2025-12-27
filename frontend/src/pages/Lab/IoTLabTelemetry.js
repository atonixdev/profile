import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { iotLabService } from '../../services';
import JsonPanel from '../../components/Lab/JsonPanel';

const IoTLabTelemetry = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [error, setError] = useState('');

  const [metricsText, setMetricsText] = useState('{}');
  const [rawText, setRawText] = useState('');
  const [sending, setSending] = useState(false);

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

  const loadDevices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await iotLabService.listDevices();
      const list = res.data?.results || res.data || [];
      const arr = Array.isArray(list) ? list : [];
      setDevices(arr);
      if (arr.length > 0) setSelectedDeviceId(String(arr[0].id));
    } catch (e) {
      setError(formatApiError(e, 'Failed to load devices'));
      setDevices([]);
      setSelectedDeviceId('');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTelemetry = useCallback(async (deviceId) => {
    if (!deviceId) {
      setRecords([]);
      return;
    }
    setLoadingRecords(true);
    setError('');
    try {
      const res = await iotLabService.listTelemetry({ device: deviceId });
      const list = res.data?.results || res.data || [];
      setRecords(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(formatApiError(e, 'Failed to load telemetry'));
      setRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  }, []);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  useEffect(() => {
    loadTelemetry(selectedDeviceId);
  }, [selectedDeviceId, loadTelemetry]);

  const selectedDevice = useMemo(() => {
    return devices.find((d) => String(d.id) === String(selectedDeviceId)) || null;
  }, [devices, selectedDeviceId]);

  const submitTelemetry = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedDeviceId) {
      setError('Select a device first');
      return;
    }

    let metrics = {};
    try {
      metrics = metricsText.trim() ? JSON.parse(metricsText) : {};
    } catch {
      setError('Metrics must be valid JSON');
      return;
    }

    setSending(true);
    try {
      await iotLabService.createTelemetry({
        device: Number(selectedDeviceId),
        timestamp: new Date().toISOString(),
        metrics,
        raw_text: rawText,
      });
      setMetricsText('{}');
      setRawText('');
      await loadTelemetry(selectedDeviceId);
    } catch (e2) {
      setError(formatApiError(e2, 'Failed to submit telemetry'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sensor Telemetry</h1>
        <p className="text-gray-600 mt-1">View device readings and submit test telemetry events.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Device</label>
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            disabled={loading || devices.length === 0}
            className="w-full md:max-w-xl px-3 py-2 border border-gray-300 rounded-lg"
          >
            {devices.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          {!loading && devices.length === 0 && (
            <div className="text-sm text-gray-600 mt-2">No devices available. Create one in Device Manager first.</div>
          )}
          {selectedDevice && (
            <div className="text-xs text-gray-500 mt-2">Type: {selectedDevice.device_type || '—'} • Location: {selectedDevice.location || '—'}</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Submit Telemetry (Test)</h2>
        <form onSubmit={submitTelemetry} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Metrics (JSON)</label>
            <textarea
              value={metricsText}
              onChange={(e) => setMetricsText(e.target.value)}
              rows={6}
              className="w-full font-mono text-xs px-4 py-3 rounded-lg border border-gray-300 text-gray-900 outline-none"
              disabled={sending}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Raw Text (optional)</label>
            <input
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 outline-none"
              disabled={sending}
              placeholder="e.g. serial payload"
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="px-5 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
          >
            {sending ? 'Sending…' : 'Send Telemetry'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Readings</h2>
          <button
            type="button"
            onClick={() => loadTelemetry(selectedDeviceId)}
            className="px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50"
            disabled={loadingRecords || !selectedDeviceId}
          >
            Refresh
          </button>
        </div>

        {loadingRecords ? (
          <div className="text-gray-600">Loading…</div>
        ) : records.length === 0 ? (
          <div className="text-gray-600">No telemetry records yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {records.slice(0, 8).map((r) => (
              <div key={r.id} className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-semibold text-gray-900">{r.device_name || 'Device'}</div>
                <div className="text-xs text-gray-500 mb-3">{r.timestamp ? new Date(r.timestamp).toLocaleString() : '—'}</div>
                <JsonPanel title="Metrics" value={r.metrics} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IoTLabTelemetry;
