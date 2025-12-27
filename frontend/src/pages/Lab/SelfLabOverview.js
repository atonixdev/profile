import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiUser, FiTrendingUp, FiBook, FiPlayCircle, FiActivity } from 'react-icons/fi';

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

const SelfLabOverview = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white font-['Poppins']">Self Lab</h1>
          <p className="text-gray-400 mt-2">
            Biometric tracking, cognitive experiments, and personal evolution analytics
          </p>
        </div>
        <Link
          to="/lab/self/cognitive"
          className="px-5 py-2.5 bg-gradient-to-r from-[#1A4FFF] to-[#00E0FF] text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-[#1A4FFF]/50 transition-all duration-200"
        >
          <FiPlayCircle className="inline mr-2" />
          New Experiment
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={FiHeart} label="Biometric Readings" value="1,245" trend="Updated 2h ago" color="blue" />
        <StatCard icon={FiUser} label="Cognitive Tests" value="87" trend="5 pending" color="cyan" />
        <StatCard icon={FiTrendingUp} label="Evolution Score" value="94.2" trend="+2.3 this month" color="purple" />
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4 font-['Poppins']">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickAction
            icon={FiHeart}
            label="Biometrics"
            to="/lab/self/biometrics"
            description="Track heart rate, sleep, and vitals"
          />
          <QuickAction
            icon={FiUser}
            label="Cognitive Experiments"
            to="/lab/self/cognitive"
            description="Run memory, focus, and cognition tests"
          />
          <QuickAction
            icon={FiTrendingUp}
            label="Personal Evolution"
            to="/lab/self/evolution"
            description="Analyze growth metrics over time"
          />
          <QuickAction
            icon={FiBook}
            label="Journals & Logs"
            to="/lab/self/journals"
            description="Review daily entries and reflections"
          />
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4 font-['Poppins']">Recent Activity</h2>
        <div className="text-gray-400 text-center py-8">
          Self-research activity history will appear here
        </div>
      </div>
    </div>
  );
};

export default SelfLabOverview;
