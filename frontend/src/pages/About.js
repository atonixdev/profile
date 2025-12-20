import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { profileService } from '../services';

const About = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await profileService.getPublicProfile();
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-8 mb-12">
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-4 text-gray-900">About AtonixDev</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                A modern, high-precision software engineering and technology architecture company specializing in building intelligent, scalable, and future-proof digital systems. Founded by visionary technical architect Samuel Realm, AtonixDev operates at the intersection of advanced software development, AI-driven automation, and financial technology innovation.
              </p>
            </div>
          </div>

          {/* Profile Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="md:col-span-1">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.full_name}
                  className="w-full rounded-xl shadow-lg"
                />
              ) : (
                <div className="w-full aspect-square bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl shadow-lg flex items-center justify-center">
                  <span className="text-6xl text-white font-bold">
                    {profile?.full_name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
              <div className="mt-6 space-y-3">
                {profile?.location && (
                  <p className="text-gray-700"><strong>Location:</strong> {profile.location}</p>
                )}
                {profile?.email && (
                  <p className="text-gray-700">
                    <strong>Email:</strong> <a href={`mailto:${profile.email}`} className="text-primary-600 hover:underline">{profile.email}</a>
                  </p>
                )}
                {profile?.phone && (
                  <p className="text-gray-700">
                    <strong>Phone:</strong> <a href={`tel:${profile.phone}`} className="text-primary-600 hover:underline">{profile.phone}</a>
                  </p>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <h2 className="text-3xl font-bold mb-3">{profile?.full_name}</h2>
              <p className="text-2xl text-primary-600 font-semibold mb-6">{profile?.title}</p>
              <p className="text-gray-700 text-lg leading-relaxed mb-8">{profile?.bio}</p>
              
              {/* Key Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg border-l-4 border-primary-600 shadow-sm">
                  <div className="text-3xl font-bold text-primary-600">8+</div>
                  <div className="text-sm text-gray-600 mt-1">Years of Experience</div>
                </div>
                <div className="bg-white p-4 rounded-lg border-l-4 border-primary-600 shadow-sm">
                  <div className="text-3xl font-bold text-primary-600">50+</div>
                  <div className="text-sm text-gray-600 mt-1">Projects Delivered</div>
                </div>
                <div className="bg-white p-4 rounded-lg border-l-4 border-primary-600 shadow-sm">
                  <div className="text-3xl font-bold text-primary-600">Global</div>
                  <div className="text-sm text-gray-600 mt-1">Emerging Markets Focus</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/services"
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  View our Services
                </Link>
                <Link
                  to="/portfolio"
                  className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Explore our Work
                </Link>
              </div>
            </div>
          </div>

          {/* Detailed About Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-gray-900">Our Journey</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                From vision to impact, building the future of technology in Africa and beyond
              </p>
            </div>

            <div className="space-y-8">
              {/* From Vision to Impact */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-8 border-l-4 border-blue-600 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-blue-900 mb-3">From Vision to Impact</h3>
                    <p className="text-gray-800 leading-relaxed">
                      AtonixDev was founded with a clear mission: to bridge the gap between advanced technology innovation and practical business solutions. Starting as a solo venture, I've grown the organization into a trusted partner for enterprises seeking cutting-edge infrastructure, AI-powered solutions, and transformative digital strategies.
                    </p>
                  </div>
                </div>
              </div>

              {/* Core Philosophy */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-primary-600"></div>
                  <h3 className="text-2xl font-bold text-gray-900">Core Philosophy</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      title: 'Sovereign Technology',
                      desc: 'Building infrastructure that gives organizations true control over their data and systems',
                      color: 'from-purple-500 to-purple-600'
                    },
                    {
                      title: 'Intelligent Automation',
                      desc: 'Leveraging AI and machine learning to solve complex challenges efficiently',
                      color: 'from-pink-500 to-pink-600'
                    },
                    {
                      title: 'Scalable Architecture',
                      desc: 'Designing systems that grow with your business without compromising performance',
                      color: 'from-orange-500 to-orange-600'
                    },
                    {
                      title: 'Developer Excellence',
                      desc: 'Creating platforms and tools that empower developers to do their best work',
                      color: 'from-green-500 to-green-600'
                    }
                  ].map((item, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all p-6 border-t-4 border-gray-200">
                      <div className={`inline-block w-12 h-12 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center mb-4`}>
                        <span className="text-white font-bold text-lg">{index + 1}</span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specializations */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-primary-600"></div>
                  <h3 className="text-2xl font-bold text-gray-900">Specializations</h3>
                </div>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    {[
                      {
                        title: 'Cloud Infrastructure & Architecture',
                        items: ['OpenStack', 'AWS', 'Kubernetes', 'Ceph', 'OVN', 'High-availability systems', 'Load Balancing', 'Service Mesh (Istio)', 'Network Architecture', 'Disaster Recovery'],
                        icon: (
                          <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
                          </svg>
                        )
                      },
                      {
                        title: 'AI & Machine Learning',
                        items: ['Model development', 'TensorFlow', 'PyTorch', 'LLM Integration', 'Deployment pipelines', 'Research platforms', 'Data preprocessing', 'Model training & optimization', 'GPU acceleration', 'MLOps & Model Serving'],
                        icon: (
                          <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                          </svg>
                        )
                      },
                      {
                        title: 'DevOps & CI/CD',
                        items: ['Jenkins', 'GitLab CI', 'Docker', 'Rootless containers', 'BuildKit', 'Kubernetes', 'Terraform', 'Ansible', 'Kafka', 'Zero-downtime deployments', 'Infrastructure as Code', 'Monitoring & Logging'],
                        icon: (
                          <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
                          </svg>
                        )
                      },
                      {
                        title: 'Full-Stack Development',
                        items: ['React', 'Next.js', 'JavaScript/TypeScript', 'Django', 'FastAPI', 'Python', 'REST APIs', 'GraphQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Enterprise applications'],
                        icon: (
                          <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
                          </svg>
                        )
                      },
                      {
                        title: 'IoT & Embedded Systems',
                        items: ['Raspberry Pi', 'Arduino', 'ROS (Robotics Operating System)', 'MQTT', 'Edge Computing', 'Microcontroller programming', 'IoT protocols', 'Embedded Linux', 'Sensor integration', 'Real-time systems'],
                        icon: (
                          <svg className="w-8 h-8 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9l-7-7z M6 4h5v5h5v12H6V4z M8 10h2v2H8v-2zm4 0h2v2h-2v-2zm-4 4h2v2H8v-2zm4 0h2v2h-2v-2zm-4 4h8v2H8v-2z"/>
                          </svg>
                        )
                      }
                    ].map((spec, index) => (
                      <div key={index} className={`p-6 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b ${index < 2 ? 'md:border-r border-gray-200' : 'border-gray-200'}`}>
                        <div className="mb-3">{spec.icon}</div>
                        <h4 className="text-lg font-bold text-gray-900 mb-3">{spec.title}</h4>
                        <ul className="space-y-2">
                          {spec.items.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-gray-700">
                              <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Impact & Achievements */}
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-8 border-l-4 border-primary-600">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-primary-900 mb-3">Impact & Achievements</h3>
                    <p className="text-gray-800 leading-relaxed mb-4">
                      Over the years, I've successfully delivered <strong>50+ projects</strong> across multiple sectors, from startups to enterprises. My work spans cloud migration initiatives, AI research platforms, DevOps transformations, and financial technology solutions.
                    </p>
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary-600">50+</div>
                        <div className="text-sm text-gray-700">Projects</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary-600">8+</div>
                        <div className="text-sm text-gray-700">Years</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary-600">Global</div>
                        <div className="text-sm text-gray-700">Reach</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Looking Forward */}
              <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg p-8 border-l-4 border-indigo-600">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-indigo-900 mb-3">Looking Forward</h3>
                    <p className="text-gray-800 leading-relaxed">
                      As technology continues to evolve, AtonixDev remains committed to staying at the forefront of innovation. We focus on emerging technologies, ethical AI implementation, and building systems that are not just powerful but also sustainable and responsible. Our vision is to empower organizations across Africa and globally to compete at the highest level using cutting-edge technology.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          {profile?.skills && profile.skills.length > 0 && (
            <div className="mb-16">
              <h3 className="text-3xl font-bold mb-8 text-center">Technical Expertise</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Core Infrastructure */}
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary-600">
                  <h4 className="font-bold text-lg mb-4 text-gray-900">Cloud & Infrastructure</h4>
                  <div className="flex flex-wrap gap-2">
                    {['OpenStack', 'Kubernetes', 'Docker', 'AWS', 'Cloud Architecture'].map((skill, index) => (
                      profile.skills.some(s => s.toLowerCase().includes(skill.toLowerCase())) && (
                        <span
                          key={index}
                          className="bg-primary-100 text-primary-700 px-3 py-1 rounded text-sm font-medium"
                        >
                          {skill}
                        </span>
                      )
                    ))}
                  </div>
                </div>

                {/* AI & Systems */}
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary-600">
                  <h4 className="font-bold text-lg mb-4 text-gray-900">AI & Systems</h4>
                  <div className="flex flex-wrap gap-2">
                    {['AI/ML', 'Python', 'C++', 'TensorFlow', 'Neural Networks'].map((skill, index) => (
                      profile.skills.some(s => s.toLowerCase().includes(skill.toLowerCase())) && (
                        <span
                          key={index}
                          className="bg-primary-100 text-primary-700 px-3 py-1 rounded text-sm font-medium"
                        >
                          {skill}
                        </span>
                      )
                    ))}
                  </div>
                </div>

                {/* DevOps */}
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary-600">
                  <h4 className="font-bold text-lg mb-4 text-gray-900">DevOps & Pipeline</h4>
                  <div className="flex flex-wrap gap-2">
                    {['CI/CD', 'Jenkins', 'GitLab', 'Automation', 'Infrastructure as Code'].map((skill, index) => (
                      profile.skills.some(s => s.toLowerCase().includes(skill.toLowerCase())) && (
                        <span
                          key={index}
                          className="bg-primary-100 text-primary-700 px-3 py-1 rounded text-sm font-medium"
                        >
                          {skill}
                        </span>
                      )
                    ))}
                  </div>
                </div>

                {/* Other Skills */}
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary-600">
                  <h4 className="font-bold text-lg mb-4 text-gray-900">Additional Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.slice(0, 5).map((skill, index) => (
                      <span
                        key={index}
                        className="bg-primary-100 text-primary-700 px-3 py-1 rounded text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Approach/Values Section */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold mb-8 text-center">Our Approach</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-lg shadow-md">
                <div className="text-3xl font-bold text-blue-600 mb-3">1</div>
                <h4 className="text-xl font-bold mb-3 text-gray-900">Results-Driven</h4>
                <p className="text-gray-700">Every project is focused on delivering measurable outcomes and business impact. I align technical solutions with your strategic goals.</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-lg shadow-md">
                <div className="text-3xl font-bold text-green-600 mb-3">2</div>
                <h4 className="text-xl font-bold mb-3 text-gray-900">Collaborative</h4>
                <p className="text-gray-700">I work closely with you throughout the process, ensuring your vision becomes reality. Transparency and communication are paramount.</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-lg shadow-md">
                <div className="text-3xl font-bold text-purple-600 mb-3">3</div>
                <h4 className="text-xl font-bold mb-3 text-gray-900">Innovative</h4>
                <p className="text-gray-700">I stay current with the latest technologies and methodologies to provide cutting-edge solutions that give you a competitive advantage.</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-lg shadow-md">
                <div className="text-3xl font-bold text-orange-600 mb-3">4</div>
                <h4 className="text-xl font-bold mb-3 text-gray-900">Problem-Solver</h4>
                <p className="text-gray-700">Complex challenges are my specialty. I break down difficult problems and find elegant, scalable solutions that stand the test of time.</p>
              </div>
            </div>
          </div>

          {/* Contact & Social Section */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg p-12">
            <h3 className="text-3xl font-bold mb-4 text-center">Let's Build the Future Together</h3>
            <p className="text-lg text-center text-primary-100 max-w-2xl mx-auto mb-8">
              Ready to bring your infrastructure vision to life? Let's discuss your project and explore how we can collaborate to create sovereign, scalable solutions.
            </p>
            
            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {profile?.email && (
                <div className="text-center">
                  <div className="text-sm text-primary-200 mb-2">EMAIL</div>
                  <a href={`mailto:${profile.email}`} className="text-white hover:text-primary-100 font-semibold break-all">
                    {profile.email}
                  </a>
                </div>
              )}
              {profile?.phone && (
                <div className="text-center">
                  <div className="text-sm text-primary-200 mb-2">PHONE</div>
                  <a href={`tel:${profile.phone}`} className="text-white hover:text-primary-100 font-semibold">
                    {profile.phone}
                  </a>
                </div>
              )}
              {profile?.location && (
                <div className="text-center">
                  <div className="text-sm text-primary-200 mb-2">LOCATION</div>
                  <p className="text-white font-semibold">{profile.location}</p>
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap justify-center gap-4 pt-6 border-t border-primary-500">
              {profile?.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-primary-600 px-6 py-2 rounded-lg font-semibold hover:bg-primary-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
              )}
              {profile?.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-primary-600 px-6 py-2 rounded-lg font-semibold hover:bg-primary-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
              )}
              {profile?.gitlab_url && (
                <a
                  href={profile.gitlab_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-primary-600 px-6 py-2 rounded-lg font-semibold hover:bg-primary-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.955 13.587l-1.342-4.135-2.664-8.189c-.135-.414-.496-.673-.93-.539L12 2.252 4.981.724c-.434-.134-.795.125-.93.539L1.387 9.452.045 13.587c-.134.414.125.795.539.93l10.966 4.003 10.966-4.003c.414-.135.673-.516.539-.93z"/>
                  </svg>
                  GitLab
                </a>
              )}
              {profile?.twitter_url && (
                <a
                  href={profile.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-primary-600 px-6 py-2 rounded-lg font-semibold hover:bg-primary-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417a9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Twitter
                </a>
              )}
              {profile?.website_url && (
                <a
                  href={profile.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-primary-600 px-6 py-2 rounded-lg font-semibold hover:bg-primary-100 transition-colors"
                >
                  Website
                </a>
              )}
            </div>

            {/* CTA Button */}
            <div className="text-center mt-8">
              <Link
                to="/contact"
                className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-bold hover:bg-primary-50 transition-colors"
              >
                Start a Conversation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
