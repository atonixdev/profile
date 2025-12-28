import React, { useEffect, useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import ImageLayer from 'ol/layer/Image';
import ImageArcGISRest from 'ol/source/ImageArcGISRest';
import { Projection } from 'ol/proj';
import { addProjection } from 'ol/proj';

const BASEMAPS = {
  eq: {
    label: 'Equirect (Global)',
    projection: { code: 'EPSG:104905', units: 'degrees', extent: [-180, -90, 180, 90], center: [0, 0], zoom: 2 },
    url: 'https://trek.nasa.gov/mars/trekarcgis/rest/services/Mars_Viking_MDIM21_ClrMosaic_global_232m/ImageServer',
  },
  np: {
    label: 'North Pole',
    projection: {
      code: 'EPSG:104903',
      units: 'm',
      extent: [-1820012.7356853096, -1819971.6340914431, 1820012.7356853096, 1820053.837279176],
      center: [0, 0],
      zoom: 3,
    },
    url: 'https://trek.nasa.gov/mars/trekarcgis/rest/services/Mars_Viking_MDIM21_ClrMosaic_global_232m_np/ImageServer',
  },
  sp: {
    label: 'South Pole',
    projection: {
      code: 'EPSG:104904',
      units: 'm',
      extent: [-1809300.1269719196, -1809259.2673023306, 1809300.1269719196, 1809341.4148377852],
      center: [0, 0],
      zoom: 3,
    },
    url: 'https://trek.nasa.gov/mars/trekarcgis/rest/services/Mars_Viking_MDIM21_ClrMosaic_global_232m_sp/ImageServer',
  },
};

const MarsTrekMapPage = () => {
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const basemapLayerRef = useRef(null);
  const marsProjectionRef = useRef(null);
  const [error, setError] = useState(null);
  const [basemapId, setBasemapId] = useState('eq');

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    try {
      const initial = BASEMAPS.eq;
      const marsProj = new Projection({
        code: initial.projection.code,
        units: initial.projection.units,
        extent: initial.projection.extent,
        global: true,
      });
      addProjection(marsProj);
      marsProjectionRef.current = marsProj;

      const basemapSource = new ImageArcGISRest({
        url: initial.url,
        ratio: 1,
        params: {
          format: 'png32',
          transparent: false,
        },
      });

      const basemapLayer = new ImageLayer({ source: basemapSource });
      basemapLayerRef.current = basemapLayer;

      const map = new Map({
        target: containerRef.current,
        layers: [basemapLayer],
        view: new View({
          projection: marsProj,
          center: initial.projection.center,
          zoom: initial.projection.zoom,
          extent: initial.projection.extent,
          constrainOnlyCenter: true,
        }),
        controls: [],
      });

      mapRef.current = map;

      basemapSource.on('imageloaderror', () => {
        setError('Failed to load Mars Trek imagery (CORS/network).');
      });
    } catch (e) {
      setError(e?.message || 'Failed to initialize Mars Trek map');
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.setTarget(null);
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = basemapLayerRef.current;
    if (!map || !layer) return;

    const next = BASEMAPS[basemapId] || BASEMAPS.eq;
    setError(null);

    const nextProj = new Projection({
      code: next.projection.code,
      units: next.projection.units,
      extent: next.projection.extent,
      global: true,
    });
    addProjection(nextProj);
    marsProjectionRef.current = nextProj;

    const nextSource = new ImageArcGISRest({
      url: next.url,
      ratio: 1,
      params: {
        format: 'png32',
        transparent: false,
      },
    });

    nextSource.on('imageloaderror', () => {
      setError('Failed to load Mars Trek imagery (CORS/network).');
    });

    layer.setSource(nextSource);
    map.setView(
      new View({
        projection: nextProj,
        center: next.projection.center,
        zoom: next.projection.zoom,
        extent: next.projection.extent,
        constrainOnlyCenter: true,
      })
    );
  }, [basemapId]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold font-['Poppins'] ${isDark ? 'text-white' : 'text-gray-900'}`}>Mars Trek Map</h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
            Mars basemap (Viking MDIM21) rendered via OpenLayers.
          </p>
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
          <Link
            to="/lab/space/map"
            className={`px-4 py-2 rounded-lg font-semibold ${
              isDark
                ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                : 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50'
            }`}
          >
            Earth Map
          </Link>
        </div>
      </div>

      <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} backdrop-blur-md border rounded-xl p-4 shadow-xl`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Basemap</div>
          <select
            value={basemapId}
            onChange={(e) => setBasemapId(e.target.value)}
            className={`w-full md:w-72 px-3 py-2 rounded-lg border ${
              isDark
                ? 'bg-[#0A0F1F] border-white/10 text-gray-100'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            aria-label="Select Mars basemap"
          >
            {Object.entries(BASEMAPS).map(([id, b]) => (
              <option key={id} value={id}>
                {b.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} backdrop-blur-md border rounded-xl p-4 shadow-xl`}>
        <div ref={containerRef} className="w-full h-[75vh] min-h-[620px] rounded-lg overflow-hidden" />
      </div>

      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        This page uses Trek’s ArcGIS ImageServer (planetary CRS). That’s why it’s separate from the Mapbox Earth map.
      </div>
    </div>
  );
};

export default MarsTrekMapPage;
