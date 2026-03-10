import React from 'react';
import { Link } from 'react-router-dom';

const GovernmentContracting = () => {
  const capabilities = [
    { title: 'Cloud & Infrastructure', items: ['OpenStack private cloud deployment', 'Hybrid & multi-cloud architecture', 'Kubernetes orchestration', 'Disaster recovery & business continuity'] },
    { title: 'Software Engineering', items: ['Custom government platform development', 'Legacy system modernisation', 'API-first architecture & integration', 'Citizen-facing digital service delivery'] },
    { title: 'AI & Data Intelligence', items: ['Predictive analytics & decision support', 'NLP document processing & automation', 'Fraud detection & anomaly systems', 'Data lakehouse & BI platforms'] },
    { title: 'Security & Compliance', items: ['Zero-trust architecture implementation', 'SIEM & security operations', 'Compliance automation (ISO 27001, SOC 2)', 'Penetration testing & vulnerability management'] },
    { title: 'DevOps & Automation', items: ['CI/CD pipeline engineering', 'Infrastructure-as-code (Terraform, Ansible)', 'Container lifecycle management', 'Automated testing & quality gates'] },
    { title: 'Enterprise Integration', items: ['API gateway design & management', 'ERP & CRM integration', 'Cross-agency data exchange protocols', 'Secure B2G & B2B connector systems'] },
  ];

  const differentiators = [
    { title: 'Security-First Engineering', desc: 'All deliverables are built with government-grade security requirements — zero-trust, encryption, and compliance from day one, not as an afterthought.' },
    { title: 'Enterprise Delivery Model', desc: 'We deliver on fixed specifications with documented milestones, transparent status reporting, and clear acceptance criteria aligned to contract requirements.' },
    { title: 'Cleared & Compliant Team', desc: 'AtonixDev maintains the policies, procedures, and operational standards required for sensitive government engagements across multiple jurisdictions.' },
    { title: 'Long-Term Support', desc: 'We provide multi-year maintenance, security patch obligations, SLA-backed support, and operational continuity planning for every government deployment.' },
  ];

  const naics = [
    { code: '541511', title: 'Custom Computer Programming Services' },
    { code: '541512', title: 'Computer Systems Design Services' },
    { code: '541519', title: 'Other Computer Related Services' },
    { code: '541611', title: 'Management Consulting Services' },
    { code: '518210', title: 'Data Processing & Managed Services' },
    { code: '541990', title: 'Professional & Technical Services' },
  ];

  const vehicles = [
    { name: 'Direct Award', desc: 'Available for sole-source and limited competition awards under applicable thresholds and emergency procurement provisions.' },
    { name: 'GSA Schedule', desc: 'In-process for GSA Multiple Award Schedule qualification — enabling streamlined procurement for US federal agencies.' },
    { name: 'Subcontracting', desc: 'Available as a qualified subcontractor to prime contractors on existing IDIQ and GWAC vehicles.' },
    { name: 'International Procurement', desc: 'Experienced with direct government contracting in multiple African and European jurisdictions outside US FAR frameworks.' },
  ];

  return (
    <div style={{ background: '#FFFFFF' }}>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', background: '#FFFFFF', overflow: 'hidden', padding: '120px 0 96px' }}>
        <div className="hero-grid-bg" />
        <div className="hero-accent-bar" />
        <div className="gsw-container" style={{ position: 'relative', zIndex: 1 }}>
          <span className="gsw-eyebrow">Government Contracting</span>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 800, color: '#111827', lineHeight: 1.08, maxWidth: 760, marginBottom: 24 }}>
            Technology Delivery for<br />
            <span style={{ color: '#A81D37' }}>Government & Public Sector</span>
          </h1>
          <p style={{ fontSize: 18, color: '#6B7280', lineHeight: 1.75, maxWidth: 640, marginBottom: 40 }}>
            AtonixDev delivers enterprise-grade software, cloud infrastructure, and AI capabilities
            to government agencies and public sector organisations worldwide with the security and
            compliance posture that public service demands.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', padding: '12px 28px', background: '#A81D37', color: '#FFFFFF', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Start a Conversation
            </Link>
            <Link to="/capabilities" style={{ display: 'inline-flex', alignItems: 'center', padding: '11px 28px', border: '1px solid #D1D5DB', color: '#374151', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Capabilities Statement
            </Link>
          </div>
        </div>
      </section>

      <hr className="gsw-divider" />

      {/* ── Capabilities ── */}
      <section className="gsw-section" style={{ background: '#F8F9FA' }}>
        <div className="gsw-container">
          <span className="gsw-eyebrow">Technical Capabilities</span>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, color: '#111827', lineHeight: 1.12, maxWidth: 600, marginBottom: 16 }}>
            Core Technical Areas
          </h2>
          <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.75, maxWidth: 660, marginBottom: 56 }}>
            AtonixDev is qualified to deliver across the full government technology stack — from infrastructure to intelligent applications.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB' }}>
            {capabilities.map((cap) => (
              <div key={cap.title} style={{ background: '#FFFFFF', padding: '32px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 3, height: 20, background: '#A81D37' }} />
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: 0 }}>{cap.title}</h3>
                </div>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {cap.items.map((item) => (
                    <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#374151', lineHeight: 1.65 }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#A81D37', flexShrink: 0, marginTop: 6 }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="gsw-divider" />

      {/* ── Why AtonixDev ── */}
      <section className="gsw-section" style={{ background: '#FFFFFF' }}>
        <div className="gsw-container">
          <span className="gsw-eyebrow">Why AtonixDev</span>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, color: '#111827', lineHeight: 1.12, maxWidth: 600, marginBottom: 56 }}>
            Purpose-Built for Government
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB' }}>
            {differentiators.map((d, idx) => (
              <div key={d.title} style={{ background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA', padding: '36px 32px' }}>
                <div style={{ width: 32, height: 2, background: '#A81D37', marginBottom: 20 }} />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 12 }}>{d.title}</h3>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.8, margin: 0 }}>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="gsw-divider" />

      {/* ── NAICS & Contract Vehicles ── */}
      <section className="gsw-section" style={{ background: '#F8F9FA' }}>
        <div className="gsw-container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px 80px', alignItems: 'start' }}>
            <div>
              <span className="gsw-eyebrow">NAICS Codes</span>
              <h2 style={{ fontSize: 'clamp(22px, 2.5vw, 32px)', fontWeight: 800, color: '#111827', lineHeight: 1.2, marginBottom: 32 }}>
                Registered NAICS Codes
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB' }}>
                {naics.map((n) => (
                  <div key={n.code} style={{ background: '#FFFFFF', padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#A81D37', fontFamily: 'var(--font-mono)', flexShrink: 0, minWidth: 60 }}>{n.code}</span>
                    <span style={{ fontSize: 13, color: '#374151' }}>{n.title}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <span className="gsw-eyebrow">Contract Vehicles</span>
              <h2 style={{ fontSize: 'clamp(22px, 2.5vw, 32px)', fontWeight: 800, color: '#111827', lineHeight: 1.2, marginBottom: 32 }}>
                How to Engage
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {vehicles.map((v) => (
                  <div key={v.name} style={{ padding: '20px 24px', background: '#FFFFFF', border: '1px solid #E5E7EB', borderLeft: '3px solid #A81D37' }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#111827', marginBottom: 6 }}>{v.name}</div>
                    <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7 }}>{v.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="gsw-section-sm" style={{ background: '#111827' }}>
        <div className="gsw-container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px 48px' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 800, color: '#FFFFFF', marginBottom: 10 }}>Ready to discuss your requirements?</h2>
            <p style={{ fontSize: 14, color: '#9CA3AF', margin: 0, lineHeight: 1.7 }}>Download our Capabilities Statement or contact our government solutions team directly.</p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/capabilities" style={{ display: 'inline-flex', alignItems: 'center', padding: '12px 28px', background: '#A81D37', color: '#FFFFFF', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
              View Capabilities
            </Link>
            <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', padding: '11px 28px', border: '1px solid rgba(255,255,255,0.25)', color: '#D1D5DB', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Contact Us
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default GovernmentContracting;
