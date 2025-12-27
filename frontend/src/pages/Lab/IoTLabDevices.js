import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { iotLabService } from '../../services';

const IoTLabDevices = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [location, setLocation] = useState('');
  const [metadataText, setMetadataText] = useState('{}');
  const [saving, setSaving] = useState(false);

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
      const res = await iotLabService.listDevices();
      const list = res.data?.results || res.data || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(formatApiError(e, 'Failed to load devices'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createDevice = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Device name is required');
      return;
    }

    let metadata = {};
    try {
      metadata = metadataText.trim() ? JSON.parse(metadataText) : {};
    } catch {
      setError('Metadata must be valid JSON');
      return;
    }

    setSaving(true);
    try {
      await iotLabService.createDevice({
        name: name.trim(),
        device_type: deviceType.trim(),
        location: location.trim(),
        metadata,
      });
      setName('');
      setDeviceType('');
      setLocation('');
      setMetadataText('{}');
      await load();
    } catch (e2) {
      setError(formatApiError(e2, 'Failed to create device'));
    } finally {
      setSaving(false);
    }
  };

  const statusBadge = (status) => {
    const s = String(status || 'unknown');
    const cls = s === 'online'
      ? 'bg-green-50 text-green-700 border-green-200'
      : s === 'offline'
        ? 'bg-red-50 text-red-700 border-red-200'
        : s === 'maintenance'
          ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
          : 'bg-gray-50 text-gray-700 border-gray-200';

    return <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold border rounded ${cls}`}>{s}</span>;
  };

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
  }, [items]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Device Manager</h1>
        <p className="text-gray-600 mt-1">Register devices and manage their status.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add Device</h2>
        <form onSubmit={createDevice} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 outline-none"
                placeholder="e.g. greenhouse-sensor-01"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
              <input
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 outline-none"
                placeholder="e.g. ESP32"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 outline-none"
                placeholder="e.g. Lab A"
                disabled={saving}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Metadata (JSON)</label>
            <textarea
              value={metadataText}
              onChange={(e) => setMetadataText(e.target.value)}
              rows={6}
              className="w-full font-mono text-xs px-4 py-3 rounded-lg border border-gray-300 text-gray-900 outline-none"
              disabled={saving}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Create Device'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900">Devices</h2>
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
        ) : sorted.length === 0 ? (
          <div className="text-gray-600">No devices yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-2">Name</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Location</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((d) => (
                  <tr key={d.id} className="border-b last:border-b-0">
                    <td className="py-2 text-gray-900 font-semibold">{d.name}</td>
                    <td className="py-2 text-gray-600">{d.device_type || '—'}</td>
                    <td className="py-2 text-gray-600">{d.location || '—'}</td>
                    <td className="py-2">{statusBadge(d.status)}</td>
                    <td className="py-2 text-gray-600">{d.last_seen_at ? new Date(d.last_seen_at).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default IoTLabDevices;
