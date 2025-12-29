import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { iotLabService } from '../../services';

const IoTLabAgriRules = () => {
  const outlet = useOutletContext?.() || {};
  const theme = outlet?.theme || 'light';

  const [sites, setSites] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState('');

  const [zones, setZones] = useState([]);
  const [rules, setRules] = useState([]);

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
      setZones([]);
      setRules([]);
      return;
    }

    setBusy(true);
    setError('');
    try {
      const [zonesRes, rulesRes] = await Promise.all([
        iotLabService.listIrrigationZones({ site: siteId }),
        iotLabService.listIrrigationRules({ site: siteId }),
      ]);

      const z = zonesRes.data?.results || zonesRes.data || [];
      const r = rulesRes.data?.results || rulesRes.data || [];

      setZones(Array.isArray(z) ? z : []);
      setRules(Array.isArray(r) ? r : []);
    } catch (e) {
      setError(formatApiError(e, 'Failed to load rules'));
      setZones([]);
      setRules([]);
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

  const zoneNameById = useMemo(() => {
    const map = {};
    for (const z of zones) map[String(z.id)] = z.name;
    return map;
  }, [zones]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${titleClass}`}>Agriculture • Rules</h1>
        <p className={mutedClass}>Irrigation rule definitions and last decision status.</p>
      </div>

      <div className={panelClass}>
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
          <div className="min-w-0">
            <div className={`text-sm font-semibold ${labelClass}`}>Farm Site</div>
            <div className={`text-xs ${mutedClass}`}>Rules are scoped to a zone.</div>
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
        <div className={`text-lg font-bold ${titleClass}`}>Rules</div>
        <div className={`text-xs ${mutedClass} mt-1`}>Create rules in Django Admin for now. Scheduler command: python manage.py evaluate_irrigation_rules</div>

        <div className="mt-4 space-y-3">
          {rules.length === 0 ? (
            <div className={mutedClass}>No rules found.</div>
          ) : (
            rules.map((rule) => (
              <div key={rule.id} className={theme === 'dark' ? 'border border-white/10 rounded-lg p-4' : 'border border-gray-100 rounded-lg p-4'}>
                <div className={`font-semibold ${titleClass}`}>{rule.name}</div>
                <div className={`text-xs ${mutedClass}`}>Zone: {zoneNameById[String(rule.zone)] || rule.zone_name || rule.zone}</div>
                <div className={`text-xs ${mutedClass}`}>Enabled: {rule.enabled ? 'yes' : 'no'}</div>
                <div className={`text-xs ${mutedClass}`}>Last evaluated: {rule.last_evaluated_at ? new Date(rule.last_evaluated_at).toLocaleString() : 'n/a'}</div>
                <div className={`text-xs ${mutedClass}`}>Last decision: {rule.last_decision || 'n/a'}</div>
                {rule.last_decision_reason ? (
                  <div className={`text-xs ${mutedClass}`}>Reason: {rule.last_decision_reason}</div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default IoTLabAgriRules;
