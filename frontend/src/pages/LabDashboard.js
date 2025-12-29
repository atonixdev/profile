import React, { useEffect, useState } from 'react';
import { labService } from '../services';

const LabDashboard = () => {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeRun, setActiveRun] = useState(null);
  const [runLogs, setRunLogs] = useState([]);
  const [runLoadingId, setRunLoadingId] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await labService.getExperiments();
        const list = res.data?.results || res.data || [];
        setExperiments(Array.isArray(list) ? list : []);
      } catch (e) {
        setError('Failed to load lab experiments.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleRun = async (experimentId) => {
    setRunLoadingId(experimentId);
    setError('');
    setRunLogs([]);
    try {
      const res = await labService.runExperiment(experimentId, {});
      setActiveRun(res.data);

      if (res.data?.id) {
        const logsRes = await labService.getRunLogs(res.data.id);
        setRunLogs(logsRes.data || []);
      }
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.response?.data?.error || 'Experiment run failed.';
      setError(msg);
    } finally {
      setRunLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading lab dashboard...</div>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3">Dashboard</h1>
          <p className="text-gray-600 max-w-3xl">
            Run experiments and store results (PostgreSQL/SQLite) via the backend API.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {experiments.map((exp) => (
            <div key={exp.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{exp.name}</h2>
                  {exp.description && <p className="text-sm text-gray-600 mt-1">{exp.description}</p>}
                  <div className="mt-3 text-xs font-semibold text-primary-700 bg-primary-100 inline-block px-2 py-1 rounded">
                    {exp.experiment_type}
                  </div>
                </div>

                <button
                  onClick={() => handleRun(exp.id)}
                  disabled={runLoadingId === exp.id}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {runLoadingId === exp.id ? 'Running…' : 'Run'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {activeRun && (
          <div className="mt-10 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-bold mb-4">Latest Run</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-600 mb-2">Metrics</div>
                <pre className="bg-gray-50 border rounded p-4 text-xs overflow-auto">
                  {JSON.stringify(activeRun.metrics || {}, null, 2)}
                </pre>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-2">Output</div>
                <pre className="bg-gray-50 border rounded p-4 text-xs overflow-auto">
                  {JSON.stringify(activeRun.output || {}, null, 2)}
                </pre>
              </div>
            </div>

            {runLogs.length > 0 && (
              <div className="mt-6">
                <div className="text-sm text-gray-600 mb-2">Local SQLite Logs</div>
                <div className="bg-gray-50 border rounded p-4 text-xs space-y-2">
                  {runLogs.map((l, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="font-bold">{l.level}:</span>
                      <span className="text-gray-800">{l.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LabDashboard;
