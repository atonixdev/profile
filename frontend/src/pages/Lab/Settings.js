import React, { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';

const Settings = () => {
  const { settings, setSettings } = useOutletContext();

  const compareCap = useMemo(() => Number(settings?.compareCap || 5), [settings]);
  const logsLimit = useMemo(() => Number(settings?.logsLimit || 200), [settings]);

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 mt-1">Basic lab preferences.</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm font-semibold text-gray-700">Compare run limit</div>
            <div className="text-xs text-gray-500 mt-1">Controls the max runs selectable in Compare.</div>
            <input
              type="number"
              min={2}
              max={10}
              value={compareCap}
              onChange={(e) => {
                const n = clamp(Number(e.target.value || 0), 2, 10);
                setSettings?.({ compareCap: n });
              }}
              className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <div className="text-sm font-semibold text-gray-700">Log lines limit</div>
            <div className="text-xs text-gray-500 mt-1">Controls how many log lines the UI requests per run.</div>
            <input
              type="number"
              min={20}
              max={1000}
              value={logsLimit}
              onChange={(e) => {
                const n = clamp(Number(e.target.value || 0), 20, 1000);
                setSettings?.({ logsLimit: n });
              }}
              className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="text-xs text-gray-500 mt-4">
          Saved locally in your browser (per device).
        </div>
      </div>
    </div>
  );
};

export default Settings;
