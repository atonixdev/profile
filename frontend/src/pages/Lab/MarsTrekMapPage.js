import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import ImageLayer from 'ol/layer/Image';
import ImageArcGISRest from 'ol/source/ImageArcGISRest';
import { Projection } from 'ol/proj';
import { addProjection } from 'ol/proj';

const MarsTrekMapPage = () => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    try {
      // Mars Trek basemap (Viking MDIM21 color mosaic)
      // ArcGIS ImageServer reports wkid 104905 with bounds [-180..180, -90..90].
      const marsProj = new Projection({
        code: 'EPSG:104905',
        units: 'degrees',
        extent: [-180, -90, 180, 90],
        global: true,
      });
      addProjection(marsProj);

      const basemapSource = new ImageArcGISRest({
        url: 'https://trek.nasa.gov/mars/trekarcgis/rest/services/Mars_Viking_MDIM21_ClrMosaic_global_232m/ImageServer',
        ratio: 1,
        params: {
          format: 'png32',
          transparent: false,
        },
      });

      const basemapLayer = new ImageLayer({
        source: basemapSource,
      });

      const map = new Map({
        target: containerRef.current,
        layers: [basemapLayer],
        view: new View({
          projection: marsProj,
          center: [0, 0],
          zoom: 1,
          extent: [-180, -90, 180, 90],
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

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-['Poppins']">Mars Trek Map</h1>
          <p className="text-gray-400 mt-2">
            Mars basemap (Viking MDIM21) rendered via OpenLayers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/lab/space"
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-semibold hover:bg-white/10"
          >
            <FiArrowLeft className="inline mr-2" />
            Space Lab
          </Link>
          <Link
            to="/lab/space/map"
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-semibold hover:bg-white/10"
          >
            Earth Map
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-xl">
        <div ref={containerRef} className="w-full h-[520px] rounded-lg overflow-hidden" />
      </div>

      <div className="text-xs text-gray-400">
        This page uses Trek’s ArcGIS ImageServer (planetary CRS). That’s why it’s separate from the Mapbox Earth map.
      </div>
    </div>
  );
};

export default MarsTrekMapPage;
