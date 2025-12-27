import React, { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { labService } from '../../services';

const LineChart = ({ points }) => {
  const w = 600;
  const h = 160;
  const pad = 20;
  if (points.length < 2) {
    return <div className="text-gray-600">Not enough data to chart.</div>;
  }

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const scaleX = (x) => {
    const denom = maxX - minX || 1;
    return pad + ((x - minX) / denom) * (w - pad * 2);
  };
  const scaleY = (y) => {
    const denom = maxY - minY || 1;
    return h - pad - ((y - minY) / denom) * (h - pad * 2);
  };

  const d = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(p.x).toFixed(1)} ${scaleY(p.y).toFixed(1)}`)
    .join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-600" />
    </svg>
  );
};

const StatCard = ({ label, value }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="text-sm text-gray-600 font-semibold">{label}</div>
    <div className="text-3xl font-bold text-primary-600 mt-2">{value}</div>
  </div>
);

const Overview = () => {
  const { search } = useOutletContext();
  const [experiments, setExperiments] = useState([]);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExperiment, setSelectedExperiment] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('duration_ms');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [expRes, runRes] = await Promise.all([
          labService.getExperiments(),
          labService.getRuns(),
        ]);

        const expList = expRes.data?.results || expRes.data || [];
        const runList = runRes.data?.results || runRes.data || [];

        setExperiments(Array.isArray(expList) ? expList : []);
        setRuns(Array.isArray(runList) ? runList : []);

        const firstExpSlug = (Array.isArray(expList) && expList[0]?.slug) || '';
        if (firstExpSlug) setSelectedExperiment(firstExpSlug);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredRuns = useMemo(() => {
    if (!search) return runs;
    const q = search.toLowerCase();
    return runs.filter((r) => {
      const name = r.experiment?.name || r.experiment?.slug || '';
      return (
        name.toLowerCase().includes(q) ||
        (r.status || '').toLowerCase().includes(q)
      );
    });
  }, [runs, search]);

  const stats = useMemo(() => {
    const totalRuns = runs.length;
    const succeeded = runs.filter((r) => r.status === 'succeeded').length;
    const avgRuntime =
      totalRuns > 0
        ? Math.round(
            runs.reduce((acc, r) => acc + (r.duration_ms || 0), 0) / totalRuns
          )
        : 0;

    return {
      totalExperiments: experiments.length,
      totalRuns,
      successRate: totalRuns > 0 ? `${Math.round((succeeded / totalRuns) * 100)}%` : '0%',
      avgRuntime: `${avgRuntime} ms`,
    };
  }, [experiments, runs]);

  const recentRuns = filteredRuns.slice(0, 6);

  const metricOptions = useMemo(() => {
    const keys = new Set(['duration_ms']);
    runs.forEach((r) => {
      Object.entries(r.metrics || {}).forEach(([k, v]) => {
        if (typeof v === 'number' && Number.isFinite(v)) keys.add(k);
      });
    });
    return Array.from(keys);
  }, [runs]);

  const chartPoints = useMemo(() => {
    const byExp = selectedExperiment
      ? runs.filter((r) => r.experiment?.slug === selectedExperiment)
      : runs;

    const sorted = [...byExp]
      .filter((r) => r.created_at)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    return sorted.slice(-20).map((r) => {
      const y =
        selectedMetric === 'duration_ms'
          ? Number(r.duration_ms || 0)
          : Number(r.metrics?.[selectedMetric] || 0);
      return {
        x: new Date(r.created_at).getTime(),
        y,
      };
    });
  }, [runs, selectedExperiment, selectedMetric]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-xl">Loading lab overview...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">
            Run experiments, track performance, and compare runs.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/lab/run"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700"
          >
            Run Experiment
          </Link>
          <Link
            to="/lab/compare"
            className="px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50"
          >
            Compare
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Experiments" value={stats.totalExperiments} />
        <StatCard label="Total Runs" value={stats.totalRuns} />
        <StatCard label="Success Rate" value={stats.successRate} />
        <StatCard label="Average Runtime" value={stats.avgRuntime} />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Runs</h2>
          <Link to="/lab/history" className="text-primary-600 font-semibold hover:underline">
            View All →
          </Link>
        </div>

        {recentRuns.length === 0 ? (
          <div className="text-gray-600">No runs yet. Start by running an experiment.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-2">Experiment</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Runtime</th>
                  <th className="py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {recentRuns.map((r) => (
                  <tr key={r.id} className="border-b last:border-b-0">
                    <td className="py-2 font-semibold text-gray-900">
                      {r.experiment?.name || r.experiment?.slug || `Run #${r.id}`}
                    </td>
                    <td className="py-2">{r.status}</td>
                    <td className="py-2">{r.duration_ms ? `${r.duration_ms} ms` : '-'}</td>
                    <td className="py-2">{r.created_at ? new Date(r.created_at).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Performance Over Time</h2>
            <div className="text-sm text-gray-600">Tracks a selected metric across recent runs.</div>
          </div>

          <div className="md:ml-auto flex flex-col sm:flex-row gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Experiment</label>
              <select
                value={selectedExperiment}
                onChange={(e) => setSelectedExperiment(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                {experiments.map((e) => (
                  <option key={e.slug} value={e.slug}>{e.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Metric</label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                {metricOptions.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <LineChart points={chartPoints} />
        <div className="text-xs text-gray-500 mt-2">Showing up to last 20 runs.</div>
      </div>
    </div>
  );
};

export default Overview;
