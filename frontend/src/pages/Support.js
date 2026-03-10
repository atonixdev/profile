import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const CATEGORIES = [
  { value: 'technical',        label: 'Technical Support' },
  { value: 'billing',          label: 'Billing & Payments' },
  { value: 'account_access',   label: 'Account Access' },
  { value: 'deployment',       label: 'Deployment & Infrastructure' },
  { value: 'api',              label: 'API & Integrations' },
  { value: 'developer_tools',  label: 'Developer Tools' },
  { value: 'compliance',       label: 'Compliance & Security' },
  { value: 'general',          label: 'General Inquiry' },
];

const PRIORITIES = [
  { value: 'low',      label: 'Low — General question, no urgency' },
  { value: 'medium',   label: 'Medium — Service degraded, workaround available' },
  { value: 'high',     label: 'High — Major feature broken, no workaround' },
  { value: 'critical', label: 'Critical — Full service outage or data integrity risk' },
];

const INPUT = {
  width: '100%',
  padding: '11px 14px',
  border: '1px solid #D1D5DB',
  background: '#FFFFFF',
  fontSize: 14,
  color: '#111827',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  borderRadius: 0,
};

const LABEL = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#374151',
  marginBottom: 6,
  fontFamily: 'var(--font-mono, monospace)',
};

export default function Support() {
  const { user } = useContext(AuthContext);

  const [form, setForm]     = useState({
    name:       user?.full_name || '',
    email:      user?.email     || '',
    category:   'technical',
    priority:   'medium',
    subject:    '',
    message:    '',
    attachment: null,
  });
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(null);   // null | { ticket_ref }
  const [error, setError]         = useState('');
  const [fileLabel, setFileLabel] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm(prev => ({ ...prev, attachment: file }));
      setFileLabel(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== '') payload.append(k, v);
      });
      const res = await api.post('/support/tickets/', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSubmitted(res.data);
      setForm({ name: '', email: '', category: 'technical', priority: 'medium', subject: '', message: '', attachment: null });
      setFileLabel('');
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const msgs = Object.values(data).flat().join(' ');
        setError(msgs || 'Submission failed. Please try again.');
      } else {
        setError('Submission failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ maxWidth: 520, width: '100%', background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '48px 40px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, background: '#A81D37', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Request Received</h2>
          <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 24px', lineHeight: 1.6 }}>
            Your support ticket has been submitted. We'll respond to <strong>{form.email || 'your email'}</strong> as soon as possible.
          </p>
          <div style={{ background: '#F3F4F6', border: '1px solid #E5E7EB', padding: '16px 24px', marginBottom: 28 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', fontFamily: 'var(--font-mono, monospace)', marginBottom: 6 }}>Ticket Reference</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#A81D37', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '0.08em' }}>
              {submitted.ticket_ref || 'PENDING'}
            </div>
          </div>
          <button
            onClick={() => setSubmitted(null)}
            style={{ padding: '10px 28px', background: '#A81D37', border: 'none', color: '#FFFFFF', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      {/* ── Page Hero ──────────────────────────────────────── */}
      <section style={{ position: 'relative', background: '#FFFFFF', overflow: 'hidden', padding: '120px 0 96px' }}>
        <div className="hero-grid-bg" />
        <div className="hero-accent-bar" />
        <div className="gsw-container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <span className="gsw-eyebrow">Enterprise Support</span>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, color: '#111827', lineHeight: 1.1, maxWidth: 700, margin: '0 auto 24px' }}>
            Support Center
          </h1>
          <p style={{ fontSize: 18, color: '#6B7280', maxWidth: 560, lineHeight: 1.7, margin: '0 auto' }}>
            Submit a request to the AtonixDev support team. All ticket communications are tracked and responded to directly by our engineers.
          </p>
        </div>
      </section>
      <hr className="gsw-divider" />

      {/* Form */}
      <section className="gsw-section">
        <div className="gsw-container" style={{ maxWidth: 720 }}>
        <form onSubmit={handleSubmit}>
          {/* Row: name + email */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={LABEL} htmlFor="sup-name">Full Name</label>
              <input id="sup-name" name="name" value={form.name} onChange={handleChange} required placeholder="Your full name" style={INPUT} />
            </div>
            <div>
              <label style={LABEL} htmlFor="sup-email">Email Address</label>
              <input id="sup-email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" style={INPUT} />
            </div>
          </div>

          {/* Row: category + priority */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={LABEL} htmlFor="sup-cat">Category</label>
              <select id="sup-cat" name="category" value={form.category} onChange={handleChange} style={INPUT}>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={LABEL} htmlFor="sup-pri">Priority</label>
              <select id="sup-pri" name="priority" value={form.priority} onChange={handleChange} style={INPUT}>
                {PRIORITIES.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject */}
          <div style={{ marginBottom: 20 }}>
            <label style={LABEL} htmlFor="sup-sub">Subject</label>
            <input id="sup-sub" name="subject" value={form.subject} onChange={handleChange} required maxLength={200} placeholder="Brief description of the issue" style={INPUT} />
          </div>

          {/* Message */}
          <div style={{ marginBottom: 20 }}>
            <label style={LABEL} htmlFor="sup-msg">Message</label>
            <textarea
              id="sup-msg" name="message" value={form.message} onChange={handleChange} required rows={7}
              placeholder="Describe your issue in detail. Include any error messages, steps to reproduce, and what you expected to happen."
              style={{ ...INPUT, resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>

          {/* Attachment */}
          <div style={{ marginBottom: 28 }}>
            <label style={LABEL}>Attachment (optional)</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', border: '1px dashed #D1D5DB', background: '#F9FAFB', cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
              </svg>
              <span style={{ fontSize: 13, color: fileLabel ? '#111827' : '#9CA3AF' }}>
                {fileLabel || 'Choose file — PDF, PNG, JPG, ZIP, TXT (max 10 MB)'}
              </span>
              <input type="file" onChange={handleFile} style={{ display: 'none' }} accept=".pdf,.png,.jpg,.jpeg,.webp,.zip,.txt" />
            </label>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', fontSize: 13, marginBottom: 20 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '13px 36px', background: loading ? '#6B7280' : '#A81D37', border: 'none',
              color: '#FFFFFF', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', width: '100%',
            }}
          >
            {loading ? 'Submitting…' : 'Submit Support Request'}
          </button>

          <p style={{ marginTop: 14, fontSize: 12, color: '#6B7280', textAlign: 'center' }}>
            For critical outages affecting production, please also contact us directly at{' '}
            <strong>support@atonixdev.org</strong>.
          </p>
        </form>
        </div>
      </section>
    </div>
  );
}
