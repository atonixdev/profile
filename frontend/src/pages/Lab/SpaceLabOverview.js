import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCrosshair, FiGlobe, FiTarget, FiDatabase, FiPlayCircle, FiTrendingUp, FiActivity } from 'react-icons/fi';

import { spaceService } from '../../services';

const StatCard = ({ icon: Icon, label, value, trend, color = 'blue' }) => {
  const colorClasses = {
    blue: 'from-[#1A4FFF]/20 to-[#1A4FFF]/5 border-[#1A4FFF]/30',
    cyan: 'from-[#00E0FF]/20 to-[#00E0FF]/5 border-[#00E0FF]/30',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-md rounded-xl p-6 shadow-lg`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-400 font-medium mb-2">{label}</div>
          <div className="text-3xl font-bold text-white font-['Poppins']">{value}</div>
          {trend && (
            <div className="flex items-center gap-1 mt-2 text-xs text-[#00E0FF]">
              <FiTrendingUp />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <Icon className="text-3xl text-[#00E0FF] opacity-60" />
      </div>
    </div>
  );
};

const QuickAction = ({ icon: Icon, label, to, description }) => (
  <Link
    to={to}
    className="flex items-start gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00E0FF]/50 rounded-lg transition-all duration-200 backdrop-blur-md"
  >
    <Icon className="text-2xl text-[#00E0FF] flex-shrink-0 mt-1" />
    <div>
      <div className="font-semibold text-white">{label}</div>
      <div className="text-xs text-gray-400 mt-1">{description}</div>
    </div>
  </Link>
);

const SpaceLabOverview = () => {
  const [feeds, setFeeds] = useState({
    loading: true,
    error: null,
    apod: null,
    iss: null,
    neo: null,
    donki: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [apodRes, issRes, neoRes, donkiRes] = await Promise.all([
          spaceService.getApod(),
          spaceService.getIssNow(),
          spaceService.getNeoSummary(),
          spaceService.getDonkiSummary(),
        ]);

        if (cancelled) return;
        setFeeds({
          loading: false,
          error: null,
          apod: apodRes.data,
          iss: issRes.data,
          neo: neoRes.data,
          donki: donkiRes.data,
        });
      } catch (err) {
        if (cancelled) return;
        setFeeds((prev) => ({
          ...prev,
          loading: false,
          error: err?.response?.data?.detail || err?.message || 'Failed to load space feeds',
        }));
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const issLabel = feeds.iss?.latitude != null && feeds.iss?.longitude != null
    ? `${Number(feeds.iss.latitude).toFixed(2)}, ${Number(feeds.iss.longitude).toFixed(2)}`
    : '—';

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white font-['Poppins']">Space Lab</h1>
          <p className="text-gray-400 mt-2">
            Astrophysics simulations, orbital mechanics, and cosmic event modeling
          </p>
        </div>
        <Link
          to="/lab/space/simulations"
          className="px-5 py-2.5 bg-gradient-to-r from-[#1A4FFF] to-[#00E0FF] text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-[#1A4FFF]/50 transition-all duration-200"
        >
          <FiPlayCircle className="inline mr-2" />
          New Simulation
        </Link>
      </div>

      {feeds.error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-200">
          {feeds.error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={FiGlobe}
          label="APOD"
          value={feeds.loading ? 'Loading…' : (feeds.apod?.date || '—')}
          trend={feeds.apod?.title || ''}
          color="cyan"
        />
        <StatCard
          icon={FiCrosshair}
          label="NEO Count"
          value={feeds.loading ? 'Loading…' : (feeds.neo?.total_near_earth_objects ?? '—')}
          trend={feeds.neo ? `Hazardous: ${feeds.neo.potentially_hazardous_count}` : ''}
          color="blue"
        />
        <StatCard
          icon={FiTarget}
          label="ISS Position"
          value={feeds.loading ? 'Loading…' : issLabel}
          trend={feeds.iss?.altitude_km != null ? `Alt: ${Number(feeds.iss.altitude_km).toFixed(0)} km` : ''}
          color="purple"
        />
        <StatCard
          icon={FiActivity}
          label="Space Weather"
          value={feeds.loading ? 'Loading…' : (feeds.donki?.count ?? '—')}
          trend={feeds.donki ? 'DONKI notifications (7d)' : ''}
          color="cyan"
        />
      </div>

      {feeds.apod?.media_type === 'image' && feeds.apod?.url && (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4 font-['Poppins']">Astronomy Picture of the Day</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <a
              href={feeds.apod.hdurl || feeds.apod.url}
              target="_blank"
              rel="noreferrer"
              className="block rounded-lg overflow-hidden border border-white/10"
            >
              <img
                src={feeds.apod.url}
                alt={feeds.apod.title || 'APOD'}
                className="w-full h-64 object-cover"
                loading="lazy"
              />
            </a>
            <div className="space-y-2">
              <div className="text-white font-semibold">{feeds.apod.title}</div>
              <div className="text-xs text-gray-400">{feeds.apod.date}</div>
              <div className="text-sm text-gray-300 leading-relaxed">
                {String(feeds.apod.explanation || '').slice(0, 260)}
                {feeds.apod.explanation && String(feeds.apod.explanation).length > 260 ? '…' : ''}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4 font-['Poppins']">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickAction
            icon={FiCrosshair}
            label="Orbital Simulations"
            to="/lab/space/simulations"
            description="Run gravitational and trajectory models"
          />
          <QuickAction
            icon={FiTarget}
            label="Satellite Telemetry"
            to="/lab/space/telemetry"
            description="Monitor real-time satellite data"
          />
          <QuickAction
            icon={FiGlobe}
            label="Cosmic Event Models"
            to="/lab/space/models"
            description="Analyze supernovae, black holes, and more"
          />
          <QuickAction
            icon={FiDatabase}
            label="Datasets"
            to="/lab/space/datasets"
            description="Browse astrophysics research data"
          />
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4 font-['Poppins']">Recent Simulations</h2>
        <div className="text-gray-400 text-center py-8">
          Space simulation history will appear here
        </div>
      </div>
    </div>
  );
};

export default SpaceLabOverview;
