import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { FiHardDrive, FiRadio, FiZap, FiWifi, FiPlayCircle, FiActivity } from 'react-icons/fi';

const StatCard = ({ icon: Icon, label, value, trend, color = 'blue', isDark }) => {
  const colorClasses = {
    blue: 'from-[#1A4FFF]/20 to-[#1A4FFF]/5 border-[#1A4FFF]/30',
    cyan: 'from-[#00E0FF]/20 to-[#00E0FF]/5 border-[#00E0FF]/30',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-md rounded-xl p-6 shadow-lg`}>
      <div className="flex items-start justify-between">
        <div>
          <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>{label}</div>
          <div className={`text-3xl font-bold font-['Poppins'] ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</div>
          {trend && (
            <div className="flex items-center gap-1 mt-2 text-xs text-[#00E0FF]">
              <FiActivity />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <Icon className="text-3xl text-[#00E0FF] opacity-60" />
      </div>
    </div>
  );
};

const QuickAction = ({ icon: Icon, label, to, description, isDark }) => (
  <Link
    to={to}
    className={`flex items-start gap-4 p-4 rounded-lg transition-all duration-200 backdrop-blur-md ${
      isDark
        ? 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00E0FF]/50'
        : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-[#00E0FF]/50'
    }`}
  >
    <Icon className="text-2xl text-[#00E0FF] flex-shrink-0 mt-1" />
    <div>
      <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{label}</div>
      <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{description}</div>
    </div>
  </Link>
);

const IoTLabOverview = () => {
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className={`text-4xl font-bold font-['Poppins'] ${isDark ? 'text-white' : 'text-gray-900'}`}>IoT Lab</h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
            Device management, sensor telemetry, and automation experiments
          </p>
        </div>
        <Link
          to="/lab/iot/automation"
          className="px-5 py-2.5 bg-gradient-to-r from-[#1A4FFF] to-[#00E0FF] text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-[#1A4FFF]/50 transition-all duration-200"
        >
          <FiPlayCircle className="inline mr-2" />
          New Automation
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={FiHardDrive} label="Connected Devices" value="24" trend="100% online" color="blue" isDark={isDark} />
        <StatCard icon={FiRadio} label="Sensor Readings" value="12.5K" trend="+540 today" color="cyan" isDark={isDark} />
        <StatCard icon={FiZap} label="Automations Active" value="17" trend="99.8% uptime" color="purple" isDark={isDark} />
      </div>

      <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} backdrop-blur-md border rounded-xl p-6 shadow-xl`}>
        <h2 className={`text-xl font-bold mb-4 font-['Poppins'] ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickAction
            icon={FiHardDrive}
            label="Device Manager"
            to="/lab/iot/devices"
            description="Configure and monitor IoT devices"
            isDark={isDark}
          />
          <QuickAction
            icon={FiRadio}
            label="Sensor Telemetry"
            to="/lab/iot/telemetry"
            description="View real-time sensor data streams"
            isDark={isDark}
          />
          <QuickAction
            icon={FiZap}
            label="Automation Experiments"
            to="/lab/iot/automation"
            description="Build and test automation workflows"
            isDark={isDark}
          />
          <QuickAction
            icon={FiWifi}
            label="Network Health"
            to="/lab/iot/network"
            description="Monitor network status and connectivity"
            isDark={isDark}
          />
        </div>
      </div>

      <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} backdrop-blur-md border rounded-xl p-6 shadow-xl`}>
        <h2 className={`text-xl font-bold mb-4 font-['Poppins'] ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h2>
        <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-center py-8`}>
          IoT activity history will appear here
        </div>
      </div>
    </div>
  );
};

export default IoTLabOverview;
