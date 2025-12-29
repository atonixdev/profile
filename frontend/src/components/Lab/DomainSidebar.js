import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiActivity, FiPlayCircle, FiClock, FiBarChart2, FiSliders, FiSettings,
  FiGlobe, FiCrosshair, FiTarget, FiDatabase,
  FiHeart, FiUser, FiTrendingUp, FiBook,
  FiCpu, FiLayers, FiGitBranch, FiBox,
  FiRadio, FiHardDrive, FiZap, FiWifi,
  FiChevronsLeft, FiChevronsRight
} from 'react-icons/fi';

const domainConfigs = {
  experimentation: {
    title: 'Experimentation Lab',
    subtitle: 'A/B Testing & Research Engine',
    items: [
      { to: '/lab', label: 'Dashboard Overview', icon: FiActivity, end: true },
      { to: '/lab/run', label: 'Run Experiment', icon: FiPlayCircle },
      { to: '/lab/history', label: 'Experiment History', icon: FiClock },
      { to: '/lab/compare', label: 'Compare Experiments', icon: FiBarChart2 },
      { to: '/lab/models', label: 'Models & Artifacts', icon: FiSliders },
      { to: '/lab/notebooks', label: 'Notebooks', icon: FiBook },
      { to: '/lab/settings', label: 'Settings', icon: FiSettings },
    ],
  },
  space: {
    title: 'Space Lab',
    subtitle: 'Astrophysics & Orbital Mechanics',
    items: [
      { to: '/lab/space', label: 'Dashboard Overview', icon: FiActivity, end: true },
      { to: '/lab/space/map', label: 'Earth Imagery Map', icon: FiGlobe },
      { to: '/lab/space/mars-map', label: 'Mars Trek Map', icon: FiGlobe },
      { to: '/lab/space/astrophysics', label: 'Astrophysics & Orbital Mechanics', icon: FiGlobe },
      { to: '/lab/space/simulations', label: 'Orbital Simulations', icon: FiCrosshair },
      { to: '/lab/space/telemetry', label: 'Satellite Telemetry', icon: FiTarget },
      { to: '/lab/space/models', label: 'Cosmic Event Models', icon: FiGlobe },
      { to: '/lab/space/datasets', label: 'Datasets', icon: FiDatabase },
      { to: '/lab/space/settings', label: 'Settings', icon: FiSettings },
    ],
  },
  self: {
    title: 'Self Lab',
    subtitle: 'Biometrics & Personal Evolution',
    items: [
      { to: '/lab/self', label: 'Dashboard Overview', icon: FiActivity, end: true },
      { to: '/lab/self/biometrics', label: 'Biometrics', icon: FiHeart },
      { to: '/lab/self/cognitive', label: 'Cognitive Experiments', icon: FiUser },
      { to: '/lab/self/evolution', label: 'Personal Evolution', icon: FiTrendingUp },
      { to: '/lab/self/journals', label: 'Journals & Logs', icon: FiBook },
      { to: '/lab/self/settings', label: 'Settings', icon: FiSettings },
    ],
  },
  ai: {
    title: 'AI Lab',
    subtitle: 'Machine Learning & Model Training',
    items: [
      { to: '/lab/ai', label: 'Dashboard Overview', icon: FiActivity, end: true },
      { to: '/lab/ai/training', label: 'Model Training', icon: FiCpu },
      { to: '/lab/ai/datasets', label: 'Dataset Manager', icon: FiLayers },
      { to: '/lab/ai/experiments', label: 'Hyperparameter Tuning', icon: FiGitBranch },
      { to: '/lab/ai/registry', label: 'Model Registry', icon: FiBox },
      { to: '/lab/ai/settings', label: 'Settings', icon: FiSettings },
    ],
  },
  iot: {
    title: 'IoT Lab',
    subtitle: 'Devices & Sensor Networks',
    items: [
      { to: '/lab/iot', label: 'Dashboard Overview', icon: FiActivity, end: true },
      { to: '/lab/iot/agriculture', label: 'Agriculture', icon: FiActivity },
      { to: '/lab/iot/devices', label: 'Device Manager', icon: FiHardDrive },
      { to: '/lab/iot/telemetry', label: 'Sensor Telemetry', icon: FiRadio },
      { to: '/lab/iot/automation', label: 'Automation Experiments', icon: FiZap },
      { to: '/lab/iot/network', label: 'Network Health', icon: FiWifi },
      { to: '/lab/iot/settings', label: 'Settings', icon: FiSettings },
    ],
  },
};

