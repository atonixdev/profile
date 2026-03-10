import React from 'react';
import { Link } from 'react-router-dom';

// Legal hub page — central index of all legal & compliance documents
const Legal = () => {
  const docs = [
    {
      category: 'Privacy & Data',
      items: [
        { title: 'Privacy Policy', desc: 'How we collect, use, and protect your personal information.', path: '/privacy', tag: 'Effective March 2026' },
        { title: 'Data Protection', desc: 'GDPR principles, data subject rights, and our data processing register.', path: '/data-protection', tag: 'GDPR Aligned' },
      ],
    },
    {
      category: 'Terms & Agreements',
      items: [
        { title: 'Terms of Service', desc: 'The legal agreement governing your use of AtonixDev platform and services.', path: '/terms', tag: 'Effective March 2026' },
      ],
    },
    {
      category: 'Security & Compliance',
      items: [
        { title: 'Security & Compliance', desc: 'Our security control framework, certifications, and incident response process.', path: '/security', tag: 'Updated March 2026' },
        { title: 'Data Protection Policy', desc: 'Detailed GDPR-aligned policies for enterprise and government engagements.', path: '/data-protection', tag: 'Available on Request' },
      ],
    },
    {
      category: 'Government & Procurement',
      items: [
        { title: 'Capabilities Statement', desc: 'NAICS codes, past performance, and technical capabilities for government contracting.', path: '/capabilities', tag: 'Government Procurement' },
        { title: 'Government Contracting', desc: 'How to engage AtonixDev for government agency requirements.', path: '/government', tag: 'Public Sector' },
      ],
    },
  ];

  return (
    <div style={{ background: '#FFFFFF' }}>

      {/* ── Header ── */}
      <section style={{ position: 'relative', background: '#FFFFFF', overflow: 'hidden', padding: '120px 0 80px' }}>
        <div className="hero-grid-bg" />
        <div className="hero-accent-bar" />
        <div className="gsw-container" style={{ position: 'relative', zIndex: 1 }}>
          <span className="gsw-eyebrow">Legal & Compliance</span>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, color: '#111827', lineHeight: 1.1, maxWidth: 680, marginBottom: 20 }}>
            Legal
          </h1>
          <p style={{ fontSize: 17, color: '#6B7280', lineHeight: 1.75, maxWidth: 580 }}>
            All legal documents, policies, compliance information, and procurement resources for AtonixDev are available below.
          </p>
        </div>
      </section>

      <hr className="gsw-divider" />

      {/* ── Document Index ── */}
      <section className="gsw-section" style={{ background: '#FFFFFF' }}>
        <div className="gsw-container">
          {docs.map((group) => (
            <div key={group.category} style={{ marginBottom: 64 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9CA3AF', fontFamily: 'var(--font-mono)', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #E5E7EB' }}>
                {group.category}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB' }}>
                {group.items.map((doc) => (
                  <Link
                    key={doc.title}
                    to={doc.path}
                    style={{ background: '#FFFFFF', padding: '24px 28px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFAFA'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
                  >
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 6 }}>{doc.title}</h3>
                      <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7, margin: 0 }}>{doc.desc}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                      <span style={{ padding: '3px 10px', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B7280', border: '1px solid #E5E7EB', fontFamily: 'var(--font-mono)' }}>{doc.tag}</span>
                      <span style={{ fontSize: 12, color: '#A81D37', fontWeight: 700 }}>View →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact ── */}
      <section className="gsw-section-sm" style={{ background: '#A81D37' }}>
        <div className="gsw-container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px 48px' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 800, color: '#FFFFFF', marginBottom: 10 }}>Legal enquiries & DPA requests</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.7 }}>Contact our legal and compliance team for data processing agreements, enterprise terms negotiations, and government procurement questions.</p>
          </div>
          <Link to="/contact" style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', padding: '12px 28px', background: '#A81D37', color: '#FFFFFF', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
            Contact Legal
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Legal;
