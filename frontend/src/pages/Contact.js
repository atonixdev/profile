import React, { useState, useEffect } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    inquiry_type: 'general',
    subject: '',
    message: '',
    budget: '',
    timeline: '',
    project_type: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const selectedType = sessionStorage.getItem('selectedInquiryType');
    const selectedService = sessionStorage.getItem('selectedService');

    if (selectedType === 'quote') {
      setFormData(prev => ({
        ...prev,
        inquiry_type: 'quote',
        subject: selectedService ? `Quote Request: ${selectedService}` : 'Infrastructure Project Quote',
        message: selectedService ? `I am interested in your ${selectedService} service. Please provide a detailed quote for my infrastructure project.\n\nProject Details:` : prev.message
      }));
      sessionStorage.removeItem('selectedInquiryType');
      sessionStorage.removeItem('selectedService');
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        inquiry_type: 'general',
        subject: '',
        message: '',
        budget: '',
        timeline: '',
        project_type: '',
      });
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'quote', label: 'Request Quote' },
    { value: 'consultation', label: 'Free Consultation' },
    { value: 'cloud', label: 'Cloud Infrastructure' },
    { value: 'ai', label: 'AI & Machine Learning' },
    { value: 'devops', label: 'DevOps & CI/CD' },
    { value: 'infrastructure', label: 'Systems Infrastructure' }
  ];

  const projectTypes = [
    { value: 'cloud-migration', label: 'Cloud Migration' },
    { value: 'ai-infrastructure', label: 'AI Infrastructure' },
    { value: 'devops-setup', label: 'DevOps Pipeline Setup' },
    { value: 'security-audit', label: 'Security Infrastructure Audit' },
    { value: 'high-performance-computing', label: 'High-Performance Computing' },
    { value: 'enterprise-email', label: 'Enterprise Communication' },
    { value: 'marketing-automation', label: 'Marketing Automation' },
    { value: 'custom-development', label: 'Custom Development' }
  ];

  const budgets = [
    { value: '', label: 'Select Budget Range' },
    { value: 'under-5k', label: 'Under $5,000' },
    { value: '5k-15k', label: '$5,000 - $15,000' },
    { value: '15k-50k', label: '$15,000 - $50,000' },
    { value: '50k-100k', label: '$50,000 - $100,000' },
    { value: 'over-100k', label: 'Over $100,000' }
  ];

  const timelines = [
    { value: '', label: 'Select Timeline' },
    { value: 'asap', label: 'ASAP' },
    { value: '1-month', label: 'Within 1 month' },
    { value: '2-3-months', label: '2-3 months' },
    { value: '3-6-months', label: '3-6 months' },
    { value: '6-months-plus', label: '6+ months' }
  ];

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Let's Build Together</h1>
            <p className="text-xl text-gray-600">Contact me for infrastructure solutions and digital innovation</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6">Send Message</h2>

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
                    Thank you! I'll respond within 24 hours.
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="inquiry_type" className="block text-sm font-medium text-gray-700 mb-2">
                        Inquiry Type *
                      </label>
                      <select
                        id="inquiry_type"
                        name="inquiry_type"
                        value={formData.inquiry_type}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {inquiryTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="project_type" className="block text-sm font-medium text-gray-700 mb-2">
                        Project Type
                      </label>
                      <select
                        id="project_type"
                        name="project_type"
                        value={formData.project_type}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select Type</option>
                        {projectTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                        Budget
                      </label>
                      <select
                        id="budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {budgets.map(b => (
                          <option key={b.value} value={b.value}>{b.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
                        Timeline
                      </label>
                      <select
                        id="timeline"
                        name="timeline"
                        value={formData.timeline}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {timelines.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Tell me about your project..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">Contact Info</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-semibold">Email</div>
                    <a href="mailto:admin@atonixdev.com" className="text-primary-600 hover:underline">
                      admin@atonixdev.com
                    </a>
                  </div>
                  <div>
                    <div className="font-semibold">Location</div>
                    <div>Stellenbosch, South Africa</div>
                  </div>
                  <div>
                    <div className="font-semibold">Response</div>
                    <div>Within 24 hours</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">Connect</h3>
                <div className="space-y-2 text-sm">
                  <a href="https://linkedin.com/in/atonixdev" target="_blank" rel="noopener noreferrer" className="block text-primary-600 hover:underline">
                    LinkedIn
                  </a>
                  <a href="https://github.com/atonixdev" target="_blank" rel="noopener noreferrer" className="block text-primary-600 hover:underline">
                    GitHub
                  </a>
                  <a href="https://gitlab.com/atonixdev" target="_blank" rel="noopener noreferrer" className="block text-primary-600 hover:underline">
                    GitLab
                  </a>
                  <a href="https://twitter.com/atonixdev" target="_blank" rel="noopener noreferrer" className="block text-primary-600 hover:underline">
                    Twitter
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
