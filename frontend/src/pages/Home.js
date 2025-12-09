import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { profileService, projectService, testimonialService, serviceService } from '../services';

const Home = () => {
  const [profile, setProfile] = useState(null);
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [featuredTestimonials, setFeaturedTestimonials] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, projectsRes, testimonialsRes, servicesRes] = await Promise.all([
          profileService.getPublicProfile(),
          projectService.getFeatured(),
          testimonialService.getFeatured(),
          serviceService.getAll(),
        ]);

        setProfile(profileRes.data);
        setFeaturedProjects(projectsRes.data.slice(0, 3));
        setFeaturedTestimonials(testimonialsRes.data.slice(0, 3));
        // Handle paginated response for services
        const servicesData = servicesRes.data.results || servicesRes.data;
        setServices(servicesData.slice(0, 4));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="text-2xl text-primary-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-left">
              <div className="inline-block bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <span className="text-sm font-semibold">Sovereign Infrastructure Architect</span>
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Hi, I'm <span className="text-yellow-300">Samuel </span>
              </h1>

              <p className="text-xl lg:text-2xl mb-4 text-primary-100">
                Founder & Technical Architect at AtonixCorp
              </p>

              <p className="text-lg mb-8 text-gray-200 max-w-2xl">
                Building scalable, sovereign infrastructure globally with cloud architecture, AI systems, DevOps pipelines, and high-performance computing. Specialized in emerging markets and digital independence solutions.
              </p>

              {/* Key Expertise */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center">
                  <div className="text-sm font-semibold">OpenStack</div>
                  <div className="text-xs text-gray-300">Cloud Architecture</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold">AI/ML</div>
                  <div className="text-xs text-gray-300">Neuron Data Centers</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold">DevOps</div>
                  <div className="text-xs text-gray-300">CI/CD Pipelines</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold">Global</div>
                  <div className="text-xs text-gray-300">Emerging Markets</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/portfolio"
                  className="group bg-white text-primary-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  <span className="flex items-center">
                    View My Work
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </Link>
                <Link
                  to="/contact"
                  className="group border-2 border-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-primary-600 transition-all duration-300 transform hover:scale-105"
                >
                  <span className="flex items-center">
                    Get In Touch
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </span>
                </Link>
              </div>

              {/* Social Links */}
              <div className="flex justify-center lg:justify-start gap-4 mt-8">
                {profile?.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                     className="w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                )}
                {profile?.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                     className="w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                    <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                )}
                {profile?.twitter_url && (
                  <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer"
                     className="w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                    <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                )}
                {profile?.gitlab_url && (
                  <a href={profile.gitlab_url} target="_blank" rel="noopener noreferrer"
                     className="w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                    <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.955 13.587l-1.342-4.135-2.664-8.189c-.135-.414-.496-.673-.93-.539L12 2.252 4.981.724c-.434-.134-.795.125-.93.539L1.387 9.452.045 13.587c-.134.414.125.795.539.93l10.966 4.003 10.966-4.003c.414-.135.673-.516.539-.93z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="relative z-10">
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.full_name}
                    className="w-80 h-80 rounded-full object-cover mx-auto shadow-2xl border-8 border-white border-opacity-20"
                  />
                ) : (
                  <div className="w-80 h-80 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mx-auto shadow-2xl border-8 border-white border-opacity-20 flex items-center justify-center">
                    <span className="text-8xl text-white font-bold">
                      {profile?.full_name?.charAt(0)?.toUpperCase() || 'J'}
                    </span>
                  </div>
                )}

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg shadow-lg animate-bounce">
                  <span className="font-bold">8+ Years</span>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-green-400 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
                  <span className="font-bold">Sovereign Infrastructure</span>
                </div>
              </div>

              {/* Background Shapes */}
              <div className="absolute top-10 right-10 w-20 h-20 bg-white bg-opacity-10 rounded-full animate-pulse"></div>
              <div className="absolute bottom-10 left-10 w-16 h-16 bg-yellow-300 bg-opacity-20 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </section>

      {/* Core Expertise Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Core Infrastructure Expertise</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Specialized in building sovereign, scalable infrastructure for global markets, with deep expertise in emerging economies and digital independence solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* OpenStack Cloud Architecture */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold mb-4 text-primary-600">OpenStack Cloud Architecture</h3>
              <ul className="text-gray-700 space-y-2">
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>Full cloud orchestration</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>Bare-metal & virtualized clusters</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>OVN/OVS networking & CNI plugins</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>Multi-region replication & failover</span>
                </li>
              </ul>
            </div>

            {/* Neuron Data Center Engineering */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold mb-4 text-primary-600">Neuron Data Center Engineering</h3>
              <ul className="text-gray-700 space-y-2">
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>AI/ML workload optimization</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>GPU & Neuron accelerators</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>Containerized microservices</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>Edge-to-cloud data pipelines</span>
                </li>
              </ul>
            </div>

            {/* DevOps & CI/CD */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold mb-4 text-primary-600">DevOps & CI/CD Pipelines</h3>
              <ul className="text-gray-700 space-y-2">
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>Git, GitHub, Gerrit workflows</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>Jenkins, GitLab CI, GitHub Actions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>Docker & nerdctl containerization</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>Zero-downtime deployments</span>
                </li>
              </ul>
            </div>

            {/* AI & Systems Programming */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold mb-4 text-primary-600">AI & Systems Programming</h3>
              <ul className="text-gray-700 space-y-2">
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>C/C++ low-level systems</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>Python, TensorFlow, PyTorch</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>GPU/Neuron model deployment</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>AI-powered API design</span>
                </li>
              </ul>
            </div>

            {/* Communication Infrastructure */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold mb-4 text-primary-600">Communication Infrastructure</h3>
              <ul className="text-gray-700 space-y-2">
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>Custom SMTP servers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>DKIM, SPF, DMARC authentication</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>AI-driven marketing automation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>Multi-channel delivery systems</span>
                </li>
              </ul>
            </div>

            {/* Vision & Mission */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold mb-4 text-primary-600">Vision & Mission</h3>
              <ul className="text-gray-700 space-y-2">
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>Global sovereign infrastructure solutions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>Emerging markets expertise & innovation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>Digital independence & autonomy</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>Finance, science & community empowerment</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Quote CTA Section */}
      <section className="py-12 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Build Sovereign Infrastructure?</h2>
            <p className="text-xl text-primary-100 mb-8">
              Get a detailed consultation for your cloud architecture, AI systems, or DevOps pipeline needs
            </p>
            <Link
              to="/contact"
              onClick={() => {
                // This will be handled by the contact page
                sessionStorage.setItem('selectedInquiryType', 'consultation');
              }}
              className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Get Free Consultation
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">8+</div>
              <div className="text-gray-600">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">50+</div>
              <div className="text-gray-600">Projects Completed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">100%</div>
              <div className="text-gray-600">Client Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What I Do</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive technology solutions tailored to your business needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <div key={service.id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <Link
                  to="/services"
                  className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                >
                  Learn More →
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/services"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Projects</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore some of my recent work and creative solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProjects.map((project, index) => (
              <Link
                key={project.id}
                to={`/portfolio/${project.id}`}
                className="group bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative overflow-hidden h-48">
                  {project.thumbnail ? (
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                      <span className="text-4xl text-white font-bold">
                        {project.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-50 group-hover:scale-100">
                      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
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
                  </div>
                  <div className="text-primary-600 font-semibold group-hover:text-primary-700 transition-colors">
                    View Project →
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/portfolio"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-all duration-300 transform hover:scale-105"
            >
              View All Projects
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {featuredTestimonials.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">What Clients Say</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Don't just take my word for it - hear from my satisfied clients
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {featuredTestimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    <div className="text-yellow-500 text-lg mr-2">
                      {'★'.repeat(testimonial.rating)}
                      {'☆'.repeat(5 - testimonial.rating)}
                    </div>
                    <span className="text-sm text-gray-600">({testimonial.rating}/5)</span>
                  </div>

                  {/* Quote Icon */}
                  <div className="text-4xl text-primary-200 mb-4">"</div>

                  {/* Content */}
                  <p className="text-gray-700 italic mb-6 leading-relaxed text-lg">"{testimonial.content}"</p>

                  {/* Client Info */}
                  <div className="flex items-center border-t pt-4">
                    {testimonial.client_avatar ? (
                      <img
                        src={testimonial.client_avatar}
                        alt={testimonial.client_name}
                        className="w-12 h-12 rounded-full mr-4 object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full mr-4 bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-bold">
                          {testimonial.client_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-gray-900">{testimonial.client_name}</h4>
                      {testimonial.client_title && (
                        <p className="text-gray-600 text-sm">{testimonial.client_title}</p>
                      )}
                      {testimonial.client_company && (
                        <p className="text-primary-600 text-sm font-medium">{testimonial.client_company}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                to="/testimonials"
                className="inline-block border-2 border-primary-600 text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-600 hover:text-white transition-all duration-300"
              >
                Read All Testimonials
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Skills Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Skills & Expertise</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Technologies and tools I use to bring your ideas to life
            </p>
          </div>

          {profile?.skills && profile.skills.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              {profile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-full font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Project?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Let's collaborate to transform your vision into a digital reality that drives results and exceeds expectations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              to="/contact"
              className="inline-block bg-white text-primary-600 px-10 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Get Free Consultation
            </Link>
            <Link
              to="/portfolio"
              className="inline-block border-2 border-white px-10 py-4 rounded-lg font-bold hover:bg-white hover:text-primary-600 transition-all duration-300 transform hover:scale-105"
            >
              View My Work
            </Link>
          </div>

          <div className="text-primary-200">
            <p className="mb-2">{profile?.email || 'john@example.com'}</p>
            <p>Available for new projects</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
