import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// GS-WSF — Community Platform Landing
const categories = [
  { name: 'Artificial Intelligence', slug: 'artificial-intelligence', desc: 'Machine learning, LLMs, AI pipelines, and intelligent automation.' },
  { name: 'Cloud',                   slug: 'cloud',                   desc: 'Cloud infrastructure, OpenStack, Kubernetes, and multi-cloud.' },
  { name: 'DevOps',                  slug: 'devops',                  desc: 'CI/CD, containerisation, automation, and release engineering.' },
  { name: 'Security',                slug: 'security',                desc: 'Zero-trust, compliance, secure architecture, and DevSecOps.' },
  { name: 'Data & Analytics',        slug: 'data-analytics',          desc: 'Data platforms, pipelines, BI systems, and analytics.' },
  { name: 'Integration',             slug: 'integration',             desc: 'APIs, microservices, event-driven systems, and middleware.' },
  { name: 'Business Systems',        slug: 'business-systems',        desc: 'ERP, CRM, workflow automation, and enterprise resource planning.' },
  { name: 'Infrastructure',          slug: 'infrastructure',          desc: 'Servers, networking, storage, and physical infrastructure.' },
  { name: 'General Discussion',      slug: 'general-discussion',      desc: 'Open forum for the AtonixDev engineering community.' },
];

const CommunityHome = () => {
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <div style={{ background: '#FFFFFF' }}>

      {/* ── Stats bar ────────────────────────────────────────── */}
      <div style={{ background: '#F8F9FA', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', padding: '20px 0' }}>
        <div className="gsw-container">
          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { label: 'Categories',   value: '9'  },
              { label: 'Discussions',  value: '0'  },
              { label: 'Members',      value: '0'  },
              { label: 'Tutorials',    value: '0'  },
            ].map((s) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: '#111827' }}>{s.value}</span>
                <span style={{ fontSize: 11, color: '#4B5563', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <hr className="gsw-divider" />

      {/* ── Discussion Categories ────────────────────────────── */}
      <section className="gsw-section" style={{ background: '#FFFFFF' }} aria-labelledby="discussion-boards">
        <div className="gsw-container">
          <div className="gsw-section-header">
            <span className="gsw-eyebrow">Discussion Boards</span>
            <h2
              id="discussion-boards"
              style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: '#111827', lineHeight: 1.15 }}
            >
              Browse Categories
            </h2>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              border: '1px solid #E5E7EB',
              borderRight: 'none',
              borderBottom: 'none',
            }}
          >
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/community/discussions/${cat.slug}`}
                style={{
                  padding: '28px 24px',
                  borderRight: '1px solid #E5E7EB',
                  borderBottom: '1px solid #E5E7EB',
                  textDecoration: 'none',
                  background: '#FFFFFF',
                  display: 'block',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F8F9FA'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
              >
                <div style={{ width: 20, height: 2, background: '#A81D37', marginBottom: 14 }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{cat.name}</div>
                <div style={{ fontSize: 12, color: '#4B5563', lineHeight: 1.65, marginBottom: 12 }}>{cat.desc}</div>
                <div style={{ fontSize: 10, color: '#4B5563', fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: '0.08em' }}>
                  0 THREADS
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <hr className="gsw-divider" />

      {/* ── Community Sections ───────────────────────────────── */}
      <section className="gsw-section" style={{ background: '#F8F9FA' }}>
        <div className="gsw-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Tutorials & Guides',
                desc: 'Structured how-to guides, architecture examples, best practices, and code references.',
                to: '/community/tutorials',
                cta: 'Browse Tutorials',
              },
              {
                title: 'Announcements',
                desc: 'Product updates, release notes, platform improvements, and community events.',
                to: '/community/announcements',
                cta: 'View Updates',
              },
              {
                title: 'Community Guidelines',
                desc: 'Code of conduct, posting guidelines, moderation policy, and privacy notice.',
                to: '/community/rules',
                cta: 'Read Guidelines',
              },
            ].map((tile) => (
              <div key={tile.title} className="gsw-card" style={{ padding: '36px 32px' }}>
                <div style={{ width: 32, height: 2, background: '#A81D37', marginBottom: 20 }} />
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#111827', marginBottom: 10 }}>{tile.title}</h3>
                <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.75, marginBottom: 28 }}>{tile.desc}</p>
                <Link
                  to={tile.to}
                  style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: '#A81D37', textDecoration: 'none',
                  }}
                >
                  {tile.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section style={{ background: '#A81D37', padding: '72px 0' }}>
        <div className="gsw-container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: '#FFFFFF', marginBottom: 16, lineHeight: 1.2 }}>
            Join the AtonixDev Engineering Community
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.75 }}>
            Create an account to participate in discussions, share knowledge, and connect
            with engineers from across the globe.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/register"
              style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '14px 36px', background: '#FFFFFF', color: '#A81D37',
                fontWeight: 800, fontSize: 12, letterSpacing: '0.1em',
                textTransform: 'uppercase', textDecoration: 'none',
              }}
            >
              Create Account
            </Link>
            <Link
              to="/community/discussions"
              style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '14px 36px', background: 'transparent', color: '#FFFFFF',
                fontWeight: 800, fontSize: 12, letterSpacing: '0.1em',
                textTransform: 'uppercase', textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.5)',
              }}
            >
              Browse Discussions
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default CommunityHome;
