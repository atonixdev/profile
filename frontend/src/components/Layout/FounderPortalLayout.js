import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AtonixDevLogo from '../AtonixDevLogo';

const NAV_ITEMS = [
  { path: '/founder-portal',                   exact: true,  label: 'Executive Dashboard',    code: 'EXC' },
  { path: '/founder-portal/working-dashboard', exact: false, label: 'Working Dashboard',      code: 'WRK' },
  { path: '/founder-portal/investor',          exact: false, label: 'Investor Hub',            code: 'INV' },
  { path: '/founder-portal/team',              exact: false, label: 'Team Management',         code: 'TEM' },
  { path: '/founder-portal/financial',         exact: false, label: 'Financial & Compliance',  code: 'FIN' },
  { path: '/founder-portal/vision',            exact: false, label: 'Vision & Narrative',      code: 'VIS' },
  { path: '/founder-portal/developer',         exact: false, label: 'Developer Dashboard',     code: 'DEV' },
  { path: '/founder-portal/marketing',         exact: false, label: 'Marketing Dashboard',     code: 'MKT' },
  { path: '/founder-portal/branding',          exact: false, label: 'Branding Systems',        code: 'BRD' },
];

const ACCENT       = '#A81D37';
const SIDEBAR_BG   = '#0a0e17';
const SIDEBAR_BORDER = 'rgba(255,255,255,0.08)';
const HEADER_BG    = '#FFFFFF';
const PRIMARY_TEXT  = '#1F2937';

const FounderPortalLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (item) =>
    item.exact
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path);

  const currentItem = NAV_ITEMS.find(isActive);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const displayName = [user?.user?.first_name, user?.user?.last_name]
    .filter(Boolean).join(' ') || user?.username || 'Founder';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F8FAFC', fontFamily: 'inherit', position: 'relative' }}>
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 49 }} />
      )}

      {/* ══ SIDEBAR ═══════════════════════════════════════════ */}
      <aside
        className={`app-sidebar${sidebarOpen ? ' sidebar-open' : ''}`}
        style={{
          width: 260, background: SIDEBAR_BG, display: 'flex', flexDirection: 'column',
          borderRight: `1px solid ${SIDEBAR_BORDER}`, overflow: 'hidden',
        }}
      >
        {/* Brand */}
        <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'block' }}>
            <AtonixDevLogo size={26} variant="dark" textColor="#FFFFFF" />
          </Link>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.16em',
            textTransform: 'uppercase', color: ACCENT,
            marginTop: 10, fontFamily: 'var(--font-mono)',
          }}>
            Founder Portal
          </div>
          <div style={{
            fontSize: 8, color: 'rgba(255,255,255,0.35)', marginTop: 3,
            fontFamily: 'var(--font-mono)', letterSpacing: '0.10em', textTransform: 'uppercase',
          }}>
            Sovereign Command Center
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, paddingTop: 8, paddingBottom: 8, overflowY: 'auto' }}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 20px', fontSize: 12,
                  fontWeight: active ? 700 : 400,
                  color: active ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
                  textDecoration: 'none',
                  borderLeft: active ? `2px solid ${ACCENT}` : '2px solid transparent',
                  background: active ? 'rgba(168,29,55,0.16)' : 'transparent',
                  letterSpacing: '0.01em',
                  transition: 'color 0.15s, background 0.15s',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = '#FFFFFF'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
              >
                <span style={{
                  fontSize: 8, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
                  color: active ? ACCENT : 'rgba(255,255,255,0.30)', minWidth: 28, fontWeight: 700,
                }}>
                  {item.code}
                </span>
                <span style={{ flex: 1 }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Console crosslinks */}
        <div style={{ padding: '10px 14px', borderTop: `1px solid rgba(255,255,255,0.08)` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5, marginBottom: 6 }}>
            {[
              { to: '/billing-console',       label: 'BILLING' },
              { to: '/financial-dashboard',   label: 'FINANCE' },
              { to: '/admin-console',         label: 'ADMIN' },
            ].map(({ to, label }) => (
              <Link key={to} to={to} style={{
                padding: '6px 4px', fontSize: 8, fontWeight: 700,
                letterSpacing: '0.10em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.55)', textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)', textAlign: 'center',
                fontFamily: 'var(--font-mono)',
              }}>
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* User section */}
        <div style={{ padding: '14px 20px', borderTop: `1px solid rgba(255,255,255,0.08)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: ACCENT, border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            }}>
              {user?.oauth_avatar ? (
                <img src={user.oauth_avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', userSelect: 'none' }}>
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {displayName}
              </div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.40)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
                FOUNDER · EXECUTIVE
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '7px', fontSize: 9, fontWeight: 700,
              letterSpacing: '0.10em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.55)', background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer',
              fontFamily: 'inherit', transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.40)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ══ MAIN AREA ════════════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          height: 52, minHeight: 52, background: HEADER_BG,
          borderBottom: '1px solid #E5E7EB',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 28px', gap: 16,
        }}>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'none' }}
          >
            <div style={{ width: 18, height: 2, background: PRIMARY_TEXT, marginBottom: 4 }} />
            <div style={{ width: 18, height: 2, background: PRIMARY_TEXT, marginBottom: 4 }} />
            <div style={{ width: 18, height: 2, background: PRIMARY_TEXT }} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(168,29,55,0.8)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              FOUNDER-PORTAL
            </span>
            {currentItem && (
              <>
                <span style={{ fontSize: 10, color: '#D1D5DB' }}>/</span>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', color: PRIMARY_TEXT, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                  {currentItem.code} — {currentItem.label}
                </span>
              </>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4B5563', fontFamily: 'var(--font-mono)' }}>
              LIVE
            </span>
          </div>
        </header>

        <main className="console-content console-padded-content" style={{ flex: 1, overflowY: 'auto', background: '#F8FAFC' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default FounderPortalLayout;
