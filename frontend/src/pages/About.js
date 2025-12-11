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
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-8 mb-12">
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-4 text-gray-900">About Atonixdev</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Architect of sovereign infrastructure solutions enabling digital independence and innovation globally, with deep expertise in emerging markets
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
                  View My Services
                </Link>
                <Link
                  to="/portfolio"
                  className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Explore My Work
                </Link>
              </div>
            </div>
          </div>

          {/* Detailed About Section */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold mb-8 text-center">My Journey</h3>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              {profile?.about ? (
                <div className="space-y-6">
                  {profile.about.split('\n\n').map((section, index) => {
                    // Check if this is a header section
                    if (section.startsWith('## ')) {
                      return (
                        <div key={index} className="mt-8 pt-8 border-t border-gray-200">
                          <h4 className="text-2xl font-bold text-primary-600 mb-4">
                            {section.replace('## ', '')}
                          </h4>
                        </div>
                      );
                    }
                    
                    // Check if this contains bullet points
                    if (section.includes('• ')) {
                      const lines = section.split('\n');
                      return (
                        <div key={index} className="mb-6">
                          {lines.map((line, lineIndex) => {
                            if (line.trim().startsWith('• ')) {
                              return (
                                <div key={lineIndex} className="flex items-start mb-3 pl-4">
                                  <span className="text-primary-600 font-bold mr-3 mt-1">▸</span>
                                  <span className="flex-1 text-gray-700">{line.replace('• ', '')}</span>
                                </div>
                              );
                            }
                            return line ? <p key={lineIndex} className="mb-2 text-gray-700">{line}</p> : null;
                          })}
                        </div>
                      );
                    }
                    
                    // Regular paragraph
                    return section ? (
                      <p key={index} className="mb-4 text-gray-700 leading-relaxed text-base">
                        {section}
                      </p>
                    ) : null;
                  })}
                </div>
              ) : (
                <p className="text-gray-600">Loading detailed information...</p>
              )}
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
            <h3 className="text-3xl font-bold mb-8 text-center">My Approach</h3>
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
