import React from 'react';
import { Link } from 'react-router-dom';

const DataProtection = () => {
  const principles = [
    { title: 'Lawfulness & Transparency', desc: 'We process personal data only with a valid lawful basis and inform data subjects clearly about how their data is used, stored, and shared.' },
    { title: 'Purpose Limitation', desc: 'Data collected for a specific purpose is not used for incompatible secondary purposes. Each processing activity has a documented justification.' },
    { title: 'Data Minimisation', desc: 'We collect only the data that is strictly necessary for the stated purpose. Unnecessary data is not requested, retained, or processed.' },
    { title: 'Accuracy', desc: 'We maintain accurate and up-to-date records. Data subjects can request corrections, and we have processes to propagate updates across systems.' },
    { title: 'Storage Limitation', desc: 'Data is retained only for as long as required by the processing purpose or legal obligation. Automated retention policies enforce deletion schedules.' },
    { title: 'Integrity & Confidentiality', desc: 'All personal data is protected by AES-256 encryption at rest, TLS 1.3 in transit, and role-based access controls enforced at every layer.' },
  ];

  const rights = [
    { right: 'Right of Access', desc: 'You may request a copy of all personal data we hold about you, including the categories processed, purposes, and retention periods.' },
    { right: 'Right to Rectification', desc: 'If any personal data we hold is inaccurate or incomplete, you have the right to request correction or completion.' },
    { right: 'Right to Erasure', desc: 'You may request deletion of your personal data where there is no lawful basis for continued processing ("right to be forgotten").' },
    { right: 'Right to Restriction', desc: 'You may request that we restrict processing of your personal data in specific circumstances, such as while we verify accuracy.' },
    { right: 'Right to Portability', desc: 'You may request your personal data in a structured, machine-readable format for transfer to another controller.' },
    { right: 'Right to Object', desc: 'You may object to processing of your personal data for direct marketing or legitimate interest purposes.' },
    { right: 'Right to Withdraw Consent', desc: 'Where processing is based on consent, you may withdraw that consent at any time without affecting the lawfulness of prior processing.' },
  ];

  const categories = [
    { category: 'Account Data', examples: 'Name, email address, username, password hash', basis: 'Contract Performance', retention: 'Duration of account + 90 days post-deletion' },
    { category: 'Usage & Activity Data', examples: 'Platform interactions, login timestamps, API usage metrics', basis: 'Legitimate Interest', retention: '12 months rolling' },
    { category: 'Communication Data', examples: 'Support tickets, contact form submissions, email correspondence', basis: 'Contract Performance / Legitimate Interest', retention: '3 years' },
    { category: 'Technical Data', examples: 'IP address, browser agent, session identifiers', basis: 'Legitimate Interest / Security', retention: '90 days' },
    { category: 'Professional Data', examples: 'Company name, job title, industry sector (for business accounts)', basis: 'Contract Performance', retention: 'Duration of account + 90 days' },
  ];

  return (
    <div style={{ background: '#FFFFFF' }}>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', background: '#FFFFFF', overflow: 'hidden', padding: '120px 0 96px' }}>
        <div className="hero-grid-bg" />
        <div className="hero-accent-bar" />
        <div className="gsw-container" style={{ position: 'relative', zIndex: 1 }}>
          <span className="gsw-eyebrow">Trust & Compliance</span>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 800, color: '#111827', lineHeight: 1.08, maxWidth: 760, marginBottom: 24 }}>
            Data Protection
          </h1>
          <p style={{ fontSize: 18, color: '#6B7280', lineHeight: 1.75, maxWidth: 640, marginBottom: 32 }}>
            AtonixDev processes personal data responsibly and in full alignment with GDPR principles,
            international privacy standards, and the expectations of enterprise and government clients.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/privacy" style={{ display: 'inline-flex', alignItems: 'center', padding: '12px 28px', background: '#A81D37', color: '#FFFFFF', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Privacy Policy
            </Link>
            <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', padding: '11px 28px', border: '1px solid #D1D5DB', color: '#374151', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Data Request
            </Link>
          </div>
        </div>
      </section>

      <hr className="gsw-divider" />

      {/* ── Principles ── */}
      <section className="gsw-section" style={{ background: '#F8F9FA' }}>
        <div className="gsw-container">
          <span className="gsw-eyebrow">GDPR Principles</span>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, color: '#111827', lineHeight: 1.12, maxWidth: 600, marginBottom: 16 }}>
            How We Handle Your Data
          </h2>
          <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.75, maxWidth: 660, marginBottom: 56 }}>
            Our data processing is grounded in the six core GDPR principles, applied across every system that handles personal information.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB' }}>
            {principles.map((p) => (
              <div key={p.title} style={{ background: '#FFFFFF', padding: '32px 28px' }}>
                <div style={{ width: 32, height: 2, background: '#A81D37', marginBottom: 20 }} />
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#111827', marginBottom: 12 }}>{p.title}</h3>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.8, margin: 0 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="gsw-divider" />

      {/* ── Data Categories ── */}
      <section className="gsw-section" style={{ background: '#FFFFFF' }}>
        <div className="gsw-container">
          <span className="gsw-eyebrow">Data Register</span>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 36px)', fontWeight: 800, color: '#111827', lineHeight: 1.12, maxWidth: 560, marginBottom: 56 }}>
            Personal Data We Process
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1.5fr 1.8fr', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB', minWidth: 720 }}>
              {/* Header */}
              {['Category', 'Examples', 'Lawful Basis', 'Retention'].map((h) => (
                <div key={h} style={{ background: '#A81D37', padding: '12px 16px' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)' }}>{h}</span>
                </div>
              ))}
              {/* Rows */}
              {categories.map((row) => (
                <React.Fragment key={row.category}>
                  <div style={{ background: '#FFFFFF', padding: '16px 16px', fontSize: 13, fontWeight: 700, color: '#111827' }}>{row.category}</div>
                  <div style={{ background: '#FFFFFF', padding: '16px 16px', fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{row.examples}</div>
                  <div style={{ background: '#FFFFFF', padding: '16px 16px', fontSize: 12, color: '#374151' }}>{row.basis}</div>
                  <div style={{ background: '#FFFFFF', padding: '16px 16px', fontSize: 12, color: '#374151' }}>{row.retention}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      <hr className="gsw-divider" />

      {/* ── Rights ── */}
      <section className="gsw-section" style={{ background: '#F8F9FA' }}>
        <div className="gsw-container">
          <span className="gsw-eyebrow">Your Rights</span>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 36px)', fontWeight: 800, color: '#111827', lineHeight: 1.12, maxWidth: 560, marginBottom: 56 }}>
            Data Subject Rights
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB', maxWidth: 840 }}>
            {rights.map((r) => (
              <div key={r.right} style={{ background: '#FFFFFF', padding: '20px 28px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                <div style={{ width: 3, height: 20, background: '#A81D37', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#111827', marginBottom: 6 }}>{r.right}</div>
                  <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.75, margin: 0 }}>{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 32, padding: '20px 24px', background: '#F1F3F5', border: '1px solid #E5E7EB', maxWidth: 840 }}>
            <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.75, margin: 0 }}>
              To exercise any of these rights, contact our Data Protection team via the{' '}
              <Link to="/contact" style={{ color: '#A81D37', textDecoration: 'none', fontWeight: 600 }}>Contact page</Link>.
              We will respond within 30 days. Identity verification may be required.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="gsw-section-sm" style={{ background: '#A81D37' }}>
        <div className="gsw-container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px 48px' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 800, color: '#FFFFFF', marginBottom: 10 }}>Have a data protection enquiry?</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.7 }}>Reach our Data Protection Officer or review our full Privacy Policy and Terms of Service.</p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', padding: '12px 28px', background: '#A81D37', color: '#FFFFFF', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Contact DPO
            </Link>
            <Link to="/privacy" style={{ display: 'inline-flex', alignItems: 'center', padding: '11px 28px', border: '1px solid rgba(255,255,255,0.25)', color: '#D1D5DB', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Privacy Policy
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default DataProtection;
