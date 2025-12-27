import React from 'react';
import { NavLink } from 'react-router-dom';
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
  return (
    <div className="bg-gradient-to-r from-[#0A0F1F] via-[#0D1425] to-[#0A0F1F] border-b border-[#1A4FFF]/20 shadow-xl">
      <div className="max-w-[1800px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white font-['Poppins']">
              Atonix Research Lab
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Unified Command Center for Multi-Domain Research
            </p>
          </div>
          <div className="text-xs text-[#00E0FF] font-semibold tracking-wider">
            v2.0.0
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-[#1A4FFF] scrollbar-track-transparent">
          {domains.map((domain) => {
            const Icon = domain.icon;
            return (
              <NavLink
                key={domain.id}
                to={domain.path}
                end={domain.exact}
                className={({ isActive }) =>
                  [
                    'group flex items-center gap-3 px-5 py-3 rounded-lg transition-all duration-300',
                    'border backdrop-blur-md min-w-fit',
                    isActive
                      ? 'bg-[#1A4FFF]/20 border-[#1A4FFF] shadow-lg shadow-[#1A4FFF]/25'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#00E0FF]/50',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
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
                      <span className="text-xs text-gray-500">
                        {domain.description}
                      </span>
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResearchDomainNav;
