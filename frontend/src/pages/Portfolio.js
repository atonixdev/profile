import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Portfolio = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const projects = [
    {
      id: 1,
      title: 'OpenStack Private Cloud ',
      description: 'Designed and deployed a comprehensive OpenStack cloud infrastructure supporting AI research workloads.',
      category: 'cloud',
      technologies: ['OpenStack', 'OVN', 'Kubernetes', 'Ceph'],
      client: 'atonixdev',
      completion_date: '2024-06-15',
      is_featured: true,
      image: '/portfolio/cloud-infrastructure.svg'
    },
    {
      id: 2,
      title: 'Neuron Data Center - AI Research Hub',
      description: 'Built a high-performance computing environment optimized for AI/ML workloads with GPU acceleration.',
      category: 'ai',
      technologies: ['AWS Neuron', 'GPU', 'Docker', 'TensorFlow'],
      client: 'atonixdev',
      completion_date: '2024-08-20',
      is_featured: true,
      image: '/portfolio/ai-ml-hub.svg'
    },
    {
      id: 3,
      title: 'DevOps Pipeline Automation - FinTech SA',
      description: 'Implemented comprehensive CI/CD pipelines with automated testing and zero-downtime deployments.',
      category: 'devops',
      technologies: ['Jenkins', 'GitLab CI', 'Docker', 'Kubernetes'],
      client: 'atonixdev',
      completion_date: '2024-05-10',
      is_featured: false,
      image: '/portfolio/devops-pipeline.svg'
    },
    {
      id: 4,
      title: 'Enterprise Email Infrastructure',
      description: 'Developed secure, scalable communication systems with custom SMTP servers and encryption.',
      category: 'infrastructure',
      technologies: ['Postfix', 'DKIM', 'SPF', 'Redis'],
      client: 'atonixdev',
      completion_date: '2024-07-25',
      is_featured: false,
      image: '/portfolio/email-infrastructure.svg'
    },
    {
      id: 5,
      title: 'AI Marketing Automation Platform',
      description: 'Created automated marketing workflows with segmentation engines and behavioral triggers.',
      category: 'ai',
      technologies: ['Python', 'TensorFlow', 'React', 'PostgreSQL'],
      client: 'atonixdev',
      completion_date: '2024-09-05',
      is_featured: true,
      image: '/portfolio/ai-ml-hub.svg'
    },
    {
      id: 6,
      title: 'Scientific Computing Platform',
      description: 'Architected high-performance computing systems for scientific research with optimizations.',
      category: 'systems',
      technologies: ['C++', 'Python', 'CUDA', 'Hadoop'],
      client: 'atonixdev',
      completion_date: '2024-04-30',
      is_featured: false,
      image: '/portfolio/scientific-computing.svg'
    }
  ];

  const categories = ['all', 'cloud', 'ai', 'devops', 'infrastructure', 'systems'];

  const filteredProjects = projects.filter(project => {
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
    const matchesSearch = searchTerm === '' ||
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryDisplayName = (category) => {
    const names = {
      'cloud': 'Cloud',
      'ai': 'AI & ML',
      'devops': 'DevOps',
      'infrastructure': 'Infrastructure',
      'systems': 'Systems'
    };
    return names[category] || category;
  };

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Portfolio</h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Showcase of sovereign infrastructure projects powering African innovation.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category === 'all' ? 'All' : getCategoryDisplayName(category)}
            </button>
          ))}
        </div>

        <div className="max-w-md mx-auto mb-8">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div key={project.id} className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow ${project.is_featured ? 'ring-2 ring-primary-500' : ''}`}>
              {project.is_featured && (
                <div className="bg-primary-500 text-white text-xs font-bold px-3 py-1 text-center">
                  FEATURED
                </div>
              )}

              <div className="h-48 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                <p className="text-gray-600 mb-4">{project.description}</p>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.slice(0, 3).map((tech, idx) => (
                      <span key={idx} className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs font-medium">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-sm text-gray-500 mb-4">
                  <div>{project.client}</div>
                  <div>{new Date(project.completion_date).toLocaleDateString()}</div>
                </div>

                <Link
                  to={`/portfolio/${project.id}`}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-center block"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center text-gray-600">
            <p>No projects match your filters.</p>
          </div>
        )}

        <div className="mt-16 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready for Your Infrastructure Project?</h2>
          <p className="text-xl mb-6 text-primary-100">
            Let's build sovereign, scalable solutions together.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all"
          >
            Discuss Your Project
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
