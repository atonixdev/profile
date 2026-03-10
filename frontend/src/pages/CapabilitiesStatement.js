import React from 'react';
import { Link } from 'react-router-dom';

const CapabilitiesStatement = () => {
  const coreCapabilities = [
    {
      area: 'Software Engineering & Development',
      code: 'NAICS 541511',
      items: [
        'Custom enterprise application development (Python, Django, Node.js, React)',
        'API design, development, and management',
        'Legacy system modernisation and re-platforming',
        'Full-stack product development and delivery',
        'Microservices architecture and event-driven systems',
      ],
    },
    {
      area: 'Cloud Architecture & Infrastructure',
      code: 'NAICS 541512',
      items: [
        'OpenStack private cloud deployment and operations',
        'Kubernetes cluster design, deployment, and management',
        'Hybrid and multi-cloud architecture',
        'Infrastructure as Code (Terraform, Ansible, Pulumi)',
        'Cloud migration planning and execution',
      ],
    },
    {
      area: 'Artificial Intelligence & Automation',
      code: 'NAICS 541519',
      items: [
        'Machine learning model development and deployment',
        'Intelligent process automation and RPA integration',
        'NLP and document intelligence systems',
        'Predictive analytics and decision-support platforms',
        'AI-augmented business workflow design',
      ],
    },
    {
      area: 'Security & Compliance Engineering',
      code: 'NAICS 541519',
      items: [
        'Zero-trust architecture design and implementation',
        'Application security review and penetration testing',
        'Compliance automation (ISO 27001, SOC 2, NIST)',
        'Security monitoring, SIEM integration, and incident response',
        'Secrets management and identity governance',
      ],
    },
    {
      area: 'DevOps & Platform Engineering',
      code: 'NAICS 541512',
      items: [
        'CI/CD pipeline design, implementation, and optimisation',
        'Container registry, image signing, and lifecycle management',
        'Observability, monitoring, and alerting platforms',
        'Automated testing frameworks and quality gates',
        'Platform reliability engineering and SLA management',
      ],
    },
    {
      area: 'Systems Integration & Data Engineering',
      code: 'NAICS 518210',
      items: [
        'Cross-system API gateway and integration hub design',
        'ETL/ELT pipeline development and optimisation',
        'Data warehouse and data lakehouse architecture',
        'Enterprise data governance and cataloguing',
        'Real-time streaming and event-driven data platforms',
      ],
    },
  ];

  const pastPerformance = [
    { title: 'National Digital Infrastructure Platform', sector: 'Government', region: 'West Africa', desc: 'Designed and deployed a sovereign cloud infrastructure serving 12 government ministries with zero-trust security and 99.9% uptime SLA.' },
    { title: 'Enterprise AI Marketing Automation', sector: 'Private Sector', region: 'United States', desc: 'Built ML-powered audience segmentation and campaign automation platform processing over 50 million data points monthly.' },
    { title: 'OpenStack Private Cloud — AI Research Hub', sector: 'Research', region: 'International', desc: 'Delivered high-performance computing infrastructure for AI/ML workloads with GPU orchestration on Kubernetes.' },
    { title: 'FinTech Compliance & Reporting Platform', sector: 'Financial Services', region: 'South Africa', desc: 'Engineered a regulatory reporting engine with multi-country tax logic, real-time compliance validation, and audit trail management.' },
    { title: 'Enterprise DevOps Pipeline Transformation', sector: 'Corporate', region: 'International', desc: 'Implemented full CI/CD automation with zero-downtime blue-green deployments, reducing release cycles by 80%.' },
    { title: 'Secure Enterprise Email Infrastructure', sector: 'Government', region: 'Africa', desc: 'Built and hardened high-availability email infrastructure with custom SMTP, DKIM, SPF, DMARC, and encryption at rest.' },
  ];

  const certifications = [
    'ISO/IEC 27001 Information Security Management (aligned)',
    'SOC 2 Type II readiness (in progress)',
    'OWASP Secure Development Lifecycle practices',
    'NIST Cybersecurity Framework alignment',
    'Kubernetes Administrator certification (team)',
    'AWS Solutions Architect certification (team)',
    'Google Professional Cloud Architect (team)',
  ];

  return (
    <div style={{ background: '#FFFFFF' }}>

      {/* ── Cover Header ── */}
      <section style={{ position: 'relative', background: '#A81D37', overflow: 'hidden', padding: '96px 0 80px' }}>
        <div className="gsw-container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#A81D37', fontFamily: 'var(--font-mono)', marginBottom: 16 }}>
                Capabilities Statement
              </div>
              <h1 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1, marginBottom: 16 }}>
                AtonixDev
              </h1>
              <p style={{ fontSize: 15, color: '#9CA3AF', lineHeight: 1.7, maxWidth: 480, margin: 0 }}>
                Enterprise Software, Cloud & AI Engineering Company
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              {[
                ['UEI', 'Available on Request'],
                ['CAGE Code', 'Available on Request'],
                ['Entity Type', 'Corporation'],
                ['Business Size', 'Small Business'],
                ['SAM.gov', 'Registered'],
              ].map(([label, val]) => (
                <div key={label} style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B7280', fontFamily: 'var(--font-mono)', marginRight: 12 }}>{label}</span>
                  <span style={{ fontSize: 12, color: '#D1D5DB', fontFamily: 'var(--font-mono)' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Company Overview ── */}
      <section className="gsw-section-sm" style={{ background: '#F8F9FA', borderBottom: '1px solid #E5E7EB' }}>
        <div className="gsw-container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px 80px', alignItems: 'start' }}>
            <div>
              <span className="gsw-eyebrow">Company Profile</span>
              <h2 style={{ fontSize: 'clamp(22px, 2.5vw, 30px)', fontWeight: 800, color: '#111827', marginBottom: 16 }}>About AtonixDev</h2>
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, marginBottom: 16 }}>
                AtonixDev is a global enterprise technology company specialising in software engineering,
                cloud infrastructure, artificial intelligence, and security-driven systems delivery.
                We serve governments, corporations, financial institutions, and high-growth organisations
                across the United States, Africa, and Europe.
              </p>
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, margin: 0 }}>
                Our team of senior engineers and architects delivers mission-critical platforms with
                the discipline, security posture, and long-term support obligations that enterprise
                and government clients require.
              </p>
            </div>
            <div>
              <span className="gsw-eyebrow">Contact Information</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  ['Company Name', 'AtonixDev — AtonixCorp'],
                  ['Website', 'atonixdev.com'],
                  ['Primary Contact', 'Government Solutions Team'],
                  ['Email', 'gov@atonixdev.com'],
                  ['Headquarters', 'United States (Remote-First Global)'],
                  ['Service Regions', 'United States, Africa, Europe'],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', gap: 12, padding: '12px 16px', background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9CA3AF', fontFamily: 'var(--font-mono)', minWidth: 140, flexShrink: 0 }}>{label}</span>
                    <span style={{ fontSize: 13, color: '#111827' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="gsw-divider" />

      {/* ── Core Capabilities ── */}
      <section className="gsw-section" style={{ background: '#FFFFFF' }}>
        <div className="gsw-container">
          <span className="gsw-eyebrow">Technical Capabilities</span>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, color: '#111827', lineHeight: 1.12, maxWidth: 600, marginBottom: 56 }}>
            Core Technical Capabilities
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB' }}>
            {coreCapabilities.map((cap) => (
              <div key={cap.area} style={{ background: '#FFFFFF', padding: '32px 28px' }}>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A81D37', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>{cap.code}</div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: 0, lineHeight: 1.3 }}>{cap.area}</h3>
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

      {/* ── Past Performance ── */}
      <section className="gsw-section" style={{ background: '#F8F9FA' }}>
        <div className="gsw-container">
          <span className="gsw-eyebrow">Track Record</span>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, color: '#111827', lineHeight: 1.12, maxWidth: 600, marginBottom: 56 }}>
            Past Performance
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB' }}>
            {pastPerformance.map((p) => (
              <div key={p.title} style={{ background: '#FFFFFF', padding: '28px 32px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px 32px', alignItems: 'start' }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111827', marginBottom: 8, lineHeight: 1.3 }}>{p.title}</h3>
                  <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.75, margin: 0 }}>{p.desc}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A81D37', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{p.sector}</div>
                  <div style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'var(--font-mono)' }}>{p.region}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="gsw-divider" />

      {/* ── Certifications & NAICS ── */}
      <section className="gsw-section" style={{ background: '#FFFFFF' }}>
        <div className="gsw-container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px 80px' }}>
            <div>
              <span className="gsw-eyebrow">Certifications & Standards</span>
              <h2 style={{ fontSize: 'clamp(20px, 2vw, 28px)', fontWeight: 800, color: '#111827', marginBottom: 28 }}>Certifications & Compliance</h2>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {certifications.map((c) => (
                  <li key={c} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#374151', lineHeight: 1.65 }}>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#A81D37', flexShrink: 0, marginTop: 7 }} />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="gsw-eyebrow">Procurement</span>
              <h2 style={{ fontSize: 'clamp(20px, 2vw, 28px)', fontWeight: 800, color: '#111827', marginBottom: 28 }}>Engage AtonixDev</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  ['Sole Source / Direct Award', 'Available for qualifying awards'],
                  ['Subcontract', 'Available as qualified subcontractor'],
                  ['International Direct', 'Multiple jurisdiction experience'],
                  ['GSA Schedule', 'Qualification in progress'],
                ].map(([label, val]) => (
                  <div key={label} style={{ padding: '14px 18px', background: '#F8F9FA', border: '1px solid #E5E7EB', borderLeft: '3px solid #A81D37' }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#111827', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="gsw-section-sm" style={{ background: '#A81D37' }}>
        <div className="gsw-container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px 48px' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 800, color: '#FFFFFF', marginBottom: 10 }}>Ready to engage AtonixDev?</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.7 }}>Contact our government solutions team to discuss requirements, contract vehicles, and procurement options.</p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', padding: '12px 28px', background: '#A81D37', color: '#FFFFFF', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Contact Us
            </Link>
            <Link to="/government" style={{ display: 'inline-flex', alignItems: 'center', padding: '11px 28px', border: '1px solid rgba(255,255,255,0.25)', color: '#D1D5DB', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Government Contracting
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default CapabilitiesStatement;
