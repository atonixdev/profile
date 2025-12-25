import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      id: 1,
      category: 'General',
      question: 'What services does AtonixDev offer?',
      answer: 'AtonixDev specializes in software engineering, cloud infrastructure, AI/ML solutions, DevOps, and technology architecture. We help businesses build scalable, intelligent, and future-proof digital systems. Visit our Services page for detailed information about each offering.'
    },
    {
      id: 2,
      category: 'General',
      question: 'How can I get in touch with AtonixDev?',
      answer: 'You can reach us through our Contact page, email, or using the live chat feature at the bottom right of this page. Our team responds to inquiries within 24 hours during business days.'
    },
    {
      id: 3,
      category: 'General',
      question: 'What is your company experience?',
      answer: 'AtonixDev has delivered 6+ major projects including cloud infrastructure, AI research hubs, DevOps pipelines, and enterprise systems. Check our Portfolio page to see detailed case studies of our work.'
    },
    {
      id: 4,
      category: 'Services',
      question: 'Do you offer custom software development?',
      answer: 'Yes! We provide custom software development tailored to your specific business needs. We work with modern technologies including React, Django, Kubernetes, and AWS. Contact us to discuss your project requirements.'
    },
    {
      id: 5,
      category: 'Services',
      question: 'What is your approach to cloud infrastructure?',
      answer: 'We design sovereign, scalable cloud solutions using OpenStack, AWS, and Kubernetes. Our approach focuses on high availability, security, and cost optimization. We can help you migrate to or architect cloud-native applications.'
    },
    {
      id: 6,
      category: 'Services',
      question: 'Do you offer DevOps consulting?',
      answer: 'Absolutely! We implement CI/CD pipelines, infrastructure automation, and deployment strategies using Jenkins, GitLab CI, Docker, and Kubernetes. We help teams achieve zero-downtime deployments and automated testing.'
    },
    {
      id: 7,
      category: 'Services',
      question: 'Can you help with AI/ML implementation?',
      answer: 'Yes, we specialize in AI and machine learning solutions. We can help with architecture design, model development using TensorFlow/PyTorch, and production deployment. Perfect for data science teams and research organizations.'
    },
    {
      id: 8,
      category: 'Project Process',
      question: 'How do you approach project engagement?',
      answer: 'We start with a detailed discovery phase to understand your goals and requirements. Then we design a solution, implement it in phases, test thoroughly, and provide ongoing support. We maintain transparent communication throughout.'
    },
    {
      id: 9,
      category: 'Project Process',
      question: 'What is your typical project timeline?',
      answer: 'Project timelines vary based on scope and complexity. Simple projects take 2-4 weeks, medium projects 1-3 months, and complex infrastructure work 3-6 months. We provide detailed timeline estimates during the initial consultation.'
    },
    {
      id: 10,
      category: 'Project Process',
      question: 'Do you provide ongoing support after project completion?',
      answer: 'Yes! We offer maintenance, monitoring, and support packages. Many of our clients benefit from ongoing optimization and security updates. We\'re committed to the long-term success of your systems.'
    },
    {
      id: 11,
      category: 'Pricing',
      question: 'How is pricing determined?',
      answer: 'We provide custom quotes based on project scope, complexity, and timeline. We offer flexible engagement models: fixed-price projects, time-and-materials, or dedicated team arrangements. Contact us for a personalized quote.'
    },
    {
      id: 12,
      category: 'Pricing',
      question: 'Do you offer startup or non-profit discounts?',
      answer: 'Yes! We support innovation and social impact. We offer discounted rates for startups and non-profits. Please mention your organization type when contacting us, and we\'ll discuss available options.'
    },
    {
      id: 13,
      category: 'Technical',
      question: 'What technologies does AtonixDev use?',
      answer: 'We work with modern tech stacks: Frontend (React, Vue), Backend (Django, FastAPI, Node.js), Cloud (AWS, OpenStack, Kubernetes), Databases (PostgreSQL, MongoDB), and CI/CD (Jenkins, GitLab CI, GitHub Actions).'
    },
    {
      id: 14,
      category: 'Technical',
      question: 'Do you follow best practices and standards?',
      answer: 'Absolutely! We follow industry best practices including WCAG accessibility standards, OWASP security guidelines, Clean Code principles, and agile methodologies. Code quality and security are paramount.'
    },
    {
      id: 15,
      category: 'Technical',
      question: 'Can you help with legacy system modernization?',
      answer: 'Yes! We specialize in modernizing legacy systems. We can help with code refactoring, migration to modern frameworks, cloud migration, or complete system redesigns. Let\'s discuss your specific needs.'
    }
  ];

  const categories = ['All', ...new Set(faqs.map(faq => faq.category))];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredFaqs = selectedCategory === 'All' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our services, process, and pricing. Can't find what you're looking for? Contact us directly.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
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
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto space-y-4">
          {filteredFaqs.map((faq, index) => (
            <div
              key={faq.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start gap-4 flex-1">
                  <span className="text-primary-600 font-bold text-lg mt-1">{faq.id}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {faq.question}
                    </h3>
                    <span className="text-sm text-primary-600 font-medium">
                      {faq.category}
                    </span>
                  </div>
                </div>
                <svg
                  className={`w-6 h-6 text-primary-600 flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>

              {openIndex === index && (
                <div className="px-6 py-4 bg-white border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still need help? */}
        <div className="mt-16 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-gray-700 mb-6">
            Our support team is here to help. Use the live chat feature or contact us directly for personalized assistance.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-all"
            >
              Contact Us
            </Link>
            <Link
              to="/portfolio"
              className="inline-block border-2 border-primary-600 text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-all"
            >
              View Our Projects
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
