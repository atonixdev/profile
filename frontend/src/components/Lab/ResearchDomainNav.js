import React, { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiZap, FiActivity, FiCpu, FiRadio, FiBarChart } from 'react-icons/fi';

const domains = [
  { 
    id: 'space', 
    label: 'Space Lab', 
    icon: FiZap, 
    path: '/lab/space',
    description: 'Astrophysics & Orbital Mechanics' 
  },
  { 
    id: 'self', 
    label: 'Self Lab', 
    icon: FiActivity, 
    path: '/lab/self',
    description: 'Biometrics & Personal Evolution' 
  },
  { 
    id: 'ai', 
    label: 'AI Lab', 
    icon: FiCpu, 
    path: '/lab/ai',
    description: 'Machine Learning & Model Training' 
  },
  { 
    id: 'iot', 
    label: 'IoT Lab', 
    icon: FiRadio, 
    path: '/lab/iot',
    description: 'Devices & Sensor Networks' 
  },
  { 
    id: 'experimentation', 
    label: 'Experimentation Lab', 
    icon: FiBarChart, 
    path: '/lab',
    description: 'A/B Testing & Research Engine',
    exact: true
  },
];

const ResearchDomainNav = () => {
  const location = useLocation();

  const isExperimentationActive = useMemo(() => {
    const p = location.pathname || '';
    if (!p.startsWith('/lab')) return false;
    const otherDomains = ['/lab/space', '/lab/self', '/lab/ai', '/lab/iot'];
    return !otherDomains.some((prefix) => p === prefix || p.startsWith(`${prefix}/`));
  }, [location.pathname]);

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
          <div className="text-xs text-[#00E0FF] font-semibold tracking-wider sm:text-right">
            v2.0.0
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
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
