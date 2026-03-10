import React from 'react';
import { Link } from 'react-router-dom';

// GS-WSF — Community Announcements
const Announcements = () => (
  <div style={{ background: '#FFFFFF', minHeight: '100vh' }}>

    {/* Page Header */}
    <section style={{ background: '#F8F9FA', borderBottom: '1px solid #E5E7EB', padding: '56px 24px 40px' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <nav style={{ fontSize: 12, color: '#4B5563', marginBottom: 16, fontFamily: 'var(--font-mono)' }}>
          <Link to="/community" style={{ color: '#4B5563', textDecoration: 'none' }}>Community</Link>
          {' / '}
          <span style={{ color: '#111827' }}>Announcements</span>
        </nav>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#111827', lineHeight: 1.1, marginBottom: 16 }}>
          Announcements
        </h1>
        <p style={{ fontSize: 15, color: '#4B5563', maxWidth: 580, lineHeight: 1.75 }}>
          Product updates, new feature releases, platform improvements, release notes,
          and community events from the AtonixDev engineering team.
        </p>
      </div>
    </section>

    {/* Content */}
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '40px 24px' }}>

      {/* Category filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
        {['All', 'Product Updates', 'Release Notes', 'Platform', 'Events'].map((tag, i) => (
          <button
            key={tag}
            style={{
              padding: '7px 18px',
              background: i === 0 ? '#111827' : 'transparent',
              border: `1px solid ${i === 0 ? '#111827' : '#D1D5DB'}`,
              color: i === 0 ? '#FFFFFF' : '#4B5563',
              fontSize: 12, fontWeight: 600, letterSpacing: '0.06em',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {tag}
          </button>
        ))}
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
          No announcements yet
        </p>
        <p
          style={{
            fontSize: 13, color: '#4B5563', lineHeight: 1.7,
            maxWidth: 440, margin: '0 auto 28px',
          }}
        >
          Platform updates, release notes, and community events will be published here
          by the AtonixDev engineering team. Check back soon.
        </p>
        <Link
          to="/community"
          style={{
            fontSize: 11, fontWeight: 700, color: '#A81D37',
            textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase',
          }}
        >
          ← Back to Community
        </Link>
      </div>
    </div>
  </div>
);

export default Announcements;
