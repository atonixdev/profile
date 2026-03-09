/**
 * AtonixDev — Design Token System  (GS-WSF 1.0 Light Theme)
 * Single source of truth for all colors, typography, spacing, radius & shadow.
 *
 * Rules:
 *  - brand.* values are reserved exclusively for the logo mark.
 *  - font.mono maps to IBM Plex Mono — use for code/terminal surfaces only.
 *  - Do not add new color values without design governance approval.
 */

export const tokens = {
  // ── Backgrounds ──────────────────────────────────────────────────────────
  bg: {
    page:    '#FFFFFF',   // Page root
    surface: '#F8F9FA',   // Headers, sidebars, elevated panels
    card:    '#F1F3F5',   // Cards, table headers, inner surfaces
    input:   '#F1F3F5',   // Form input backgrounds
  },

  // ── Borders ──────────────────────────────────────────────────────────────
  border: {
    default: '#E5E7EB',   // Standard dividers
    input:   '#D1D5DB',   // Form input borders
    muted:   '#F3F4F6',   // Table row separators
  },

  // ── Typography ───────────────────────────────────────────────────────────
  text: {
    primary:   '#111827',  // Body text
    secondary: '#6B7280',  // Subtext, labels, placeholders
    muted:     '#374151',  // De-emphasised text
  },

  // ── Accent — Crimson ─────────────────────────────────────────────────────
  accent: {
    primary: '#DC2626',               // Crimson — buttons, links, active states
    deep:    '#991B1B',               // Hover / destructive
    bg:      'rgba(220,38,38,0.08)',  // Subtle accent fill
    border:  '#DC2626',
  },

  // ── Status Semantics ─────────────────────────────────────────────────────
  status: {
    success: { bg: '#F0FDF4', border: '#16A34A', text: '#15803D' },
    warning: { bg: '#FFFBEB', border: '#D97706', text: '#B45309' },
    error:   { bg: '#FEF2F2', border: '#DC2626', text: '#DC2626' },
    info:    { bg: '#EFF6FF', border: '#2563EB', text: '#1D4ED8' },
  },

  // ── Brand Mark (logo only — never use in UI components) ──────────────────
  brand: {
    blue: '#1456F0',   // Atonix Blue — logo emblem fill
    cyan: '#22D3EE',   // Electric Cyan — logo crossbar accent
    bg:   '#111827',   // Deep Graphite — logo tile background
  },

  // ── Typography Scale ─────────────────────────────────────────────────────
  font: {
    family: "'Inter', system-ui, sans-serif",
    mono:   "'IBM Plex Mono', 'Courier New', monospace",
  },

  text_size: {
    xs:   '0.75rem',    // 12px
    sm:   '0.875rem',   // 14px
    base: '1rem',       // 16px
    lg:   '1.125rem',   // 18px
    xl:   '1.25rem',    // 20px
    '2xl':'1.5rem',     // 24px
    '3xl':'1.875rem',   // 30px
    '4xl':'2.25rem',    // 36px
    '5xl':'3rem',       // 48px
    '6xl':'3.75rem',    // 60px
  },

  weight: {
    regular:   400,
    medium:    500,
    semibold:  600,
    bold:      700,
    extrabold: 800,
    black:     900,
  },

  leading: {
    tight:   1.2,
    snug:    1.375,
    normal:  1.5,
    relaxed: 1.625,
  },

  // ── Spacing ──────────────────────────────────────────────────────────────
  space: {
    1:  '4px',
    2:  '8px',
    3:  '12px',
    4:  '16px',
    6:  '24px',
    8:  '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
    30: '120px',
  },

  // ── Radius ───────────────────────────────────────────────────────────────
  radius: {
    sm:   '4px',
    card: '8px',
    lg:   '12px',
    full: '9999px',
  },

  // ── Shadow ───────────────────────────────────────────────────────────────
  shadow: {
    xs:   '0 1px 3px rgba(0,0,0,0.04)',
    card: '0 8px 24px rgba(0,0,0,0.06)',
    md:   '0 4px 16px rgba(0,0,0,0.08)',
    lg:   '0 16px 48px rgba(0,0,0,0.10)',
  },
};

// ── Convenience aliases ────────────────────────────────────────────────────
export const CRIMSON  = tokens.accent.primary;   // '#DC2626'
export const GRAPHITE = tokens.brand.bg;          // '#111827'
export const WHITE    = tokens.bg.page;           // '#FFFFFF'

export default tokens;
