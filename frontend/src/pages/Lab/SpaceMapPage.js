import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const SpaceMapPage = () => {
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [error, setError] = useState(null);

  const mapboxToken = useMemo(() => process.env.REACT_APP_MAPBOX_TOKEN, []);

  useEffect(() => {
    if (!mapboxToken) {
      setError('Missing REACT_APP_MAPBOX_TOKEN. Add it to your frontend environment to render the Mapbox map.');
      return;
    }

    if (!containerRef.current) return;
    if (mapRef.current) return;

    mapboxgl.accessToken = mapboxToken;

    try {
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [0, 20],
        zoom: 1.6,
      });

      mapRef.current = map;

      map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');

      map.on('load', () => {
        // GIBS WMTS as an XYZ-style tile template (EPSG:3857) that Mapbox can consume.
        // This uses a stable, common layer. You can swap the layer or the date string later.
        const gibsLayer = 'MODIS_Terra_CorrectedReflectance_TrueColor';
        const gibsDate = '2024-01-01';
        const gibsMatrixSet = 'GoogleMapsCompatible_Level9';

        const tiles = [
          `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${gibsLayer}/default/${gibsDate}/${gibsMatrixSet}/{z}/{y}/{x}.jpg`,
        ];

        if (!map.getSource('gibs')) {
          map.addSource('gibs', {
            type: 'raster',
            tiles,
            tileSize: 256,
            minzoom: 1,
            maxzoom: 9,
          });
        }

        if (!map.getLayer('gibs-layer')) {
          map.addLayer({
            id: 'gibs-layer',
            type: 'raster',
            source: 'gibs',
            paint: {
              'raster-opacity': 0.85,
            },
          });
        }
      });

      map.on('error', (e) => {
        // Avoid spamming; show a simple message.
        const msg = e?.error?.message;
        if (msg) setError(msg);
      });
    } catch (e) {
      setError(e?.message || 'Failed to initialize Mapbox map');
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapboxToken]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold font-['Poppins'] ${isDark ? 'text-white' : 'text-gray-900'}`}>Earth Imagery Map</h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
            Mapbox GL base map + NASA GIBS imagery overlay.
          </p>
        </div>
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
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-200">
          {error}
          {!mapboxToken ? (
            <div className="mt-2 text-xs text-red-200/80">
              Set `REACT_APP_MAPBOX_TOKEN` then restart the frontend.
            </div>
          ) : null}
        </div>
      )}

      <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} backdrop-blur-md border rounded-xl p-4 shadow-xl`}>
        <div ref={containerRef} className="w-full h-[520px] rounded-lg overflow-hidden" />
      </div>

      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        For Mars Trek imagery, open <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Mars Trek Map</span> from the Space Lab sidebar.
      </div>
    </div>
  );
};

export default SpaceMapPage;
