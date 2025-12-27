import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { profileService, projectService, testimonialService, serviceService } from '../services';
import InteractiveProjects from '../components/InteractiveProjects';

const Home = () => {
  const [profile, setProfile] = useState(null);
  const [featuredTestimonials, setFeaturedTestimonials] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const normalizeList = (data) => {
    const list = data?.results ?? data;
    return Array.isArray(list) ? list : [];
  };

  const normalizeSkills = (skills) => {
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string') {
      return skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, , testimonialsRes, servicesRes] = await Promise.all([
          profileService.getPublicProfile(),
          projectService.getFeatured(),
          testimonialService.getFeatured(),
          serviceService.getAll(),
        ]);

        const safeProfile = profileRes?.data || null;
        // Ensure we never crash if the backend stored JSON as string or null.
        if (safeProfile && typeof safeProfile === 'object') {
          safeProfile.skills = normalizeSkills(safeProfile.skills);
        }
        setProfile(safeProfile);

        const testimonialsData = normalizeList(testimonialsRes?.data);
        setFeaturedTestimonials(testimonialsData.slice(0, 3));

        const servicesData = normalizeList(servicesRes?.data);
        setServices(servicesData.slice(0, 4));
      } catch (error) {
        console.error('Error fetching data:', error);
        setProfile(null);
        setFeaturedTestimonials([]);
        setServices([]);
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
                <span className="text-sm font-semibold">Modern Software Engineering Company</span>
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Welcome to <span className="text-yellow-300">AtonixDev</span>
              </h1>

              
              <p className="text-lg mb-8 text-gray-200 max-w-2xl">
                A modern, high-precision software engineering and technology architecture company specializing in building intelligent, scalable, and future-proof digital systems. We operate at the intersection of advanced software development, AI-driven automation, and financial technology innovation.
              </p>

              {/* Key Expertise */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center">
                  <div className="text-sm font-semibold">Software Engineering</div>
                  <div className="text-xs text-gray-300">Custom Development</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold">AI Automation</div>
                  <div className="text-xs text-gray-300">Intelligent Systems</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold">FinTech</div>
                  <div className="text-xs text-gray-300">Financial Platforms</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold">Technical Architecture</div>
                  <div className="text-xs text-gray-300">Systems Design</div>
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
                      AD
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

      {/* Production Pipeline Visualization Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How I Build & Deploy</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              End-to-end pipelines from development to production with robust monitoring and automation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Production Pipeline */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
              <div className="w-full bg-white border-b border-gray-200 flex items-center justify-center" style={{ minHeight: '280px' }}>
                <img 
                  src="/portfolio/production-pipeline.svg" 
                  alt="Production Pipeline"
                  className="w-full h-full object-contain p-4"
                  style={{ maxHeight: '280px' }}
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold mb-3 text-primary-600">Production Pipeline</h3>
                <p className="text-gray-600 mb-4 text-base leading-relaxed">
                  Automated CI/CD workflows that take code from development through testing, review, and production with comprehensive monitoring.
                </p>
                <ul className="text-sm text-gray-700 space-y-3 flex-grow">
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-3 font-bold text-lg">→</span>
                    <span className="font-medium">Continuous Integration & Deployment</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-3 font-bold text-lg">→</span>
                    <span className="font-medium">Automated Testing & Validation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-3 font-bold text-lg">→</span>
                    <span className="font-medium">Real-time Monitoring & Alerts</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Data Pipeline */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
              <div className="w-full bg-white border-b border-gray-200 flex items-center justify-center" style={{ minHeight: '280px' }}>
                <img 
                  src="/portfolio/data-pipeline.svg" 
                  alt="Data Pipeline"
                  className="w-full h-full object-contain p-4"
                  style={{ maxHeight: '280px' }}
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold mb-3 text-primary-600">Data Processing Pipeline</h3>
                <p className="text-gray-600 mb-4 text-base leading-relaxed">
                  Extract, Transform, Load pipelines that process data efficiently from multiple sources to analytics and storage systems.
                </p>
                <ul className="text-sm text-gray-700 space-y-3 flex-grow">
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-3 font-bold text-lg">→</span>
                    <span className="font-medium">ETL/ELT Processing</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-3 font-bold text-lg">→</span>
                    <span className="font-medium">Data Validation & Quality</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-3 font-bold text-lg">→</span>
                    <span className="font-medium">Scalable Data Warehousing</span>
                  </li>
                </ul>
              </div>
            </div>
            {/* Infrastructure Deployment */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
              <div className="w-full bg-white border-b border-gray-200 flex items-center justify-center" style={{ minHeight: '280px' }}>
                <svg viewBox="0 0 400 320" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" className="p-4" style={{ maxHeight: '280px' }}>
                  <rect width="400" height="320" fill="#f3f4f6"/>
                  <text x="200" y="30" textAnchor="middle" fontSize="24" fontWeight="700" fill="#111827">Infrastructure Deployment</text>
                  
                  <circle cx="60" cy="110" r="32" fill="#3b82f6"/>
                  <text x="60" y="115" textAnchor="middle" fontSize="15" fontWeight="700" fill="#ffffff">Plan</text>
                  
                  <line x1="92" y1="110" x2="108" y2="110" stroke="#d1d5db" strokeWidth="3"/>
                  <polygon points="108,110 118,105 118,115" fill="#d1d5db"/>
                  
                  <circle cx="160" cy="110" r="32" fill="#8b5cf6"/>
                  <text x="160" y="115" textAnchor="middle" fontSize="14" fontWeight="700" fill="#ffffff">Provision</text>
                  
                  <line x1="192" y1="110" x2="208" y2="110" stroke="#d1d5db" strokeWidth="3"/>
                  <polygon points="208,110 218,105 218,115" fill="#d1d5db"/>
                  
                  <circle cx="270" cy="110" r="32" fill="#f59e0b"/>
                  <text x="270" y="115" textAnchor="middle" fontSize="14" fontWeight="700" fill="#ffffff">Configure</text>
                  
                  <line x1="302" y1="110" x2="318" y2="110" stroke="#d1d5db" strokeWidth="3"/>
                  <polygon points="318,110 328,105 328,115" fill="#d1d5db"/>
                  
                  <circle cx="340" cy="110" r="32" fill="#10b981"/>
                  <text x="340" y="115" textAnchor="middle" fontSize="14" fontWeight="700" fill="#ffffff">Monitor</text>
                  
                  <text x="60" y="170" textAnchor="middle" fontSize="11" fontWeight="600" fill="#374151">Infrastructure</text>
                  <text x="60" y="185" textAnchor="middle" fontSize="10" fill="#6b7280">as Code</text>
                  
                  <text x="160" y="170" textAnchor="middle" fontSize="11" fontWeight="600" fill="#374151">Create</text>
                  <text x="160" y="185" textAnchor="middle" fontSize="10" fill="#6b7280">Resources</text>
                  
                  <text x="270" y="170" textAnchor="middle" fontSize="11" fontWeight="600" fill="#374151">Setup</text>
                  <text x="270" y="185" textAnchor="middle" fontSize="10" fill="#6b7280">Services</text>
                  
                  <text x="340" y="170" textAnchor="middle" fontSize="11" fontWeight="600" fill="#374151">Health</text>
                  <text x="340" y="185" textAnchor="middle" fontSize="10" fill="#6b7280">Monitoring</text>
                  
                  <line x1="20" y1="220" x2="380" y2="220" stroke="#e5e7eb" strokeWidth="1"/>
                  
                  <rect x="20" y="240" width="175" height="65" rx="6" fill="#ecfdf5" stroke="#10b981" strokeWidth="2"/>
                  <text x="32" y="262" fontSize="13" fontWeight="700" fill="#047857">Compute Layer</text>
                  <text x="32" y="280" fontSize="10" fill="#059669">Virtual Machines</text>
                  <text x="32" y="297" fontSize="10" fill="#059669">Load Balancers</text>
                  
                  <rect x="205" y="240" width="175" height="65" rx="6" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2"/>
                  <text x="217" y="262" fontSize="13" fontWeight="700" fill="#92400e">Storage & Network</text>
                  <text x="217" y="280" fontSize="10" fill="#b45309">Distributed Storage</text>
                  <text x="217" y="297" fontSize="10" fill="#b45309">Cloud Networking</text>
                </svg>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold mb-3 text-primary-600">Infrastructure Deployment</h3>
                <p className="text-gray-600 mb-4 text-base leading-relaxed">
                  Infrastructure as Code approach to plan, provision, configure, and monitor cloud resources with full automation.
                </p>
                <ul className="text-sm text-gray-700 space-y-3 flex-grow">
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-3 font-bold text-lg">→</span>
                    <span className="font-medium">Infrastructure as Code</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-3 font-bold text-lg">→</span>
                    <span className="font-medium">Cloud Resource Management</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-3 font-bold text-lg">→</span>
                    <span className="font-medium">Automated Health Monitoring</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Expertise Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M50 50c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm-2 0c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8zm-8-6c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text animate-fade-in-up">
              Core Expertise
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-200">
              Specialized in building sovereign, scalable infrastructure for global markets, with deep expertise in emerging economies and digital independence solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* OpenStack Cloud Architecture */}
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl card-hover border border-gray-100 animate-slide-in-up">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">OpenStack Cloud Architecture</h3>
              <ul className="text-gray-700 space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">Full cloud orchestration and management</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">Bare-metal & virtualized clusters</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">OVN/OVS networking & CNI plugins</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">Multi-region replication & failover</span>
                </li>
              </ul>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">OpenStack</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Kubernetes</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">OVN</span>
              </div>
            </div>

            {/* Neuron Data Center Engineering */}
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl card-hover border border-gray-100 animate-slide-in-up delay-200">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Neuron Data Center Engineering</h3>
              <ul className="text-gray-700 space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">AI/ML workload optimization</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">GPU & Neuron accelerators</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">Containerized microservices</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">Edge-to-cloud data pipelines</span>
                </li>
              </ul>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">AWS Neuron</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">GPU</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">TensorFlow</span>
              </div>
            </div>

            {/* DevOps & CI/CD */}
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl card-hover border border-gray-100 animate-slide-in-up delay-400">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">DevOps & CI/CD Pipelines</h3>
              <ul className="text-gray-700 space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">Git, GitHub, Gerrit workflows</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">Jenkins, GitLab CI, GitHub Actions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">Docker & nerdctl containerization</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">Zero-downtime deployments</span>
                </li>
              </ul>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Jenkins</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Docker</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">GitOps</span>
              </div>
            </div>

            {/* AI & Systems Programming */}
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl card-hover border border-gray-100 animate-slide-in-up delay-600">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">AI & Systems Programming</h3>
              <ul className="text-gray-700 space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">C/C++ low-level systems</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">Python, TensorFlow, PyTorch</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">GPU/Neuron model deployment</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">Performance optimization</span>
                </li>
              </ul>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">C/C++</span>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">Python</span>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">CUDA</span>
              </div>
            </div>

            {/* Sovereign Infrastructure */}
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl card-hover border border-gray-100 animate-slide-in-up delay-800">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Sovereign Infrastructure</h3>
              <ul className="text-gray-700 space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-cyan-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">Digital independence solutions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">Regulatory compliance frameworks</span>
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">Data sovereignty & privacy</span>
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">Emerging markets specialization</span>
                </li>
              </ul>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium">GDPR</span>
                <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium">CCPA</span>
                <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium">Sovereignty</span>
              </div>
            </div>

            {/* Enterprise Solutions */}
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl card-hover border border-gray-100 animate-slide-in-up delay-1000">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Enterprise Solutions</h3>
              <ul className="text-gray-700 space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">Large-scale system architecture</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">Migration & modernization</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">Performance optimization</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">24/7 production support</span>
                </li>
              </ul>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">Enterprise</span>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">Migration</span>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">Support</span>
              </div>
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
      <section className="py-20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group animate-fade-in-up">
              <div className="text-5xl md:text-6xl font-bold text-white mb-3 group-hover:scale-110 transition-transform duration-300">
                8+
              </div>
              <div className="text-slate-300 text-lg font-medium">Years Experience</div>
              <div className="w-16 h-1 bg-gradient-to-r from-primary-400 to-primary-600 mx-auto mt-3 rounded-full"></div>
            </div>
            <div className="text-center group animate-fade-in-up delay-200">
              <div className="text-5xl md:text-6xl font-bold text-white mb-3 group-hover:scale-110 transition-transform duration-300">
                50+
              </div>
              <div className="text-slate-300 text-lg font-medium">Projects Completed</div>
              <div className="w-16 h-1 bg-gradient-to-r from-primary-400 to-primary-600 mx-auto mt-3 rounded-full"></div>
            </div>
            <div className="text-center group animate-fade-in-up delay-400">
              <div className="text-5xl md:text-6xl font-bold text-white mb-3 group-hover:scale-110 transition-transform duration-300">
                100%
              </div>
              <div className="text-slate-300 text-lg font-medium">Client Satisfaction</div>
              <div className="w-16 h-1 bg-gradient-to-r from-primary-400 to-primary-600 mx-auto mt-3 rounded-full"></div>
            </div>
            <div className="text-center group animate-fade-in-up delay-600">
              <div className="text-5xl md:text-6xl font-bold text-white mb-3 group-hover:scale-110 transition-transform duration-300">
                24/7
              </div>
              <div className="text-slate-300 text-lg font-medium">Support Available</div>
              <div className="w-16 h-1 bg-gradient-to-r from-primary-400 to-primary-600 mx-auto mt-3 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-white relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='50' cy='50' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text animate-fade-in-up">
              What I Do
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
              Comprehensive technology solutions tailored to your business needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {services.map((service, index) => (
              <div
                key={service.id}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl card-hover border border-gray-100 animate-slide-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl text-white font-bold">
                    {service.title.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-primary-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3">
                  {service.description}
                </p>
                <Link
                  to="/services"
                  className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 transition-colors group-hover:translate-x-1 transform duration-300"
                >
                  <span>Learn More</span>
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 animate-fade-in-up delay-800">
            <Link
              to="/services"
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-primary-500/25"
            >
              <span>View All Services</span>
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Projects - Interactive Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Projects</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore some of my recent work and creative solutions
            </p>
          </div>

          <InteractiveProjects limit={6} showViewAll={true} />
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
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up leading-tight">
              Ready to Start Your
              <span className="block gradient-text">Digital Transformation?</span>
            </h2>
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-slate-300 leading-relaxed animate-fade-in-up delay-200">
              Let's collaborate to transform your vision into a digital reality that drives results and exceeds expectations.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12 animate-fade-in-up delay-400">
              <Link
                to="/contact"
                onClick={() => {
                  sessionStorage.setItem('selectedInquiryType', 'consultation');
                }}
                className="group inline-flex items-center px-10 py-5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-primary-500/25 text-lg"
              >
                <span>Get Free Consultation</span>
                <svg className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                to="/portfolio"
                className="group inline-flex items-center px-10 py-5 border-2 border-white/30 text-white font-bold rounded-2xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm text-lg"
              >
                <span>View My Work</span>
                <svg className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-slate-400 animate-fade-in-up delay-600">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Free Initial Consultation</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">24/7 Support</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">100% Satisfaction Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
