import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AtonixDevLogo from '../AtonixDevLogo';

// GS-WSF — Settings Shell
// White sidebar (distinct from dark Dashboard sidebar) with #A81D37 active indicator.
const NAV_SECTIONS = [
  {
    label: 'General',
    items: [
      { path: '/settings/profile',  label: 'Profile'  },
      { path: '/settings/account',  label: 'Account'  },
    ],
  },
  {
    label: 'Security',
    items: [
      { path: '/settings/security',      label: 'Security'      },
      { path: '/settings/ssh-keys',      label: 'SSH Keys'      },
      { path: '/settings/gpg-keys',      label: 'GPG Keys'      },
    ],
  },
  {
    label: 'Developer',
    items: [
      { path: '/settings/access-tokens', label: 'Access Tokens' },
      { path: '/settings/sessions',      label: 'Sessions'      },
      { path: '/settings/notifications', label: 'Notifications' },
    ],
  },
];

const SettingsLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const currentLabel = (() => {
    for (const section of NAV_SECTIONS) {
      const match = section.items.find((i) => i.path === location.pathname);
      if (match) return match.label;
    }
    return 'Settings';
  })();

  const displayName = [user?.user?.first_name, user?.user?.last_name]
    .filter(Boolean).join(' ') || user?.username || 'Developer';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F8FAFC', fontFamily: 'inherit', position: 'relative' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="app-sidebar-overlay"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 49 }}
        />
      )}

      {/* ══ SIDEBAR ═══════════════════════════════════════════ */}
      <aside
        className={`app-sidebar${sidebarOpen ? ' sidebar-open' : ''}`}
        style={{
          width: 240,
          background: '#393E41',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}
      >
        {/* Brand / topbar row */}
        <div
          style={{
            height: 52,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            flexShrink: 0,
          }}
        >
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <AtonixDevLogo size={22} variant="dark" textColor="#FFFFFF" />
          </Link>
          <Link
            to="/dashboard"
            style={{
              fontSize: 10, fontWeight: 700, color: '#4B5563',
              textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase',
            }}
            title="Go to Dashboard"
          >
            Console
          </Link>
        </div>

        {/* Section label: Settings heading */}
        <div
          style={{
            padding: '20px 20px 8px',
            fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Settings
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto', paddingBottom: 12 }}>
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} style={{ marginBottom: 4 }}>
              <div
                style={{
                  padding: '10px 20px 4px',
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {section.label}
              </div>
              {section.items.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      display: 'block',
                      padding: '9px 20px',
                      fontSize: 13,
                      fontWeight: active ? 700 : 400,
                      color: active ? '#FFFFFF' : '#4B5563',
                      textDecoration: 'none',
                      borderLeft: active ? '2px solid #A81D37' : '2px solid transparent',
                      background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                      letterSpacing: '0.01em',
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = '#D1D5DB'; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = '#4B5563'; }}  
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            {/* Avatar */}
            <div
              style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                background: '#A81D37', border: '1px solid rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {user?.oauth_avatar ? (
                <img src={user.oauth_avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', userSelect: 'none' }}>
                  {(user?.first_name || user?.username || 'U')[0].toUpperCase()}
                </span>
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF', marginBottom: 1 }}>
                {displayName}
              </div>
              <div
                style={{
                  fontSize: 11, color: '#4B5563',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}
              >
                {user?.user?.email || ''}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '7px 0',
              background: 'none', border: '1px solid rgba(255,255,255,0.1)',
              color: '#4B5563', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#A81D37';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = '#4B5563';
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ══ MAIN ══════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <div
          style={{
            height: 52, flexShrink: 0,
            background: '#393E41', borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="flex md:hidden"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, flexDirection: 'column', gap: 4 }}
              aria-label="Toggle sidebar"
            >
              <span style={{ display: 'block', width: 18, height: 2, background: '#4B5563' }} />
              <span style={{ display: 'block', width: 18, height: 2, background: '#4B5563' }} />
              <span style={{ display: 'block', width: 18, height: 2, background: '#4B5563' }} />
            </button>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
              }}
            >
              <span style={{ color: '#4B5563' }}>Settings</span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
              <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{currentLabel}</span>
            </div>
          </div>
          <Link
            to="/"
            style={{
              fontSize: 11, color: '#4B5563', textDecoration: 'none',
              fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#4B5563'; }}
          >
            ← Back to Site
          </Link>
        </div>

        {/* Page content */}
        <div className="console-content" style={{ flex: 1, overflowY: 'auto', padding: 'clamp(16px, 4vw, 40px)', maxWidth: 900 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
