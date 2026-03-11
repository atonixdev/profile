import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AtonixDevLogo from '../AtonixDevLogo';

// AtonixDev Social Hub — Console Shell
// Design: dark sidebar (#0f1623), gold accent (#D4AF37), light content area

const ACCENT      = '#D4AF37';
const SIDEBAR_BG  = '#0f1623';
const BD          = '1px solid rgba(255,255,255,0.10)';

const NAV_ITEMS = [
  { path: '/social-hub',              exact: true,  label: 'Hub Overview',    code: 'OVW' },
  { path: '/social-hub/posts',        exact: false, label: 'Posts',           code: 'PST' },
  { path: '/social-hub/calendar',     exact: false, label: 'Calendar',        code: 'CAL' },
  { path: '/social-hub/media',        exact: false, label: 'Media Library',   code: 'MED' },
  { path: '/social-hub/accounts',     exact: false, label: 'Accounts',        code: 'ACC' },
  { path: '/social-hub/analytics',    exact: false, label: 'Analytics',       code: 'ANL' },
];

const PLATFORM_ICONS = {
  linkedin:  'in',
  facebook:  'fb',
  instagram: 'ig',
  twitter:   'x',
  tiktok:    'tk',
  youtube:   'yt',
};

const SocialHubLayout = () => {
  const location   = useLocation();
  const navigate   = useNavigate();
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

  const displayName =
    [user?.user?.first_name, user?.user?.last_name].filter(Boolean).join(' ') ||
    user?.username || 'User';

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
          borderRight: BD,
          overflow: 'hidden',
        }}
      >
        {/* Brand */}
        <div style={{ padding: '20px 20px 18px', borderBottom: BD }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'block' }}>
            <AtonixDevLogo size={26} variant="dark" textColor="#FFFFFF" />
          </Link>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: ACCENT,
            marginTop: 10, fontFamily: 'var(--font-mono)',
          }}>
            Social Hub
          </div>
          <div style={{
            fontSize: 9, color: 'rgba(255,255,255,0.40)', marginTop: 3,
            fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            Multi-Platform Publishing
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
                  color: active ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
                  textDecoration: 'none',
                  borderLeft: active ? `2px solid ${ACCENT}` : '2px solid transparent',
                  background: active ? `rgba(212,175,55,0.12)` : 'transparent',
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
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Platform legend */}
        <div style={{ padding: '10px 14px', borderTop: BD }}>
          <div style={{
            fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.35)',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            fontFamily: 'var(--font-mono)', marginBottom: 8,
          }}>
            Supported Platforms
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.entries(PLATFORM_ICONS).map(([platform, code]) => (
              <span
                key={platform}
                title={platform.charAt(0).toUpperCase() + platform.slice(1)}
                style={{
                  fontSize: 8, fontWeight: 700, fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  padding: '3px 7px',
                  background: 'rgba(212,175,55,0.08)',
                  border: '1px solid rgba(212,175,55,0.2)',
                  color: 'rgba(212,175,55,0.8)',
                }}
              >
                {code}
              </span>
            ))}
          </div>
        </div>

        {/* Founder Portal link — admin only */}
        {user?.is_staff && (
          <div style={{ padding: '8px 14px', borderTop: BD }}>
            <Link to="/founder-portal" style={{ display: 'block', padding: '7px 10px', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A81D37', textDecoration: 'none', border: '1px solid rgba(168,29,55,0.4)', background: 'rgba(168,29,55,0.08)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
              ← FOUNDER PORTAL
            </Link>
          </div>
        )}

        {/* User section */}
        <div style={{ padding: '14px 20px', borderTop: BD }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(212,175,55,0.3)',
              border: `1px solid ${ACCENT}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {user?.oauth_avatar ? (
                <img src={user.oauth_avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 13, fontWeight: 700, color: ACCENT, userSelect: 'none' }}>
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayName}
              </div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.40)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Social Hub
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '8px', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.10em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.55)', background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer',
              fontFamily: 'inherit', transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ══ MAIN AREA ════════════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Top bar */}
        <header style={{
          height: 52, minHeight: 52, background: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', gap: 16, flexShrink: 0,
        }}>
          {/* Mobile menu toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', flexDirection: 'column', gap: 4 }}
              aria-label="Open navigation"
            >
              <div style={{ width: 18, height: 2, background: '#374151' }} />
              <div style={{ width: 18, height: 2, background: '#374151' }} />
              <div style={{ width: 18, height: 2, background: '#374151' }} />
            </button>

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
                color: ACCENT, textTransform: 'uppercase', fontFamily: 'var(--font-mono)',
              }}>
                SOCIAL-HUB
              </span>
              {currentItem && (
                <>
                  <span style={{ fontSize: 10, color: '#D1D5DB' }}>/</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.10em',
                    color: '#1F2937', textTransform: 'uppercase', fontFamily: 'var(--font-mono)',
                  }}>
                    {currentItem.code} — {currentItem.label}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link
              to="/social-hub/posts/new"
              style={{
                padding: '7px 18px',
                background: ACCENT, border: 'none',
                color: '#06080D', fontSize: 11, fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                textDecoration: 'none', fontFamily: 'inherit',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              + Create Post
            </Link>
            <Link
              to="/"
              style={{
                fontSize: 11, color: '#6B7280', textDecoration: 'none',
                fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#111827'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7280'; }}
            >
              ← Site
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="console-content console-padded-content" style={{ flex: 1, overflowY: 'auto', background: '#F8FAFC' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SocialHubLayout;
