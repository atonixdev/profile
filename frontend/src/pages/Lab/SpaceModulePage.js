import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import { FiActivity, FiGlobe, FiTarget, FiTrendingUp } from 'react-icons/fi';

import { spaceService } from '../../services';

const StatCard = ({ icon: Icon, label, value, sub, isDark }) => {
  return (
    <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} backdrop-blur-md border rounded-xl p-6 shadow-xl`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>{label}</div>
          <div className={`text-2xl font-bold font-['Poppins'] break-words ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</div>
          {sub ? <div className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{sub}</div> : null}
        </div>
        <Icon className="text-3xl text-[#00E0FF] opacity-60 flex-shrink-0" />
      </div>
    </div>
  );
};

const SpaceModulePage = ({ title, description, kind }) => {
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  const [state, setState] = useState({
    loading: true,
    error: null,
    apod: null,
    iss: null,
    neo: null,
    donki: null,
  });

  const fetchPlan = useMemo(() => {
    switch (kind) {
      case 'telemetry':
        return { apod: false, iss: true, neo: false, donki: false };
      case 'models':
        return { apod: false, iss: false, neo: false, donki: true };
      case 'datasets':
        return { apod: false, iss: false, neo: true, donki: true };
      case 'simulations':
        return { apod: false, iss: true, neo: true, donki: false };
      case 'astrophysics':
      default:
        return { apod: true, iss: false, neo: true, donki: false };
    }
  }, [kind]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const tasks = [];
        if (fetchPlan.apod) tasks.push(spaceService.getApod().then((r) => ({ key: 'apod', data: r.data })));
        if (fetchPlan.iss) tasks.push(spaceService.getIssNow().then((r) => ({ key: 'iss', data: r.data })));
        if (fetchPlan.neo) tasks.push(spaceService.getNeoSummary().then((r) => ({ key: 'neo', data: r.data })));
        if (fetchPlan.donki) tasks.push(spaceService.getDonkiSummary().then((r) => ({ key: 'donki', data: r.data })));

        const results = await Promise.all(tasks);
        if (cancelled) return;

        const next = { apod: null, iss: null, neo: null, donki: null };
        for (const r of results) next[r.key] = r.data;

        setState({ loading: false, error: null, ...next });
      } catch (err) {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err?.response?.data?.detail || err?.message || 'Failed to load Space Lab data',
        }));
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [fetchPlan]);

  const issLabel = state.iss?.latitude != null && state.iss?.longitude != null
    ? `${Number(state.iss.latitude).toFixed(2)}, ${Number(state.iss.longitude).toFixed(2)}`
    : '—';

  return (
    <div className="space-y-8">
      <div>
        <h1 className={`text-4xl font-bold font-['Poppins'] ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h1>
        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>{description}</p>
      </div>

      {state.error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-200">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {fetchPlan.apod && (
          <StatCard
            icon={FiGlobe}
            label="APOD"
            value={state.loading ? 'Loading…' : (state.apod?.date || '—')}
            sub={state.apod?.title || ''}
            isDark={isDark}
          />
        )}
        {fetchPlan.neo && (
          <StatCard
            icon={FiTrendingUp}
            label="Near‑Earth Objects"
            value={state.loading ? 'Loading…' : (state.neo?.total_near_earth_objects ?? '—')}
            sub={state.neo ? `Hazardous: ${state.neo.potentially_hazardous_count}` : ''}
            isDark={isDark}
          />
        )}
        {fetchPlan.iss && (
          <StatCard
            icon={FiTarget}
            label="ISS Position"
            value={state.loading ? 'Loading…' : issLabel}
            sub={state.iss?.altitude_km != null ? `Alt: ${Number(state.iss.altitude_km).toFixed(0)} km` : ''}
            isDark={isDark}
          />
        )}
        {fetchPlan.donki && (
          <StatCard
            icon={FiActivity}
            label="Space Weather"
            value={state.loading ? 'Loading…' : (state.donki?.count ?? '—')}
            sub={state.donki ? 'DONKI notifications (range)' : ''}
            isDark={isDark}
          />
        )}
      </div>

      {fetchPlan.apod && state.apod?.media_type === 'image' && state.apod?.url && (
        <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} backdrop-blur-md border rounded-xl p-6 shadow-xl`}>
          <h2 className={`text-xl font-bold mb-4 font-['Poppins'] ${isDark ? 'text-white' : 'text-gray-900'}`}>Astronomy Picture of the Day</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <a
              href={state.apod.hdurl || state.apod.url}
              target="_blank"
              rel="noreferrer"
              className={`block rounded-lg overflow-hidden border ${isDark ? 'border-white/10' : 'border-gray-200'}`}
            >
              <img
                src={state.apod.url}
                alt={state.apod.title || 'APOD'}
                className="w-full h-64 object-cover"
                loading="lazy"
              />
            </a>
            <div className="space-y-2">
              <div className={`${isDark ? 'text-white' : 'text-gray-900'} font-semibold`}>{state.apod.title}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{state.apod.date}</div>
              <div className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {String(state.apod.explanation || '').slice(0, 260)}
                {state.apod.explanation && String(state.apod.explanation).length > 260 ? '…' : ''}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpaceModulePage;
