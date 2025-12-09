import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const Discussions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General Discussion' },
    { value: 'help', label: 'Help & Support' },
    { value: 'showcase', label: 'Project Showcase' },
    { value: 'ideas', label: 'Ideas & Suggestions' },
    { value: 'cloud', label: 'Cloud Infrastructure' },
    { value: 'ai-ml', label: 'AI & Machine Learning' },
    { value: 'devops', label: 'DevOps & Automation' },
    { value: 'security', label: 'Security' },
  ];

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-blue-100 text-blue-700',
      help: 'bg-green-100 text-green-700',
      showcase: 'bg-purple-100 text-purple-700',
      ideas: 'bg-orange-100 text-orange-700',
      cloud: 'bg-indigo-100 text-indigo-700',
      'ai-ml': 'bg-pink-100 text-pink-700',
      devops: 'bg-cyan-100 text-cyan-700',
      security: 'bg-red-100 text-red-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  useEffect(() => {
    const fetchDiscussions = async () => {
      setLoading(true);
      try {
        let url = 'http://localhost:8000/api/community/discussions/?ordering=-created_at';
        
        if (selectedCategory !== 'all') {
          url += `&category=${selectedCategory}`;
        }
        
        if (searchTerm) {
          url += `&search=${encodeURIComponent(searchTerm)}`;
        }

        const response = await axios.get(url);
        setDiscussions(response.data.results || response.data);
      } catch (error) {
        console.error('Error fetching discussions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();
  }, [selectedCategory, searchTerm]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (searchTerm) params.set('search', searchTerm);
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (value) params.set('search', value);
    setSearchParams(params);
  };

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Community Discussions</h1>
          <p className="text-lg text-gray-600">
            Share knowledge, ask questions, and connect with experts from around the world
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="font-bold text-lg mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => handleCategoryChange(cat.value)}
                    className={`w-full text-left px-4 py-2 rounded transition-colors ${
                      selectedCategory === cat.value
                        ? 'bg-primary-600 text-white font-semibold'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="mt-6 pt-6 border-t">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search discussions..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="text-lg text-gray-600">Loading discussions...</div>
              </div>
            ) : discussions.length > 0 ? (
              <div className="space-y-4">
                {discussions.map((discussion) => (
                  <Link
                    key={discussion.id}
                    to={`/community/discussion/${discussion.slug}`}
                    className="block bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all border-l-4 border-primary-600"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg text-gray-900 hover:text-primary-600">
                            {discussion.title}
                          </h3>
                          {discussion.is_pinned && (
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-semibold">
                              Pinned
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="font-semibold">{discussion.author_info?.full_name || 'Anonymous'}</span>
                          <span>{new Date(discussion.created_at).toLocaleDateString()}</span>
                        </div>
                        <span className={`inline-block px-3 py-1 rounded text-sm font-semibold ${getCategoryColor(discussion.category)}`}>
                          {categories.find(c => c.value === discussion.category)?.label}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary-600">{discussion.reply_count}</div>
                        <div className="text-xs text-gray-600">Replies</div>
                        <div className="mt-2 text-sm text-gray-600">{discussion.view_count} views</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <div className="text-lg text-gray-600">No discussions found. Be the first to start one!</div>
                <Link to="#" className="mt-4 inline-block bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700">
                  Start a Discussion
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discussions;
