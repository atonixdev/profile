import React from 'react';

/**
 * AtonixDev canonical emblem — single source of truth for the icon.
 *
 * @param {{ size?: number, variant?: 'light' | 'dark' }} props
 *   size    — rendered px dimension (default 32, min 16)
 *   variant — 'dark' → #111827 bg + white glyph (for dark surfaces)
 *             'light' → #FFFFFF bg + dark glyph (for light surfaces)
 */
function AtonixDevLogoIcon({ size = 32, variant = 'dark' }) {
  const bg      = variant === 'light' ? '#FFFFFF' : '#111827';
  const primary = '#1456F0';
  const accent  = '#22D3EE';
  // rx scales with size: 25% of half-dimension keeps proportions consistent
  const rx = Math.round((size / 64) * 16);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="AtonixDev logo icon"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* Background tile — enables use as app icon / badge */}
      <rect x="0" y="0" width="64" height="64" rx={rx} fill={bg} />

      {/* Geometric A emblem */}
      <g transform="translate(12, 10)">
        {/* Left pillar */}
        <path d="M4 40 L12 12 L20 40 Z" fill={primary} />
        {/* Right pillar */}
        <path d="M20 40 L28 12 L36 40 Z" fill={primary} />
        {/* Crossbar — Electric Cyan accent */}
        <rect x="12" y="20" width="16" height="4" rx="2" fill={accent} />
      </g>
    </svg>
  );
}

export default AtonixDevLogoIcon;
export { AtonixDevLogoIcon };
