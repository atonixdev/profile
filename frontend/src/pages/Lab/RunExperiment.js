import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { labService } from '../../services';
import JsonPanel from '../../components/Lab/JsonPanel';

const RunExperiment = ({ experimentType, titleOverride } = {}) => {
  const { search } = useOutletContext();
  const [experiments, setExperiments] = useState([]);
  const [selectedExperimentId, setSelectedExperimentId] = useState('');
  const [paramsText, setParamsText] = useState('{}');
  const [datasetFile, setDatasetFile] = useState(null);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [runResult, setRunResult] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await labService.getExperiments(experimentType ? { experiment_type: experimentType } : undefined);
        const list = res.data?.results || res.data || [];
        const exps = Array.isArray(list) ? list : [];
        setExperiments(exps);
        if (exps.length > 0) setSelectedExperimentId(String(exps[0].id));
      } catch (e) {
        const msg = e?.response?.data?.detail || 'Failed to load experiments.';
        setError(msg);
        setExperiments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [experimentType]);

  const filteredExperiments = useMemo(() => {
    if (!search) return experiments;
    const q = search.toLowerCase();
    return experiments.filter((e) => (e.name || '').toLowerCase().includes(q) || (e.slug || '').toLowerCase().includes(q));
  }, [experiments, search]);

  const selectedExperiment = useMemo(() => {
    return experiments.find((e) => String(e.id) === String(selectedExperimentId)) || null;
  }, [experiments, selectedExperimentId]);

  const handleRun = async () => {
    setError('');
    setRunResult(null);

    let params = {};
    try {
      params = paramsText.trim() ? JSON.parse(paramsText) : {};
    } catch {
      setError('Parameters must be valid JSON.');
      return;
    }

    // Optional dataset upload: read as text and pass as params.csv (used by data_processing experiment)
    if (datasetFile) {
      try {
        const text = await datasetFile.text();
        params = { ...params, csv: text };
      } catch {
        setError('Failed to read dataset file.');
        return;
      }
    }

    setRunning(true);
    try {
      const res = await labService.runExperiment(selectedExperimentId, params);
      setRunResult(res.data);
    } catch (e) {
      const msg = e?.response?.data?.error || e?.response?.data?.detail || 'Experiment run failed.';
      setError(msg);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{titleOverride || 'Run Experiment'}</h1>
        <p className="text-gray-600 mt-1">
          Select an experiment, set parameters, optionally upload a dataset, then run.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Experiment</label>
          <select
            value={selectedExperimentId}
            onChange={(e) => setSelectedExperimentId(e.target.value)}
            disabled={loading || experiments.length === 0}
            className="w-full md:max-w-xl px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {filteredExperiments.map((exp) => (
              <option key={exp.id} value={exp.id}>
                {exp.name} ({exp.experiment_type})
              </option>
            ))}
          </select>
          {!loading && experiments.length === 0 && (
            <div className="text-sm text-gray-600 mt-2">No experiments available.</div>
          )}
          {selectedExperiment?.description && (
            <div className="text-sm text-gray-600 mt-2">{selectedExperiment.description}</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Parameters (JSON)</label>
          <textarea
            value={paramsText}
            onChange={(e) => setParamsText(e.target.value)}
            rows={8}
            className="w-full font-mono text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder='{"seed": 1, "n_paths": 1000}'
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Dataset (optional)</label>
          <input
            type="file"
            accept=".csv,text/csv,text/plain"
            onChange={(e) => setDatasetFile(e.target.files?.[0] || null)}
            className="w-full"
          />
          <div className="text-xs text-gray-500 mt-1">
            If provided, the file content is sent as params.csv (useful for Data Processing).
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRun}
            disabled={!selectedExperimentId || running || loading || experiments.length === 0}
            className="px-5 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {running ? 'Running…' : 'Run'}
          </button>
          <div className="text-sm text-gray-600">
            {loading ? 'Live status: loading…' : running ? 'Live status: running…' : 'Live status: idle'}
          </div>
        </div>
      </div>

      {runResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <JsonPanel title="Metrics" value={runResult.metrics} />
          <JsonPanel title="Output" value={runResult.output} />
        </div>
      )}
    </div>
  );
};

export default RunExperiment;
