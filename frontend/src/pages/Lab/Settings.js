import React, { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';

const Settings = () => {
  const { settings, setSettings, theme } = useOutletContext();
  const isDark = theme === 'dark';

  const compareCap = useMemo(() => Number(settings?.compareCap || 5), [settings]);
  const logsLimit = useMemo(() => Number(settings?.logsLimit || 200), [settings]);

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const domainSettings = useMemo(() => settings?.domains || {}, [settings]);

  const domains = useMemo(
    () => [
      { id: 'space', fallbackLabel: 'Space Lab', fallbackDescription: 'Astrophysics & Orbital Mechanics' },
      { id: 'self', fallbackLabel: 'Self Lab', fallbackDescription: 'Biometrics & Personal Evolution' },
      { id: 'ai', fallbackLabel: 'AI Lab', fallbackDescription: 'Machine Learning & Model Training' },
      { id: 'iot', fallbackLabel: 'IoT Lab', fallbackDescription: 'Devices & Sensor Networks' },
      { id: 'experimentation', fallbackLabel: 'Experimentation Lab', fallbackDescription: 'A/B Testing & Research Engine' },
    ],
    []
  );

  const updateDomain = (domainId, patch) => {
    setSettings?.((prev) => {
      const prevDomains = prev?.domains || {};
      const nextDomains = {
        ...prevDomains,
        [domainId]: {
          ...(prevDomains[domainId] || {}),
          ...(patch || {}),
        },
      };
      return { ...prev, domains: nextDomains };
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className={isDark ? 'text-gray-300 mt-1' : 'text-gray-600 mt-1'}>Basic lab preferences.</p>
      </div>

      <div className={isDark ? 'bg-white/5 border border-white/10 rounded-lg p-6' : 'bg-white rounded-lg shadow-md p-6'}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className={isDark ? 'text-sm font-semibold text-gray-200' : 'text-sm font-semibold text-gray-700'}>Compare run limit</div>
            <div className={isDark ? 'text-xs text-gray-300 mt-1' : 'text-xs text-gray-500 mt-1'}>Controls the max runs selectable in Compare.</div>
            <input
              type="number"
              min={2}
              max={10}
              value={compareCap}
              onChange={(e) => {
                const n = clamp(Number(e.target.value || 0), 2, 10);
                setSettings?.({ compareCap: n });
              }}
              className={isDark ? 'mt-3 w-full px-3 py-2 border border-white/10 bg-white/5 text-white rounded-lg' : 'mt-3 w-full px-3 py-2 border border-gray-300 rounded-lg'}
            />
          </div>

          <div>
            <div className={isDark ? 'text-sm font-semibold text-gray-200' : 'text-sm font-semibold text-gray-700'}>Log lines limit</div>
            <div className={isDark ? 'text-xs text-gray-300 mt-1' : 'text-xs text-gray-500 mt-1'}>Controls how many log lines the UI requests per run.</div>
            <input
              type="number"
              min={20}
              max={1000}
              value={logsLimit}
              onChange={(e) => {
                const n = clamp(Number(e.target.value || 0), 20, 1000);
                setSettings?.({ logsLimit: n });
              }}
              className={isDark ? 'mt-3 w-full px-3 py-2 border border-white/10 bg-white/5 text-white rounded-lg' : 'mt-3 w-full px-3 py-2 border border-gray-300 rounded-lg'}
            />
          </div>
        </div>

        <div className={isDark ? 'text-xs text-gray-300 mt-4' : 'text-xs text-gray-500 mt-4'}>
          Saved locally in your browser (per device).
        </div>
      </div>

      <div className={isDark ? 'bg-white/5 border border-white/10 rounded-lg p-6' : 'bg-white rounded-lg shadow-md p-6'}>
        <div className="mb-4">
          <div className={isDark ? 'text-lg font-bold text-white' : 'text-lg font-bold text-gray-900'}>Lab Dashboard Settings</div>
          <div className={isDark ? 'text-sm text-gray-300 mt-1' : 'text-sm text-gray-600 mt-1'}>
            Configure the name and tagline shown in the lab navigation and sidebars.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {domains.map((d) => {
            const current = domainSettings?.[d.id] || {};
            const enabled = current.enabled !== false;
            const label = current.label || d.fallbackLabel;
            const description = current.description || d.fallbackDescription;

            return (
              <div key={d.id} className={isDark ? 'border border-white/10 rounded-lg p-5 bg-white/5' : 'border border-gray-200 rounded-lg p-5'}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className={isDark ? 'text-sm font-semibold text-white' : 'text-sm font-semibold text-gray-800'}>{d.fallbackLabel}</div>
                    <div className={isDark ? 'text-xs text-gray-300 mt-1' : 'text-xs text-gray-500 mt-1'}>
                      Domain key: <span className="font-mono">{d.id}</span>
                    </div>
                  </div>

                  <label className={isDark ? 'inline-flex items-center gap-2 text-sm font-semibold text-gray-200 select-none' : 'inline-flex items-center gap-2 text-sm font-semibold text-gray-700 select-none'}>
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => updateDomain(d.id, { enabled: e.target.checked })}
                      className="h-4 w-4"
                    />
                    Enabled
                  </label>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <div className={isDark ? 'text-xs font-semibold text-gray-200' : 'text-xs font-semibold text-gray-700'}>Label</div>
                    <input
                      type="text"
                      value={label}
                      onChange={(e) => updateDomain(d.id, { label: e.target.value })}
                      className={isDark ? 'mt-2 w-full px-3 py-2 border border-white/10 bg-white/5 text-white rounded-lg' : 'mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg'}
                    />
                  </div>

                  <div>
                    <div className={isDark ? 'text-xs font-semibold text-gray-200' : 'text-xs font-semibold text-gray-700'}>Tagline</div>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => updateDomain(d.id, { description: e.target.value })}
                      className={isDark ? 'mt-2 w-full px-3 py-2 border border-white/10 bg-white/5 text-white rounded-lg' : 'mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg'}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={isDark ? 'text-xs text-gray-300 mt-4' : 'text-xs text-gray-500 mt-4'}>
          These settings are saved locally in your browser.
        </div>
      </div>
    </div>
  );
};

export default Settings;
