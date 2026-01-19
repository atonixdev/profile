import React from 'react';

const MetricsBarChart = ({ title, items, theme = 'light' }) => {
  const max = Math.max(...items.map((i) => i.value), 0);

  const panelClass = theme === 'dark' ? 'bg-white/5 border border-white/10 rounded-lg p-6' : 'bg-white rounded-lg shadow-md p-6';
  const titleClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const metaTextClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const labelClass = theme === 'dark' ? 'text-gray-200' : 'text-gray-700';
  const valueClass = theme === 'dark' ? 'text-gray-100' : 'text-gray-600';
  const trackClass = theme === 'dark' ? 'h-2 bg-white/10 rounded' : 'h-2 bg-gray-100 rounded';

  return (
    <div className={panelClass}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${titleClass}`}>{title}</h3>
        <div className={`text-xs ${metaTextClass}`}>Max: {max.toFixed ? max.toFixed(2) : max}</div>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const pct = max > 0 ? Math.min(100, (item.value / max) * 100) : 0;
          return (
            <div key={item.label}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className={`font-semibold ${labelClass}`}>{item.label}</span>
                <span className={valueClass}>{item.value}</span>
              </div>
              <div className={trackClass}>
                <div className="h-2 bg-primary-600 rounded" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MetricsBarChart;
