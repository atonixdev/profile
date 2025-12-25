import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogService } from '../services';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const params = {};

        if (selectedCategory !== 'all') {
          params.category = selectedCategory;
        }
        if (searchTerm) {
          params.search = searchTerm;
        }

        const response = await blogService.getAll(params);
        setPosts(response.data.results || response.data);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [selectedCategory, searchTerm]);

  const categories = [
    { value: 'all', label: 'All Posts' },
    { value: 'cloud', label: 'Cloud Architecture' },
    { value: 'ai', label: 'AI & ML' },
    { value: 'devops', label: 'DevOps' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'security', label: 'Security' },
    { value: 'tutorial', label: 'Tutorial' },
  ];

  const getCategoryColor = (category) => {
    const colors = {
      cloud: 'bg-blue-100 text-blue-800',
      ai: 'bg-purple-100 text-purple-800',
      devops: 'bg-green-100 text-green-800',
      infrastructure: 'bg-orange-100 text-orange-800',
      security: 'bg-red-100 text-red-800',
      tutorial: 'bg-yellow-100 text-yellow-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryLabel = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-8 mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">Blog</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Insights on cloud infrastructure, AI/ML, DevOps, and technology trends for African digital sovereignty
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Search */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Search</h3>
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.value
                        ? 'bg-primary-600 text-white font-semibold'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block text-xl text-gray-600">Loading blog posts...</div>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl text-gray-600">No blog posts found.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <article key={post.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3 ${getCategoryColor(post.category)}`}>
                            {getCategoryLabel(post.category)}
                          </span>
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            <Link to={`/blog/${post.slug}`} className="hover:text-primary-600 transition-colors">
                              {post.title}
                            </Link>
                          </h2>
                        </div>
                      </div>

                      {/* Excerpt */}
                      <p className="text-gray-600 mb-4 leading-relaxed">{post.excerpt}</p>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-200">
                        <span>By {post.author}</span>
                        <span>{new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        <span>{post.read_time} min read</span>
                        <span>{post.view_count} views</span>
                      </div>

                      {/* Tags */}
                      {post.tags_list && post.tags_list.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags_list.map((tag, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* CTA */}
                      <Link
                        to={`/blog/${post.slug}`}
                        className="inline-block mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                      >
                        Read More
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Have an Idea for a Blog Post?</h2>
          <p className="text-xl text-primary-100 mb-6">
            Share your thoughts on cloud infrastructure, AI/ML, DevOps, and technology innovation.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Blog;
