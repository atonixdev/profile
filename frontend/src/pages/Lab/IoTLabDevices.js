import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { iotLabService } from '../../services';
import { API_BASE_URL } from '../../services/apiClient';

const IoTLabDevices = () => {
  const outlet = useOutletContext?.() || {};
  const theme = outlet?.theme || 'light';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [location, setLocation] = useState('');
  const [metadataText, setMetadataText] = useState('{}');
  const [saving, setSaving] = useState(false);

  // Device selection + execution
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [code, setCode] = useState('# Write Python code to run on the selected device\nprint("hello from Atonix IoT Lab")\n');
  const [commandId, setCommandId] = useState(null);
  const [commandStatus, setCommandStatus] = useState('');
  const [commandError, setCommandError] = useState('');
  const [logs, setLogs] = useState([]);
  const commandStatusRef = useRef('');
  const lastLogIdRef = useRef(null);
  const pollRef = useRef({ status: null, logs: null });

  const commandWsRef = useRef(null);
  const deviceWsRef = useRef(null);
  const wsConnectedRef = useRef({ command: false, device: false });
  const wsIntentionalCloseRef = useRef({ command: false, device: false });

  useEffect(() => {
    commandStatusRef.current = commandStatus;
  }, [commandStatus]);

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

  const selectedDevice = useMemo(() => {
    if (!selectedDeviceId) return null;
    return items.find((d) => String(d.id) === String(selectedDeviceId)) || null;
  }, [items, selectedDeviceId]);

  const stopPolling = useCallback(() => {
    if (pollRef.current.status) {
      clearInterval(pollRef.current.status);
      pollRef.current.status = null;
    }
    if (pollRef.current.logs) {
      clearInterval(pollRef.current.logs);
      pollRef.current.logs = null;
    }
  }, []);

  const startPolling = useCallback((id) => {
    stopPolling();

    pollRef.current.status = setInterval(async () => {
      try {
        const res = await iotLabService.getCommand(id);
        const s = res?.data?.status || '';
        setCommandStatus(s);
        if (s === 'succeeded' || s === 'failed' || s === 'canceled') {
          stopPolling();
        }
      } catch {
        // ignore transient polling errors
      }
    }, 1500);

    pollRef.current.logs = setInterval(async () => {
      try {
        const params = {};
        if (lastLogIdRef.current) params.after_id = lastLogIdRef.current;
        params.limit = 200;
        const res = await iotLabService.getCommandLogs(id, { params });
        const list = Array.isArray(res.data) ? res.data : [];
        if (list.length) {
          lastLogIdRef.current = list[list.length - 1].id;
          setLogs((prev) => [...prev, ...list]);
        }
      } catch {
        // ignore transient polling errors
      }
    }, 800);
  }, [stopPolling]);

  const closeSockets = useCallback(() => {
    try {
      wsIntentionalCloseRef.current.command = true;
      if (commandWsRef.current) {
        commandWsRef.current.close();
        commandWsRef.current = null;
      }
    } catch {
      // ignore
    }
    try {
      wsIntentionalCloseRef.current.device = true;
      if (deviceWsRef.current) {
        deviceWsRef.current.close();
        deviceWsRef.current = null;
      }
    } catch {
      // ignore
    }
    wsConnectedRef.current = { command: false, device: false };
  }, []);

  useEffect(() => {
    return () => {
      stopPolling();
      closeSockets();
    };
  }, [stopPolling, closeSockets]);

  const wsBase = useMemo(() => {
    try {
      const u = new URL(API_BASE_URL);
      const scheme = u.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${scheme}//${u.host}`;
    } catch {
      // Fallback: best effort
      const isHttps = typeof window !== 'undefined' ? window.location.protocol === 'https:' : false;
      const host = typeof window !== 'undefined' ? window.location.host : 'localhost:8000';
      return `${isHttps ? 'wss:' : 'ws:'}//${host}`;
    }
  }, []);

  const startCommandWs = useCallback((id) => {
    if (!id) return;

    wsIntentionalCloseRef.current.command = false;
    wsConnectedRef.current.command = false;

    try {
      if (commandWsRef.current) {
        wsIntentionalCloseRef.current.command = true;
        commandWsRef.current.close();
      }
    } catch {
      // ignore
    }

    const url = `${wsBase}/ws/iot-lab/commands/${id}/`;
    let ws;
    try {
      ws = new WebSocket(url);
    } catch {
      startPolling(id);
      return;
    }
    commandWsRef.current = ws;

    const ensureFallbackTimer = setTimeout(() => {
      if (!wsConnectedRef.current.command) {
        try {
          wsIntentionalCloseRef.current.command = true;
          ws.close();
        } catch {
          // ignore
        }
        startPolling(id);
      }
    }, 900);

    ws.onopen = () => {
      clearTimeout(ensureFallbackTimer);
      wsConnectedRef.current.command = true;
      stopPolling();
    };

    ws.onmessage = (ev) => {
      let msg;
      try {
        msg = JSON.parse(ev.data);
      } catch {
        return;
      }
      const t = msg?.type;
      if (t === 'init') {
        const cmd = msg?.command;
        if (cmd?.status) setCommandStatus(cmd.status);
        const list = Array.isArray(msg?.logs) ? msg.logs : [];
        setLogs(list);
        if (list.length) lastLogIdRef.current = list[list.length - 1].id;
        return;
      }
      if (t === 'status') {
        const cmd = msg?.command;
        if (cmd?.status) {
          setCommandStatus(cmd.status);
          if (cmd.status === 'succeeded' || cmd.status === 'failed' || cmd.status === 'canceled') {
            try {
              wsIntentionalCloseRef.current.command = true;
              ws.close();
            } catch {
              // ignore
            }
          }
        }
        return;
      }
      if (t === 'log') {
        const row = msg?.log;
        if (row && typeof row === 'object') {
          if (row.id) lastLogIdRef.current = row.id;
          setLogs((prev) => [...prev, row]);
        }
      }
    };

    ws.onerror = () => {
      // Let onclose decide fallback.
    };

    ws.onclose = () => {
      clearTimeout(ensureFallbackTimer);
      commandWsRef.current = null;
      const s = String(commandStatusRef.current || '');
      const finished = s === 'succeeded' || s === 'failed' || s === 'canceled';
      if (!wsIntentionalCloseRef.current.command && !finished) {
        startPolling(id);
      }
    };
  }, [wsBase, startPolling, stopPolling]);

  const startDeviceWs = useCallback((deviceId) => {
    if (!deviceId) return;

    wsIntentionalCloseRef.current.device = false;
    wsConnectedRef.current.device = false;

    try {
      if (deviceWsRef.current) {
        wsIntentionalCloseRef.current.device = true;
        deviceWsRef.current.close();
      }
    } catch {
      // ignore
    }

    const url = `${wsBase}/ws/iot-lab/devices/${deviceId}/`;
    let ws;
    try {
      ws = new WebSocket(url);
    } catch {
      return;
    }
    deviceWsRef.current = ws;

    ws.onopen = () => {
      wsConnectedRef.current.device = true;
    };

    ws.onmessage = (ev) => {
      let msg;
      try {
        msg = JSON.parse(ev.data);
      } catch {
        return;
      }
      const t = msg?.type;
      const d = t === 'init' ? msg?.device : t === 'device' ? msg?.device : null;
      if (!d || !d.id) return;
      setItems((prev) => prev.map((row) => (String(row.id) === String(d.id) ? { ...row, ...d } : row)));
    };

    ws.onclose = () => {
      deviceWsRef.current = null;
    };
  }, [wsBase]);

  useEffect(() => {
    const flags = wsIntentionalCloseRef.current;
    if (selectedDeviceId) startDeviceWs(selectedDeviceId);
    return () => {
      try {
        flags.device = true;
        if (deviceWsRef.current) deviceWsRef.current.close();
      } catch {
        // ignore
      }
    };
  }, [selectedDeviceId, startDeviceWs]);

  useEffect(() => {
    const flags = wsIntentionalCloseRef.current;
    if (commandId) startCommandWs(commandId);
    return () => {
      try {
        flags.command = true;
        if (commandWsRef.current) commandWsRef.current.close();
      } catch {
        // ignore
      }
    };
  }, [commandId, startCommandWs]);

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

  const runCode = async () => {
    setCommandError('');

    if (!selectedDeviceId) {
      setCommandError('Select a device first');
      return;
    }
    if (!String(code || '').trim()) {
      setCommandError('Code cannot be empty');
      return;
    }

    setLogs([]);
    lastLogIdRef.current = null;
    setCommandStatus('queued');

    try {
      const res = await iotLabService.createCommand({
        device: selectedDeviceId,
        kind: 'run_python',
        payload: { code },
      });
      const id = res?.data?.id;
      if (!id) {
        setCommandError('Command created but no id returned');
        return;
      }
      setCommandId(id);
    } catch (e) {
      setCommandError(formatApiError(e, 'Failed to queue command'));
    }
  };

  const statusBadge = (status) => {
    const s = String(status || 'unknown');
    const cls = s === 'online'
      ? theme === 'dark'
        ? 'bg-green-500/20 text-green-200 border-green-500/20'
        : 'bg-green-50 text-green-700 border-green-200'
      : s === 'offline'
        ? theme === 'dark'
          ? 'bg-red-500/20 text-red-200 border-red-500/20'
          : 'bg-red-50 text-red-700 border-red-200'
        : s === 'maintenance'
          ? theme === 'dark'
            ? 'bg-yellow-500/20 text-yellow-100 border-yellow-500/20'
            : 'bg-yellow-50 text-yellow-800 border-yellow-200'
          : theme === 'dark'
            ? 'bg-white/10 text-gray-200 border-white/10'
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
        <p className={theme === 'dark' ? 'text-gray-300 mt-1' : 'text-gray-600 mt-1'}>Register devices and manage their status.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className={theme === 'dark' ? 'bg-white/5 border border-white/10 rounded-lg p-6' : 'bg-white rounded-lg shadow-md p-6'}>
        <h2 className={theme === 'dark' ? 'text-xl font-bold text-white mb-4' : 'text-xl font-bold text-gray-900 mb-4'}>Add Device</h2>
        <form onSubmit={createDevice} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={theme === 'dark' ? 'w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white outline-none' : 'w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 outline-none'}
                placeholder="e.g. greenhouse-sensor-01"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
              <input
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
                className={theme === 'dark' ? 'w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white outline-none' : 'w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 outline-none'}
                placeholder="e.g. ESP32"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={theme === 'dark' ? 'w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white outline-none' : 'w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 outline-none'}
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
              className={theme === 'dark' ? 'w-full font-mono text-xs px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white outline-none' : 'w-full font-mono text-xs px-4 py-3 rounded-lg border border-gray-300 text-gray-900 outline-none'}
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

      <div className={theme === 'dark' ? 'bg-white/5 border border-white/10 rounded-lg p-6' : 'bg-white rounded-lg shadow-md p-6'}>
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className={theme === 'dark' ? 'text-xl font-bold text-white' : 'text-xl font-bold text-gray-900'}>Devices</h2>
          <button
            type="button"
            onClick={load}
            className={theme === 'dark' ? 'px-4 py-2 border border-white/10 rounded-lg font-semibold hover:bg-white/10 text-white' : 'px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50'}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Loading…</div>
        ) : sorted.length === 0 ? (
          <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>No devices yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={theme === 'dark' ? 'text-left text-gray-300 border-b border-white/10' : 'text-left text-gray-600 border-b'}>
                  <th className="py-2">Name</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Location</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((d) => (
                  <tr
                    key={d.id}
                    className={
                      String(selectedDeviceId) === String(d.id)
                        ? theme === 'dark'
                          ? 'border-b last:border-b-0 bg-white/10'
                          : 'border-b last:border-b-0 bg-primary-50'
                        : 'border-b last:border-b-0'
                    }
                  >
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => setSelectedDeviceId(d.id)}
                        className={theme === 'dark' ? 'text-white font-semibold hover:underline' : 'text-gray-900 font-semibold hover:underline'}
                      >
                        {d.name}
                      </button>
                    </td>
                    <td className={theme === 'dark' ? 'py-2 text-gray-200' : 'py-2 text-gray-600'}>{d.device_type || '—'}</td>
                    <td className={theme === 'dark' ? 'py-2 text-gray-200' : 'py-2 text-gray-600'}>{d.location || '—'}</td>
                    <td className="py-2">{statusBadge(d.status)}</td>
                    <td className={theme === 'dark' ? 'py-2 text-gray-200' : 'py-2 text-gray-600'}>{d.last_seen_at ? new Date(d.last_seen_at).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Device execution panel */}
      <div className={theme === 'dark' ? 'bg-white/5 border border-white/10 rounded-lg p-6' : 'bg-white rounded-lg shadow-md p-6'}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <h2 className={theme === 'dark' ? 'text-xl font-bold text-white' : 'text-xl font-bold text-gray-900'}>Run Code</h2>
            <p className={theme === 'dark' ? 'text-sm text-gray-300 mt-1' : 'text-sm text-gray-600 mt-1'}>
              Select a device, run Python, and view logs/results.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={theme === 'dark' ? 'text-sm text-gray-300' : 'text-sm text-gray-700'}>
              Device: <span className={theme === 'dark' ? 'font-semibold text-white' : 'font-semibold text-gray-900'}>{selectedDevice?.name || 'None selected'}</span>
            </div>
            <button
              type="button"
              onClick={runCode}
              disabled={!selectedDeviceId}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
            >
              Run
            </button>
          </div>
        </div>

        {commandError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {commandError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className={theme === 'dark' ? 'block text-sm font-semibold text-gray-200 mb-2' : 'block text-sm font-semibold text-gray-700 mb-2'}>
              Python Code
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={14}
              className={theme === 'dark' ? 'w-full font-mono text-xs px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white outline-none' : 'w-full font-mono text-xs px-4 py-3 rounded-lg border border-gray-300 text-gray-900 outline-none'}
            />
            <div className={theme === 'dark' ? 'text-xs text-gray-400 mt-2' : 'text-xs text-gray-500 mt-2'}>
              This queues a command. A Raspberry Pi agent must be online to execute it.
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={theme === 'dark' ? 'block text-sm font-semibold text-gray-200' : 'block text-sm font-semibold text-gray-700'}>
                Console
              </label>
              <div className={theme === 'dark' ? 'text-xs text-gray-300' : 'text-xs text-gray-600'}>
                {commandId ? `Command #${commandId}` : '—'} {commandStatus ? `(${commandStatus})` : ''}
              </div>
            </div>
            <div className={theme === 'dark' ? 'rounded-lg border border-white/10 bg-black/40 p-3 h-[360px] overflow-auto' : 'rounded-lg border border-gray-200 bg-gray-50 p-3 h-[360px] overflow-auto'}>
              {logs.length === 0 ? (
                <div className={theme === 'dark' ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>
                  No logs yet.
                </div>
              ) : (
                <pre className={theme === 'dark' ? 'text-xs text-gray-100 whitespace-pre-wrap' : 'text-xs text-gray-900 whitespace-pre-wrap'}>
                  {logs.map((l) => {
                    const prefix = l.stream === 'stderr' ? '[stderr] ' : l.stream === 'stdout' ? '[stdout] ' : '';
                    return `${prefix}${l.message}`;
                  }).join('\n')}
                </pre>
              )}
            </div>

            {selectedDevice?.metadata?.health && (
              <div className={theme === 'dark' ? 'mt-3 text-xs text-gray-300' : 'mt-3 text-xs text-gray-600'}>
                Health: CPU {selectedDevice.metadata.health.cpu_percent ?? '—'}% · RAM {selectedDevice.metadata.health.mem_percent ?? '—'}% · Temp {selectedDevice.metadata.health.temp_c ?? '—'}°C
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IoTLabDevices;
