import React from 'react';
import { Link } from 'react-router-dom';

// Industries Page — AtonixDev Corporate
const Industries = () => {
  const industries = [
    {
      name: 'Government',
      challenges: 'Legacy infrastructure, siloed data systems, compliance requirements, and the need for sovereign, nationally-controlled technology platforms.',
      solutions: 'National digital platforms, e-government portals, secure data systems, AI-assisted public services, and sovereign infrastructure.',
      technologies: ['OpenStack', 'Kubernetes', 'Django', 'PostgreSQL', 'SIEM', 'Zero-Trust'],
      impact: 'Modernised public services, reduced operational costs, improved compliance, and digitally empowered citizens.',
    },
    {
      name: 'Finance',
      challenges: 'Regulatory compliance, real-time transaction processing, fraud detection, multi-currency operations, and legacy core banking systems.',
      solutions: 'FinTech platforms, tax calculation engines, compliance automation, payment gateways, and financial reporting systems.',
      technologies: ['Python', 'Django', 'PostgreSQL', 'Redis', 'Celery', 'React'],
      impact: 'Faster processing, regulatory compliance, reduced fraud, and improved customer financial outcomes.',
    },
    {
      name: 'Healthcare',
      challenges: 'Patient data security, interoperability between clinical systems, compliance with health data regulations, and operational efficiency.',
      solutions: 'Electronic health record systems, clinical data platforms, patient management portals, and health information exchanges.',
      technologies: ['HL7/FHIR', 'Python', 'PostgreSQL', 'Docker', 'Encryption', 'RBAC'],
      impact: 'Improved patient outcomes, reduced administrative burden, and enhanced clinical decision-making.',
    },
    {
      name: 'Energy',
      challenges: 'Grid management complexity, IoT device integration, real-time monitoring demands, and sustainability reporting requirements.',
      solutions: 'Grid monitoring platforms, IoT integration layers, energy management dashboards, and predictive maintenance systems.',
      technologies: ['IoT Agents', 'MQTT', 'Python', 'React', 'Time-series DB', 'ML'],
      impact: 'Optimised energy distribution, reduced downtime, improved sustainability tracking, and operational cost savings.',
    },
    {
      name: 'Education',
      challenges: 'Fragmented student data, outdated learning management systems, accessibility requirements, and digital skills gaps.',
      solutions: 'Learning management systems, student information platforms, digital assessment tools, and institutional analytics.',
      technologies: ['React', 'Django', 'PostgreSQL', 'WebRTC', 'REST APIs', 'Docker'],
      impact: 'Improved learning outcomes, administrative efficiency, data-driven institutional decisions, and wider access.',
    },
    {
      name: 'Logistics',
      challenges: 'Supply chain visibility, fleet management, real-time tracking, last-mile delivery optimisation, and warehouse efficiency.',
      solutions: 'Fleet tracking systems, warehouse management platforms, supply chain dashboards, and delivery optimisation engines.',
      technologies: ['GPS/IoT', 'Python', 'React', 'PostgreSQL', 'Redis', 'Docker'],
      impact: 'Reduced delivery costs, improved supply chain visibility, lower inventory waste, and enhanced customer satisfaction.',
    },
    {
      name: 'Retail',
      challenges: 'Omnichannel complexity, inventory management, customer personalisation, and competitive digital commerce requirements.',
      solutions: 'E-commerce platforms, inventory management systems, personalisation engines, and POS integrations.',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'AI/ML', 'REST APIs'],
      impact: 'Increased revenue, improved customer retention, operational efficiency, and omnichannel consistency.',
    },
    {
      name: 'Technology',
      challenges: 'Rapid scaling demands, developer productivity, cloud cost management, and platform reliability at scale.',
      solutions: 'SaaS platform engineering, developer tooling, cloud-native architecture, and platform observability systems.',
      technologies: ['Kubernetes', 'Terraform', 'CI/CD', 'Observability', 'Docker', 'Python'],
      impact: 'Faster product delivery, reduced infrastructure costs, improved platform reliability, and developer velocity.',
    },
  ];

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh' }}>

      {/* ── Page Hero ──────────────────────────────────────── */}
      <section style={{ position: 'relative', background: '#FFFFFF', overflow: 'hidden', padding: '120px 0 96px' }}>
        <div className="hero-grid-bg" />
        <div className="hero-accent-bar" />
        <div className="gsw-container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <span className="gsw-eyebrow">Sector Expertise</span>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, color: '#111827', lineHeight: 1.1, maxWidth: 700, margin: '0 auto 24px' }}>
            Industries
          </h1>
          <p style={{ fontSize: 18, color: '#6B7280', lineHeight: 1.7, maxWidth: 600, margin: '0 auto' }}>
            Domain-specific technology delivery across eight critical sectors,
            with deep understanding of each industry's regulatory, operational, and technical requirements.
          </p>
        </div>
      </section>
      <hr className="gsw-divider" />

      {/* Industries List */}
      <section style={{ maxWidth: 1440, margin: '0 auto', padding: '64px 24px 80px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB' }}>
          {industries.map((ind) => (
            <div key={ind.name} style={{ background: '#FFFFFF', padding: '48px 44px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '0 56px' }}>
                {/* Left — Name */}
                <div>
                  <div style={{ width: 28, height: 2, background: '#A81D37', marginBottom: 16 }} />
                  <h2 style={{ fontSize: 24, fontWeight: 900, color: '#111827', letterSpacing: '-0.02em', marginBottom: 0 }}>{ind.name}</h2>
                </div>
                {/* Right — Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 40px' }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9CA3AF', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>Challenges</div>
                    <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.72, margin: 0 }}>{ind.challenges}</p>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9CA3AF', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>Solutions Delivered</div>
                    <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.72, margin: 0 }}>{ind.solutions}</p>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9CA3AF', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>Technologies</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {ind.technologies.map((t) => (
                        <span key={t} style={{ padding: '3px 10px', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', color: '#6B7280', border: '1px solid #E5E7EB', fontFamily: 'var(--font-mono)' }}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9CA3AF', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>Impact</div>
                    <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.72, margin: 0 }}>{ind.impact}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 56, textAlign: 'center' }}>
          <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 28, lineHeight: 1.6 }}>
            Does your sector require a tailored approach?
          </p>
          <Link
            to="/contact"
            style={{
              display: 'inline-flex', alignItems: 'center', padding: '14px 40px',
              background: '#A81D37', color: '#FFFFFF',
              fontWeight: 700, fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase',
              textDecoration: 'none', transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#7A1528'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#A81D37'; }}
          >
            Discuss Your Industry
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Industries;
