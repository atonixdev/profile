import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const resourceTypes = [
    { value: 'all', label: 'All Resources' },
    { value: 'tutorial', label: 'Tutorials' },
    { value: 'guide', label: 'Guides' },
    { value: 'template', label: 'Templates' },
    { value: 'tool', label: 'Tools' },
    { value: 'library', label: 'Libraries' },
    { value: 'documentation', label: 'Documentation' },
  ];

  const difficultyLevels = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  const getResourceTypeColor = (type) => {
    const colors = {
      tutorial: 'bg-blue-100 text-blue-700',
      guide: 'bg-green-100 text-green-700',
      template: 'bg-purple-100 text-purple-700',
      tool: 'bg-orange-100 text-orange-700',
      library: 'bg-red-100 text-red-700',
      documentation: 'bg-cyan-100 text-cyan-700',
      other: 'bg-gray-100 text-gray-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const getDifficultyColor = (level) => {
    const colors = {
      beginner: 'bg-green-100 text-green-700',
      intermediate: 'bg-yellow-100 text-yellow-700',
      advanced: 'bg-red-100 text-red-700',
    };
    return colors[level] || 'bg-gray-100 text-gray-700';
  };

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        let url = 'http://localhost:8000/api/community/resources/?ordering=-featured,-created_at';
        
        if (selectedType !== 'all') {
          url += `&resource_type=${selectedType}`;
        }
        
        if (selectedDifficulty !== 'all') {
          url += `&difficulty_level=${selectedDifficulty}`;
        }

        if (searchTerm) {
          url += `&search=${encodeURIComponent(searchTerm)}`;
        }

        const response = await axios.get(url);
        setResources(response.data.results || response.data);
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [selectedType, selectedDifficulty, searchTerm]);

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Community Resources</h1>
          <p className="text-lg text-gray-600">
            Discover tutorials, guides, and templates shared by the community
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Resource Type Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {resourceTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {difficultyLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">Loading resources...</div>
          </div>
        ) : resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <Link
                key={resource.id}
                to={`/community/resource/${resource.slug}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-all overflow-hidden flex flex-col"
              >
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start gap-2 mb-3 flex-wrap">
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${getResourceTypeColor(resource.resource_type)}`}>
                      {resource.resource_type.charAt(0).toUpperCase() + resource.resource_type.slice(1)}
                    </span>
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${getDifficultyColor(resource.difficulty_level)}`}>
                      {resource.difficulty_level.charAt(0).toUpperCase() + resource.difficulty_level.slice(1)}
                    </span>
                    {resource.featured && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-semibold">
                        Featured
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 flex-grow">
                    {resource.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {resource.description}
                  </p>

                  {resource.tags && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {resource.tags.split(',').slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-4 border-t mt-auto">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div>
                        <div className="font-semibold">{resource.author_info?.full_name || 'Community'}</div>
                        <div className="text-xs">{new Date(resource.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-primary-600">{resource.view_count}</div>
                        <div className="text-xs">Views</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <div className="text-lg text-gray-600">No resources found. Try adjusting your filters.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;
