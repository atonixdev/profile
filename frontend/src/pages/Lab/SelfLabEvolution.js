import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { selfLabService } from '../../services';

const formatApiError = (e, fallback) => {
  const status = e?.response?.status;
  const data = e?.response?.data;
  if (typeof data === 'string') {
    const t = data.trim();
    const looksLikeHtml = t.startsWith('<!DOCTYPE') || t.startsWith('<html');
    return `${fallback}${status ? ` (HTTP ${status})` : ''}${looksLikeHtml ? ' (received HTML, check /api proxy)' : ''}`;
  }
  if (data?.detail) return String(data.detail);
  if (data?.error) return String(data.error);
  if (status) return `${fallback} (HTTP ${status})`;
  return e?.message || fallback;
};

const SelfLabEvolution = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [recordedAt, setRecordedAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [metricName, setMetricName] = useState('evolution_score');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await selfLabService.listEvolutionMetrics();
      const list = res.data?.results || res.data || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(formatApiError(e, 'Failed to load evolution metrics'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (e) => {
    e.preventDefault();
    setError('');

    if (!metricName.trim()) {
      setError('Metric name is required');
      return;
    }

    const n = Number(value);
    if (!Number.isFinite(n)) {
      setError('Value must be a number');
      return;
    }

    setSaving(true);
    try {
      await selfLabService.createEvolutionMetric({
        metric_name: metricName.trim(),
        value: n,
        recorded_at: new Date(recordedAt).toISOString(),
        notes: notes.trim(),
      });
      setValue('');
      setNotes('');
      setRecordedAt(new Date().toISOString().slice(0, 16));
      await load();
    } catch (e2) {
      setError(formatApiError(e2, 'Failed to save evolution metric'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    setError('');
    try {
      await selfLabService.deleteEvolutionMetric(id);
      await load();
    } catch (e) {
      setError(formatApiError(e, 'Failed to delete evolution metric'));
    }
  };

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));
  }, [items]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Personal Evolution</h1>
        <p className="text-gray-600 mt-1">Log personal metrics over time.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add Metric</h2>
        <form onSubmit={create} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Recorded at</label>
              <input
                type="datetime-local"
                value={recordedAt}
                onChange={(e) => setRecordedAt(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 outline-none"
                disabled={saving}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Metric name</label>
              <input
                value={metricName}
                onChange={(e) => setMetricName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 outline-none"
                disabled={saving}
                placeholder="e.g. evolution_score"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Value</label>
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 outline-none"
                disabled={saving}
                placeholder="e.g. 94.2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 outline-none"
              placeholder="optional"
              disabled={saving}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Metric'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900">History</h2>
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
          <div className="text-gray-600">No metrics yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-2">Recorded</th>
                  <th className="py-2">Metric</th>
                  <th className="py-2">Value</th>
                  <th className="py-2">Notes</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((m) => (
                  <tr key={m.id} className="border-b last:border-b-0">
                    <td className="py-2 text-gray-900 font-semibold">{m.recorded_at ? new Date(m.recorded_at).toLocaleString() : '—'}</td>
                    <td className="py-2 text-gray-600">{m.metric_name}</td>
                    <td className="py-2 text-gray-600">{m.value}</td>
                    <td className="py-2 text-gray-600">{m.notes || '—'}</td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => remove(m.id)}
                        className="text-red-600 font-semibold hover:underline"
                      >
                        Delete
                      </button>
                    </td>
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

export default SelfLabEvolution;
