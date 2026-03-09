import React from 'react';
import AtonixDevLogoIcon from './AtonixDevLogoIcon';

/**
 * AtonixDev full brand logo — icon emblem + wordmark.
 *
 * @param {{ size?: number, variant?: 'light' | 'dark' }} props
 *   size    — icon height in px; wordmark scales proportionally (default 32)
 *   variant — 'dark'  → dark tile icon, white wordmark (for dark surfaces)
 *             'light' → white tile icon, dark wordmark (for light surfaces)
 */
function AtonixDevLogo({ size = 32, variant = 'dark', textColor: textColorProp }) {
  const textColor = textColorProp !== undefined ? textColorProp : (variant === 'light' ? '#111827' : '#FFFFFF');

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <AtonixDevLogoIcon size={size} variant={variant} />
      <span
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 700,
          fontSize: Math.round(size * 0.6),
          color: textColor,
          letterSpacing: '0.04em',
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
