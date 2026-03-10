import React from 'react';
import { Link } from 'react-router-dom';

// PlatformCTA — call-to-action bar at the bottom of each platform page
const PlatformCTA = ({ eyebrow, title, description, links }) => (
  <section
    className="gsw-section-sm"
    style={{ background: '#A81D37', borderTop: '1px solid rgba(255,255,255,0.15)' }}
  >
    <div className="gsw-container">
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '32px 48px',
        }}
      >
        {/* Text */}
        <div style={{ maxWidth: 560 }}>
          <span
            style={{
              display: 'inline-block',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.15em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)',
              fontFamily: 'var(--font-mono)', marginBottom: 14,
            }}
          >
            {eyebrow}
          </span>
          <h2
            style={{
              fontSize: 'clamp(22px, 2.5vw, 30px)', fontWeight: 800,
              color: '#FFFFFF', lineHeight: 1.2, marginBottom: 14,
            }}
          >
            {title}
          </h2>
          <p style={{ fontSize: 15, color: '#4B5563', lineHeight: 1.7, margin: 0 }}>
            {description}
          </p>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          {links.map((lnk) =>
            lnk.primary ? (
              <Link
                key={lnk.label}
                to={lnk.href}
                style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '12px 28px',
                  background: '#FFFFFF',
                  color: '#A81D37',
                  fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  textDecoration: 'none',
                  fontFamily: 'inherit',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                {lnk.label}
              </Link>
            ) : (
              <Link
                key={lnk.label}
                to={lnk.href}
                style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '11px 28px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#D1D5DB',
                  fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  textDecoration: 'none',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.color = '#D1D5DB';
                }}
              >
                {lnk.label}
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  </section>
);

export default PlatformCTA;
