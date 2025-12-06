import React, { useState, useEffect } from 'react';
import { inquiryService } from '../services';

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
    // Check if user came from quote CTA or service page
    const selectedType = sessionStorage.getItem('selectedInquiryType');
    const selectedService = sessionStorage.getItem('selectedService');
    const selectedProjectType = sessionStorage.getItem('selectedProjectType');

    if (selectedType === 'quote') {
      setFormData(prev => ({
        ...prev,
        inquiry_type: 'quote',
        project_type: selectedProjectType || prev.project_type,
        subject: selectedService ? `Quote Request: ${selectedService}` : 'Project Quote Request',
        message: selectedService ? `I am interested in your ${selectedService} service. Please provide a detailed quote for my project.\n\nProject Details:` : prev.message
      }));
      sessionStorage.removeItem('selectedInquiryType');
      sessionStorage.removeItem('selectedService');
      sessionStorage.removeItem('selectedProjectType');
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
    setSuccess(false);

    try {
      await inquiryService.create(formData);
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
      setError('Failed to submit inquiry. Please try again.');
      console.error('Error submitting inquiry:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Get In Touch</h1>
          <p className="text-xl text-gray-600 mb-6">
            Have a project in mind? Let's discuss how I can help you
          </p>

          {/* Quote Request CTA */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-2">Need a Quote?</h2>
            <p className="mb-4">Get a detailed project estimate tailored to your needs</p>
            <button
              onClick={() => {
                setFormData({...formData, inquiry_type: 'quote'});
                document.getElementById('inquiry_type').value = 'quote';
              }}
              className="bg-white text-primary-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Request Quote
            </button>
          </div>
        </div>          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {formData.inquiry_type === 'quote'
                ? 'Thank you for your quote request! I\'ll review your project details and get back to you with a detailed proposal within 24 hours.'
                : 'Thank you for your inquiry! I\'ll get back to you soon.'
              }
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="phone" className="block text-gray-700 font-semibold mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-gray-700 font-semibold mb-2">
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="inquiry_type" className="block text-gray-700 font-semibold mb-2">
                  Inquiry Type *
                </label>
                <select
                  id="inquiry_type"
                  name="inquiry_type"
                  value={formData.inquiry_type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
                >
                  <option value="general">General Inquiry</option>
                  <option value="quote">Request Quote</option>
                  <option value="project">Project Request</option>
                  <option value="job">Job Opportunity</option>
                  <option value="collaboration">Collaboration</option>
                  <option value="other">Other</option>
                </select>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="budget" className="block text-gray-700 font-semibold mb-2">
                  Budget Range {formData.inquiry_type === 'quote' && <span className="text-red-500">*</span>}
                </label>
                <select
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  required={formData.inquiry_type === 'quote'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
                >
                  <option value="">Select budget range</option>
                  <option value="$1,000 - $5,000">$1,000 - $5,000</option>
                  <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                  <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                  <option value="$25,000 - $50,000">$25,000 - $50,000</option>
                  <option value="$50,000+">$50,000+</option>
                  <option value="Custom">Custom - Please specify in message</option>
                </select>
              </div>

              {formData.inquiry_type === 'quote' && (
                <div>
                  <label htmlFor="timeline" className="block text-gray-700 font-semibold mb-2">
                    Project Timeline *
                  </label>
                  <select
                    id="timeline"
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleChange}
                    required={formData.inquiry_type === 'quote'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
                  >
                    <option value="">Select timeline</option>
                    <option value="ASAP">ASAP (Rush project)</option>
                    <option value="1-2 weeks">1-2 weeks</option>
                    <option value="1 month">1 month</option>
                    <option value="2-3 months">2-3 months</option>
                    <option value="3-6 months">3-6 months</option>
                    <option value="6+ months">6+ months</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
              )}
            </div>

            {formData.inquiry_type === 'quote' && (
              <div className="mb-6">
                <label htmlFor="project_type" className="block text-gray-700 font-semibold mb-2">
                  Project Type *
                </label>
                <select
                  id="project_type"
                  name="project_type"
                  value={formData.project_type}
                  onChange={handleChange}
                  required={formData.inquiry_type === 'quote'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
                >
                  <option value="">Select project type</option>
                  <option value="web-development">Web Development</option>
                  <option value="mobile-app">Mobile App Development</option>
                  <option value="cloud-infrastructure">Cloud Infrastructure</option>
                  <option value="ai-ml">AI/ML Solutions</option>
                  <option value="devops">DevOps & CI/CD</option>
                  <option value="consulting">Technical Consulting</option>
                  <option value="other">Other - Please specify in message</option>
                </select>
              </div>
            )}
            </div>

            <div className="mb-6">
              <label htmlFor="subject" className="block text-gray-700 font-semibold mb-2">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="message" className="block text-gray-700 font-semibold mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Submitting...' : formData.inquiry_type === 'quote' ? 'Request Quote' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
