import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { profileService, projectService, testimonialService, serviceService } from '../services';
import InteractiveProjects from '../components/InteractiveProjects';

// GS-WSF §4 Hero + §5 Component Library — Home page
const Home = () => {
  const [profile, setProfile] = useState(null);
  const [featuredTestimonials, setFeaturedTestimonials] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const normalizeList = (data) => {
    const list = data?.results ?? data;
    return Array.isArray(list) ? list : [];
  };

  const normalizeSkills = (skills) => {
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string') return skills.split(',').map((s) => s.trim()).filter(Boolean);
    return [];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, , testimonialsRes, servicesRes] = await Promise.all([
          profileService.getPublicProfile(),
          projectService.getFeatured(),
          testimonialService.getFeatured(),
          serviceService.getAll(),
        ]);
        const safeProfile = profileRes?.data || null;
        if (safeProfile && typeof safeProfile === 'object') {
          safeProfile.skills = normalizeSkills(safeProfile.skills);
        }
        setProfile(safeProfile);
        const testimonialsData = normalizeList(testimonialsRes?.data);
        setFeaturedTestimonials(testimonialsData.slice(0, 3));
        const servicesData = normalizeList(servicesRes?.data);
        setServices(servicesData.slice(0, 4));
      } catch {
        setProfile(null);
        setFeaturedTestimonials([]);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="gsw-loading">Loading AtonixDev&hellip;</div>;
  }

  const expertise = [
    { label: 'Software Engineering', detail: 'Custom Development & Full-Stack' },
    { label: 'AI Automation', detail: 'Intelligent Systems & ML Pipelines' },
    { label: 'FinTech Engineering', detail: 'Financial Platforms & Tax Logic' },
    { label: 'Cloud Architecture', detail: 'OpenStack, Kubernetes, DevOps' },
    { label: 'Technical Architecture', detail: 'Systems Design & Infrastructure' },
    { label: 'Sovereign Infrastructure', detail: 'Africa & Emerging Markets' },
  ];

  const stats = [
    { value: '8+',   label: 'Years Experience' },
    { value: '50+',  label: 'Projects Completed' },
    { value: '100%', label: 'Client Satisfaction' },
    { value: '24/7', label: 'Production Support' },
  ];

  return (
    <div style={{ background: '#FFFFFF' }}>

      {/* ── §4 Hero Section ────────────────────────────────── */}
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
        {/* Engineering grid */}
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 0,
            backgroundImage: `
              linear-gradient(rgba(168,29,55,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(168,29,55,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Top accent bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: '#A81D37', zIndex: 2 }} />
        {/* Radial glow */}
        <div
          style={{
            position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
            width: 900, height: 600,
            background: 'radial-gradient(ellipse at center, rgba(168,29,55,0.06) 0%, transparent 68%)',
            zIndex: 0, pointerEvents: 'none',
          }}
        />

        <div className="gsw-container" style={{ position: 'relative', zIndex: 1, padding: '72px 24px 48px', textAlign: 'center' }}>

          {/* Eyebrow badge */}
          <div
            className="anim-fade-up"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 28,
              padding: '9px 20px',
              border: '1px solid rgba(168,29,55,0.35)',
              background: 'rgba(168,29,55,0.07)',
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#A81D37', flexShrink: 0 }} />
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'rgba(0,0,0,0.45)',
              fontFamily: 'var(--font-mono)',
            }}>
              Enterprise Software Engineering · AtonixCorp
            </span>
          </div>

          {/* Headline */}
          <h1
            className="anim-fade-up anim-delay-1"
            style={{
              fontSize: 'clamp(36px, 5.5vw, 68px)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              marginBottom: 24,
              textAlign: 'center',
            }}
          >
            <span style={{ display: 'block', color: '#111827' }}>Building Intelligent</span>
            <span style={{ display: 'block', color: '#A81D37' }}>Digital Systems</span>
          </h1>

          {/* Subtext */}
          <p
            className="anim-fade-up anim-delay-2"
            style={{
              fontSize: 'clamp(14px, 1.4vw, 17px)',
              color: '#6B7280',
              lineHeight: 1.65,
              maxWidth: 560,
              margin: '0 auto 36px',
            }}
          >
            A high-precision software engineering and technology architecture company
            specializing in scalable, sovereign, and future-proof digital systems.
          </p>

          {/* CTAs */}
          <div
            className="anim-fade-up anim-delay-3"
            style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}
          >
            <Link
              to="/contact"
              style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '13px 36px',
                background: '#A81D37',
                color: '#FFFFFF',
                fontWeight: 700, fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#7A1528'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#A81D37'; }}
            >
              Start a Project
            </Link>
            <Link
              to="/infrastructure"
              style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '13px 36px',
                background: 'transparent',
                color: '#111827',
                fontWeight: 700, fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase',
                textDecoration: 'none',
                border: '1px solid #D1D5DB',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#A81D37'; e.currentTarget.style.color = '#A81D37'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.color = '#111827'; }}
            >
              View Infrastructure
            </Link>
          </div>

          {/* Stats — integrated inside hero */}
          <div
            className="anim-fade-up anim-delay-4"
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
              borderTop: '1px solid #E5E7EB',
              borderLeft: '1px solid #E5E7EB',
              maxWidth: 720, margin: '0 auto 40px',
            }}
          >
            {stats.map((s) => (
              <div
                key={s.label}
                style={{
                  padding: '22px 16px',
                  borderRight: '1px solid #E5E7EB',
                  borderBottom: '1px solid #E5E7EB',
                  textAlign: 'center',
                }}
              >
                <div style={{
                  fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 900,
                  color: '#111827', letterSpacing: '-0.02em', marginBottom: 4,
                }}>
                  {s.value}
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: '#9CA3AF',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Expertise pills */}
          <div
            className="anim-fade-up anim-delay-5"
            style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}
          >
            {expertise.map((e) => (
              <span
                key={e.label}
                style={{
                  display: 'inline-block',
                  padding: '6px 14px',
                  fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#6B7280',
                  border: '1px solid #E5E7EB',
                  background: 'transparent',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {e.label}
              </span>
            ))}
          </div>

        </div>
      </section>

      {/* ── Services / What We Build ───────────────────────── */}
      <section className="gsw-section" style={{ background: '#FFFFFF' }}>
        <div className="gsw-container">
          <div style={{ marginBottom: 64 }}>
            <span className="gsw-eyebrow">What We Build</span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#111827', maxWidth: 600, lineHeight: 1.2 }}>
              Enterprise-Grade Solutions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(services.length > 0 ? services : [
              { id: 1, title: 'Software Engineering & Product Development', description: 'Custom applications, platforms, and digital tools built with clean, maintainable, and scalable codebases.' },
              { id: 2, title: 'AI-Driven Automation & Intelligence', description: 'Integrate AI into workflows for smarter decision-making, automated processes, and intelligent data analysis.' },
              { id: 3, title: 'Technical Architecture & Systems Design', description: 'Expert architectural planning for complex systems — databases, UIs, financial engines, enterprise infrastructure.' },
              { id: 4, title: 'FinTech Engineering & Financial Logic', description: 'Tax calculations, multi-currency logic, compliance workflows, and financial reporting platforms.' },
            ]).map((service) => (
              <div key={service.id} className="gsw-card" style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    width: 36, height: 3, background: '#A81D37', marginBottom: 24, flexShrink: 0,
                  }}
                />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 12, lineHeight: 1.4 }}>
                  {service.title}
                </h3>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7, marginBottom: 24, flexGrow: 1 }}>
                  {service.description}
                </p>
                <Link
                  to="/services"
                  style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A81D37', textDecoration: 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#111827'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#A81D37'; }}
                >
                  Learn More →
                </Link>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 48, display: 'flex', justifyContent: 'center' }}>
            <Link to="/services" className="gsw-btn gsw-btn-ghost">
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured Projects ──────────────────────────────── */}
      <section className="gsw-section" style={{ background: '#F8F9FA', borderTop: '1px solid #F3F4F6' }}>
        <div className="gsw-container">
          <div style={{ marginBottom: 64, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span className="gsw-eyebrow">Infrastructure</span>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>
                Featured Projects
              </h2>
            </div>
            <Link to="/infrastructure" className="gsw-btn gsw-btn-dark" style={{ flexShrink: 0 }}>
              View All Work
            </Link>
          </div>
          <InteractiveProjects limit={6} showViewAll={false} />
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────── */}
      {featuredTestimonials.length > 0 && (
        <section className="gsw-section" style={{ background: '#FFFFFF', borderTop: '1px solid #F3F4F6' }}>
          <div className="gsw-container">
            <div style={{ marginBottom: 64 }}>
              <span className="gsw-eyebrow">Client Results</span>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>
                What Clients Say
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredTestimonials.map((t) => (
                <div key={t.id} className="gsw-testimonial">
                  <div style={{ fontSize: 32, color: '#A81D37', marginBottom: 16, lineHeight: 1 }}>&ldquo;</div>
                  <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, marginBottom: 24 }}>
                    {t.content}
                  </p>
                  <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{t.client_name}</div>
                    {t.client_title && (
                      <div style={{ fontSize: 12, color: '#6B7280' }}>{t.client_title}</div>
                    )}
                    {t.client_company && (
                      <div style={{ fontSize: 12, color: '#A81D37', marginTop: 2 }}>{t.client_company}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 48, display: 'flex', justifyContent: 'center' }}>
              <Link to="/testimonials" className="gsw-btn gsw-btn-ghost">
                Read All Testimonials
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Skills ─────────────────────────────────────────── */}
      {profile?.skills && profile.skills.length > 0 && (
        <section className="gsw-section-sm" style={{ background: '#F8F9FA', borderTop: '1px solid #F3F4F6' }}>
          <div className="gsw-container">
            <div style={{ marginBottom: 32, textAlign: 'center' }}>
              <span className="gsw-eyebrow">Tech Stack</span>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: '#111827' }}>Skills &amp; Expertise</h2>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {profile.skills.map((skill, i) => (
                <span key={i} className="gsw-tag">{skill}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA Bar ────────────────────────────────────────── */}
      <section className="gsw-cta-bar">
        <div className="gsw-container" style={{ textAlign: 'center' }}>
          <span className="gsw-eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Get Started</span>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#111827', marginBottom: 16, marginTop: 0 }}>
            Ready to Build Intelligent Systems?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Get a detailed consultation for your software engineering, AI automation, or infrastructure needs.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/contact"
              onClick={() => sessionStorage.setItem('selectedInquiryType', 'consultation')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 36px', background: '#FFFFFF', color: '#A81D37',
                fontWeight: 800, fontSize: 12, letterSpacing: '0.1em',
                textTransform: 'uppercase', textDecoration: 'none',
              }}
            >
              Get Free Consultation
            </Link>
            <Link
              to="/infrastructure"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 36px', background: 'transparent', color: '#111827',
                fontWeight: 800, fontSize: 12, letterSpacing: '0.1em',
                textTransform: 'uppercase', textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.4)',
              }}
            >
              View Infrastructure
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
