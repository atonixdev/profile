import React from 'react';
import { Link } from 'react-router-dom';
import { FiHardDrive, FiRadio, FiZap, FiWifi, FiPlayCircle, FiActivity } from 'react-icons/fi';

const StatCard = ({ icon: Icon, label, value, trend, color = 'blue' }) => {
  const colorClasses = {
    blue: 'from-[#1A4FFF]/20 to-[#1A4FFF]/5 border-[#1A4FFF]/30',
    cyan: 'from-[#00E0FF]/20 to-[#00E0FF]/5 border-[#00E0FF]/30',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-md rounded-xl p-6 shadow-lg`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-400 font-medium mb-2">{label}</div>
          <div className="text-3xl font-bold text-white font-['Poppins']">{value}</div>
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

const QuickAction = ({ icon: Icon, label, to, description }) => (
  <Link
    to={to}
    className="flex items-start gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00E0FF]/50 rounded-lg transition-all duration-200 backdrop-blur-md"
  >
    <Icon className="text-2xl text-[#00E0FF] flex-shrink-0 mt-1" />
    <div>
      <div className="font-semibold text-white">{label}</div>
      <div className="text-xs text-gray-400 mt-1">{description}</div>
    </div>
  </Link>
);

const IoTLabOverview = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white font-['Poppins']">IoT Lab</h1>
          <p className="text-gray-400 mt-2">
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
        <StatCard icon={FiHardDrive} label="Connected Devices" value="24" trend="100% online" color="blue" />
        <StatCard icon={FiRadio} label="Sensor Readings" value="12.5K" trend="+540 today" color="cyan" />
        <StatCard icon={FiZap} label="Automations Active" value="17" trend="99.8% uptime" color="purple" />
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4 font-['Poppins']">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickAction
            icon={FiHardDrive}
            label="Device Manager"
            to="/lab/iot/devices"
            description="Configure and monitor IoT devices"
          />
          <QuickAction
            icon={FiRadio}
            label="Sensor Telemetry"
            to="/lab/iot/telemetry"
            description="View real-time sensor data streams"
          />
          <QuickAction
            icon={FiZap}
            label="Automation Experiments"
            to="/lab/iot/automation"
            description="Build and test automation workflows"
          />
          <QuickAction
            icon={FiWifi}
            label="Network Health"
            to="/lab/iot/network"
            description="Monitor network status and connectivity"
          />
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4 font-['Poppins']">Recent Activity</h2>
        <div className="text-gray-400 text-center py-8">
          IoT activity history will appear here
        </div>
      </div>
    </div>
  );
};

export default IoTLabOverview;
