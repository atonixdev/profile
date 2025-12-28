import React, { useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiZap, FiActivity, FiCpu, FiRadio, FiBarChart, FiMenu, FiX } from 'react-icons/fi';

const ResearchDomainNav = ({ domainsMeta = {}, theme = 'light' }) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const domains = useMemo(() => {
    const base = [
      { id: 'space', icon: FiZap, path: '/lab/space' },
      { id: 'self', icon: FiActivity, path: '/lab/self' },
      { id: 'ai', icon: FiCpu, path: '/lab/ai' },
      { id: 'iot', icon: FiRadio, path: '/lab/iot' },
      { id: 'experimentation', icon: FiBarChart, path: '/lab', exact: true },
    ];

    const hydrated = base.map((d) => {
      const meta = domainsMeta?.[d.id] || {};
      return {
        ...d,
        enabled: meta.enabled !== false,
        label:
          meta.label ||
          (d.id === 'experimentation' ? 'Experimentation Lab' : `${d.id.charAt(0).toUpperCase()}${d.id.slice(1)} Lab`),
        description: meta.description || '',
      };
    });

    return hydrated.filter((d) => d.enabled);
  }, [domainsMeta]);

  const isExperimentationActive = useMemo(() => {
    const p = location.pathname || '';
    if (!p.startsWith('/lab')) return false;
    const otherDomains = ['/lab/space', '/lab/self', '/lab/ai', '/lab/iot'];
    return !otherDomains.some((prefix) => p === prefix || p.startsWith(`${prefix}/`));
  }, [location.pathname]);

  const activeDomain = useMemo(() => {
    const p = location.pathname || '';
    const matched = domains.find((d) => d.id !== 'experimentation' && (p === d.path || p.startsWith(`${d.path}/`)));
    if (matched) return matched;
    if (isExperimentationActive) return domains.find((d) => d.id === 'experimentation') || domains[0] || null;
    return domains[0] || null;
  }, [location.pathname, isExperimentationActive, domains]);

  return (
    <div
      className={
        theme === 'dark'
          ? 'bg-gradient-to-r from-[#0A0F1F] via-[#0D1425] to-[#0A0F1F] border-b border-[#1A4FFF]/20 shadow-xl'
          : 'bg-white border-b border-gray-200 shadow-sm'
      }
    >
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h1
              className={
                theme === 'dark'
                  ? "text-2xl font-bold text-white font-['Poppins']"
                  : "text-2xl font-bold text-gray-900 font-['Poppins']"
              }
            >
              Atonix Research Lab
            </h1>
            <p className={theme === 'dark' ? 'text-xs text-gray-400 mt-1' : 'text-xs text-gray-600 mt-1'}>
              Unified Command Center for Multi-Domain Research
            </p>
          </div>

          {/* Desktop version */}
          <div
            className={
              theme === 'dark'
                ? 'hidden sm:block text-xs text-[#00E0FF] font-semibold tracking-wider sm:text-right'
                : 'hidden sm:block text-xs text-primary-700 font-semibold tracking-wider sm:text-right'
            }
          >
            v2.0.0
          </div>

          {/* Mobile menu toggle */}
          <div className="sm:hidden flex items-center justify-between gap-3">
            <div className={theme === 'dark' ? 'text-xs text-gray-300' : 'text-xs text-gray-700'}>
              <span className={theme === 'dark' ? 'font-semibold text-white' : 'font-semibold text-gray-900'}>
                {activeDomain?.label}
              </span>
              <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}> — </span>
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                {activeDomain?.description}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className={
                theme === 'dark'
                  ? 'inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10'
                  : 'inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white hover:bg-gray-50'
              }
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <FiX className={theme === 'dark' ? 'text-white' : 'text-gray-700'} />
              ) : (
                <FiMenu className={theme === 'dark' ? 'text-white' : 'text-gray-700'} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown list */}
        {mobileOpen && (
          <div className="sm:hidden grid grid-cols-1 gap-2 mb-3">
            {domains.map((domain) => {
              const Icon = domain.icon;

              return (
                <NavLink
                  key={domain.id}
                  to={domain.path}
                  end={domain.exact}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive: navIsActive }) => {
                    const isActive = domain.id === 'experimentation' ? isExperimentationActive : navIsActive;
                    return [
                      'group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300',
                      'border backdrop-blur-md w-full min-w-0',
                      theme === 'dark'
                        ? isActive
                          ? 'bg-[#1A4FFF]/20 border-[#1A4FFF]'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#00E0FF]/50'
                        : isActive
                          ? 'bg-primary-50 border-primary-200'
                          : 'bg-white border-gray-200 hover:bg-gray-50',
                    ].join(' ');
                  }}
                >
                  {({ isActive: navIsActive }) => {
                    const isActive = domain.id === 'experimentation' ? isExperimentationActive : navIsActive;
                    return (
                      <>
                        <Icon
                          className={
                            theme === 'dark'
                              ? `text-lg transition-colors ${
                                  isActive ? 'text-[#00E0FF]' : 'text-gray-400 group-hover:text-[#00E0FF]'
                                }`
                              : `text-lg transition-colors ${
                                  isActive ? 'text-primary-700' : 'text-gray-500 group-hover:text-primary-700'
                                }`
                          }
                        />
                        <div className="flex flex-col min-w-0">
                          <span
                            className={
                              theme === 'dark'
                                ? `text-sm font-semibold transition-colors ${
                                    isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                                  }`
                                : `text-sm font-semibold transition-colors ${
                                    isActive ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'
                                  }`
                            }
                          >
                            {domain.label}
                          </span>
                          <span
                            className={
                              theme === 'dark'
                                ? 'text-xs text-gray-500 leading-snug truncate'
                                : 'text-xs text-gray-500 leading-snug truncate'
                            }
                          >
                            {domain.description}
                          </span>
                        </div>
                      </>
                    );
                  }}
                </NavLink>
              );
            })}
          </div>
        )}

        {/* Desktop grid */}
        <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {domains.map((domain) => {
            const Icon = domain.icon;

            return (
              <NavLink
                key={domain.id}
                to={domain.path}
                end={domain.exact}
                className={({ isActive: navIsActive }) => {
                  const isActive = domain.id === 'experimentation' ? isExperimentationActive : navIsActive;
                  return [
                    'group flex items-center gap-3 px-5 py-3 rounded-lg transition-all duration-300',
                    'border backdrop-blur-md w-full min-w-0',
                    theme === 'dark'
                      ? isActive
                        ? 'bg-[#1A4FFF]/20 border-[#1A4FFF] shadow-lg shadow-[#1A4FFF]/25'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#00E0FF]/50'
                      : isActive
                        ? 'bg-primary-50 border-primary-200'
                        : 'bg-white border-gray-200 hover:bg-gray-50',
                  ].join(' ');
                }}
              >
                {({ isActive: navIsActive }) => {
                  const isActive = domain.id === 'experimentation' ? isExperimentationActive : navIsActive;
                  return (
                    <>
                      <Icon
                        className={
                          theme === 'dark'
                            ? `text-xl transition-colors ${
                                isActive ? 'text-[#00E0FF]' : 'text-gray-400 group-hover:text-[#00E0FF]'
                              }`
                            : `text-xl transition-colors ${
                                isActive ? 'text-primary-700' : 'text-gray-500 group-hover:text-primary-700'
                              }`
                        }
                      />
                      <div className="flex flex-col">
                        <span
                          className={
                            theme === 'dark'
                              ? `text-sm font-semibold transition-colors ${
                                  isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                                }`
                              : `text-sm font-semibold transition-colors ${
                                  isActive ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'
                                }`
                          }
                        >
                          {domain.label}
                        </span>
                        <span className="text-xs text-gray-500 leading-snug">
                          {domain.description}
                        </span>
                      </div>
                    </>
                  );
                }}
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResearchDomainNav;
