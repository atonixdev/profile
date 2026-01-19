import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { iotLabService } from '../../services';
import { API_BASE_URL } from '../../services/apiClient';

const IoTLabAutomation = () => {
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerText, setTriggerText] = useState('{}');
  const [actionText, setActionText] = useState('{}');
  const [saving, setSaving] = useState(false);

  const [alerts, setAlerts] = useState([]);
  const [alertsConnected, setAlertsConnected] = useState(false);
  const alertsWsRef = useRef(null);

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
      const res = await iotLabService.listAutomations();
      const list = res.data?.results || res.data || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(formatApiError(e, 'Failed to load automations'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loadAlerts = useCallback(async () => {
    try {
      const res = await iotLabService.listAlerts({ page_size: 50 });
      const list = res.data?.results || res.data || [];
      setAlerts(Array.isArray(list) ? list : []);
    } catch (e) {
      // Best-effort; realtime WS may still provide data.
    }
  }, []);

  useEffect(() => {
    // Realtime alerts stream
    loadAlerts();
    try {
      if (alertsWsRef.current) {
        try {
          alertsWsRef.current.close();
        } catch (e) {
          // ignore
        }
      }

      const url = `${wsBaseUrl}/ws/iot-lab/alerts/`;
      const ws = new WebSocket(url);
      alertsWsRef.current = ws;
      setAlertsConnected(false);

      ws.onopen = () => {
        setAlertsConnected(true);
      };

      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          if (msg.type === 'init' && Array.isArray(msg.alerts)) {
            setAlerts(msg.alerts);
            return;
          }
          if (msg.type === 'alert' && msg.alert) {
            setAlerts((prev) => {
              const next = [...prev];
              const idx = next.findIndex((a) => a?.id === msg.alert?.id);
              if (idx >= 0) next[idx] = { ...next[idx], ...msg.alert };
              else next.push(msg.alert);
              return next.slice(-50);
            });
          }
        } catch (e) {
          // ignore
        }
      };

      ws.onerror = () => {
        setAlertsConnected(false);
      };

      ws.onclose = () => {
        setAlertsConnected(false);
      };

      return () => {
        try {
          ws.close();
        } catch (e) {
          // ignore
        }
      };
    } catch (e) {
      setAlertsConnected(false);
      return undefined;
    }
  }, [loadAlerts, wsBaseUrl]);

  const resolveAlert = async (id) => {
    setError('');
    try {
      const res = await iotLabService.resolveAlert(id);
      const resolvedAt = res?.data?.resolved_at || new Date().toISOString();
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolved_at: resolvedAt } : a)));
    } catch (e) {
      setError(formatApiError(e, 'Failed to resolve alert'));
    }
  };

  const createAutomation = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    let trigger = {};
    let action = {};
    try {
      trigger = triggerText.trim() ? JSON.parse(triggerText) : {};
    } catch {
      setError('Trigger must be valid JSON');
      return;
    }
    try {
      action = actionText.trim() ? JSON.parse(actionText) : {};
    } catch {
      setError('Action must be valid JSON');
      return;
    }

    setSaving(true);
    try {
      await iotLabService.createAutomation({
        name: name.trim(),
        description,
        trigger,
        action,
        is_active: true,
      });
      setName('');
      setDescription('');
      setTriggerText('{}');
      setActionText('{}');
      await load();
    } catch (e2) {
      setError(formatApiError(e2, 'Failed to create automation'));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (job) => {
    setError('');
    try {
      await iotLabService.updateAutomation(job.id, { is_active: !job.is_active });
      await load();
    } catch (e) {
      setError(formatApiError(e, 'Failed to update automation'));
    }
  };

  const runNow = async (job) => {
    setError('');
    try {
      await iotLabService.runAutomation(job.id);
      await load();
    } catch (e) {
      setError(formatApiError(e, 'Failed to run automation'));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Automation Experiments</h1>
        <p className={isDark ? 'text-gray-300 mt-1' : 'text-gray-600 mt-1'}>Create automation jobs and run them on-demand.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className={isDark ? 'bg-white/5 border border-white/10 rounded-lg p-6' : 'bg-white rounded-lg shadow-md p-6'}>
        <h2 className={isDark ? 'text-xl font-bold text-white mb-4' : 'text-xl font-bold text-gray-900 mb-4'}>New Automation</h2>
        <form onSubmit={createAutomation} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={isDark ? 'block text-sm font-semibold text-gray-200 mb-2' : 'block text-sm font-semibold text-gray-700 mb-2'}>Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={isDark ? 'w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white outline-none' : 'w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 outline-none'}
                disabled={saving}
                placeholder="e.g. nightly-reset"
              />
            </div>
            <div>
              <label className={isDark ? 'block text-sm font-semibold text-gray-200 mb-2' : 'block text-sm font-semibold text-gray-700 mb-2'}>Description</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={isDark ? 'w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white outline-none' : 'w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 outline-none'}
                disabled={saving}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={isDark ? 'block text-sm font-semibold text-gray-200 mb-2' : 'block text-sm font-semibold text-gray-700 mb-2'}>Trigger (JSON)</label>
              <textarea
                value={triggerText}
                onChange={(e) => setTriggerText(e.target.value)}
                rows={6}
                className={isDark ? 'w-full font-mono text-xs px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white outline-none' : 'w-full font-mono text-xs px-4 py-3 rounded-lg border border-gray-300 text-gray-900 outline-none'}
                disabled={saving}
              />
            </div>
            <div>
              <label className={isDark ? 'block text-sm font-semibold text-gray-200 mb-2' : 'block text-sm font-semibold text-gray-700 mb-2'}>Action (JSON)</label>
              <textarea
                value={actionText}
                onChange={(e) => setActionText(e.target.value)}
                rows={6}
                className={isDark ? 'w-full font-mono text-xs px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white outline-none' : 'w-full font-mono text-xs px-4 py-3 rounded-lg border border-gray-300 text-gray-900 outline-none'}
                disabled={saving}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Create Automation'}
          </button>
        </form>
      </div>

      <div className={isDark ? 'bg-white/5 border border-white/10 rounded-lg p-6' : 'bg-white rounded-lg shadow-md p-6'}>
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className={isDark ? 'text-xl font-bold text-white' : 'text-xl font-bold text-gray-900'}>Alerts</h2>
          <div className={isDark ? 'text-xs text-gray-300' : 'text-xs text-gray-600'}>
            {alertsConnected ? 'Live' : 'Disconnected'}
          </div>
        </div>

        {alerts.length === 0 ? (
          <div className={isDark ? 'text-gray-300' : 'text-gray-600'}>No alerts yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDark ? 'text-left text-gray-300 border-b border-white/10' : 'text-left text-gray-600 border-b'}>
                  <th className="py-2">When</th>
                  <th className="py-2">Device</th>
                  <th className="py-2">Severity</th>
                  <th className="py-2">Title</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {alerts
                  .slice()
                  .sort((a, b) => {
                    const at = a?.created_at ? Date.parse(a.created_at) : 0;
                    const bt = b?.created_at ? Date.parse(b.created_at) : 0;
                    return bt - at;
                  })
                  .map((a) => (
                    <tr key={a.id} className={isDark ? 'border-b border-white/10 last:border-b-0' : 'border-b last:border-b-0'}>
                      <td className={isDark ? 'py-2 text-gray-200' : 'py-2 text-gray-600'}>
                        {a.created_at ? new Date(a.created_at).toLocaleString() : '—'}
                      </td>
                      <td className={isDark ? 'py-2 text-white font-semibold' : 'py-2 text-gray-900 font-semibold'}>
                        {a.device_name || (a.device ? `#${a.device}` : '—')}
                      </td>
                      <td className={isDark ? 'py-2 text-gray-200' : 'py-2 text-gray-600'}>{a.severity || 'info'}</td>
                      <td className={isDark ? 'py-2 text-gray-200' : 'py-2 text-gray-600'}>
                        <div className={isDark ? 'text-white font-semibold' : 'text-gray-900 font-semibold'}>{a.title || 'Alert'}</div>
                        {a.message ? <div className={isDark ? 'text-gray-300' : 'text-gray-600'}>{a.message}</div> : null}
                      </td>
                      <td className={isDark ? 'py-2 text-gray-200' : 'py-2 text-gray-600'}>{a.resolved_at ? 'Resolved' : 'Open'}</td>
                      <td className="py-2">
                        {a.resolved_at ? (
                          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>—</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => resolveAlert(a.id)}
                            className={isDark ? 'px-3 py-1.5 border border-white/10 rounded font-semibold hover:bg-white/10 text-white' : 'px-3 py-1.5 border border-gray-200 rounded font-semibold hover:bg-gray-50'}
                          >
                            Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={isDark ? 'bg-white/5 border border-white/10 rounded-lg p-6' : 'bg-white rounded-lg shadow-md p-6'}>
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className={isDark ? 'text-xl font-bold text-white' : 'text-xl font-bold text-gray-900'}>Automations</h2>
          <button
            type="button"
            onClick={load}
            className={isDark ? 'px-4 py-2 border border-white/10 rounded-lg font-semibold hover:bg-white/10 text-white' : 'px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50'}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loading…</div>
        ) : items.length === 0 ? (
          <div className={isDark ? 'text-gray-300' : 'text-gray-600'}>No automations yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDark ? 'text-left text-gray-300 border-b border-white/10' : 'text-left text-gray-600 border-b'}>
                  <th className="py-2">Name</th>
                  <th className="py-2">Active</th>
                  <th className="py-2">Last Run</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((job) => (
                  <tr key={job.id} className={isDark ? 'border-b border-white/10 last:border-b-0' : 'border-b last:border-b-0'}>
                    <td className={isDark ? 'py-2 text-white font-semibold' : 'py-2 text-gray-900 font-semibold'}>{job.name}</td>
                    <td className={isDark ? 'py-2 text-gray-200' : 'py-2 text-gray-600'}>{job.is_active ? 'Yes' : 'No'}</td>
                    <td className={isDark ? 'py-2 text-gray-200' : 'py-2 text-gray-600'}>{job.last_run_at ? new Date(job.last_run_at).toLocaleString() : '—'}</td>
                    <td className={isDark ? 'py-2 text-gray-200' : 'py-2 text-gray-600'}>{job.last_run_status || '—'}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => toggleActive(job)}
                          className={isDark ? 'px-3 py-1.5 border border-white/10 rounded font-semibold hover:bg-white/10 text-white' : 'px-3 py-1.5 border border-gray-200 rounded font-semibold hover:bg-gray-50'}
                        >
                          {job.is_active ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          type="button"
                          onClick={() => runNow(job)}
                          className="px-3 py-1.5 bg-primary-600 text-white rounded font-semibold hover:bg-primary-700"
                        >
                          Run Now
                        </button>
                      </div>
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

export default IoTLabAutomation;
