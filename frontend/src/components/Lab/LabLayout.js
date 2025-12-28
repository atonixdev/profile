import React, { useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import DomainSidebar from './DomainSidebar';
import LabTopBar from './LabTopBar';
import ResearchDomainNav from './ResearchDomainNav';

const LabLayout = () => {
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('lab_theme') || 'light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('lab_sidebar_collapsed') === '1');
  const [settings, setSettings] = useState(() => {
    const defaults = {
      compareCap: 5,
      compareMetric: 'duration_ms',
      logsLimit: 200,
      domains: {
        space: {
          enabled: true,
          label: 'Space Lab',
          description: 'Astrophysics & Orbital Mechanics',
        },
        self: {
          enabled: true,
          label: 'Self Lab',
          description: 'Biometrics & Personal Evolution',
        },
        ai: {
          enabled: true,
          label: 'AI Lab',
          description: 'Machine Learning & Model Training',
        },
        iot: {
          enabled: true,
          label: 'IoT Lab',
          description: 'Devices & Sensor Networks',
        },
        experimentation: {
          enabled: true,
          label: 'Experimentation Lab',
          description: 'A/B Testing & Research Engine',
        },
      },
    };

    try {
      const raw = localStorage.getItem('lab_settings');
      if (!raw) return defaults;
      const parsed = JSON.parse(raw);
      const merged = { ...defaults, ...(parsed || {}) };
      merged.domains = { ...defaults.domains, ...((parsed || {}).domains || {}) };
      return merged;
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

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('lab_sidebar_collapsed', next ? '1' : '0');
      return next;
    });
  };

  const currentDomain = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/lab/space')) return 'space';
    if (path.startsWith('/lab/self')) return 'self';
    if (path.startsWith('/lab/ai')) return 'ai';
    if (path.startsWith('/lab/iot')) return 'iot';
    return 'experimentation';
  }, [location.pathname]);

  const themeClasses = useMemo(() => {
    return theme === 'dark'
      ? 'bg-[#0A0F1F] text-gray-100'
      : 'bg-gray-50 text-gray-900';
  }, [theme]);

  const domainsMeta = useMemo(() => settings?.domains || {}, [settings?.domains]);

  return (
    <div className={`min-h-screen ${themeClasses}`}>
      <ResearchDomainNav domainsMeta={domainsMeta} theme={theme} />
      
      <div className="flex flex-col md:flex-row">
        {/* Desktop sidebar */}
        <div className={sidebarCollapsed ? 'hidden md:block w-20' : 'hidden md:block w-72'}>
          <DomainSidebar
            domain={currentDomain}
            domainsMeta={domainsMeta}
            theme={theme}
            collapsed={sidebarCollapsed}
            onToggleCollapse={toggleSidebarCollapsed}
          />
        </div>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              aria-label="Close menu"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative h-full">
              <DomainSidebar
                domain={currentDomain}
                domainsMeta={domainsMeta}
                theme={theme}
                variant="drawer"
                onNavigate={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <LabTopBar
            search={search}
            setSearch={setSearch}
            theme={theme}
            toggleTheme={toggleTheme}
            isMenuOpen={mobileMenuOpen}
            onToggleMenu={() => setMobileMenuOpen((v) => !v)}
          />

          <div className="px-4 md:px-6 py-6">
            <Outlet context={{ search, theme, settings, setSettings: updateSettings, domain: currentDomain }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabLayout;
