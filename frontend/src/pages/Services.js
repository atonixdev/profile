import React from 'react';
import { Link } from 'react-router-dom';

const Services = () => {
  const services = [
    {
      id: 1,
      title: 'OpenStack Cloud Architecture',
      description: 'Design and deploy distributed cloud environments using OpenStack for full cloud orchestration, bare-metal and virtualized compute clusters, OVN/OVS networking, and multi-region replication.',
      features: [
        'Full cloud orchestration with OpenStack',
        'Bare-metal and virtualized compute clusters',
        'OVN/OVS networking and custom CNI plugins',
        'Multi-region replication and failover',
        'Secure tenant isolation and role-based access'
      ],
      pricing: 'Custom Quote'
    },
    {
      id: 2,
      title: 'Neuron Data Center Engineering',
      description: 'Architect high-performance compute environments optimized for AI/ML workloads, GPU and Neuron accelerators, containerized microservices, and edge-to-cloud data pipelines.',
      features: [
        'AI/ML workload optimization',
        'GPU and Neuron accelerator integration',
        'Containerized microservices architecture',
        'Scientific and financial computation',
        'Edge-to-cloud data pipelines'
      ],
      pricing: 'Custom Quote'
    },
    {
      id: 3,
      title: 'DevOps & CI/CD Pipelines',
      description: 'Build end-to-end DevOps pipelines using Git, Jenkins, GitLab CI, Docker containerization, automated testing, security scanning, and zero-downtime deployment workflows.',
      features: [
        'Git, GitHub, Gerrit integration',
        'Jenkins, GitLab CI, GitHub Actions',
        'Docker & nerdctl containerization',
        'Automated testing and security scanning',
        'Zero-downtime deployment workflows'
      ],
      pricing: 'Starting at $2,500'
    },
    {
      id: 4,
      title: 'AI & Systems Programming',
      description: 'Low-level systems programming in C/C++, backend service optimization, AI application development with Python/TensorFlow/PyTorch, and model deployment on GPU/Neuron clusters.',
      features: [
        'Low-level systems programming (C/C++)',
        'Backend service optimization',
        'AI development (Python, TensorFlow, PyTorch)',
        'Model deployment on GPU/Neuron clusters',
        'API design for AI-powered features'
      ],
      pricing: 'Starting at $3,000'
    },
    {
      id: 5,
      title: 'Enterprise Communication Infrastructure',
      description: 'Build secure, scalable communication systems with custom SMTP servers, DKIM/SPF/DMARC authentication, encrypted mail routing, notification APIs, and synthetic email datasets.',
      features: [
        'Custom SMTP server implementation',
        'DKIM, SPF, DMARC authentication',
        'Encrypted mail routing',
        'Notification APIs for apps/platforms',
        'Synthetic email datasets for testing'
      ],
      pricing: 'Starting at $1,500'
    },
    {
      id: 6,
      title: 'AI-Driven Marketing Automation',
      description: 'Design automated marketing workflows with segmentation engines, behavioral triggers, AI-generated outreach, campaign analytics, and multi-channel delivery systems.',
      features: [
        'Segmentation engines',
        'Behavioral triggers',
        'AI-generated outreach',
        'Campaign analytics',
        'Multi-channel delivery (email, SMS, in-app)'
      ],
      pricing: 'Starting at $2,000'
    }
  ];

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Infrastructure & Technology Services</h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-6">
            Sovereign infrastructure solutions for Africa and beyond. From cloud architecture to AI systems, DevOps pipelines to high-performance computing — we build the foundation for digital independence and innovation.
          </p>
          <div className="bg-primary-50 rounded-lg p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-primary-800 mb-2">AtonixCorp's Mission</h2>
            <p className="text-gray-700">
              Building scalable, secure, and developer-ready ecosystems that empower African innovation and reduce dependency on external infrastructure providers.
            </p>
          </div>
        </div>

        {/* Quote CTA Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg p-8 mb-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Build Sovereign Infrastructure?</h2>
          <p className="text-xl mb-6 text-primary-100">
            Get a detailed consultation for your cloud architecture, AI systems, or DevOps pipeline needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="text-primary-100">Custom infrastructure design</div>
            <div className="text-primary-100">High-performance computing</div>
            <div className="text-primary-100">Enterprise-grade security</div>
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
