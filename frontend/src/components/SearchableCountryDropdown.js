import React, { useState, useRef, useEffect, useCallback } from 'react';
import { countries, getCountryByName } from '../utils/countries';

const SearchableCountryDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Filter countries based on search term
  const filteredCountries = searchTerm.trim() === '' 
    ? countries 
    : countries.filter(country =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.code.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleSelectCountry = useCallback((countryName) => {
    onChange({
      target: {
        name: 'country',
        value: countryName,
      },
    });
    setIsOpen(false);
    setSearchTerm('');
  }, [onChange]);

  const handleToggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const selectedCountry = value ? getCountryByName(value) : null;

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={handleToggleDropdown}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-left bg-white flex justify-between items-center hover:border-gray-400 transition-colors"
      >
        <span className="text-gray-700">
          {value ? `${value} (${selectedCountry?.code})` : 'Select Country'}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
            <input
              type="text"
              placeholder="Search country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
            />
          </div>

          {/* Country List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredCountries.length > 0 ? (
              filteredCountries.map(country => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleSelectCountry(country.name)}
                  className={`w-full px-4 py-2 text-left hover:bg-primary-50 transition-colors ${
                    value === country.name ? 'bg-primary-100 text-primary-700 font-semibold' : 'text-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{country.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {country.code}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-center text-gray-500">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableCountryDropdown;
