import React from 'react';
import { Link } from 'react-router-dom';

const Services = () => {
  const services = [
    {
      id: 1,
      title: 'Software Engineering & Product Development',
      description: 'AtonixDev builds custom applications, platforms, and digital tools tailored to the unique needs of each client. From backend systems and APIs to full user-facing applications, the company delivers clean, maintainable, and scalable codebases that support long-term growth.',
      features: [
        'Custom application development',
        'Full-stack engineering',
        'Backend systems and APIs',
        'User-facing application design',
        'Clean, maintainable codebases',
        'Scalable architecture solutions'
      ],
      pricing: 'Custom Quote'
    },
    {
      id: 2,
      title: 'AI-Driven Automation & Intelligence',
      description: 'The company integrates artificial intelligence into business workflows, enabling smarter decision-making, automated processes, and intelligent data analysis. AtonixDev focuses on practical, high-impact AI implementations that enhance efficiency and reduce human error.',
      features: [
        'AI-powered workflow automation',
        'Intelligent data analysis',
        'Smart decision-making systems',
        'Automated business processes',
        'Machine learning integration',
        'Efficiency optimization'
      ],
      pricing: 'Custom Quote'
    },
    {
      id: 3,
      title: 'Technical Architecture & Systems Design',
      description: 'AtonixDev provides expert architectural planning for complex systems, ensuring that every component — from databases to user interfaces — is harmonized, secure, and optimized for performance. This includes multi-country logic, financial engines, and enterprise-grade infrastructure.',
      features: [
        'Complex systems architecture',
        'Database design and optimization',
        'User interface harmonization',
        'Multi-country logic implementation',
        'Financial engine design',
        'Enterprise-grade infrastructure'
      ],
      pricing: 'Custom Quote'
    },
    {
      id: 4,
      title: 'FinTech Engineering & Financial Logic Harmonization',
      description: 'With deep expertise in financial systems, AtonixDev builds platforms that handle tax calculations, multi-currency logic, compliance workflows, and financial reporting with precision. The company\'s approach ensures accuracy, transparency, and regulatory alignment.',
      features: [
        'Tax calculation systems',
        'Multi-currency logic',
        'Compliance workflow automation',
        'Financial reporting platforms',
        'Regulatory alignment',
        'Transparent financial insights'
      ],
      pricing: 'Custom Quote'
    },
    {
      id: 5,
      title: 'Strategic Consulting & Developer-Ready Specifications',
      description: 'AtonixDev helps businesses clarify their product vision, define technical requirements, and create detailed documentation that developers can execute without confusion. This reduces development time, prevents costly errors, and ensures alignment across teams.',
      features: [
        'Product vision clarification',
        'Technical requirement definition',
        'Detailed documentation creation',
        'Developer-ready specifications',
        'Cross-team alignment',
        'Error prevention strategies'
      ],
      pricing: 'Custom Quote'
    }
  ];

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">AtonixDev Services</h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-6">
            AtonixDev specializes in custom software development, full-stack engineering, AI-driven automation, and technical architecture for complex platforms. The company is known for its ability to translate high-level business goals into clean, modular, and developer-ready specifications that eliminate ambiguity and reduce operational risk.
          </p>
          <div className="bg-primary-50 rounded-lg p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-primary-800 mb-2">Our Mission</h2>
            <p className="text-gray-700">
              Building intelligent, scalable, and future-proof digital systems. At its core, AtonixDev is built on the belief that technology should not merely solve problems — it should create new possibilities.
            </p>
          </div>
        </div>

        {/* Quote CTA Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg p-8 mb-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Build Intelligent Digital Systems?</h2>
          <p className="text-xl mb-6 text-primary-100">
            Get a detailed consultation for your software development, AI automation, or technical architecture needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="text-primary-100">Custom software solutions</div>
            <div className="text-primary-100">AI-driven automation</div>
            <div className="text-primary-100">Future-proof architecture</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow relative">
              {/* Title */}
              <h3 className="text-2xl font-bold mb-4">{service.title}</h3>

              {/* Description */}
              <p className="text-gray-600 mb-6">{service.description}</p>

              {/* Features */}
              {service.features && service.features.length > 0 && (
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="text-gray-700 flex items-start">
                      <span className="text-primary-500 mr-2 mt-1">•</span>
                      <span>{feature}</span>
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
                  }}
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-center block"
                >
                  Request Quote
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
