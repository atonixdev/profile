import React, { useState, useEffect } from 'react';
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">About Realm</h1>

          {/* Profile Image and Bio */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-1">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.full_name}
                  className="w-full rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full aspect-square bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg shadow-lg flex items-center justify-center">
                  <span className="text-6xl text-white font-bold">
                    {profile?.full_name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold mb-4">{profile?.full_name}</h2>
              <p className="text-xl text-primary-600 mb-6">{profile?.title}</p>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">{profile?.bio}</p>
              
              {/* Key Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-primary-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">8+</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
                <div className="text-center p-4 bg-primary-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">50+</div>
                  <div className="text-sm text-gray-600">Projects Completed</div>
                </div>
                <div className="text-center p-4 bg-primary-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">100%</div>
                  <div className="text-sm text-gray-600">Client Satisfaction</div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed About Section */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6">About Realm</h3>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              {profile?.about ? (
                <div className="space-y-6">
                  {profile.about.split('\n\n').map((section, index) => {
                    // Check if this is a header section
                    if (section.startsWith('## ')) {
                      return (
                        <div key={index} className="mt-8">
                          <h4 className="text-xl font-bold text-primary-600 mb-4 border-b border-primary-200 pb-2">
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
                                <div key={lineIndex} className="flex items-start mb-2">
                                  <span className="text-primary-500 mr-2 mt-1">•</span>
                                  <span className="flex-1">{line.replace('• ', '')}</span>
                                </div>
                              );
                            }
                            return line ? <p key={lineIndex} className="mb-2">{line}</p> : null;
                          })}
                        </div>
                      );
                    }
                    
                    // Regular paragraph
                    return section ? (
                      <p key={index} className="mb-4 text-gray-700 leading-relaxed">
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
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-3">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-primary-100 text-primary-700 px-4 py-2 rounded-lg font-semibold hover:bg-primary-200 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Approach/Values Section */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6">My Approach</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-4">🎯</div>
                <h4 className="text-lg font-bold mb-2">Results-Driven</h4>
                <p className="text-gray-600">Every project is focused on delivering measurable outcomes that drive your business forward.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h4 className="text-lg font-bold mb-2">Collaborative</h4>
                <p className="text-gray-600">I work closely with you throughout the process, ensuring your vision becomes reality.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h4 className="text-lg font-bold mb-2">Innovative</h4>
                <p className="text-gray-600">I stay current with the latest technologies to provide cutting-edge solutions.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h4 className="text-lg font-bold mb-2">Problem-Solver</h4>
                <p className="text-gray-600">Complex challenges are my specialty - I love finding elegant solutions to difficult problems.</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-6">Let's Work Together</h3>
            <p className="text-gray-700 mb-6">
              Ready to bring your ideas to life? I'd love to discuss your project and explore how we can collaborate.
            </p>
            <div className="space-y-3 mb-6">
              {profile?.email && (
                <p className="flex items-center">
                  <span className="font-semibold mr-2">Email:</span>
                  <a href={`mailto:${profile.email}`} className="text-primary-600 hover:underline">
                    {profile.email}
                  </a>
                </p>
              )}
              {profile?.phone && (
                <p className="flex items-center">
                  <span className="font-semibold mr-2">Phone:</span>
                  <a href={`tel:${profile.phone}`} className="text-primary-600 hover:underline">
                    {profile.phone}
                  </a>
                </p>
              )}
              {profile?.location && (
                <p className="flex items-center">
                  <span className="font-semibold mr-2">📍 Location:</span>
                  {profile.location}
                </p>
              )}
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap gap-4">
              {profile?.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mr-4"
                >
                  LinkedIn
                </a>
              )}
              {profile?.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
                >
                  GitHub
                </a>
              )}
              {profile?.twitter_url && (
                <a
                  href={profile.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <span className="mr-2">🐦</span> Twitter
                </a>
              )}
              {profile?.website_url && (
                <a
                  href={profile.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <span className="mr-2">🌐</span> Website
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
