import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const ACCENT = '#A81D37';
const BD     = '1px solid #E5E7EB';
const MONO   = { fontFamily: 'var(--font-mono)' };

const MODULE_META = {
  '/founder-portal/working-dashboard': { code: 'WRK', label: 'Working Dashboard',      accent: '#A81D37' },
  '/founder-portal/investor':    { code: 'INV', label: 'Investor Hub',            accent: '#2563EB' },
  '/founder-portal/team':      { code: 'TEM', label: 'Team Management',         accent: '#16A34A' },
  '/founder-portal/financial': { code: 'FIN', label: 'Financial & Compliance',  accent: '#D97706' },
  '/founder-portal/vision':    { code: 'VIS', label: 'Vision & Narrative',      accent: '#7C3AED' },
  '/founder-portal/developer': { code: 'DEV', label: 'Developer Dashboard',     accent: '#0891B2' },
  '/founder-portal/marketing': { code: 'MKT', label: 'Marketing Dashboard',     accent: '#EA580C' },
  '/founder-portal/branding':  { code: 'BRD', label: 'Branding Systems',        accent: '#DC2626' },
};

const FounderModuleLayout = () => {
  const location = useLocation();
  const meta = MODULE_META[location.pathname] || { code: '···', label: 'Founder Portal', accent: ACCENT };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      {/* ── Thin top bar ─────────────────────────────────── */}
      <header style={{
        height: 48, minHeight: 48, background: '#FFFFFF', borderBottom: BD,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(16px, 4vw, 32px)', gap: 16,
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        {/* Left: back link + breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link
            to="/founder-portal"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
              color: '#6B7280', textDecoration: 'none', ...MONO,
              padding: '4px 0',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#111827'}
            onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
          >
            <span style={{ fontSize: 13, lineHeight: 1 }}>←</span>
            <span>Executive Dashboard</span>
          </Link>
          <span style={{ fontSize: 10, color: '#D1D5DB' }}>/</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{
              fontSize: 8, fontWeight: 700, letterSpacing: '0.10em',
              color: '#FFFFFF', background: meta.accent,
              padding: '3px 7px', borderRadius: 2, ...MONO,
            }}>{meta.code}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{meta.label}</span>
          </div>
        </div>

        {/* Right: portal label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 8, fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: ACCENT, ...MONO,
          }}>ATONIXDEV</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#D1D5DB' }} />
          <span style={{
            fontSize: 8, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#9CA3AF', ...MONO,
          }}>FOUNDER PORTAL</span>
        </div>
      </header>

      {/* ── Page content ─────────────────────────────────── */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default FounderModuleLayout;
