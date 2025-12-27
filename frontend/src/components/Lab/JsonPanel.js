import React from 'react';

const JsonPanel = ({ title, value }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
      <pre className="bg-gray-50 border border-gray-200 rounded p-4 text-xs overflow-auto">
        {JSON.stringify(value || {}, null, 2)}
      </pre>
    </div>
  );
};

export default JsonPanel;