const DomainSidebar = ({
  domain = 'experimentation',
  domainsMeta = {},
  theme = 'light',
  collapsed = false,
  onToggleCollapse,
  onNavigate,
  variant = 'default',
}) => {
  const config = domainConfigs[domain] || domainConfigs.experimentation;
  const meta = domainsMeta?.[domain] || {};
  const title = meta.label || config.title;
  const subtitle = meta.description || config.subtitle;

  const abbrev = (value) => {
    const s = String(value || '').trim();
    if (!s) return 'LAB';
    const parts = s.split(/\s+/).filter(Boolean);
    const initials = parts.slice(0, 3).map((p) => p[0]?.toUpperCase()).join('');
    return initials || s.slice(0, 3).toUpperCase();
  };

  const baseClassName = (() => {
    const width = variant === 'drawer' ? 'w-72' : 'w-full';
    if (theme === 'dark') {
      return `${width} bg-gradient-to-b from-[#0A0F1F] to-[#0D1425] border-r border-[#1A4FFF]/20`;
    }
    return `${width} bg-white border-r border-gray-200`;
  })();

  return (
    <aside className={baseClassName}>
      <div
        className={
          collapsed
            ? theme === 'dark'
              ? 'px-3 py-4 border-b border-[#1A4FFF]/20'
              : 'px-3 py-4 border-b border-gray-200'
            : theme === 'dark'
              ? 'px-6 py-5 border-b border-[#1A4FFF]/20'
              : 'px-6 py-5 border-b border-gray-200'
        }
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div
              className={
                collapsed
                  ? theme === 'dark'
                    ? 'text-sm font-bold text-white font-[\'Poppins\'] text-center'
                    : 'text-sm font-bold text-gray-900 font-[\'Poppins\'] text-center'
                  : theme === 'dark'
                    ? "text-lg font-bold text-white font-['Poppins']"
                    : "text-lg font-bold text-gray-900 font-['Poppins']"
              }
              title={title}
            >
              {collapsed ? abbrev(title) : title}
            </div>
            {!collapsed && (
              <div className={theme === 'dark' ? 'text-xs text-gray-400 mt-1' : 'text-xs text-gray-600 mt-1'}>
                {subtitle}
              </div>
            )}
          </div>

          {variant !== 'drawer' && (
            <button
              type="button"
              onClick={() => onToggleCollapse?.()}
              className={
                theme === 'dark'
                  ? 'hidden md:inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10'
                  : 'hidden md:inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <FiChevronsRight /> : <FiChevronsLeft />}
            </button>
          )}
        </div>
      </div>

      <nav className={collapsed ? 'p-2 space-y-1' : 'p-3 space-y-1'}>
        {config.items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => {
                if (typeof onNavigate === 'function') onNavigate();
              }}
              title={item.label}
              aria-label={item.label}
              className={({ isActive }) =>
                [
                  collapsed
                    ? 'flex items-center justify-center px-2 py-2.5 rounded-lg font-semibold transition-all duration-200'
                    : 'flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-all duration-200',
                  theme === 'dark'
                    ? isActive
                      ? 'bg-[#1A4FFF]/20 text-[#00E0FF] shadow-lg shadow-[#1A4FFF]/25'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    : isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                ].join(' ')
              }
            >
              <Icon className="text-lg" />
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default DomainSidebar;
