import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testimonialService } from '../services';

// Corporate Homepage — AtonixDev Enterprise Technology Company
const Home = () => {
  const [featuredTestimonials, setFeaturedTestimonials] = useState([]);

  useEffect(() => {
    testimonialService.getFeatured()
      .then((res) => {
        const data = res?.data?.results ?? res?.data;
        setFeaturedTestimonials(Array.isArray(data) ? data.slice(0, 3) : []);
      })
      .catch(() => setFeaturedTestimonials([]));
  }, []);

  const capabilities = [
    { title: 'Artificial Intelligence', desc: 'Production-grade ML pipelines, intelligent automation, NLP, and AI-driven decision systems for enterprise environments.' },
    { title: 'Data & Analytics', desc: 'Real-time data platforms, BI dashboards, data warehousing, ETL pipelines, and analytics infrastructure.' },
    { title: 'DevOps & Automation', desc: 'CI/CD pipelines, infrastructure-as-code, Kubernetes orchestration, and end-to-end release engineering.' },
    { title: 'Security', desc: 'Zero-trust architecture, IAM, application security, compliance automation, and secure SDLC practices.' },
    { title: 'Business Management Systems', desc: 'ERP integrations, workflow automation, CRM platforms, financial management, and enterprise resource planning.' },
    { title: 'Integration', desc: 'API gateway design, microservices, event-driven systems, SaaS integrations, and middleware platforms.' },
    { title: 'Cloud', desc: 'Multi-cloud strategy, OpenStack deployments, cloud-native architecture, cost optimisation, and hybrid infrastructure.' },
    { title: 'Storage', desc: 'Distributed storage, object storage, database architecture, backup, disaster recovery, and high-availability data layers.' },
  ];

  const industries = [
    { name: 'Government', desc: 'National platforms, public sector digitisation, and sovereign infrastructure.' },
    { name: 'Finance', desc: 'FinTech, banking systems, tax platforms, and multi-currency financial engines.' },
    { name: 'Healthcare', desc: 'Clinical data systems, patient management, and health information platforms.' },
    { name: 'Energy', desc: 'Grid management, IoT-driven monitoring, and energy infrastructure platforms.' },
    { name: 'Education', desc: 'Learning management systems, student data platforms, and academic infrastructure.' },
    { name: 'Logistics', desc: 'Fleet tracking, supply chain visibility, and warehouse management systems.' },
    { name: 'Retail', desc: 'E-commerce platforms, inventory systems, and omnichannel digital commerce.' },
    { name: 'Technology', desc: 'SaaS platforms, developer tools, cloud services, and technology infrastructure.' },
  ];

  return (
    <div style={{ background: '#FFFFFF' }}>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          background: '#FFFFFF',
          overflow: 'hidden',
          minHeight: '72vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="gsw-container" style={{ position: 'relative', zIndex: 1, padding: '72px 24px 32px', textAlign: 'center' }}>

          <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 44px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 24, textAlign: 'center' }}>
            <span style={{ display: 'block', color: '#111827' }}>Engineering the Future of Cloud,</span>
            <span style={{ display: 'block', color: '#A81D37' }}>Automation, and Intelligent Infrastructure.</span>
          </h1>

          <p style={{ fontSize: 'clamp(14px, 1.4vw, 18px)', color: '#4B5563', lineHeight: 1.7, maxWidth: 640, margin: '0 auto 36px' }}>
            Delivering secure, scalable, and intelligent technology solutions for governments,
            enterprises, and global organisations across software, cloud, AI, and infrastructure.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            <Link
              to="/contact"
              style={{
                display: 'inline-flex', alignItems: 'center', padding: '13px 36px',
                background: '#A81D37', color: '#FFFFFF',
                fontWeight: 700, fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase',
                textDecoration: 'none', transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#7A1528'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#A81D37'; }}
            >
              Request a Proposal
            </Link>
            <Link
              to="/solutions"
              style={{
                display: 'inline-flex', alignItems: 'center', padding: '13px 36px',
                background: 'transparent', color: '#111827',
                fontWeight: 700, fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase',
                textDecoration: 'none', border: '1px solid #D1D5DB', transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#A81D37'; e.currentTarget.style.color = '#A81D37'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.color = '#111827'; }}
            >
              Explore Solutions
            </Link>
          </div>
        </div>
      </section>

      {/* ── Core Capabilities ──────────────────────────────── */}
      <section className="gsw-section" style={{ background: '#F8F9FA', borderTop: '1px solid #E5E7EB', paddingTop: 64, paddingBottom: 120 }}>
        <div className="gsw-container">
          <div style={{ marginBottom: 56, textAlign: 'center' }}>
            <span className="gsw-eyebrow">Core Capabilities</span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>
              Eight Technology Domains
            </h2>
            <p style={{ fontSize: 16, color: '#4B5563', maxWidth: 560, margin: '12px auto 0', lineHeight: 1.65 }}>
              End-to-end enterprise technology delivery across every critical domain.
            </p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB',
          }}>
            {capabilities.map((c) => (
              <div key={c.title} style={{ background: '#FFFFFF', padding: '32px 28px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: 28, height: 2, background: '#A81D37', marginBottom: 20, flexShrink: 0 }} />
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111827', marginBottom: 10, lineHeight: 1.3 }}>{c.title}</h3>
                <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.7, flexGrow: 1 }}>{c.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <Link to="/software" style={{
              display: 'inline-flex', alignItems: 'center', padding: '12px 32px',
              border: '1px solid #D1D5DB', color: '#111827',
              fontWeight: 700, fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase',
              textDecoration: 'none', transition: 'border-color 0.2s, color 0.2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#A81D37'; e.currentTarget.style.color = '#A81D37'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.color = '#111827'; }}
            >
              View Full Software Catalog →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Industries ─────────────────────────────────────── */}
      <section className="gsw-section" style={{ background: '#FFFFFF', borderTop: '1px solid #E5E7EB' }}>
        <div className="gsw-container">
          <div style={{ marginBottom: 56, textAlign: 'center' }}>
            <span className="gsw-eyebrow">Industries Served</span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>
              Sector Expertise
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {industries.map((ind) => (
              <div key={ind.name} style={{ padding: '28px 24px', border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#111827', marginBottom: 8 }}>{ind.name}</div>
                <p style={{ fontSize: 12, color: '#4B5563', lineHeight: 1.65, margin: 0 }}>{ind.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <Link to="/industries" style={{
              display: 'inline-flex', alignItems: 'center', padding: '12px 32px',
              border: '1px solid #D1D5DB', color: '#111827',
              fontWeight: 700, fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase',
              textDecoration: 'none', transition: 'border-color 0.2s, color 0.2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#A81D37'; e.currentTarget.style.color = '#A81D37'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.color = '#111827'; }}
            >
              Explore All Industries →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust & Compliance ─────────────────────────────── */}
      <section style={{ background: '#F8F9FA', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', padding: '56px 24px' }}>
        <div className="gsw-container">
          <div style={{ marginBottom: 40, textAlign: 'center' }}>
            <span className="gsw-eyebrow">Trust & Compliance</span>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>
              Enterprise-Grade Security Standards
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'End-to-End Encryption', sub: 'Data in transit & at rest' },
              { label: 'Zero-Trust Architecture', sub: 'Identity-verified access' },
              { label: 'Compliance Frameworks', sub: 'GDPR, ISO, POPIA-aligned' },
              { label: 'SLA Guarantees', sub: '99.9% uptime commitment' },
              { label: 'Secure SDLC', sub: 'Security-first development' },
            ].map((item) => (
              <div key={item.label} style={{ padding: '24px 20px', border: '1px solid #E5E7EB', background: '#FFFFFF', textAlign: 'center' }}>
                <div style={{ width: 20, height: 2, background: '#A81D37', margin: '0 auto 16px' }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 6, lineHeight: 1.3 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: '#4B5563', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────── */}
      {featuredTestimonials.length > 0 && (
        <section className="gsw-section" style={{ background: '#FFFFFF', borderTop: '1px solid #E5E7EB' }}>
          <div className="gsw-container">
            <div style={{ marginBottom: 56, textAlign: 'center' }}>
              <span className="gsw-eyebrow">Client Results</span>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>
                What Our Clients Say
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredTestimonials.map((t) => (
                <div key={t.id} className="gsw-testimonial">
                  <div style={{ fontSize: 32, color: '#A81D37', marginBottom: 16, lineHeight: 1 }}>&ldquo;</div>
                  <p style={{ fontSize: 14, color: '#1F2937', lineHeight: 1.8, marginBottom: 24 }}>{t.content}</p>
                  <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{t.client_name}</div>
                    {t.client_title && <div style={{ fontSize: 12, color: '#4B5563' }}>{t.client_title}</div>}
                    {t.client_company && <div style={{ fontSize: 12, color: '#A81D37', marginTop: 2 }}>{t.client_company}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ────────────────────────────────────────────── */}
      <section style={{ background: '#A81D37', padding: '72px 24px', textAlign: 'center' }}>
        <div className="gsw-container">
          <span style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)', marginBottom: 20 }}>
            Enterprise Engagements
          </span>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#FFFFFF', marginBottom: 16, letterSpacing: '-0.02em' }}>
            Ready to Build at Enterprise Scale?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.65 }}>
            Request a formal proposal or book a consultation with our engineering team.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/contact"
              onClick={() => sessionStorage.setItem('selectedInquiryType', 'proposal')}
              style={{
                display: 'inline-flex', alignItems: 'center', padding: '14px 40px',
                background: '#FFFFFF', color: '#A81D37',
                fontWeight: 700, fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase',
                textDecoration: 'none', transition: 'background 0.2s, color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F3F5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
            >
              Request a Proposal
            </Link>
            <Link
              to="/contact"
              onClick={() => sessionStorage.setItem('selectedInquiryType', 'consultation')}
              style={{
                display: 'inline-flex', alignItems: 'center', padding: '14px 40px',
                background: 'transparent', color: '#FFFFFF',
                fontWeight: 700, fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase',
                textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
            >
              Book a Consultation
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
