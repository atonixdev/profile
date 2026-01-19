import React, { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { FiArrowLeft, FiRefreshCw } from 'react-icons/fi';

import { spaceService } from '../../services';

const truncateJson = (value, limit = 4000) => {
  try {
    const s = JSON.stringify(value, null, 2);
    if (s.length <= limit) return s;
    return s.slice(0, limit - 1) + '…';
  } catch {
    const s = String(value ?? '');
    if (s.length <= limit) return s;
    return s.slice(0, limit - 1) + '…';
  }
};

const SpaceApiPage = () => {
  const { apiId } = useParams();
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  const config = useMemo(() => {
    const defs = {
      apod: {
        title: 'APOD: Astronomy Picture of the Day',
        description: 'Daily astronomy image and metadata.',
        run: () => spaceService.getApod(),
      },
      neows: {
        title: 'Asteroids NeoWs',
        description: 'Near Earth Object Web Service summary (feed-based).',
        run: () => spaceService.getNeoSummary(),
      },
      donki: {
        title: 'DONKI',
        description: 'Space weather notifications summary.',
        run: () => spaceService.getDonkiSummary(),
      },
      eonet: {
        title: 'EONET',
        description: 'Earth Observatory Natural Event Tracker events.',
        run: () => spaceService.getEonetEvents({ status: 'open', limit: 10 }),
      },
      epic: {
        title: 'EPIC',
        description: 'Earth Polychromatic Imaging Camera (natural images).',
        run: () => spaceService.getEpicLatest(),
      },
      exoplanet: {
        title: 'Exoplanet Archive',
        description: 'Sample TAP query results from NASA Exoplanet Archive.',
        run: () => spaceService.getExoplanetSample(),
      },
      images: {
        title: 'NASA Image and Video Library',
        description: 'Search results from images.nasa.gov API.',
        run: () => spaceService.searchNasaImages({ q: 'nebula', media_type: 'image' }),
      },
      techport: {
        title: 'Techport',
        description: 'NASA technology projects (summary).',
        run: () => spaceService.getTechportProjects(),
      },
      techtransfer: {
        title: 'TechTransfer',
        description: 'Patents/software tech transfer search preview.',
        run: () => spaceService.searchTechtransferPatents({ q: 'robot' }),
      },
      ssd_cneos: {
        title: 'SSD/CNEOS',
        description: 'JPL close-approach data (CAD) summary.',
        run: () => spaceService.getSsdCneosCad({ 'dist_max': '0.05', limit: 10 }),
      },
      tle: {
        title: 'TLE API',
        description: 'Two-line element set (defaults to ISS / NORAD 25544).',
        run: () => spaceService.getTle({ catnr: 25544 }),
      },
      gibs: {
        title: 'GIBS',
        description: 'Global Imagery Browse Services (WMTS info).',
        run: () => spaceService.getGibsInfo(),
      },
      trek_wmts: {
        title: 'Vesta/Moon/Mars Trek WMTS',
        description: 'WMTS integration info for Trek imagery tiles.',
        run: () => spaceService.getTrekWmtsInfo(),
      },
      insight: {
        title: 'InSight: Mars Weather',
        description: 'Status/info for InSight weather API integration.',
        run: () => spaceService.getInsightInfo(),
      },
      osdr: {
        title: 'Open Science Data Repository',
        description: 'Status/info for OSDR integration.',
        run: () => spaceService.getOsdrInfo(),
      },
      ssc: {
        title: 'Satellite Situation Center',
        description: 'Status/info for SSC integration.',
        run: () => spaceService.getSscInfo(),
      },
    };

    return defs[apiId] || null;
  }, [apiId]);

  const [state, setState] = useState({ loading: true, error: null, data: null });

  const load = async () => {
    if (!config) return;
    setState({ loading: true, error: null, data: null });
    try {
      const res = await config.run();
      setState({ loading: false, error: null, data: res?.data });
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.response?.data?.error || e?.message || 'Request failed';
      setState({ loading: false, error: msg, data: null });
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiId]);

  if (!config) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className={`text-3xl font-bold font-['Poppins'] ${isDark ? 'text-white' : 'text-gray-900'}`}>Unknown API</h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>This Space Lab integration key is not configured.</p>
        </div>
        <Link to="/lab/space" className="inline-flex items-center gap-2 text-[#00E0FF] font-semibold">
          <FiArrowLeft />
          Back to Space Lab
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold font-['Poppins'] ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.title}</h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>{config.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/lab/space"
            className={`px-4 py-2 rounded-lg font-semibold ${
              isDark
                ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                : 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50'
            }`}
          >
            <FiArrowLeft className="inline mr-2" />
            Space Lab
          </Link>
          <button
            type="button"
            onClick={load}
            className="px-4 py-2 bg-gradient-to-r from-[#1A4FFF] to-[#00E0FF] text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-[#1A4FFF]/50"
          >
            <FiRefreshCw className="inline mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {state.error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-200">
          {state.error}
        </div>
      )}

      <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} backdrop-blur-md border rounded-xl p-6 shadow-xl`}>
        <div className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Response preview</div>
        <pre className={`text-xs overflow-auto whitespace-pre-wrap ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
          {state.loading ? 'Loading…' : truncateJson(state.data)}
        </pre>
      </div>

      {apiId === 'apod' && state.data?.media_type === 'image' && state.data?.url && (
        <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} backdrop-blur-md border rounded-xl p-6 shadow-xl`}>
          <div className={`text-lg font-bold mb-3 font-['Poppins'] ${isDark ? 'text-white' : 'text-gray-900'}`}>APOD Image</div>
          <a
            href={state.data.hdurl || state.data.url}
            target="_blank"
            rel="noreferrer"
            className={`block rounded-lg overflow-hidden border ${isDark ? 'border-white/10' : 'border-gray-200'}`}
          >
            <img src={state.data.url} alt={state.data.title || 'APOD'} className="w-full h-72 object-cover" loading="lazy" />
          </a>
        </div>
      )}
    </div>
  );
};

export default SpaceApiPage;
