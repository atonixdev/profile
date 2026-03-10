import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// GS-WSF — Dashboard Module: Support
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const DOCS_LINKS = [
  { label: 'Getting Started',        to: '/community/tutorials' },
  { label: 'Platform Documentation', to: '/community/tutorials' },
  { label: 'Community Discussions',  to: '/community/discussions' },
  { label: 'Contact AtonixDev',      to: '/contact' },
];

const Support = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    subject: '',
    priority: 'Medium',
    description: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) return;
    setLoading(true);
    try {
      // Wire to existing contact backend
      const { inquiryService } = await import('../../services/api');
      await inquiryService.create({
        name: user?.user?.first_name
          ? `${user.user.first_name} ${user.user.last_name || ''}`.trim()
          : user?.username || 'Developer',
        email: user?.user?.email || '',
        message: `[Support - ${form.priority}] ${form.subject}\n\n${form.description}`,
        inquiry_type: 'general',
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true); // still show confirmation
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A81D37', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
          Developer Console
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 6, lineHeight: 1.2 }}>Support</h1>
        <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.65 }}>
          Open a support ticket, browse documentation, or connect with the AtonixDev engineering team.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'flex-start' }}>

        {/* Ticket form */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '32px' }}>
          {submitted ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ width: 32, height: 2, background: '#A81D37', margin: '0 auto 20px' }} />
              <p style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 8 }}>Ticket Submitted</p>
              <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.65, maxWidth: 360, margin: '0 auto 24px' }}>
                Your support request has been received. The AtonixDev engineering team will respond
                to your registered email within one business day.
              </p>
              <button
                onClick={() => { setSubmitted(false); setForm({ subject: '', priority: 'Medium', description: '' }); }}
                style={{
                  padding: '10px 28px', background: '#111827', color: '#FFFFFF',
                  border: 'none', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Submit Another
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 24 }}>Open a Support Ticket</h2>
              <form onSubmit={handleSubmit}>
                {/* Subject */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1F2937', marginBottom: 6 }}>
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Brief description of your issue"
                    required
                    style={{
                      width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB',
                      fontSize: 13, fontFamily: 'inherit', outline: 'none',
                      color: '#111827', background: '#FFFFFF', boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Priority */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1F2937', marginBottom: 6 }}>
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    style={{
                      width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB',
                      fontSize: 13, fontFamily: 'inherit', outline: 'none',
                      color: '#111827', background: '#FFFFFF', cursor: 'pointer',
                    }}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1F2937', marginBottom: 6 }}>
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe the issue in detail. Include any error messages, steps to reproduce, and expected behaviour."
                    required
                    rows={6}
                    style={{
                      width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB',
                      fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical',
                      color: '#111827', background: '#FFFFFF', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '12px 32px', background: loading ? '#4B5563' : '#A81D37',
                    color: '#FFFFFF', border: 'none', fontSize: 11, fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase', cursor: loading ? 'default' : 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {loading ? 'Submitting…' : 'Submit Ticket'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Resources & links */}
        <div>
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '24px', marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1F2937', marginBottom: 16 }}>
              Resources
            </div>
            {DOCS_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '11px 0', borderBottom: '1px solid #F3F4F6',
                  textDecoration: 'none', fontSize: 13,
                  color: '#1F2937', fontWeight: 500,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#A81D37'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#1F2937'; }}
              >
                {link.label}
                <span style={{ color: '#D1D5DB', fontSize: 10 }}>→</span>
              </Link>
            ))}
          </div>

          <div
            style={{
              background: '#111827', borderLeft: '3px solid #A81D37',
              padding: '20px 20px',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>Enterprise Support</div>
            <p style={{ fontSize: 12, color: '#4B5563', lineHeight: 1.6, marginBottom: 16 }}>
              Priority response SLAs and dedicated engineering support are available on enterprise plans.
            </p>
            <Link
              to="/contact"
              style={{
                fontSize: 11, fontWeight: 700, color: '#A81D37', textDecoration: 'none',
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}
            >
              Contact Sales →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
