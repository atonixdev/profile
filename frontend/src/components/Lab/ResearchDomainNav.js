import React, { useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiZap, FiActivity, FiCpu, FiRadio, FiBarChart, FiMenu, FiX } from 'react-icons/fi';

const ResearchDomainNav = ({ domainsMeta = {} }) => {
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
    <div className="bg-gradient-to-r from-[#0A0F1F] via-[#0D1425] to-[#0A0F1F] border-b border-[#1A4FFF]/20 shadow-xl">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white font-['Poppins']">
              Atonix Research Lab
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Unified Command Center for Multi-Domain Research
            </p>
          </div>

          {/* Desktop version */}
          <div className="hidden sm:block text-xs text-[#00E0FF] font-semibold tracking-wider sm:text-right">
            v2.0.0
          </div>

          {/* Mobile menu toggle */}
          <div className="sm:hidden flex items-center justify-between gap-3">
            <div className="text-xs text-gray-300">
              <span className="font-semibold text-white">{activeDomain?.label}</span>
              <span className="text-gray-500"> — </span>
              <span className="text-gray-400">{activeDomain?.description}</span>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <FiX className="text-white" /> : <FiMenu className="text-white" />}
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
                      isActive
                        ? 'bg-[#1A4FFF]/20 border-[#1A4FFF]'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#00E0FF]/50',
                    ].join(' ');
                  }}
                >
                  {({ isActive: navIsActive }) => {
                    const isActive = domain.id === 'experimentation' ? isExperimentationActive : navIsActive;
                    return (
                      <>
                        <Icon
                          className={`text-lg transition-colors ${
                            isActive ? 'text-[#00E0FF]' : 'text-gray-400 group-hover:text-[#00E0FF]'
                          }`}
                        />
                        <div className="flex flex-col min-w-0">
                          <span
                            className={`text-sm font-semibold transition-colors ${
                              isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                            }`}
                          >
                            {domain.label}
                          </span>
                          <span className="text-xs text-gray-500 leading-snug truncate">
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
                    isActive
                      ? 'bg-[#1A4FFF]/20 border-[#1A4FFF] shadow-lg shadow-[#1A4FFF]/25'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#00E0FF]/50',
                  ].join(' ');
                }}
              >
                {({ isActive: navIsActive }) => {
                  const isActive = domain.id === 'experimentation' ? isExperimentationActive : navIsActive;
                  return (
                    <>
                      <Icon
                        className={`text-xl transition-colors ${
                          isActive ? 'text-[#00E0FF]' : 'text-gray-400 group-hover:text-[#00E0FF]'
                        }`}
                      />
                      <div className="flex flex-col">
                        <span
                          className={`text-sm font-semibold transition-colors ${
                            isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                          }`}
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
