import React from 'react';

const JsonPanel = ({ title, value, theme = 'light' }) => {
  const containerClass = theme === 'dark' ? 'bg-white/5 border border-white/10 rounded-lg p-6' : 'bg-white rounded-lg shadow-md p-6';
  const titleClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const preClass = theme === 'dark'
    ? 'bg-black/30 border border-white/10 rounded p-4 text-xs overflow-auto text-gray-100'
    : 'bg-gray-50 border border-gray-200 rounded p-4 text-xs overflow-auto';

  return (
    <div className={containerClass}>
      <h3 className={`text-lg font-bold ${titleClass} mb-3`}>{title}</h3>
      <pre className={preClass}>
        {JSON.stringify(value || {}, null, 2)}
      </pre>
    </div>
  );
};

export default JsonPanel;
