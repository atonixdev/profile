import React from 'react';

const MetricsBarChart = ({ title, items }) => {
  const max = Math.max(...items.map((i) => i.value), 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <div className="text-xs text-gray-500">Max: {max.toFixed ? max.toFixed(2) : max}</div>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const pct = max > 0 ? Math.min(100, (item.value / max) * 100) : 0;
          return (
            <div key={item.label}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-semibold text-gray-700">{item.label}</span>
                <span className="text-gray-600">{item.value}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded">
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
