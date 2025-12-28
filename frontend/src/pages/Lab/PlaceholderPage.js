import React from 'react';
import { useOutletContext } from 'react-router-dom';

const PlaceholderPage = ({ title, description, domain }) => {
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  return (
    <div className="space-y-8">
      <div>
        <h1 className={`text-4xl font-bold font-['Poppins'] ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h1>
        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>{description}</p>
      </div>

      <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} backdrop-blur-md border rounded-xl p-12 shadow-xl text-center`}>
        <h2 className={`text-2xl font-bold mb-2 font-['Poppins'] ${isDark ? 'text-white' : 'text-gray-900'}`}>Coming Soon</h2>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-md mx-auto`}>
          This feature is under development. Check back soon for updates to the {domain}.
        </p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
