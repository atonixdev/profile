import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { iotLabService } from '../../services';

const IoTLabAgriFields = () => {
  const outlet = useOutletContext?.() || {};
  const theme = outlet?.theme || 'light';

  const [sites, setSites] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState('');

  const [fields, setFields] = useState([]);
  const [nodes, setNodes] = useState([]);

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

  const loadData = useCallback(async (siteId) => {
    if (!siteId) {
      setFields([]);
      setNodes([]);
      return;
    }

    setBusy(true);
    setError('');
    try {
      const [fieldsRes, nodesRes] = await Promise.all([
        iotLabService.listAgriFields({ site: siteId }),
        iotLabService.listAgriNodes({ site: siteId }),
      ]);

      const f = fieldsRes.data?.results || fieldsRes.data || [];
      const n = nodesRes.data?.results || nodesRes.data || [];
      setFields(Array.isArray(f) ? f : []);
      setNodes(Array.isArray(n) ? n : []);
    } catch (e) {
      setError(formatApiError(e, 'Failed to load fields/nodes'));
      setFields([]);
      setNodes([]);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    loadSites();
  }, [loadSites]);

  useEffect(() => {
    loadData(selectedSiteId);
  }, [selectedSiteId, loadData]);

  const nodesByFieldId = useMemo(() => {
    const map = {};
    for (const node of nodes) {
      if (node?.field != null) {
        const k = String(node.field);
        map[k] = map[k] || [];
        map[k].push(node);
      }
    }
    return map;
  }, [nodes]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${titleClass}`}>Agriculture • Fields</h1>
        <p className={mutedClass}>Farm → Fields → Nodes overview (v1).</p>
      </div>

      <div className={panelClass}>
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
          <div className="min-w-0">
            <div className={`text-sm font-semibold ${labelClass}`}>Farm Site</div>
            <div className={`text-xs ${mutedClass}`}>Select a site to view fields and controllers.</div>
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
          <button className={buttonClass} type="button" disabled={busy || loading} onClick={() => loadData(selectedSiteId)}>
            Refresh
          </button>
        </div>
      </div>

      <div className={panelClass}>
        <div className={`text-lg font-bold ${titleClass}`}>Fields</div>
        <div className={`text-xs ${mutedClass} mt-1`}>Create fields/nodes in Django Admin or via API.</div>

        <div className="mt-4 space-y-4">
          {fields.length === 0 ? (
            <div className={mutedClass}>No fields found.</div>
          ) : (
            fields.map((field) => (
              <div key={field.id} className={theme === 'dark' ? 'border border-white/10 rounded-lg p-4' : 'border border-gray-100 rounded-lg p-4'}>
                <div className={`font-semibold ${titleClass}`}>{field.name}</div>
                <div className={`text-xs ${mutedClass}`}>Area (ha): {field.area_hectares ?? 'n/a'}</div>

                <div className="mt-3">
                  <div className={`text-sm font-semibold ${labelClass}`}>Nodes</div>
                  {(nodesByFieldId[String(field.id)] || []).length === 0 ? (
                    <div className={`text-xs ${mutedClass} mt-1`}>No nodes for this field.</div>
                  ) : (
                    <ul className={`text-sm ${mutedClass} mt-1 space-y-1`}>
                      {(nodesByFieldId[String(field.id)] || []).map((node) => (
                        <li key={node.id}>
                          {node.name} • device: {node.device_name || node.device} • connectivity: {node.connectivity}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default IoTLabAgriFields;
