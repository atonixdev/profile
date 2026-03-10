import React from 'react';
import AtonixDevLogoIcon from './AtonixDevLogoIcon';

/**
 * AtonixDev full brand logo — icon tile + wordmark.
 *
 * Wordmark spec: Inter Bold, letter-spacing 0, mixed-case "AtonixDev"
 *
 * @param {{ size?: number, variant?: 'dark' | 'light', textColor?: string }} props
 *   size      — icon height in px; wordmark scales proportionally (default 32)
 *   variant   — 'dark' → dark tile + white wordmark | 'light' → light tile + dark wordmark
 *   textColor — explicit override for wordmark color
 */
function AtonixDevLogo({ size = 32, variant = 'dark', textColor: textColorProp }) {
  const textColor = textColorProp !== undefined
    ? textColorProp
    : (variant === 'light' ? '#111827' : '#FFFFFF');

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <AtonixDevLogoIcon size={size} variant={variant} />
      <span
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 700,
          fontSize: Math.round(size * 0.56),
          color: textColor,
          letterSpacing: 0,
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        AtonixDev
      </span>
    </div>
  );
}

export default AtonixDevLogo;
export { AtonixDevLogo };
