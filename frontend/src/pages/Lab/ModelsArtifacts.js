import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { labService } from '../../services';
import JsonPanel from '../../components/Lab/JsonPanel';

const ModelsArtifacts = () => {
  const { search } = useOutletContext();
  const [runs, setRuns] = useState([]);
  const [selectedRunId, setSelectedRunId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setError('');
      try {
        const res = await labService.getRuns();
        const list = res.data?.results || res.data || [];
        const arr = Array.isArray(list) ? list : [];
        setRuns(arr);
        if (arr.length > 0) setSelectedRunId(String(arr[0].id));
      } catch {
        setError('Failed to load runs.');
        setRuns([]);
      }
    };
    load();
  }, []);

  const filteredRuns = useMemo(() => {
    if (!search) return runs;
    const q = search.toLowerCase();
    return runs.filter((r) => (r.experiment?.name || '').toLowerCase().includes(q) || String(r.id).includes(q));
  }, [runs, search]);

  const selected = useMemo(() => {
    return runs.find((r) => String(r.id) === String(selectedRunId)) || null;
  }, [runs, selectedRunId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Models & Artifacts</h1>
        <p className="text-gray-600 mt-1">
          Inspect stored outputs/metrics as artifacts. (File artifacts can be added later.)
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Run</label>
        <select
          value={selectedRunId}
          onChange={(e) => setSelectedRunId(e.target.value)}
          disabled={runs.length === 0}
          className="w-full md:max-w-xl px-3 py-2 border border-gray-300 rounded-lg"
        >
          {filteredRuns.map((r) => (
            <option key={r.id} value={r.id}>
              Run #{r.id} — {r.experiment?.name || r.experiment?.slug}
            </option>
          ))}
        </select>

        {runs.length === 0 && !error && (
          <div className="text-sm text-gray-600 mt-2">No runs yet.</div>
        )}
      </div>

      {selected && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <JsonPanel title="Metrics Artifact" value={selected.metrics} />
          <JsonPanel title="Output Artifact" value={selected.output} />
        </div>
      )}
    </div>
  );
};

export default ModelsArtifacts;
