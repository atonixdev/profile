import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

// GS-WSF — Community Discussions
const ALL_CATEGORIES = [
  { name: 'All Discussions',      slug: 'all' },
  { name: 'Artificial Intelligence', slug: 'artificial-intelligence' },
  { name: 'Cloud',                slug: 'cloud' },
  { name: 'DevOps',               slug: 'devops' },
  { name: 'Security',             slug: 'security' },
  { name: 'Data & Analytics',     slug: 'data-analytics' },
  { name: 'Integration',          slug: 'integration' },
  { name: 'Business Systems',     slug: 'business-systems' },
  { name: 'Infrastructure',       slug: 'infrastructure' },
  { name: 'General Discussion',   slug: 'general-discussion' },
];

const Discussions = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const activeSlug = category || 'all';
  const [search, setSearch] = useState('');

  const current = ALL_CATEGORIES.find((c) => c.slug === activeSlug) || ALL_CATEGORIES[0];

  const handleCategoryChange = (slug) => {
    if (slug === 'all') {
      navigate('/community/discussions');
    } else {
      navigate(`/community/discussions/${slug}`);
    }
  };

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh' }}>

      {/* Page Header */}
      <section
        style={{ background: '#F8F9FA', borderBottom: '1px solid #E5E7EB', padding: '56px 24px 40px' }}
        aria-label="Discussions"
      >
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <nav style={{ fontSize: 12, color: '#4B5563', marginBottom: 16, fontFamily: 'var(--font-mono)' }}>
            <Link to="/community" style={{ color: '#4B5563', textDecoration: 'none' }}>Community</Link>
            {' / '}
            <span style={{ color: '#111827' }}>Discussions</span>
          </nav>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#111827', lineHeight: 1.1, marginBottom: 20 }}>
            Discussions
          </h1>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search discussions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search discussions"
              style={{
                padding: '10px 16px', border: '1px solid #D1D5DB',
                fontSize: 13, fontFamily: 'inherit', outline: 'none',
                width: 300, color: '#111827', background: '#FFFFFF',
              }}
            />
            <button
              style={{
                padding: '10px 28px', background: '#A81D37', color: '#FFFFFF',
                border: 'none', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Start Discussion
            </button>
          </div>
        </div>
      </section>

      {/* Main layout */}
      <div
        style={{
          maxWidth: 1440, margin: '0 auto', padding: '40px 24px',
          display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32,
        }}
      >
        {/* Sidebar */}
        <aside>
          <div
            style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: '#4B5563',
              fontFamily: 'var(--font-mono)', marginBottom: 12, paddingLeft: 14,
            }}
          >
            Categories
          </div>
          {ALL_CATEGORIES.map((cat) => {
            const active = cat.slug === activeSlug;
            return (
              <button
                key={cat.slug}
                onClick={() => handleCategoryChange(cat.slug)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '10px 14px', background: 'none', border: 'none',
                  borderLeft: active ? '2px solid #A81D37' : '2px solid transparent',
                  fontSize: 13, fontWeight: active ? 700 : 400,
                  color: active ? '#111827' : '#4B5563',
                  cursor: 'pointer', fontFamily: 'inherit', marginBottom: 2,
                  transition: 'color 0.15s',
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </aside>

        {/* Thread list */}
        <main>
          <div
            style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 24,
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{current.name}</h2>
            <span
              style={{
                fontSize: 10, fontWeight: 700, color: '#4B5563',
                fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase',
              }}
            >
              0 THREADS
            </span>
          </div>

          {/* Empty state */}
          <div
            style={{
              border: '1px solid #E5E7EB', padding: '72px 24px',
              textAlign: 'center', background: '#FAFAFA',
            }}
          >
            <div style={{ width: 32, height: 2, background: '#E5E7EB', margin: '0 auto 20px' }} />
            <p style={{ fontSize: 15, fontWeight: 700, color: '#1F2937', marginBottom: 8 }}>
              No discussions yet in {current.name === 'All Discussions' ? 'this community' : current.name}
            </p>
            <p
              style={{
                fontSize: 13, color: '#4B5563', lineHeight: 1.7,
                maxWidth: 420, margin: '0 auto 28px',
              }}
            >
              Be the first to start a conversation. Share knowledge, ask questions,
              or propose ideas — the community is here to collaborate.
            </p>
            <button
              style={{
                padding: '12px 32px', background: '#A81D37', color: '#FFFFFF',
                border: 'none', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Start the First Discussion
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Discussions;
