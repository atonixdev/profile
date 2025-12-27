import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { labService } from '../../services';
import MetricsBarChart from '../../components/Lab/MetricsBarChart';
import JsonPanel from '../../components/Lab/JsonPanel';

const pickNumericMetricKeys = (runs) => {
  const keys = new Set();
  runs.forEach((r) => {
    Object.entries(r.metrics || {}).forEach(([k, v]) => {
      if (typeof v === 'number' && Number.isFinite(v)) keys.add(k);
    });
  });
  return Array.from(keys);
};

const Compare = () => {
  const { search, settings, setSettings } = useOutletContext();
  const [runs, setRuns] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [metricKey, setMetricKey] = useState(() => settings?.compareMetric || 'duration_ms');
  const [logs, setLogs] = useState({});

  const compareCap = Number(settings?.compareCap || 5);
  const logsLimit = Number(settings?.logsLimit || 200);

  useEffect(() => {
    if (!setSettings) return;
    setSettings((prev) => ({ ...prev, compareMetric: metricKey }));
  }, [metricKey, setSettings]);

  useEffect(() => {
    const load = async () => {
      const res = await labService.getRuns();
      const list = res.data?.results || res.data || [];
      setRuns(Array.isArray(list) ? list : []);
    };
    load();
  }, []);

  const filteredRuns = useMemo(() => {
    if (!search) return runs;
    const q = search.toLowerCase();
    return runs.filter((r) => {
      const name = r.experiment?.name || r.experiment?.slug || '';
      return name.toLowerCase().includes(q) || String(r.id).includes(q);
    });
  }, [runs, search]);

  const selectedRuns = useMemo(() => {
    const set = new Set(selectedIds.map(String));
    return runs.filter((r) => set.has(String(r.id)));
  }, [runs, selectedIds]);

  const metricOptions = useMemo(() => {
    const keys = new Set(['duration_ms']);
    pickNumericMetricKeys(runs).forEach((k) => keys.add(k));
    return Array.from(keys);
  }, [runs]);

  useEffect(() => {
    const loadLogs = async () => {
      const entries = await Promise.all(
        selectedRuns.map(async (r) => {
          try {
            const resp = await labService.getRunLogs(r.id, logsLimit);
            return [r.id, resp.data || []];
          } catch {
            return [r.id, []];
          }
        })
      );

      setLogs(Object.fromEntries(entries));
    };

    if (selectedRuns.length > 0) loadLogs();
  }, [selectedRuns, logsLimit]);

  const chartItems = useMemo(() => {
    return selectedRuns.map((r) => {
      const value = metricKey === 'duration_ms' ? (r.duration_ms || 0) : (r.metrics?.[metricKey] || 0);
      const label = `#${r.id}`;
      return { label, value };
    });
  }, [selectedRuns, metricKey]);

  const paramDiff = useMemo(() => {
    const keys = new Set();
    selectedRuns.forEach((r) => Object.keys(r.params || {}).forEach((k) => keys.add(k)));
    return Array.from(keys).sort().map((k) => {
      const values = selectedRuns.map((r) => r.params?.[k]);
      const distinct = new Set(values.map((v) => JSON.stringify(v)));
      return { key: k, values, isDifferent: distinct.size > 1 };
    });
  }, [selectedRuns]);

  const toggleSelected = (id) => {
    setSelectedIds((prev) => {
      const set = new Set(prev.map(String));
      const key = String(id);
      if (set.has(key)) {
        set.delete(key);
      } else {
        if (set.size >= compareCap) return prev; // selection cap
        set.add(key);
      }
      return Array.from(set);
    });
  };

  const downloadComparison = () => {
    const payload = {
      metricKey,
      selectedRuns,
      paramDiff,
      generatedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lab-comparison-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Compare Experiments</h1>
          <p className="text-gray-600 mt-1">Select 2–5 runs to compare metrics, parameters, and outputs.</p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={downloadComparison}
            disabled={selectedRuns.length < 2}
            className="px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50"
          >
            Export Comparison
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <div className="text-sm text-gray-600 font-semibold">Select Runs (max {compareCap})</div>
          <div className="md:ml-auto flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-700">Metric</label>
            <select
              value={metricKey}
              onChange={(e) => setMetricKey(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              {metricOptions.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                <th className="py-2">Pick</th>
                <th className="py-2">Run</th>
                <th className="py-2">Experiment</th>
                <th className="py-2">Status</th>
                <th className="py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredRuns.map((r) => {
                const checked = selectedIds.map(String).includes(String(r.id));
                const disabled = !checked && selectedIds.length >= compareCap;
                return (
                  <tr key={r.id} className="border-b last:border-b-0">
                    <td className="py-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggleSelected(r.id)}
                      />
                    </td>
                    <td className="py-2 font-semibold">#{r.id}</td>
                    <td className="py-2">
                      <div className="font-semibold text-gray-900">{r.experiment?.name || r.experiment?.slug}</div>
                      <div className="text-xs text-gray-500">{r.experiment?.experiment_type}</div>
                    </td>
                    <td className="py-2">{r.status}</td>
                    <td className="py-2">{r.created_at ? new Date(r.created_at).toLocaleString() : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="text-xs text-gray-500 mt-3">Selected: {selectedRuns.length} (need at least 2 to compare)</div>
      </div>

      {selectedRuns.length >= 2 && (
        <>
          <MetricsBarChart title={`Metrics Comparison (${metricKey})`} items={chartItems} />

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Parameter Differences</h3>
            {paramDiff.length === 0 ? (
              <div className="text-gray-600">No parameters recorded for these runs.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 border-b">
                      <th className="py-2">Parameter</th>
                      {selectedRuns.map((r) => (
                        <th key={r.id} className="py-2">Run #{r.id}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paramDiff.map((row) => (
                      <tr key={row.key} className={`border-b last:border-b-0 ${row.isDifferent ? 'bg-yellow-50' : ''}`}>
                        <td className="py-2 font-semibold text-gray-900">{row.key}</td>
                        {row.values.map((v, idx) => (
                          <td key={idx} className="py-2 font-mono text-xs text-gray-700">{JSON.stringify(v)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="text-xs text-gray-500 mt-3">Rows highlighted when values differ.</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedRuns.map((r) => (
              <React.Fragment key={r.id}>
                <JsonPanel title={`Run #${r.id} Metrics`} value={r.metrics} />
                <JsonPanel title={`Run #${r.id} Output`} value={r.output} />
              </React.Fragment>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Artifacts / Logs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedRuns.map((r) => (
                <div key={r.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="font-bold text-gray-900 mb-2">Run #{r.id}</div>
                  <div className="text-xs text-gray-500 mb-3">Local SQLite path: {r.local_sqlite_path || '—'}</div>
                  <div className="text-xs space-y-2">
                    {(logs[r.id] || []).slice(0, 20).map((l, idx) => (
                      <div key={idx} className="flex gap-2">
                        <span className="font-bold">{l.level}:</span>
                        <span className="text-gray-700">{l.message}</span>
                      </div>
                    ))}
                    {(logs[r.id] || []).length === 0 && (
                      <div className="text-gray-600">No logs found.</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Compare;
