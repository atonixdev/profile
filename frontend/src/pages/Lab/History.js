import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { labService } from '../../services';
import JsonPanel from '../../components/Lab/JsonPanel';

const StatusBadge = ({ status }) => {
  const cls =
    status === 'succeeded'
      ? 'bg-green-100 text-green-700'
      : status === 'failed'
      ? 'bg-red-100 text-red-700'
      : 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-1 rounded text-xs font-semibold ${cls}`}>{status}</span>;
};

const History = () => {
  const { search } = useOutletContext();
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedRunId, setSelectedRunId] = useState('');
  const [selectedRun, setSelectedRun] = useState(null);
  const [runLogs, setRunLogs] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await labService.getRuns();
        const list = res.data?.results || res.data || [];
        setRuns(Array.isArray(list) ? list : []);
      } catch {
        setError('Failed to load experiment history.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = (search || '').toLowerCase();
    return runs.filter((r) => {
      const matchesSearch =
        !q ||
        (r.experiment?.name || '').toLowerCase().includes(q) ||
        (r.experiment?.slug || '').toLowerCase().includes(q) ||
        (r.status || '').toLowerCase().includes(q);

      const matchesStatus = !statusFilter || r.status === statusFilter;
      const matchesType =
        !typeFilter || r.experiment?.experiment_type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [runs, search, statusFilter, typeFilter]);

  useEffect(() => {
    const loadDetails = async () => {
      if (!selectedRunId) {
        setSelectedRun(null);
        setRunLogs([]);
        return;
      }

      const id = selectedRunId;
      const run = runs.find((r) => String(r.id) === String(id)) || null;
      setSelectedRun(run);

      try {
        const logsRes = await labService.getRunLogs(id);
        setRunLogs(logsRes.data || []);
      } catch {
        setRunLogs([]);
      }
    };

    loadDetails();
  }, [selectedRunId, runs]);

  const experimentTypes = useMemo(() => {
    const set = new Set(runs.map((r) => r.experiment?.experiment_type).filter(Boolean));
    return Array.from(set);
  }, [runs]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-xl">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Experiment History</h1>
        <p className="text-gray-600 mt-1">Version history of experiment runs, with parameters and outputs stored server-side.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All</option>
              <option value="succeeded">succeeded</option>
              <option value="failed">failed</option>
              <option value="running">running</option>
              <option value="pending">pending</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All</option>
              {experimentTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-500 md:ml-auto">
            Showing {filtered.length} / {runs.length}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-gray-600">No runs match your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-2">Run</th>
                  <th className="py-2">Experiment</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Runtime</th>
                  <th className="py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className={`border-b last:border-b-0 cursor-pointer ${String(selectedRunId) === String(r.id) ? 'bg-primary-50' : ''}`}
                    onClick={() => setSelectedRunId(String(r.id))}
                  >
                    <td className="py-2 font-semibold">#{r.id}</td>
                    <td className="py-2">
                      <div className="font-semibold text-gray-900">{r.experiment?.name || r.experiment?.slug}</div>
                      <div className="text-xs text-gray-500">{r.experiment?.experiment_type}</div>
                    </td>
                    <td className="py-2"><StatusBadge status={r.status} /></td>
                    <td className="py-2">{r.duration_ms ? `${r.duration_ms} ms` : '-'}</td>
                    <td className="py-2">{r.created_at ? new Date(r.created_at).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedRun && (
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Inspect Run #{selectedRun.id}</h2>
              <div className="text-sm text-gray-600">
                {selectedRun.experiment?.name || selectedRun.experiment?.slug} • {selectedRun.status}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <JsonPanel title="Parameters" value={selectedRun.params} />
            <JsonPanel title="Metrics" value={selectedRun.metrics} />
            <JsonPanel title="Output" value={selectedRun.output} />
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Logs</h3>
              <div className="bg-gray-50 border border-gray-200 rounded p-4 text-xs space-y-2">
                {runLogs.length === 0 ? (
                  <div className="text-gray-600">No logs found.</div>
                ) : (
                  runLogs.slice(0, 200).map((l, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="font-bold">{l.level}:</span>
                      <span className="text-gray-700">{l.message}</span>
                    </div>
                  ))
                )}
              </div>
              {runLogs.length > 200 && (
                <div className="text-xs text-gray-500 mt-2">Showing first 200 log lines.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
