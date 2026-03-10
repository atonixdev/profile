import React from 'react';

/**
 * AtonixDev canonical icon — Enterprise Icon Specification v1.0
 *
 * Grid:     64×64 unit viewBox, 12.5% padding (8px each side)
 * Glyph:    Geometric "A" — two filled polygon legs + Electric Cyan crossbar
 * Geometry: 45° diagonals, 8px stroke weight (12.5% of 64), no transforms
 * Strokes:  Converted to filled polygon outlines — no stroke attributes
 * Colors:   #1456F0 Atonix Blue (legs) · #22D3EE Electric Cyan (crossbar)
 * Container: Sharp square tile — no rx, 45°/90° angles only
 *
 * Variants:
 *   dark  (default) — Deep Graphite #111827 tile, for dark/colored surfaces
 *   light            — White #FFFFFF tile, for light surfaces
 *
 * @param {{ size?: number, variant?: 'dark' | 'light' }} props
 */
function AtonixDevLogoIcon({ size = 32, variant = 'dark' }) {
  const bg      = variant === 'light' ? '#FFFFFF' : '#111827';
  const primary = '#A81D37';  // AtonixDev brand red
  const accent  = '#A81D37';  // same — full A in one colour

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="AtonixDev"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* Circular container */}
      <circle cx="32" cy="32" r="32" fill={bg} />

      {/*
        Left leg — thick trapezoid (10px wide at top, 14px wide at base)
        Apex outer (20,8) · apex inner (32,8) · inner foot (18,56) · outer foot (4,56)
      */}
      <polygon points="32,8 20,8 4,56 18,56" fill={primary} />

      {/*
        Right leg — mirror trapezoid
        Apex inner (32,8) · apex outer (44,8) · outer foot (60,56) · inner foot (46,56)
      */}
      <polygon points="32,8 44,8 60,56 46,56" fill={primary} />

      {/*
        Crossbar — Electric Cyan accent
        At y=28, inner edges of both legs meet at x≈24 and x≈40 — width=22, height=7
      */}
      <rect x="22" y="28" width="20" height="7" fill={accent} />
    </svg>
  );
}

export default AtonixDevLogoIcon;
export { AtonixDevLogoIcon };
