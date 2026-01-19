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

const Compare = ({ experimentType, titleOverride } = {}) => {
  const outlet = useOutletContext();
  const { search, settings, setSettings, theme = 'light' } = outlet || {};
  const [runs, setRuns] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [metricKey, setMetricKey] = useState(() => settings?.compareMetric || 'duration_ms');
  const [logs, setLogs] = useState({});

  const compareCap = Number(settings?.compareCap || 5);
  const logsLimit = Number(settings?.logsLimit || 200);

  const headerMutedClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const panelClass = theme === 'dark' ? 'bg-white/5 border border-white/10 rounded-lg p-6' : 'bg-white rounded-lg shadow-md p-6';
  const titleClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const labelClass = theme === 'dark' ? 'text-gray-200' : 'text-gray-700';
  const metaTextClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const subtleTextClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const buttonClass = theme === 'dark'
    ? 'px-4 py-2 border border-white/10 rounded-lg font-semibold hover:bg-white/10 text-white disabled:opacity-50'
    : 'px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50';
  const selectClass = theme === 'dark'
    ? 'px-3 py-2 border border-white/10 bg-white/5 text-white rounded-lg'
    : 'px-3 py-2 border border-gray-300 rounded-lg';

  useEffect(() => {
    if (!setSettings) return;
    setSettings((prev) => ({ ...prev, compareMetric: metricKey }));
  }, [metricKey, setSettings]);

  useEffect(() => {
    const load = async () => {
      const res = await labService.getRuns(experimentType ? { experiment_type: experimentType } : undefined);
      const list = res.data?.results || res.data || [];
      setRuns(Array.isArray(list) ? list : []);
    };
    load();
  }, [experimentType]);

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
          <h1 className="text-3xl font-bold">{titleOverride || 'Compare Experiments'}</h1>
          <p className={`${headerMutedClass} mt-1`}>Select 2–5 runs to compare metrics, parameters, and outputs.</p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={downloadComparison}
            disabled={selectedRuns.length < 2}
            className={buttonClass}
          >
            Export Comparison
          </button>
        </div>
      </div>

      <div className={panelClass}>
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <div className={`text-sm font-semibold ${subtleTextClass}`}>Select Runs (max {compareCap})</div>
          <div className="md:ml-auto flex items-center gap-2">
            <label className={`text-sm font-semibold ${labelClass}`}>Metric</label>
            <select
              value={metricKey}
              onChange={(e) => setMetricKey(e.target.value)}
              className={selectClass}
            >
              {metricOptions.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className={theme === 'dark' ? 'w-full text-sm text-gray-100' : 'w-full text-sm'}>
            <thead>
              <tr className={theme === 'dark' ? 'text-left text-gray-300 border-b border-white/10' : 'text-left text-gray-600 border-b'}>
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
                  <tr key={r.id} className={theme === 'dark' ? 'border-b border-white/10 last:border-b-0' : 'border-b last:border-b-0'}>
                    <td className="py-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggleSelected(r.id)}
                      />
                    </td>
                    <td className={theme === 'dark' ? 'py-2 font-semibold text-white' : 'py-2 font-semibold'}>#{r.id}</td>
                    <td className="py-2">
                      <div className={`font-semibold ${titleClass}`}>{r.experiment?.name || r.experiment?.slug}</div>
                      <div className={`text-xs ${metaTextClass}`}>{r.experiment?.experiment_type}</div>
                    </td>
                    <td className="py-2">{r.status}</td>
                    <td className="py-2">{r.created_at ? new Date(r.created_at).toLocaleString() : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className={`text-xs ${metaTextClass} mt-3`}>Selected: {selectedRuns.length} (need at least 2 to compare)</div>
      </div>

      {selectedRuns.length >= 2 && (
        <>
          <MetricsBarChart title={`Metrics Comparison (${metricKey})`} items={chartItems} theme={theme} />

          <div className={panelClass}>
            <h3 className={`text-lg font-bold ${titleClass} mb-4`}>Parameter Differences</h3>
            {paramDiff.length === 0 ? (
              <div className={subtleTextClass}>No parameters recorded for these runs.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className={theme === 'dark' ? 'w-full text-sm text-gray-100' : 'w-full text-sm'}>
                  <thead>
                    <tr className={theme === 'dark' ? 'text-left text-gray-300 border-b border-white/10' : 'text-left text-gray-600 border-b'}>
                      <th className="py-2">Parameter</th>
                      {selectedRuns.map((r) => (
                        <th key={r.id} className="py-2">Run #{r.id}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paramDiff.map((row) => (
                      <tr
                        key={row.key}
                        className={
                          theme === 'dark'
                            ? `border-b border-white/10 last:border-b-0 ${row.isDifferent ? 'bg-yellow-500/10' : ''}`
                            : `border-b last:border-b-0 ${row.isDifferent ? 'bg-yellow-50' : ''}`
                        }
                      >
                        <td className={`py-2 font-semibold ${titleClass}`}>{row.key}</td>
                        {row.values.map((v, idx) => (
                          <td key={idx} className={theme === 'dark' ? 'py-2 font-mono text-xs text-gray-100' : 'py-2 font-mono text-xs text-gray-700'}>{JSON.stringify(v)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className={`text-xs ${metaTextClass} mt-3`}>Rows highlighted when values differ.</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedRuns.map((r) => (
              <React.Fragment key={r.id}>
                <JsonPanel title={`Run #${r.id} Metrics`} value={r.metrics} theme={theme} />
                <JsonPanel title={`Run #${r.id} Output`} value={r.output} theme={theme} />
              </React.Fragment>
            ))}
          </div>

          <div className={panelClass}>
            <h3 className={`text-lg font-bold ${titleClass} mb-4`}>Artifacts / Logs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedRuns.map((r) => (
                <div key={r.id} className={theme === 'dark' ? 'border border-white/10 bg-white/5 rounded-lg p-4' : 'border border-gray-200 rounded-lg p-4'}>
                  <div className={`font-bold ${titleClass} mb-2`}>Run #{r.id}</div>
                  <div className={`text-xs ${metaTextClass} mb-3`}>Local SQLite path: {r.local_sqlite_path || '—'}</div>
                  <div className="text-xs space-y-2">
                    {(logs[r.id] || []).slice(0, 20).map((l, idx) => (
                      <div key={idx} className="flex gap-2">
                        <span className={theme === 'dark' ? 'font-bold text-gray-100' : 'font-bold'}>{l.level}:</span>
                        <span className={theme === 'dark' ? 'text-gray-100' : 'text-gray-700'}>{l.message}</span>
                      </div>
                    ))}
                    {(logs[r.id] || []).length === 0 && (
                      <div className={subtleTextClass}>No logs found.</div>
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
