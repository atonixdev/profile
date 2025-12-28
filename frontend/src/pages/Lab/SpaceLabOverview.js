import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { FiCrosshair, FiGlobe, FiTarget, FiDatabase, FiPlayCircle, FiTrendingUp, FiActivity } from 'react-icons/fi';

import { spaceService } from '../../services';

const isPlainObject = (value) => {
  if (!value || typeof value !== 'object') return false;
  if (Array.isArray(value)) return false;
  return true;
};

const asObjectOrNull = (value) => (isPlainObject(value) ? value : null);

const StatCard = ({ icon: Icon, label, value, trend, color = 'blue', isDark }) => {
  const colorClasses = {
    blue: 'from-[#1A4FFF]/20 to-[#1A4FFF]/5 border-[#1A4FFF]/30',
    cyan: 'from-[#00E0FF]/20 to-[#00E0FF]/5 border-[#00E0FF]/30',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-md rounded-xl p-6 shadow-lg`}>
      <div className="flex items-start justify-between">
        <div>
          <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>{label}</div>
          <div className={`text-3xl font-bold font-['Poppins'] ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</div>
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

const QuickAction = ({ icon: Icon, label, to, description, isDark }) => (
  <Link
    to={to}
    className={`flex items-start gap-4 p-4 rounded-lg transition-all duration-200 backdrop-blur-md ${
      isDark
        ? 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00E0FF]/50'
        : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-[#00E0FF]/50'
    }`}
  >
    <Icon className="text-2xl text-[#00E0FF] flex-shrink-0 mt-1" />
    <div>
      <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{label}</div>
      <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{description}</div>
    </div>
  </Link>
);

const ApiCard = ({ label, description, to, isDark }) => (
  <Link
    to={to}
    className={`flex flex-col gap-2 p-4 rounded-lg transition-all duration-200 backdrop-blur-md ${
      isDark
        ? 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00E0FF]/50'
        : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-[#00E0FF]/50'
    }`}
  >
    <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{label}</div>
    <div className={`text-xs leading-snug ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{description}</div>
  </Link>
);

const SpaceLabOverview = () => {
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

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
      const errors = [];
      const next = { loading: false, error: null, apod: null, iss: null, neo: null, donki: null };

      const fetchOne = async (key, fn, label) => {
        try {
          const res = await fn();
          const data = res?.data;
          const obj = asObjectOrNull(data);
          if (!obj) {
            if (typeof data === 'string') {
              const trimmed = data.trim();
              const looksLikeHtml = trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html');
              errors.push(`${label}: invalid response${looksLikeHtml ? ' (received HTML, check /api proxy)' : ''}`);
            } else {
              errors.push(`${label}: invalid response`);
            }
            return;
          }
          next[key] = obj;
        } catch (err) {
          const status = err?.response?.status;
          const respData = err?.response?.data;
          if (typeof respData === 'string') {
            const trimmed = respData.trim();
            const looksLikeHtml = trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html');
            errors.push(`${label}: request failed${status ? ` (HTTP ${status})` : ''}${looksLikeHtml ? ' (received HTML, check /api proxy)' : ''}`);
          } else {
            const msg = err?.response?.data?.detail || err?.message || 'request failed';
            errors.push(`${label}: ${msg}${status ? ` (HTTP ${status})` : ''}`);
          }
        }
      };

      await fetchOne('apod', () => spaceService.getApod(), 'APOD');
      await fetchOne('iss', () => spaceService.getIssNow(), 'ISS');
      await fetchOne('neo', () => spaceService.getNeoSummary(), 'NEO');
      await fetchOne('donki', () => spaceService.getDonkiSummary(), 'DONKI');

      if (cancelled) return;
      next.error = errors.length ? errors.join(' • ') : null;
      setFeeds(next);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const issLabel = feeds.iss?.latitude != null && feeds.iss?.longitude != null
    ? `${Number(feeds.iss.latitude).toFixed(2)}, ${Number(feeds.iss.longitude).toFixed(2)}`
    : '—';

  const hazardousTrend =
    feeds.neo && feeds.neo.potentially_hazardous_count != null
      ? `Hazardous: ${feeds.neo.potentially_hazardous_count}`
      : '';

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className={`text-4xl font-bold font-['Poppins'] ${isDark ? 'text-white' : 'text-gray-900'}`}>Space Lab</h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
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
          isDark={isDark}
        />
        <StatCard
          icon={FiCrosshair}
          label="NEO Count"
          value={feeds.loading ? 'Loading…' : (feeds.neo?.total_near_earth_objects ?? '—')}
          trend={hazardousTrend}
          color="blue"
          isDark={isDark}
        />
        <StatCard
          icon={FiTarget}
          label="ISS Position"
          value={feeds.loading ? 'Loading…' : issLabel}
          trend={feeds.iss?.altitude_km != null ? `Alt: ${Number(feeds.iss.altitude_km).toFixed(0)} km` : ''}
          color="purple"
          isDark={isDark}
        />
        <StatCard
          icon={FiActivity}
          label="Space Weather"
          value={feeds.loading ? 'Loading…' : (feeds.donki?.count ?? '—')}
          trend={feeds.donki ? 'DONKI notifications (7d)' : ''}
          color="cyan"
          isDark={isDark}
        />
      </div>

      {feeds.apod?.media_type === 'image' && feeds.apod?.url && (
        <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} backdrop-blur-md border rounded-xl p-6 shadow-xl`}>
          <h2 className={`text-xl font-bold mb-4 font-['Poppins'] ${isDark ? 'text-white' : 'text-gray-900'}`}>Astronomy Picture of the Day</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <a
              href={feeds.apod.hdurl || feeds.apod.url}
              target="_blank"
              rel="noreferrer"
              className={`block rounded-lg overflow-hidden border ${isDark ? 'border-white/10' : 'border-gray-200'}`}
            >
              <img
                src={feeds.apod.url}
                alt={feeds.apod.title || 'APOD'}
                className="w-full h-64 object-cover"
                loading="lazy"
              />
            </a>
            <div className="space-y-2">
              <div className={`${isDark ? 'text-white' : 'text-gray-900'} font-semibold`}>{feeds.apod.title}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{feeds.apod.date}</div>
              <div className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {String(feeds.apod.explanation || '').slice(0, 260)}
                {feeds.apod.explanation && String(feeds.apod.explanation).length > 260 ? '…' : ''}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} backdrop-blur-md border rounded-xl p-6 shadow-xl`}>
        <h2 className={`text-xl font-bold mb-4 font-['Poppins'] ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickAction
            icon={FiGlobe}
            label="Earth Imagery Map"
            to="/lab/space/map"
            description="Explore NASA GIBS satellite imagery on a map"
            isDark={isDark}
          />
          <QuickAction
            icon={FiGlobe}
            label="Mars Trek Map"
            to="/lab/space/mars-map"
            description="Explore Mars basemap imagery (Trek)"
            isDark={isDark}
          />
          <QuickAction
            icon={FiCrosshair}
            label="Orbital Simulations"
            to="/lab/space/simulations"
            description="Run gravitational and trajectory models"
            isDark={isDark}
          />
          <QuickAction
            icon={FiTarget}
            label="Satellite Telemetry"
            to="/lab/space/telemetry"
            description="Monitor real-time satellite data"
            isDark={isDark}
          />
          <QuickAction
            icon={FiGlobe}
            label="Cosmic Event Models"
            to="/lab/space/models"
            description="Analyze supernovae, black holes, and more"
            isDark={isDark}
          />
          <QuickAction
            icon={FiDatabase}
            label="Datasets"
            to="/lab/space/datasets"
            description="Browse astrophysics research data"
            isDark={isDark}
          />
        </div>
      </div>

      <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} backdrop-blur-md border rounded-xl p-6 shadow-xl`}>
        <h2 className={`text-xl font-bold mb-4 font-['Poppins'] ${isDark ? 'text-white' : 'text-gray-900'}`}>NASA / Space APIs</h2>
        <div className={`text-sm mb-5 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
          Open any integration to see a live response preview (via your backend proxy).
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ApiCard label="APOD" description="Astronomy Picture of the Day" to="/lab/space/apis/apod" isDark={isDark} />
          <ApiCard label="Asteroids NeoWs" description="Near Earth Object Web Service" to="/lab/space/apis/neows" isDark={isDark} />
          <ApiCard label="DONKI" description="Space Weather notifications" to="/lab/space/apis/donki" isDark={isDark} />
          <ApiCard label="EONET" description="Earth Observatory Natural Event Tracker" to="/lab/space/apis/eonet" isDark={isDark} />
          <ApiCard label="EPIC" description="Earth Polychromatic Imaging Camera" to="/lab/space/apis/epic" isDark={isDark} />
          <ApiCard label="Exoplanet Archive" description="Programmatic access to exoplanet database" to="/lab/space/apis/exoplanet" isDark={isDark} />
          <ApiCard label="NASA Image & Video Library" description="Search images.nasa.gov" to="/lab/space/apis/images" isDark={isDark} />
          <ApiCard label="Open Science Data Repository" description="OSDR datasets + metadata (info endpoint)" to="/lab/space/apis/osdr" isDark={isDark} />
          <ApiCard label="Satellite Situation Center" description="Geocentric spacecraft regions (info endpoint)" to="/lab/space/apis/ssc" isDark={isDark} />
          <ApiCard label="SSD/CNEOS" description="JPL Solar System dynamics + NEO close approaches" to="/lab/space/apis/ssd_cneos" isDark={isDark} />
          <ApiCard label="Techport" description="NASA technology project data" to="/lab/space/apis/techport" isDark={isDark} />
          <ApiCard label="TechTransfer" description="Patents, software, tech transfer" to="/lab/space/apis/techtransfer" isDark={isDark} />
          <ApiCard label="TLE API" description="Two-line element data for Earth-orbiting objects" to="/lab/space/apis/tle" isDark={isDark} />
          <ApiCard label="GIBS" description="Global full-resolution satellite imagery (WMTS info)" to="/lab/space/apis/gibs" isDark={isDark} />
          <ApiCard label="Vesta/Moon/Mars Trek WMTS" description="Planetary Trek imagery tiles (WMTS info)" to="/lab/space/apis/trek_wmts" isDark={isDark} />
          <ApiCard label="InSight" description="Mars Weather (status/info endpoint)" to="/lab/space/apis/insight" isDark={isDark} />
        </div>
      </div>

      <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} backdrop-blur-md border rounded-xl p-6 shadow-xl`}>
        <h2 className={`text-xl font-bold mb-4 font-['Poppins'] ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Simulations</h2>
        <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-center py-8`}>
          Space simulation history will appear here
        </div>
      </div>
    </div>
  );
};

export default SpaceLabOverview;
