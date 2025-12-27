import React from 'react';

const PlaceholderPage = ({ title, description, domain }) => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white font-['Poppins']">{title}</h1>
        <p className="text-gray-400 mt-2">{description}</p>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-12 shadow-xl text-center">
        <h2 className="text-2xl font-bold text-white mb-2 font-['Poppins']">Coming Soon</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          This feature is under development. Check back soon for updates to the {domain}.
        </p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
