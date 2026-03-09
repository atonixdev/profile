import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { profileService } from '../services';

// GS-WSF §5 — About page
const About = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileService.getPublicProfile()
      .then((r) => setProfile(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="gsw-loading">Loading&hellip;</div>;
  }

  const philosophy = [
    { title: 'Sovereign Technology',   desc: 'Building infrastructure that gives organizations true control over their data and systems.' },
    { title: 'Intelligent Automation', desc: 'Leveraging AI and machine learning to solve complex challenges efficiently.' },
    { title: 'Scalable Architecture',  desc: 'Designing systems that grow with your business without compromising performance.' },
    { title: 'Developer Excellence',   desc: 'Creating platforms and tools that empower developers to do their best work.' },
  ];

  const specializations = [
    {
      title: 'Cloud Infrastructure',
      items: ['OpenStack', 'AWS', 'Kubernetes', 'Ceph', 'OVN', 'Multi-cloud', 'High-availability', 'Disaster Recovery', 'CDN & Edge', 'Load Balancing'],
    },
    {
      title: 'AI & Machine Learning',
      items: ['TensorFlow', 'PyTorch', 'LLM Integration', 'MLOps', 'GPU Acceleration', 'RAG', 'Vector Databases', 'Distributed Training', 'NLP', 'Computer Vision'],
    },
    {
      title: 'DevOps & CI/CD',
      items: ['Jenkins', 'GitLab CI', 'Docker', 'Terraform', 'Ansible', 'ArgoCD', 'GitOps', 'Prometheus', 'Grafana', 'ELK Stack'],
    },
    {
      title: 'Full-Stack Development',
      items: ['React', 'Next.js', 'Django', 'FastAPI', 'PostgreSQL', 'Redis', 'GraphQL', 'REST APIs', 'TypeScript', 'Microservices'],
    },
    {
      title: 'IoT & Embedded Systems',
      items: ['Raspberry Pi', 'Arduino', 'MQTT', 'LoRaWAN', 'Edge Computing', 'FreeRTOS', 'Embedded Linux', 'TinyML', 'Industrial IoT', 'BLE'],
    },
    {
      title: 'Security & Compliance',
      items: ['Zero Trust', 'OWASP', 'OAuth & JWT', 'GDPR / HIPAA', 'PCI-DSS', 'DevSecOps', 'Penetration Testing', 'SIEM', 'WAF', 'Secret Management'],
    },
  ];

  return (
    <div style={{ background: '#FFFFFF' }}>

      {/* ── Page Hero ──────────────────────────────────────── */}
      <section
        style={{ position: 'relative', background: '#FFFFFF', overflow: 'hidden', padding: '120px 0 96px' }}
      >
        <div className="hero-grid-bg" />
        <div className="hero-accent-bar" />
        <div className="gsw-container" style={{ position: 'relative', zIndex: 1 }}>
          <span className="gsw-eyebrow">About AtonixDev</span>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, color: '#111827', lineHeight: 1.1, maxWidth: 700, marginBottom: 24 }}>
            Engineering Intelligence<br />
            <span style={{ color: '#DC2626' }}>for the Next Decade</span>
          </h1>
          <p style={{ fontSize: 18, color: '#6B7280', lineHeight: 1.7, maxWidth: 600, marginBottom: 0 }}>
            A modern, high-precision software engineering and technology architecture company
            founded by visionary technical architect Samuel Realm. Operating at the intersection
            of advanced software development, AI-driven automation, and financial technology innovation.
          </p>
        </div>
      </section>

      <hr className="gsw-divider" />

      {/* ── Profile ────────────────────────────────────────── */}
      <section className="gsw-section" style={{ background: '#FFFFFF' }}>
        <div className="gsw-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Avatar + info */}
            <div>
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.full_name}
                  style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', border: '1px solid #E5E7EB' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%', aspectRatio: '1',
                    background: '#DC2626',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 72, fontWeight: 800, color: '#111827',
                  }}
                >
                  {profile?.full_name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
              )}
              <div style={{ marginTop: 32, borderTop: '1px solid #E5E7EB', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {profile?.location && (
                  <div>
                    <span className="gsw-label" style={{ marginBottom: 4 }}>Location</span>
                    <span style={{ color: '#374151', fontSize: 14 }}>{profile.location}</span>
                  </div>
                )}
                {profile?.email && (
                  <div>
                    <span className="gsw-label" style={{ marginBottom: 4 }}>Email</span>
                    <a href={`mailto:${profile.email}`} style={{ color: '#DC2626', fontSize: 14 }}>{profile.email}</a>
                  </div>
                )}
                {profile?.phone && (
                  <div>
                    <span className="gsw-label" style={{ marginBottom: 4 }}>Phone</span>
                    <a href={`tel:${profile.phone}`} style={{ color: '#374151', fontSize: 14 }}>{profile.phone}</a>
                  </div>
                )}
              </div>
            </div>

            {/* Bio + stats */}
            <div className="lg:col-span-2">
              <div style={{ marginBottom: 8 }}>
                <span className="gsw-eyebrow">Principal Architect</span>
              </div>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
                {profile?.full_name || 'Samuel Realm'}
              </h2>
              <p style={{ fontSize: 16, color: '#DC2626', fontWeight: 600, marginBottom: 24 }}>
                {profile?.title || 'Technical Innovator & Systems Architect'}
              </p>
              <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.8, marginBottom: 40 }}>
                {profile?.bio || 'Building sovereign infrastructure and intelligent systems for Africa and the global market. Specializing in custom software development, full-stack engineering, AI-driven automation, and complex technical architecture.'}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6" style={{ marginBottom: 40 }}>
                {[['8+', 'Years Experience'], ['50+', 'Projects Delivered'], ['Global', 'Market Reach']].map(([v, l]) => (
                  <div key={l} className="gsw-stat">
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#111827', marginBottom: 4 }}>{v}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B7280' }}>{l}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/services" className="gsw-btn gsw-btn-accent">View Services</Link>
                <Link to="/portfolio" className="gsw-btn gsw-btn-outline">Explore Work</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="gsw-divider" />

      {/* ── Core Philosophy ────────────────────────────────── */}
      <section className="gsw-section" style={{ background: '#F8F9FA' }}>
        <div className="gsw-container">
          <div style={{ marginBottom: 64 }}>
            <span className="gsw-eyebrow">Our Foundation</span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>
              Core Philosophy
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {philosophy.map((p, i) => (
              <div key={i} className="gsw-card" style={{ padding: 32 }}>
                <div style={{ width: 40, height: 2, background: '#DC2626', marginBottom: 24 }} />
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 12 }}>{p.title}</h3>
                <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="gsw-divider" />

      {/* ── Specializations ────────────────────────────────── */}
      <section className="gsw-section" style={{ background: '#FFFFFF' }}>
        <div className="gsw-container">
          <div style={{ marginBottom: 64 }}>
            <span className="gsw-eyebrow">Technical Depth</span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>
              Specializations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specializations.map((spec) => (
              <div key={spec.title} className="gsw-card" style={{ padding: 32 }}>
                <h3
                  style={{
                    fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: '#DC2626', marginBottom: 20,
                    borderBottom: '1px solid #E5E7EB', paddingBottom: 16,
                  }}
                >
                  {spec.title}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {spec.items.map((item) => (
                    <span key={item} className="gsw-tag">{item}</span>
                  ))}
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
            Ready to Work Together?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Let's build intelligent, scalable, and future-proof systems for your business.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/contact"
              style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '14px 36px', background: '#FFFFFF', color: '#DC2626',
                fontWeight: 800, fontSize: 12, letterSpacing: '0.1em',
                textTransform: 'uppercase', textDecoration: 'none',
              }}
            >
              Get in Touch
            </Link>
            <Link
              to="/services"
              style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '14px 36px', background: 'transparent', color: '#111827',
                fontWeight: 800, fontSize: 12, letterSpacing: '0.1em',
                textTransform: 'uppercase', textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.4)',
              }}
            >
              View Services
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
