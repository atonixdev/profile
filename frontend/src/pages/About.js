import React from 'react';
import { Link } from 'react-router-dom';

// GS-WSF §5 — About page (Corporate)
const About = () => {
  const identity = [
    'Software Engineering',
    'Cloud & Infrastructure',
    'Artificial Intelligence',
    'DevOps & Automation',
    'Security & Compliance',
    'Data & Analytics',
    'Integration Systems',
    'Enterprise & Government Solutions',
  ];

  const values = [
    {
      title: 'Engineering Excellence',
      desc: 'We build with discipline, precision, and global-standard quality across every engagement.',
    },
    {
      title: 'Security First',
      desc: 'Every system is designed with enterprise-grade and government-grade security principles from the ground up.',
    },
    {
      title: 'Integrity & Transparency',
      desc: 'We operate with honesty, clarity, and accountability in every client and partner engagement.',
    },
    {
      title: 'Innovation with Purpose',
      desc: 'We apply AI, automation, and modern cloud technologies to solve real problems — not to chase trends.',
    },
    {
      title: 'Long-Term Partnership',
      desc: 'We support our clients beyond delivery, ensuring stability, performance, and continuous improvement.',
    },
  ];

  const industries = [
    'Government Agencies',
    'Large Enterprises',
    'Financial Institutions',
    'Healthcare Organizations',
    'Energy & Infrastructure',
    'Educational Institutions',
    'Logistics & Supply Chain',
    'Technology Startups',
  ];

  const regions = [
    { region: 'United States',  desc: 'Enterprise and government engagements across federal and state sectors.' },
    { region: 'Africa',         desc: 'National-scale digital transformation and sovereign infrastructure delivery.' },
    { region: 'Europe',         desc: 'Cross-border enterprise software and compliance-aligned solutions.' },
    { region: 'Asia',           desc: 'Technology integration and cloud architecture for high-growth markets.' },
  ];

  const methodology = [
    { step: '01', title: 'Discovery & Requirements',        desc: 'Deep stakeholder analysis and technical specification.' },
    { step: '02', title: 'Architecture & System Design',    desc: 'Enterprise-grade blueprints built for scale and security.' },
    { step: '03', title: 'Development & Integration',       desc: 'Disciplined engineering with continuous code quality standards.' },
    { step: '04', title: 'Security & Compliance Review',    desc: 'Government and enterprise security validation at every layer.' },
    { step: '05', title: 'Testing & Quality Assurance',     desc: 'Comprehensive automated and manual testing protocols.' },
    { step: '06', title: 'Deployment & Automation',         desc: 'CI/CD pipelines and zero-downtime production releases.' },
    { step: '07', title: 'Monitoring & Continuous Improvement', desc: '24/7 observability, alerting, and iterative optimisation.' },
  ];

  const reasons = [
    'Enterprise-grade engineering',
    'Government-level security',
    'Proven architecture expertise',
    'Modern cloud and AI capabilities',
    'End-to-end delivery model',
    'Transparent communication',
    'Long-term support and maintenance',
    'Global presence and cross-regional experience',
  ];

  return (
    <div style={{ background: '#FFFFFF' }}>

      {/* ── S1: Hero ──────────────────────────────────────────── */}
      <section
        style={{ position: 'relative', background: '#FFFFFF', overflow: 'hidden', padding: '120px 0 96px' }}
        aria-label="About AtonixDev"
      >
        <div className="hero-grid-bg" />
        <div className="hero-accent-bar" />
        <div className="gsw-container" style={{ position: 'relative', zIndex: 1 }}>
          <span className="gsw-eyebrow">About AtonixDev</span>
          <h1
            style={{
              fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 800,
              color: '#111827', lineHeight: 1.08, maxWidth: 780, marginBottom: 28,
            }}
          >
            Enterprise Software,<br />
            <span style={{ color: '#A81D37' }}>Cloud &amp; AI Engineering Company</span>
          </h1>
          <p style={{ fontSize: 18, color: '#6B7280', lineHeight: 1.75, maxWidth: 620 }}>
            AtonixDev is a global enterprise technology company delivering secure, scalable,
            and intelligent software, cloud, and infrastructure solutions for governments,
            corporations, and high-growth organizations worldwide.
          </p>
        </div>
      </section>

      <hr className="gsw-divider" />

      {/* ── S2: Who We Are ───────────────────────────────────── */}
      <section className="gsw-section" style={{ background: '#FFFFFF' }} aria-labelledby="who-we-are">
        <div className="gsw-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16" style={{ alignItems: 'start' }}>
            {/* Left: text */}
            <div>
              <span className="gsw-eyebrow">Who We Are</span>
              <h2
                id="who-we-are"
                style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, color: '#111827', lineHeight: 1.15, marginBottom: 28 }}
              >
                A Global Enterprise<br />Technology Company
              </h2>
              <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.85, marginBottom: 20 }}>
                AtonixDev operates with a singular mission: to engineer technology that drives
                national-scale impact, enterprise transformation, and long-term operational excellence.
              </p>
              <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.85 }}>
                Our work spans multiple continents, multiple industries, and multiple technology domains.
                We combine deep engineering expertise with disciplined execution, modern cloud architecture,
                and a commitment to global-standard quality.
              </p>
            </div>
            {/* Right: abstract identity block */}
            <div
              style={{
                background: '#F8F9FA',
                border: '1px solid #E5E7EB',
                padding: 48,
              }}
            >
              <div style={{ width: 32, height: 2, background: '#A81D37', marginBottom: 32 }} />
              <p
                style={{
                  fontSize: 13, fontWeight: 700, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: '#9CA3AF',
                  marginBottom: 24, fontFamily: 'var(--font-mono)',
                }}
              >
                Our Hybrid Model
              </p>
              <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 28 }}>
                AtonixDev is built as a hybrid enterprise technology company — integrating software
                engineering, cloud infrastructure, artificial intelligence, DevOps, security,
                and data systems under one unified engineering standard.
              </p>
              <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85 }}>
                This model allows us to deliver end-to-end solutions — from architecture to deployment,
                from automation to security, from cloud to AI — without fragmentation or handoff gaps.
              </p>
            </div>
          </div>
        </div>
      </section>

      <hr className="gsw-divider" />

      {/* ── S3: Mission & Vision ─────────────────────────────── */}
      <section className="gsw-section" style={{ background: '#F8F9FA' }} aria-labelledby="mission-vision">
        <div className="gsw-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderTop: '3px solid #A81D37',
                padding: '48px 40px',
              }}
            >
              <p
                style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: '#A81D37', marginBottom: 20,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                Our Mission
              </p>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#111827', lineHeight: 1.4, marginBottom: 20 }}>
                Build technology that empowers institutions and strengthens digital infrastructure.
              </p>
              <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.8 }}>
                To build technology that empowers institutions, strengthens digital infrastructure,
                and accelerates innovation across governments, enterprises, and global organizations.
              </p>
            </div>
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderTop: '3px solid #111827',
                padding: '48px 40px',
              }}
            >
              <p
                style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: '#374151', marginBottom: 20,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                Our Vision
              </p>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#111827', lineHeight: 1.4, marginBottom: 20 }}>
                Become one of the world's most trusted engineering partners for mission-critical systems.
              </p>
              <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.8 }}>
                Recognized for reliability, precision, security, and the ability to deliver
                mission-critical systems at scale — across governments and enterprises globally.
              </p>
            </div>
          </div>
        </div>
      </section>

      <hr className="gsw-divider" />

      {/* ── S4: Our Identity ─────────────────────────────────── */}
      <section className="gsw-section" style={{ background: '#FFFFFF' }} aria-labelledby="our-identity">
        <div className="gsw-container">
          <div style={{ marginBottom: 56 }}>
            <span className="gsw-eyebrow">What We Do</span>
            <h2
              id="our-identity"
              style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#111827', lineHeight: 1.15 }}
            >
              Our Identity
            </h2>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              border: '1px solid #E5E7EB',
              borderRight: 'none',
              borderBottom: 'none',
            }}
          >
            {identity.map((cap) => (
              <div
                key={cap}
                style={{
                  padding: '32px 28px',
                  borderRight: '1px solid #E5E7EB',
                  borderBottom: '1px solid #E5E7EB',
                }}
              >
                <div style={{ width: 24, height: 2, background: '#A81D37', marginBottom: 16 }} />
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', lineHeight: 1.4 }}>{cap}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="gsw-divider" />

      {/* ── S5: Values ───────────────────────────────────────── */}
      <section className="gsw-section" style={{ background: '#F8F9FA' }} aria-labelledby="our-values">
        <div className="gsw-container">
          <div style={{ marginBottom: 56 }}>
            <span className="gsw-eyebrow">Our Foundation</span>
            <h2
              id="our-values"
              style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#111827', lineHeight: 1.15 }}
            >
              Our Values
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div
                key={v.title}
                className="gsw-card"
                style={{ padding: '36px 32px' }}
              >
                <div
                  style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
                    textTransform: 'uppercase', color: '#A81D37',
                    fontFamily: 'var(--font-mono)', marginBottom: 20,
                  }}
                >
                  0{i + 1}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#111827', marginBottom: 12 }}>{v.title}</h3>
                <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.75 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="gsw-divider" />

      {/* ── S6: Who We Serve ─────────────────────────────────── */}
      <section className="gsw-section" style={{ background: '#FFFFFF' }} aria-labelledby="who-we-serve">
        <div className="gsw-container">
          <div style={{ marginBottom: 56 }}>
            <span className="gsw-eyebrow">Client Coverage</span>
            <h2
              id="who-we-serve"
              style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#111827', lineHeight: 1.15, maxWidth: 540 }}
            >
              Who We Serve
            </h2>
            <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.75, maxWidth: 560, marginTop: 16 }}>
              Our solutions are designed for organizations that require reliability, security,
              and long-term operational stability.
            </p>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              border: '1px solid #E5E7EB',
              borderRight: 'none',
              borderBottom: 'none',
            }}
          >
            {industries.map((ind) => (
              <div
                key={ind}
                style={{
                  padding: '28px 24px',
                  borderRight: '1px solid #E5E7EB',
                  borderBottom: '1px solid #E5E7EB',
                }}
              >
                <div style={{ width: 20, height: 1, background: '#A81D37', marginBottom: 14 }} />
                <p style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{ind}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="gsw-divider" />

      {/* ── S7: Global Footprint ─────────────────────────────── */}
      <section className="gsw-section" style={{ background: '#F8F9FA' }} aria-labelledby="global-footprint">
        <div className="gsw-container">
          <div style={{ marginBottom: 56 }}>
            <span className="gsw-eyebrow">Global Presence</span>
            <h2
              id="global-footprint"
              style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#111827', lineHeight: 1.15 }}
            >
              Our Global Footprint
            </h2>
            <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.75, maxWidth: 560, marginTop: 16 }}>
              AtonixDev delivers culturally aware solutions, cross-regional engineering support,
              and 24/7 operational coverage across four global territories.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {regions.map((r) => (
              <div
                key={r.region}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderTop: '2px solid #A81D37',
                  padding: '32px 28px',
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 12 }}>{r.region}</h3>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="gsw-divider" />

      {/* ── S8: Our Approach ─────────────────────────────────── */}
      <section className="gsw-section" style={{ background: '#FFFFFF' }} aria-labelledby="our-approach">
        <div className="gsw-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16" style={{ alignItems: 'start' }}>
            <div>
              <span className="gsw-eyebrow">Methodology</span>
              <h2
                id="our-approach"
                style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 800, color: '#111827', lineHeight: 1.15, marginBottom: 20 }}
              >
                Our Approach
              </h2>
              <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.8 }}>
                We follow a structured, enterprise-grade engineering methodology that ensures every project
                meets the highest standards of performance, security, and reliability.
              </p>
            </div>
            <div className="lg:col-span-2">
              <div>
                {methodology.map((m, i) => (
                  <div
                    key={m.step}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '48px 1fr',
                      gap: 24,
                      padding: '24px 0',
                      borderBottom: i < methodology.length - 1 ? '1px solid #E5E7EB' : 'none',
                      alignItems: 'start',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11, fontWeight: 800, color: '#A81D37',
                        letterSpacing: '0.1em', fontFamily: 'var(--font-mono)',
                        paddingTop: 2,
                      }}
                    >
                      {m.step}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{m.title}</div>
                      <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7 }}>{m.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="gsw-divider" />

      {/* ── S8b: Why Choose Us ───────────────────────────────── */}
      <section className="gsw-section" style={{ background: '#F8F9FA' }} aria-labelledby="why-choose-us">
        <div className="gsw-container">
          <div style={{ marginBottom: 56 }}>
            <span className="gsw-eyebrow">Our Advantage</span>
            <h2
              id="why-choose-us"
              style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#111827', lineHeight: 1.15 }}
            >
              Why Organizations Choose AtonixDev
            </h2>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 0,
              border: '1px solid #E5E7EB',
              borderRight: 'none',
              borderBottom: 'none',
            }}
          >
            {reasons.map((r) => (
              <div
                key={r}
                style={{
                  padding: '28px 24px',
                  borderRight: '1px solid #E5E7EB',
                  borderBottom: '1px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 6, height: 6, background: '#A81D37',
                    flexShrink: 0, marginTop: 6,
                  }}
                />
                <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', lineHeight: 1.5 }}>{r}</p>
              </div>
            ))}
          </div>
          <p
            style={{
              marginTop: 40, fontSize: 15, fontWeight: 700, color: '#111827',
              textAlign: 'center', letterSpacing: '0.02em',
            }}
          >
            We are not just developers — we are strategic technology partners.
          </p>
        </div>
      </section>

      <hr className="gsw-divider" />

      {/* ── S9: Our Commitment / CTA ─────────────────────────── */}
      <section
        style={{ background: '#A81D37', padding: '96px 0' }}
        aria-label="Our Commitment"
      >
        <div className="gsw-container" style={{ maxWidth: 760 }}>
          <span
            style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)',
              fontFamily: 'var(--font-mono)', display: 'block', marginBottom: 24,
            }}
          >
            Our Commitment
          </span>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800,
              color: '#FFFFFF', lineHeight: 1.2, marginBottom: 32,
            }}
          >
            We build technology that lasts.<br />
            Technology that scales.<br />
            Technology that empowers institutions.
          </h2>
          <p
            style={{
              fontSize: 16, color: 'rgba(255,255,255,0.75)',
              lineHeight: 1.8, marginBottom: 48, maxWidth: 560,
            }}
          >
            AtonixDev is committed to building with purpose, discipline, and integrity —
            strengthening digital ecosystems for the institutions and enterprises that rely on us.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link
              to="/contact"
              style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '16px 40px',
                background: '#FFFFFF', color: '#A81D37',
                fontWeight: 800, fontSize: 12, letterSpacing: '0.1em',
                textTransform: 'uppercase', textDecoration: 'none',
              }}
            >
              Request a Proposal
            </Link>
            <Link
              to="/solutions"
              style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '16px 40px',
                background: 'transparent', color: '#FFFFFF',
                fontWeight: 800, fontSize: 12, letterSpacing: '0.1em',
                textTransform: 'uppercase', textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.5)',
              }}
            >
              Explore Solutions
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
