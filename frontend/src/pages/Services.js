import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { serviceService } from '../services';

// Helper function to map service titles to project types
const getProjectTypeFromService = (serviceTitle) => {
  const serviceMap = {
    'Cloud Infrastructure Architecture': 'cloud-infrastructure',
    'AI & Machine Learning Systems': 'ai-ml',
    'DevOps & CI/CD Engineering': 'devops',
    'Web Development': 'web-development',
    'Mobile App Development': 'mobile-app',
    'Technical Consulting': 'consulting',
  };

  return serviceMap[serviceTitle] || 'other';
};

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await serviceService.getAll();
        // Handle paginated response from Django REST Framework
        const servicesData = response.data.results || response.data;
        setServices(servicesData);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Services</h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-6">
            Comprehensive solutions tailored to your needs. We deliver cutting-edge technology services designed to help businesses and individuals thrive in the digital era. Whether you're building mobile apps, securing your systems, or exploring AI innovation, we've got you covered.
          </p>
          <div className="bg-primary-50 rounded-lg p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-primary-800 mb-2">Why Choose Us?</h2>
            <p className="text-gray-700">
              We combine innovation, security, and user-centric design to deliver solutions that not only meet your needs but also exceed expectations.
            </p>
          </div>
        </div>

        {/* Quote CTA Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg p-8 mb-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-6 text-primary-100">
            Click "Request Quote" on any service below to get a detailed, customized proposal for your project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="text-primary-100">
              Free detailed quotes
            </div>
            <div className="text-primary-100">
              24-hour response time
            </div>
            <div className="text-primary-100">
              No obligation consultation
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow relative">
              {/* Quote Badge */}
              <div className="absolute top-4 right-4 bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs font-semibold">
                Quote Available
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold mb-4">{service.title}</h3>

              {/* Description */}
              <p className="text-gray-600 mb-6">{service.description}</p>

              {/* Features */}
              {service.features && service.features.length > 0 && (
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="text-gray-700">
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              {/* Pricing */}
              {service.pricing && (
                <div className="border-t pt-4">
                  <p className="text-primary-600 font-bold text-lg">{service.pricing}</p>
                </div>
              )}

              {/* Request Quote Button */}
              <div className="mt-6">
                <Link
                  to="/contact"
                  onClick={() => {
                    sessionStorage.setItem('selectedInquiryType', 'quote');
                    sessionStorage.setItem('selectedService', service.title);
                    sessionStorage.setItem('selectedProjectType', getProjectTypeFromService(service.title));
                  }}
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-center block"
                >
                  Request Quote for {service.title}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center text-gray-600">
            <p>No services available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
