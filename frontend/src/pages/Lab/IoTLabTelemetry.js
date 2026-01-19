import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { iotLabService } from '../../services';
import JsonPanel from '../../components/Lab/JsonPanel';
import { API_BASE_URL } from '../../services/apiClient';

const IoTLabTelemetry = () => {
  const outlet = useOutletContext();
  const theme = outlet?.theme || 'light';

  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [error, setError] = useState('');

  const [deviceLive, setDeviceLive] = useState(null);
  const [deviceMetaById, setDeviceMetaById] = useState({});

  const wsRef = useRef(null);
  const deviceWsRef = useRef(null);
  const deviceListWsRef = useRef({});
  const wsConnectedRef = useRef(false);
  const deviceWsConnectedRef = useRef(false);

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

  const [metricsText, setMetricsText] = useState('{}');
  const [rawText, setRawText] = useState('');
  const [sending, setSending] = useState(false);

  const headerMutedClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const panelClass = theme === 'dark' ? 'bg-white/5 border border-white/10 rounded-lg p-6' : 'bg-white rounded-lg shadow-md p-6';
  const panelClassSpaced = `${panelClass} space-y-4`;
  const titleClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const labelClass = theme === 'dark' ? 'text-gray-200' : 'text-gray-700';
  const inputClass = theme === 'dark'
    ? 'w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white outline-none placeholder:text-gray-400'
    : 'w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 outline-none';
  const selectClass = theme === 'dark'
    ? 'w-full md:max-w-xl px-3 py-2 border border-white/10 bg-white/5 text-white rounded-lg'
    : 'w-full md:max-w-xl px-3 py-2 border border-gray-300 rounded-lg';
  const subtleTextClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const metaTextClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const refreshBtnClass = theme === 'dark'
    ? 'px-4 py-2 border border-white/10 rounded-lg font-semibold hover:bg-white/10 text-white'
    : 'px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50';

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

  const closeWs = useCallback(() => {
    try {
      if (wsRef.current) wsRef.current.close();
    } catch (e) {
      // ignore
    }
    wsRef.current = null;
    wsConnectedRef.current = false;

    try {
      if (deviceWsRef.current) deviceWsRef.current.close();
    } catch (e) {
      // ignore
    }
    deviceWsRef.current = null;
    deviceWsConnectedRef.current = false;
  }, []);

  const closeDeviceListSockets = useCallback(() => {
    const sockets = deviceListWsRef.current || {};
    Object.keys(sockets).forEach((id) => {
      try {
        sockets[id]?.close();
      } catch (e) {
        // ignore
      }
    });
    deviceListWsRef.current = {};
  }, []);

  const formatStatus = useCallback((value) => {
    if (!value) return '—';
    const s = String(value);
    return s;
  }, []);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  useEffect(() => {
    return () => {
      closeDeviceListSockets();
    };
  }, [closeDeviceListSockets]);

  useEffect(() => {
    // Keep a lightweight WS connection per device to get live status labels
    // for the dropdown list (online/offline/etc.).
    const nextIds = new Set(devices.map((d) => String(d.id)));
    const sockets = deviceListWsRef.current || {};

    // Close sockets for removed devices
    Object.keys(sockets).forEach((id) => {
      if (!nextIds.has(String(id))) {
        try {
          sockets[id]?.close();
        } catch (e) {
          // ignore
        }
        delete sockets[id];
      }
    });

    // Open sockets for new devices
    devices.forEach((d) => {
      const id = String(d.id);
      if (sockets[id]) return;

      try {
        const url = `${wsBaseUrl}/ws/iot-lab/devices/${id}/`;
        const ws = new WebSocket(url);
        sockets[id] = ws;

        ws.onmessage = (evt) => {
          try {
            const msg = JSON.parse(evt.data);
            if ((msg.type === 'init' || msg.type === 'update') && msg.device) {
              setDeviceMetaById((prev) => ({
                ...prev,
                [id]: {
                  ...(prev[id] || {}),
                  ...msg.device,
                },
              }));
            }
          } catch (e) {
            // ignore
          }
        };

        ws.onerror = () => {
          // ignore
        };

        ws.onclose = () => {
          // keep last-known status; reconnect handled by page reload/navigation
        };
      } catch (e) {
        // ignore
      }
    });

    deviceListWsRef.current = sockets;
  }, [devices, wsBaseUrl]);

  useEffect(() => {
    if (!selectedDeviceId) {
      closeWs();
      setDeviceLive(null);
      return;
    }

    closeWs();
    const url = `${wsBaseUrl}/ws/iot-lab/telemetry/${selectedDeviceId}/`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    const fallbackTimer = window.setTimeout(() => {
      if (!wsConnectedRef.current) {
        loadTelemetry(selectedDeviceId);
      }
    }, 1200);

    ws.onopen = () => {
      wsConnectedRef.current = true;
    };

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg.type === 'init') {
          if (Array.isArray(msg.records)) setRecords(msg.records);
        }
        if (msg.type === 'record' && msg.record) {
          setRecords((prev) => [msg.record, ...prev]);
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
  }, [closeWs, loadTelemetry, selectedDeviceId, wsBaseUrl]);

  useEffect(() => {
    if (!selectedDeviceId) return;

    const url = `${wsBaseUrl}/ws/iot-lab/devices/${selectedDeviceId}/`;
    const ws = new WebSocket(url);
    deviceWsRef.current = ws;

    const fallbackTimer = window.setTimeout(() => {
      // If device WS never connects, we still show whatever came from listDevices.
      if (!deviceWsConnectedRef.current) {
        setDeviceLive(null);
      }
    }, 1200);

    ws.onopen = () => {
      deviceWsConnectedRef.current = true;
    };

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg.type === 'init' && msg.device) {
          setDeviceLive(msg.device);
        }
        if (msg.type === 'update' && msg.device) {
          setDeviceLive((prev) => ({ ...(prev || {}), ...msg.device }));
        }
      } catch (e) {
        // ignore
      }
    };

    ws.onerror = () => {
      // ignore
    };

    ws.onclose = () => {
      deviceWsConnectedRef.current = false;
    };

    return () => {
      window.clearTimeout(fallbackTimer);
      try {
        if (deviceWsRef.current) deviceWsRef.current.close();
      } catch (e) {
        // ignore
      }
      deviceWsRef.current = null;
      deviceWsConnectedRef.current = false;
    };
  }, [selectedDeviceId, wsBaseUrl]);

  useEffect(() => {
    loadTelemetry(selectedDeviceId);
  }, [selectedDeviceId, loadTelemetry]);

  const selectedDevice = useMemo(() => {
    return devices.find((d) => String(d.id) === String(selectedDeviceId)) || null;
  }, [devices, selectedDeviceId]);

  const deviceForHeader = deviceLive || selectedDevice;

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
        <p className={`${headerMutedClass} mt-1`}>View device readings and submit test telemetry events.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className={panelClassSpaced}>
        <div>
          <label className={`block text-sm font-semibold ${labelClass} mb-2`}>Device</label>
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            disabled={loading || devices.length === 0}
            className={selectClass}
          >
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({formatStatus(deviceMetaById[String(d.id)]?.status || d.status)})
              </option>
            ))}
          </select>
          {!loading && devices.length === 0 && (
            <div className={`text-sm ${subtleTextClass} mt-2`}>No devices available. Create one in Device Manager first.</div>
          )}
          {selectedDevice && (
            <div className={`text-xs ${metaTextClass} mt-2`}>
              Type: {deviceForHeader?.device_type || '—'} • Location: {deviceForHeader?.location || '—'} • Status: {deviceForHeader?.status || '—'} • Last seen:{' '}
              {deviceForHeader?.last_seen_at ? new Date(deviceForHeader.last_seen_at).toLocaleString() : '—'}
            </div>
          )}
        </div>
      </div>

      <div className={panelClass}>
        <h2 className={`text-xl font-bold ${titleClass} mb-4`}>Submit Telemetry (Test)</h2>
        <form onSubmit={submitTelemetry} className="space-y-4">
          <div>
            <label className={`block text-sm font-semibold ${labelClass} mb-2`}>Metrics (JSON)</label>
            <textarea
              value={metricsText}
              onChange={(e) => setMetricsText(e.target.value)}
              rows={6}
              className={theme === 'dark'
                ? 'w-full font-mono text-xs px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white outline-none placeholder:text-gray-400'
                : 'w-full font-mono text-xs px-4 py-3 rounded-lg border border-gray-300 text-gray-900 outline-none'}
              disabled={sending}
            />
          </div>
          <div>
            <label className={`block text-sm font-semibold ${labelClass} mb-2`}>Raw Text (optional)</label>
            <input
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className={inputClass}
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

      <div className={panelClass}>
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className={`text-xl font-bold ${titleClass}`}>Recent Readings</h2>
          <button
            type="button"
            onClick={() => loadTelemetry(selectedDeviceId)}
            className={refreshBtnClass}
            disabled={loadingRecords || !selectedDeviceId}
          >
            Refresh
          </button>
        </div>

        {loadingRecords ? (
          <div className={subtleTextClass}>Loading…</div>
        ) : records.length === 0 ? (
          <div className={subtleTextClass}>No telemetry records yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {records.slice(0, 8).map((r) => (
              <div
                key={r.id}
                className={theme === 'dark' ? 'border border-white/10 rounded-lg p-4 bg-white/5' : 'border border-gray-200 rounded-lg p-4'}
              >
                <div className={`text-sm font-semibold ${titleClass}`}>{r.device_name || 'Device'}</div>
                <div className={`text-xs ${metaTextClass} mb-3`}>{r.timestamp ? new Date(r.timestamp).toLocaleString() : '—'}</div>
                <JsonPanel title="Metrics" value={r.metrics} theme={theme} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IoTLabTelemetry;
