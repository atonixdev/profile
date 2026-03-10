import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AtonixDevLogo from '../AtonixDevLogo';

// GS-WSF — Billing & Usage Dashboard Shell
const NAV_ITEMS = [
  { path: '/billing-console',              exact: true,  label: 'Platform Overview',      code: 'OVW' },
  { path: '/billing-console/organizations',exact: false, label: 'Organizations',           code: 'ORG' },
  { path: '/billing-console/services',     exact: false, label: 'Service Analytics',       code: 'SVC' },
  { path: '/billing-console/users',        exact: false, label: 'User Analytics',          code: 'USR' },
  { path: '/billing-console/events',       exact: false, label: 'Event Stream',            code: 'EVT' },
  { path: '/billing-console/invoices',     exact: false, label: 'Invoices',                code: 'INV' },
  { path: '/billing-console/credits',      exact: false, label: 'Credits & Adjustments',   code: 'CRD' },
  { path: '/billing-console/ledger',       exact: false, label: 'Billing Ledger',          code: 'LDG' },
  { path: '/billing-console/compliance',   exact: false, label: 'Audit & Compliance',      code: 'AUD' },
];

const ACCENT  = '#A81D37';
const SIDEBAR_BG     = '#0f1623';
const SIDEBAR_BORDER = 'rgba(255,255,255,0.10)';

const BillingConsoleLayout = () => {
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
    .filter(Boolean).join(' ') || user?.username || 'Administrator';

  return (
    <div
      style={{
        display: 'flex', height: '100vh', overflow: 'hidden',
        background: '#F8FAFC', fontFamily: 'inherit', position: 'relative',
      }}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 49 }}
        />
      )}

      {/* ══ SIDEBAR ═══════════════════════════════════════════ */}
      <aside
        className={`app-sidebar${sidebarOpen ? ' sidebar-open' : ''}`}
        style={{
          width: 244,
          background: SIDEBAR_BG,
          display: 'flex',
          flexDirection: 'column',
          borderRight: `1px solid ${SIDEBAR_BORDER}`,
          overflow: 'hidden',
        }}
      >
        {/* Brand */}
        <div style={{ padding: '20px 20px 18px', borderBottom: `1px solid rgba(255,255,255,0.12)` }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'block' }}>
            <AtonixDevLogo size={26} variant="dark" textColor="#FFFFFF" />
          </Link>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: '#FFFFFF',
            marginTop: 10, fontFamily: 'var(--font-mono)',
          }}>
            Billing Console
          </div>
          <div style={{
            fontSize: 9, color: 'rgba(255,255,255,0.45)', marginTop: 3,
            fontFamily: 'var(--font-mono)', letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            Financial Governance
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
                  padding: '9px 20px',
                  fontSize: 12,
                  fontWeight: active ? 700 : 400,
                  color: active ? '#FFFFFF' : 'rgba(255,255,255,0.60)',
                  textDecoration: 'none',
                  borderLeft: active ? `2px solid ${ACCENT}` : '2px solid transparent',
                  background: active ? 'rgba(168,29,55,0.18)' : 'transparent',
                  letterSpacing: '0.01em',
                  transition: 'color 0.15s, background 0.15s',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = '#FFFFFF'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.60)'; }}
              >
                <span style={{
                  fontSize: 8, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
                  color: active ? ACCENT : 'rgba(255,255,255,0.35)', minWidth: 28, fontWeight: 700,
                }}>
                  {item.code}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Console crosslinks */}
        <div style={{ padding: '10px 14px', borderTop: `1px solid rgba(255,255,255,0.10)` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 6 }}>
            {[
              { to: '/admin-console', label: 'ADMIN' },
              { to: '/ops',           label: 'OPS' },
            ].map(({ to, label }) => (
              <Link key={to} to={to} style={{
                padding: '7px 6px', fontSize: 9, fontWeight: 700,
                letterSpacing: '0.10em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.70)',
                textDecoration: 'none', border: '1px solid rgba(255,255,255,0.20)',
                background: 'rgba(255,255,255,0.08)', textAlign: 'center',
                fontFamily: 'var(--font-mono)',
              }}>
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* User section */}
        <div style={{ padding: '14px 20px', borderTop: `1px solid rgba(255,255,255,0.10)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: ACCENT, border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
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
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
                FINANCIAL ADMIN
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '8px', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.10em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.65)', background: 'transparent',
              border: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer',
              fontFamily: 'inherit', transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.45)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ══ MAIN AREA ════════════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <header style={{
          height: 52, minHeight: 52, background: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 28px', gap: 16,
        }}>
          {/* Mobile menu toggle */}
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            <div style={{ width: 18, height: 2, background: '#111827', marginBottom: 4 }} />
            <div style={{ width: 18, height: 2, background: '#111827', marginBottom: 4 }} />
            <div style={{ width: 18, height: 2, background: '#111827' }} />
          </button>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(168,29,55,0.8)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              BILLING-CONSOLE
            </span>
            {currentItem && (
              <>
                <span style={{ fontSize: 10, color: '#D1D5DB' }}>/</span>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', color: '#1F2937', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                  {currentItem.code} — {currentItem.label}
                </span>
              </>
            )}
          </div>

          {/* Live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4B5563', fontFamily: 'var(--font-mono)' }}>
              LIVE
            </span>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', background: '#F8FAFC' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default BillingConsoleLayout;
