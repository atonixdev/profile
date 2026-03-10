import React from 'react';

/**
 * AtonixDev canonical icon — Triangle Frame Edition (Directive v2.0)
 *
 * Concept:   OpenStack-style geometric frame, re-imagined as a triangle.
 * Grid:      100×100 viewBox
 * Shape:     Outer equilateral △ with concentric inner △ cut-out (evenodd fill rule).
 *            Creates a clean "frame" — uniform stroke mass, balanced negative space.
 *
 * Geometry:
 *   Outer △  — circumradius 41, centroid (50,53)
 *               Top (50,12) · Bottom-right (86,74) · Bottom-left (14,74)
 *   Inner △  — circumradius 17, same centroid
 *               Top (50,36) · Bottom-left (35,62) · Bottom-right (65,62)
 *   Frame thickness ≈ 13% of viewBox width (within 12–16% spec)
 *   Negative space ≈ 24% of viewBox width (within 20–28% spec)
 *
 * Colors:    #A81D37 AtonixDev brand red on dark/light tile
 * Container: Circle tile — crisp at all sizes
 *
 * Variants:
 *   dark  (default) — Deep Graphite #111827 tile, for dark/colored surfaces
 *   light            — White #FFFFFF tile, for light surfaces
 *
 * @param {{ size?: number, variant?: 'dark' | 'light' }} props
 */
function AtonixDevLogoIcon({ size = 32, variant = 'dark', showBg = true }) {
  const bg    = variant === 'light' ? '#FFFFFF' : '#111827';
  const color = '#A81D37';  // AtonixDev brand red

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      role="img"
      aria-label="AtonixDev"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {showBg && <circle cx="50" cy="50" r="50" fill={bg} />}

      {/*
        Triangle frame — outer equilateral △ with inner equilateral △ cut-out.
        Both triangles are concentric (centroid ≈ 50,53).
        SVG evenodd fill rule makes the inner △ transparent, creating the "frame".

        Outer equilateral △ (circumradius 41):
          Top (50,12) · Bottom-right (86,74) · Bottom-left (14,74)
        Inner equilateral △ (circumradius 17, cut-out):
          Top (50,36) · Bottom-left (35,62) · Bottom-right (65,62)
      */}
      <path
        d="M50,12 L86,74 L14,74 Z M50,36 L35,62 L65,62 Z"
        fill={color}
        fillRule="evenodd"
      />
    </svg>
  );
}

export default AtonixDevLogoIcon;
export { AtonixDevLogoIcon };
