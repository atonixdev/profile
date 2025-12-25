import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const InteractiveProjects = ({ limit = 6, showViewAll = true }) => {
  const [projects, setProjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/portfolio/projects/');
      
      if (Array.isArray(response.data)) {
        setProjects(response.data.slice(0, limit));
        
        // Extract unique categories
        const uniqueCategories = ['all', ...new Set(response.data.map(p => p.category))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Fallback to sample data
      setProjects([
        {
          id: 1,
          title: 'OpenStack Private Cloud',
          description: 'Designed and deployed a comprehensive OpenStack cloud infrastructure.',
          category: 'cloud',
          technologies: ['OpenStack', 'OVN', 'Kubernetes', 'Ceph'],
          is_featured: true,
        },
        {
          id: 2,
          title: 'AI Research Hub',
          description: 'High-performance computing environment optimized for AI/ML workloads.',
          category: 'ai',
          technologies: ['GPU', 'Docker', 'TensorFlow', 'PyTorch'],
          is_featured: true,
        }
      ]);
      setCategories(['all', 'cloud', 'ai', 'devops']);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => 
    selectedCategory === 'all' || project.category === selectedCategory
  );

  const getCategoryColor = (category) => {
    const colors = {
      'web': 'from-blue-400 to-blue-600',
      'mobile': 'from-green-400 to-green-600',
      'cloud': 'from-purple-400 to-purple-600',
      'ai': 'from-pink-400 to-pink-600',
      'devops': 'from-orange-400 to-orange-600',
      'design': 'from-indigo-400 to-indigo-600',
      'consulting': 'from-cyan-400 to-cyan-600',
      'infrastructure': 'from-yellow-400 to-yellow-600',
      'systems': 'from-red-400 to-red-600',
      'other': 'from-gray-400 to-gray-600'
    };
    return colors[category] || 'from-gray-400 to-gray-600';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'web': 'Web Development',
      'mobile': 'Mobile',
      'cloud': 'Cloud',
      'ai': 'AI & ML',
      'devops': 'DevOps',
      'design': 'Design',
      'consulting': 'Consulting',
      'infrastructure': 'Infrastructure',
      'systems': 'Systems',
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center mb-12">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full font-medium transition-all transform hover:scale-105 ${
              selectedCategory === category
                ? 'bg-primary-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category === 'all' ? 'All Projects' : getCategoryLabel(category)}
          </button>
        ))}
      </div>

      {/* Featured Project Large View */}
      {selectedProject ? (
        <div className="mb-12 bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            <div>
              <div className={`bg-gradient-to-br ${getCategoryColor(selectedProject.category)} h-64 rounded-lg flex items-center justify-center`}>
                <span className="text-white text-6xl font-bold opacity-50">
                  {selectedProject.id}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold px-3 py-1 bg-primary-100 text-primary-700 rounded-full">
                    {getCategoryLabel(selectedProject.category).toUpperCase()}
                  </span>
                  {selectedProject.is_featured && (
                    <span className="text-xs font-bold px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                      ⭐ FEATURED
                    </span>
                  )}
                </div>
                
                <h2 className="text-3xl font-bold mb-4">{selectedProject.title}</h2>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {selectedProject.detailed_description || selectedProject.description}
                </p>

                {selectedProject.technologies && selectedProject.technologies.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Technologies Used</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.technologies.map((tech, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProject.client && (
                  <p className="text-gray-600 mb-2">
                    <strong>Client:</strong> {selectedProject.client}
                  </p>
                )}

                {selectedProject.completion_date && (
                  <p className="text-gray-600">
                    <strong>Completed:</strong> {new Date(selectedProject.completion_date).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="flex gap-4 mt-8">
                {selectedProject.live_url && (
                  <a
                    href={selectedProject.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-center font-medium"
                  >
                    View Live →
                  </a>
                )}
                {selectedProject.github_url && (
                  <a
                    href={selectedProject.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition text-center font-medium"
                  >
                    GitHub ↗
                  </a>
                )}
                <button
                  onClick={() => setSelectedProject(null)}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Grid of Projects */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`cursor-pointer group rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-2 ${
                  project.is_featured ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                {/* Project Image/Header */}
                <div className={`bg-gradient-to-br ${getCategoryColor(project.category)} h-48 relative overflow-hidden`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-6xl font-bold opacity-30 group-hover:opacity-50 transition">
                      {project.id}
                    </span>
                  </div>
                  
                  {project.is_featured && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-gray-900 px-2 py-1 rounded-full text-xs font-bold">
                      ⭐ Featured
                    </div>
                  )}
                </div>

                {/* Project Info */}
                <div className="bg-white p-6">
                  <div className="mb-3">
                    <span className="text-xs font-bold px-3 py-1 bg-primary-100 text-primary-700 rounded-full">
                      {getCategoryLabel(project.category)}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary-600 transition">
                    {project.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  {project.technologies && project.technologies.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.slice(0, 3).map((tech, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            +{project.technologies.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <button className="w-full px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition font-medium text-sm">
                    Explore Project →
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No projects found in this category.</p>
            </div>
          )}
        </div>
      )}

      {/* View All Link */}
      {showViewAll && filteredProjects.length >= limit && (
        <div className="text-center mt-12">
          <Link
            to="/portfolio"
            className="inline-block px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
          >
            View All Projects →
          </Link>
        </div>
      )}
    </div>
  );
};

export default InteractiveProjects;
