import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../services';

const Portfolio = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectService.getAll();
        // Handle paginated response from Django REST Framework
        const projectsData = response.data.results || response.data;
        setProjects(projectsData);
        setFilteredProjects(projectsData);

        // Extract unique categories
        const uniqueCategories = [...new Set(projectsData.map((p) => p.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    let filtered = projects;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.technologies?.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredProjects(filtered);
  }, [projects, selectedCategory, searchTerm]);

  const filterProjects = (category) => {
    setSelectedCategory(category);
  };

  const featuredProjects = projects.filter(p => p.is_featured);
  const totalProjects = projects.length;
  const categoriesCount = categories.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">My Portfolio</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Discover my journey through innovative projects and creative solutions
          </p>

          {/* Portfolio Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-md mx-auto mb-8">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="text-2xl font-bold text-primary-600">{totalProjects}</div>
              <div className="text-sm text-gray-600">Total Projects</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="text-2xl font-bold text-primary-600">{categoriesCount}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="text-2xl font-bold text-primary-600">{featuredProjects.length}</div>
              <div className="text-sm text-gray-600">Featured</div>
            </div>
          </div>
        </div>

        {/* Featured Projects */}
        {featuredProjects.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Featured Projects</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredProjects.slice(0, 2).map((project) => (
                <Link
                  key={project.id}
                  to={`/portfolio/${project.id}`}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  {project.thumbnail && (
                    <div className="relative overflow-hidden h-64">
                      <img
                        src={project.thumbnail}
                        alt={project.title}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        ★ Featured
                      </div>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm capitalize font-semibold">
                        {project.category}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{project.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies?.slice(0, 4).map((tech, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="text-primary-600 font-semibold">View Project →</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-12">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search projects by title, description, or technology..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => filterProjects('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Projects
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => filterProjects(category)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors capitalize whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              to={`/portfolio/${project.id}`}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
            >
              {project.thumbnail ? (
                <div className="relative overflow-hidden h-48">
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                  <div className="text-white text-4xl font-bold">
                    {project.title.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm capitalize font-semibold">
                    {project.category}
                  </span>
                  {project.is_featured && (
                    <span className="text-yellow-500 text-lg">★</span>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary-600 transition-colors">{project.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies?.slice(0, 3).map((tech, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies?.length > 3 && (
                    <span className="text-gray-500 text-sm">
                      +{project.technologies.length - 3} more
                    </span>
                  )}
                </div>
                <div className="flex items-center text-primary-600 font-semibold">
                  <span>View Details</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? `No projects match "${searchTerm}"` : 'No projects found in this category.'}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Show All Projects
            </button>
          </div>
        )}

        {/* CTA Section */}
        {filteredProjects.length > 0 && (
          <div className="text-center mt-16">
            <div className="bg-primary-600 text-white rounded-lg p-8 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">Have a Project in Mind?</h2>
              <p className="mb-6">Let's discuss your next big idea and bring it to life together.</p>
              <Link
                to="/contact"
                className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Start a Conversation
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
