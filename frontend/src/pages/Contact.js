import React, { useState, useEffect } from 'react';
import { inquiryService } from '../services';
import { getCountryByName } from '../utils/countries';
import SearchableCountryDropdown from '../components/SearchableCountryDropdown';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    country_code: '',
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

    if (selectedType === 'quote' || selectedType === 'project') {
      setFormData(prev => ({
        ...prev,
        inquiry_type: 'project',
        subject: selectedService ? `Project Request: ${selectedService}` : 'Infrastructure Project Request',
        message: selectedService ? `I am interested in your ${selectedService} service. Please provide information for my infrastructure project.\n\nProject Details:` : prev.message
      }));
      sessionStorage.removeItem('selectedInquiryType');
      sessionStorage.removeItem('selectedService');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'country') {
      const selectedCountry = getCountryByName(value);
      setFormData({ ...formData, country: value, country_code: selectedCountry ? selectedCountry.code : '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        country_code: formData.country_code,
        company: formData.company,
        inquiry_type: formData.inquiry_type,
        subject: formData.subject,
        message: formData.message,
        budget: formData.budget,
      };

      await inquiryService.create(payload);
      setSuccess(true);
      setFormData({
        name: '', email: '', phone: '', country: '', country_code: '',
        company: '', inquiry_type: 'general', subject: '', message: '',
        budget: '', timeline: '', project_type: '',
      });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      let errorMessage = 'Failed to send message. Please try again.';
      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          const errors = Object.entries(err.response.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n');
          errorMessage = errors || errorMessage;
        } else if (typeof err.response.data === 'string') {
          const s = err.response.data.trim().toLowerCase();
          if (s.startsWith('<!doctype html') || s.startsWith('<html') || err.response.data.length > 300) {
            errorMessage = 'Server error. Please try again later.';
          } else {
            errorMessage = err.response.data;
          }
        }
      } else if (err.message === 'Network Error') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'project', label: 'Project Request' },
    { value: 'job', label: 'Job Opportunity' },
    { value: 'collaboration', label: 'Collaboration' },
    { value: 'other', label: 'Other' }
  ];

  const projectTypes = [
    { value: '', label: 'Select Type' },
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
    { value: '5k-15k', label: '$5,000 – $15,000' },
    { value: '15k-50k', label: '$15,000 – $50,000' },
    { value: '50k-100k', label: '$50,000 – $100,000' },
    { value: 'over-100k', label: 'Over $100,000' }
  ];

  const timelines = [
    { value: '', label: 'Select Timeline' },
    { value: 'asap', label: 'ASAP' },
    { value: '1-month', label: 'Within 1 month' },
    { value: '2-3-months', label: '2–3 months' },
    { value: '3-6-months', label: '3–6 months' },
    { value: '6-months-plus', label: '6+ months' }
  ];

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: '#F1F3F5', border: '1px solid #D1D5DB',
    color: '#111827', padding: '10px 14px',
    fontSize: '14px', fontFamily: 'inherit',
    outline: 'none', transition: 'border-color 0.15s',
  };

  const labelStyle = {
    display: 'block', fontSize: '12px', fontWeight: 600,
    color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.08em',
    marginBottom: '6px',
  };

  return (
    <div style={{ background: '#FFFFFF' }} className="min-h-screen">

      {/* Main Content */}
      <section className="gsw-section">
        <div className="gsw-container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '64px', alignItems: 'start' }}>

            {/* Form Panel */}
            <div style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', padding: '48px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '32px', letterSpacing: '-0.01em' }}>
                Send Message
              </h2>

              {success && (
                <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534', padding: '14px 18px', marginBottom: '24px', fontSize: '14px' }}>
                  <strong>Message sent.</strong> Our team will respond within 24 hours.
                </div>
              )}

              {error && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '14px 18px', marginBottom: '24px', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                  <strong>Error:</strong> {error}
                </div>
              )}

              <div style={{ marginBottom: '24px', background: '#F1F3F5', border: '1px solid #E5E7EB', padding: '14px 18px' }}>
                <p style={{ fontSize: '13px', color: '#4B5563', margin: 0 }}>
                  Provide your <strong style={{ color: '#1F2937' }}>Email</strong> and <strong style={{ color: '#1F2937' }}>Phone Number</strong> for the fastest response.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}>Full Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+27 123 456 7890" style={inputStyle} />
                    <p style={{ fontSize: '11px', color: '#4B5563', marginTop: '4px' }}>Recommended for faster response</p>
                  </div>
                  <div>
                    <label style={labelStyle}>Country</label>
                    <div style={{ border: '1px solid #D1D5DB', background: '#F1F3F5' }}>
                      <SearchableCountryDropdown value={formData.country} onChange={handleChange} />
                    </div>
                  </div>
                </div>

                {formData.country && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                      <label style={labelStyle}>Country Code</label>
                      <div style={{ ...inputStyle, color: '#aaa' }}>{formData.country_code}</div>
                    </div>
                    <div>
                      <label style={labelStyle}>Dial Code</label>
                      <div style={{ ...inputStyle, color: '#aaa' }}>{getCountryByName(formData.country)?.dialCode || '—'}</div>
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Company</label>
                  <input type="text" name="company" value={formData.company} onChange={handleChange} style={inputStyle} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}>Inquiry Type *</label>
                    <select name="inquiry_type" value={formData.inquiry_type} onChange={handleChange} style={inputStyle}>
                      {inquiryTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Project Type</label>
                    <select name="project_type" value={formData.project_type} onChange={handleChange} style={inputStyle}>
                      {projectTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}>Budget</label>
                    <select name="budget" value={formData.budget} onChange={handleChange} style={inputStyle}>
                      {budgets.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Timeline</label>
                    <select name="timeline" value={formData.timeline} onChange={handleChange} style={inputStyle}>
                      {timelines.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Subject *</label>
                  <input type="text" name="subject" value={formData.subject} onChange={handleChange} required style={inputStyle} />
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <label style={labelStyle}>Message *</label>
                  <textarea
                    name="message" value={formData.message} onChange={handleChange} required rows={6}
                    placeholder="Describe your infrastructure challenge or project goals..."
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '14px 24px',
                    background: loading ? '#D1D5DB' : '#A81D37',
                    color: '#FFFFFF', border: 'none',
                    fontSize: '14px', fontWeight: 700,
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', transition: 'background 0.15s',
                  }}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#E5E7EB' }}>
              {/* Contact Info */}
              <div style={{ background: '#F8F9FA', padding: '32px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>
                  Contact Info
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {[
                    { label: 'Email', value: 'info@atonixdev.org', href: 'mailto:info@atonixdev.org' },
                    { label: 'Location', value: 'Stellenbosch & Johannesburg, South Africa' },
                    { label: 'Response Time', value: 'Within 24 hours' },
                  ].map((item, i) => (
                    <div key={i}>
                      <div style={{ fontSize: '11px', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{item.label}</div>
                      {item.href
                        ? <a href={item.href} style={{ color: '#A81D37', fontSize: '14px', textDecoration: 'none' }}>{item.value}</a>
                        : <div style={{ color: '#1F2937', fontSize: '14px' }}>{item.value}</div>
                      }
                    </div>
                  ))}
                </div>
              </div>

              {/* Social */}
              <div style={{ background: '#F8F9FA', padding: '32px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>
                  Connect
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: 'LinkedIn', href: 'https://linkedin.com/in/atonixdev' },
                    { label: 'GitHub', href: 'https://github.com/atonixdev' },
                    { label: 'GitLab', href: 'https://gitlab.com/atonixdev' },
                    { label: 'Twitter / X', href: 'https://twitter.com/atonixdev' },
                  ].map((link, i) => (
                    <a
                      key={i}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        color: '#aaa', fontSize: '14px', textDecoration: 'none',
                        padding: '10px 14px', border: '1px solid #E5E7EB',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#A81D37'; e.currentTarget.style.color = '#111827'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#aaa'; }}
                    >
                      <span>{link.label}</span>
                      <span style={{ color: '#D1D5DB', fontSize: '12px' }}>↗</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Contact;
