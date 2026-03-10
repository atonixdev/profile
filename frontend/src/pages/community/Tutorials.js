import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// GS-WSF — Community Tutorials & Guides
const FILTER_CATEGORIES = ['All', 'AI & ML', 'Cloud', 'DevOps', 'Security', 'Data', 'Integration', 'Infrastructure'];

const Tutorials = () => {
  const [active, setActive] = useState('All');

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh' }}>

      {/* Page Header */}
      <section style={{ background: '#F8F9FA', borderBottom: '1px solid #E5E7EB', padding: '56px 24px 40px' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <nav style={{ fontSize: 12, color: '#4B5563', marginBottom: 16, fontFamily: 'var(--font-mono)' }}>
            <Link to="/community" style={{ color: '#4B5563', textDecoration: 'none' }}>Community</Link>
            {' / '}
            <span style={{ color: '#111827' }}>Tutorials</span>
          </nav>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#111827', lineHeight: 1.1, marginBottom: 16 }}>
            Tutorials &amp; Guides
          </h1>
          <p style={{ fontSize: 15, color: '#4B5563', maxWidth: 580, lineHeight: 1.75 }}>
            Structured how-to guides, architecture best practices, code samples, and engineering
            references — written by AtonixDev engineers and community contributors.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '40px 24px' }}>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 40 }}>
          {FILTER_CATEGORIES.map((cat) => {
            const isActive = active === cat;
            return (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                style={{
                  padding: '8px 20px',
                  background: isActive ? '#111827' : 'transparent',
                  border: `1px solid ${isActive ? '#111827' : '#D1D5DB'}`,
                  color: isActive ? '#FFFFFF' : '#4B5563',
                  fontSize: 12, fontWeight: 600, letterSpacing: '0.06em',
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Empty state */}
        <div
          style={{
            border: '1px solid #E5E7EB', padding: '80px 24px',
            textAlign: 'center', background: '#FAFAFA',
          }}
        >
          <div style={{ width: 32, height: 2, background: '#E5E7EB', margin: '0 auto 20px' }} />
          <p style={{ fontSize: 15, fontWeight: 700, color: '#1F2937', marginBottom: 8 }}>
            No tutorials published yet
          </p>
          <p
            style={{
              fontSize: 13, color: '#4B5563', lineHeight: 1.7,
              maxWidth: 440, margin: '0 auto 28px',
            }}
          >
            Tutorials and guides will appear here as they are published by the AtonixDev
            engineering team and verified community contributors.
          </p>
          <Link
            to="/community/discussions"
            style={{
              display: 'inline-block',
              padding: '10px 28px', background: '#A81D37', color: '#FFFFFF',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', textDecoration: 'none',
            }}
          >
            Join the Discussion
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Tutorials;
