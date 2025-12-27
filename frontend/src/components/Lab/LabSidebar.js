import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiActivity, FiBarChart2, FiClock, FiPlayCircle, FiSliders, FiSettings } from 'react-icons/fi';

const navItems = [
  { to: '/lab', label: 'Dashboard Overview', icon: FiActivity, end: true },
  { to: '/lab/run', label: 'Run Experiment', icon: FiPlayCircle },
  { to: '/lab/history', label: 'Experiment History', icon: FiClock },
  { to: '/lab/compare', label: 'Compare Experiments', icon: FiBarChart2 },
  { to: '/lab/models', label: 'Models & Artifacts', icon: FiSliders },
  { to: '/lab/settings', label: 'Settings', icon: FiSettings },
];

const LabSidebar = () => {
  return (
    <aside className="w-full md:w-72 bg-white border-r border-gray-200">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="text-lg font-bold text-gray-900">Research Lab</div>
        <div className="text-xs text-gray-500 mt-1">A/B testing & experimentation</div>
      </div>

      <nav className="p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2 rounded-lg font-semibold transition-colors',
                  isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100',
                ].join(' ')
              }
            >
              <Icon className="text-lg" />
              <span className="text-sm">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default LabSidebar;
