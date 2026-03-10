import React from 'react';
import { Link } from 'react-router-dom';

// GS-WSF §5 — Services page
const Services = () => {
  const services = [
    {
      id: 1,
      title: 'Software Engineering & Product Development',
      description: 'AtonixDev builds custom applications, platforms, and digital tools tailored to the unique needs of each client. Clean, maintainable, and scalable codebases that support long-term growth.',
      features: [
        'Custom application development',
        'Full-stack engineering',
        'Backend systems and APIs',
        'User-facing application design',
        'Clean, maintainable codebases',
        'Scalable architecture solutions',
      ],
    },
    {
      id: 2,
      title: 'AI-Driven Automation & Intelligence',
      description: 'We integrate artificial intelligence into business workflows, enabling smarter decision-making, automated processes, and intelligent data analysis with high-impact implementations.',
      features: [
        'AI-powered workflow automation',
        'Intelligent data analysis',
        'Smart decision-making systems',
        'Automated business processes',
        'Machine learning integration',
        'Efficiency optimization',
      ],
    },
    {
      id: 3,
      title: 'Technical Architecture & Systems Design',
      description: 'Expert architectural planning for complex systems — from databases to user interfaces — harmonized, secure, and optimized for performance across enterprise-grade infrastructure.',
      features: [
        'Complex systems architecture',
        'Database design and optimization',
        'Multi-country logic implementation',
        'Financial engine design',
        'Enterprise-grade infrastructure',
        'Security hardening',
      ],
    },
    {
      id: 4,
      title: 'FinTech Engineering & Financial Logic',
      description: 'Deep expertise in financial systems: tax calculations, multi-currency logic, compliance workflows, and financial reporting with precision, transparency, and regulatory alignment.',
      features: [
        'Tax calculation systems',
        'Multi-currency logic',
        'Compliance workflow automation',
        'Financial reporting platforms',
        'Regulatory alignment',
        'Transparent financial insights',
      ],
    },
    {
      id: 5,
      title: 'Strategic Consulting & Dev-Ready Specifications',
      description: 'We help businesses clarify product vision, define technical requirements, and create detailed documentation that developers can execute — reducing time, cost, and error.',
      features: [
        'Product vision clarification',
        'Technical requirement definition',
        'Detailed documentation creation',
        'Developer-ready specifications',
        'Cross-team alignment',
        'Error prevention strategies',
      ],
    },
  ];

  return (
    <div style={{ background: '#FFFFFF' }}>

      {/* ── Page Hero ──────────────────────────────────────── */}
      <section style={{ position: 'relative', background: '#FFFFFF', overflow: 'hidden', padding: '80px 0 96px' }}>
        <div className="hero-grid-bg" />
        <div className="hero-accent-bar" />
        <div className="gsw-container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <span className="gsw-eyebrow">What We Offer</span>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, color: '#111827', lineHeight: 1.1, maxWidth: 700, margin: '0 auto 24px' }}>
            AtonixDev Services
          </h1>
          <p style={{ fontSize: 18, color: '#6B7280', lineHeight: 1.7, maxWidth: 600, margin: '0 auto 40px' }}>
            Specializing in custom software development, full-stack engineering, AI-driven automation,
            and technical architecture for complex platforms.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['Custom Software', 'AI Automation', 'Future-Proof Architecture'].map((t) => (
              <span key={t} className="gsw-tag">{t}</span>
            ))}
          </div>
        </div>
      </section>

      <hr className="gsw-divider" />

      {/* ── Mission bar ────────────────────────────────────── */}
      <section style={{ background: '#F8F9FA', padding: '48px 0', borderBottom: '1px solid #F3F4F6' }}>
        <div className="gsw-container">
          <div style={{ maxWidth: 700 }}>
            <span className="gsw-eyebrow">Our Mission</span>
            <p style={{ fontSize: 18, color: '#374151', lineHeight: 1.7 }}>
              Building intelligent, scalable, and future-proof digital systems. At our core, AtonixDev
              believes technology should not merely solve problems — it should create new possibilities.
            </p>
          </div>
        </div>
      </section>

      {/* ── Services Grid ──────────────────────────────────── */}
      <section className="gsw-section" style={{ background: '#FFFFFF' }}>
        <div className="gsw-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {services.map((service) => (
              <div key={service.id} className="gsw-card" style={{ padding: 0 }}>
                <div style={{ padding: '32px 32px 24px' }}>
                  <div style={{ width: 40, height: 2, background: '#A81D37', marginBottom: 24 }} />
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 12, lineHeight: 1.4 }}>
                    {service.title}
                  </h3>
                  <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.8, marginBottom: 24 }}>
                    {service.description}
                  </p>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {service.features.map((f) => (
                      <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#374151' }}>
                        <span style={{ color: '#A81D37', flexShrink: 0, marginTop: 2, fontWeight: 700 }}>—</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ padding: '20px 32px', borderTop: '1px solid #F3F4F6' }}>
                  <Link
                    to="/contact"
                    onClick={() => {
                      sessionStorage.setItem('selectedInquiryType', 'quote');
                      sessionStorage.setItem('selectedService', service.title);
                    }}
                    className="gsw-btn gsw-btn-accent"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Request Quote
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Bar ────────────────────────────────────────── */}
      <section className="gsw-cta-bar">
        <div className="gsw-container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: '#111827', marginBottom: 12, marginTop: 0 }}>
            Ready to Build Intelligent Digital Systems?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Get a detailed consultation for your software development, AI automation, or technical architecture needs.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/contact"
              onClick={() => sessionStorage.setItem('selectedInquiryType', 'consultation')}
              style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '14px 36px', background: '#FFFFFF', color: '#A81D37',
                fontWeight: 800, fontSize: 12, letterSpacing: '0.1em',
                textTransform: 'uppercase', textDecoration: 'none',
              }}
            >
              Get Free Consultation
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Services;
