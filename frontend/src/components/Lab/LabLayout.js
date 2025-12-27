import React, { useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import LabSidebar from './LabSidebar';
import LabTopBar from './LabTopBar';

const LabLayout = () => {
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('lab_theme') || 'light');
  const [settings, setSettings] = useState(() => {
    const defaults = {
      compareCap: 5,
      compareMetric: 'duration_ms',
      logsLimit: 200,
    };

    try {
      const raw = localStorage.getItem('lab_settings');
      if (!raw) return defaults;
      const parsed = JSON.parse(raw);
      return { ...defaults, ...(parsed || {}) };
    } catch {
      return defaults;
    }
  });

  const updateSettings = (next) => {
    setSettings((prev) => {
      const value = typeof next === 'function' ? next(prev) : next;
      const merged = { ...prev, ...(value || {}) };
      localStorage.setItem('lab_settings', JSON.stringify(merged));
      return merged;
    });
  };

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('lab_theme', next);
      return next;
    });
  };

  const themeClasses = useMemo(() => {
    return theme === 'dark'
      ? 'bg-gray-900 text-gray-100'
      : 'bg-gray-50 text-gray-900';
  }, [theme]);

  return (
    <div className={`min-h-[calc(100vh-64px)] ${themeClasses}`}>
      <div className="flex flex-col md:flex-row">
        <LabSidebar />

        <div className="flex-1 min-w-0">
          <LabTopBar
            search={search}
            setSearch={setSearch}
            theme={theme}
            toggleTheme={toggleTheme}
          />

          <div className="px-4 md:px-6 py-6">
            <Outlet context={{ search, theme, settings, setSettings: updateSettings }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabLayout;
