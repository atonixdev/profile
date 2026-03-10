import React from 'react';

// PlatformHero — shared hero section for platform capability pages
const PlatformHero = ({ eyebrow, title, subtitle, bullets }) => (
  <section
    style={{ position: 'relative', background: '#FFFFFF', overflow: 'hidden', padding: '120px 0 96px' }}
    aria-label={title}
  >
    <div className="hero-grid-bg" />
    <div className="hero-accent-bar" />
    <div className="gsw-container" style={{ position: 'relative', zIndex: 1 }}>
      <span className="gsw-eyebrow">{eyebrow}</span>
      <h1
        style={{
          fontSize: 'clamp(36px, 5vw, 60px)',
          fontWeight: 800,
          color: '#111827',
          lineHeight: 1.08,
          maxWidth: 760,
          marginBottom: 24,
        }}
      >
        {title}
      </h1>
      <p
        style={{
          fontSize: 18,
          color: '#6B7280',
          lineHeight: 1.75,
          maxWidth: 620,
          marginBottom: 40,
        }}
      >
        {subtitle}
      </p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: '12px 40px' }}>
        {bullets.map((b) => (
          <li
            key={b}
            style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: '#374151' }}
          >
            <span
              style={{ width: 6, height: 6, borderRadius: '50%', background: '#A81D37', flexShrink: 0 }}
            />
            {b}
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default PlatformHero;
