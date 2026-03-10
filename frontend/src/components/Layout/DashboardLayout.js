import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AtonixDevLogo from '../AtonixDevLogo';

// GS-WSF — Developer Dashboard Shell
const NAV_ITEMS = [
  { path: '/dashboard',              exact: true,  label: 'Overview'      },
  { path: '/dashboard/projects',     exact: false, label: 'Projects'      },
  { path: '/dashboard/workspaces',   exact: false, label: 'Workspaces'    },
  { path: '/dashboard/pipelines',    exact: false, label: 'Pipelines'     },
  { path: '/dashboard/environments', exact: false, label: 'Environments'  },
  { path: '/dashboard/registries',   exact: false, label: 'Registries'    },
  { path: '/dashboard/monitoring',   exact: false, label: 'Monitoring'    },
  { path: '/dashboard/support',      exact: false, label: 'Support'       },
];

const DashboardLayout = () => {
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
    .filter(Boolean).join(' ') || user?.username || 'Developer';

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
          className="app-sidebar-overlay"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 49 }}
        />
      )}

      {/* ══ SIDEBAR ═════════════════════════════════════════ */}
      <aside
        className={`app-sidebar${sidebarOpen ? ' sidebar-open' : ''}`}
        style={{
          width: 224,
          background: '#393E41',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}
      >
        {/* Brand */}
        <div
          style={{
            padding: '20px 20px 18px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Link to="/" style={{ textDecoration: 'none', display: 'block' }}>
            <AtonixDevLogo size={26} variant="dark" textColor="#FFFFFF" />
          </Link>
          <div
            style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: '#4B5563',
              marginTop: 10, fontFamily: 'var(--font-mono)',
            }}
          >
            Developer Console
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, paddingTop: 12, paddingBottom: 12, overflowY: 'auto' }}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex', alignItems: 'center',
                  padding: '10px 20px',
                  fontSize: 13,
                  fontWeight: active ? 700 : 400,
                  color: active ? '#FFFFFF' : '#4B5563',
                  textDecoration: 'none',
                  borderLeft: active ? '2px solid #A81D37' : '2px solid transparent',
                  background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                  letterSpacing: '0.01em',
                  transition: 'color 0.15s, background 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.color = '#D1D5DB';
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.color = '#4B5563';
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Staff consoles */}
        {user?.is_staff && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link
              to="/admin-console"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 12px',
                background: 'rgba(212,175,55,0.1)',
                border: '1px solid rgba(212,175,55,0.3)',
                textDecoration: 'none',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(212,175,55,0.22)';
                e.currentTarget.style.borderColor = 'rgba(212,175,55,0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(212,175,55,0.1)';
                e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)';
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
                    textTransform: 'uppercase', color: '#D4AF37',
                    fontFamily: 'var(--font-mono)', marginBottom: 2,
                  }}
                >
                  Admin
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#FFFFFF' }}>
                  Admin Console
                </div>
              </div>
              <span style={{ fontSize: 12, color: '#D4AF37' }}>→</span>
            </Link>
            <Link
              to="/ops"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 12px',
                background: 'rgba(168,29,55,0.15)',
                border: '1px solid rgba(168,29,55,0.35)',
                textDecoration: 'none',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(168,29,55,0.28)';
                e.currentTarget.style.borderColor = 'rgba(168,29,55,0.7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(168,29,55,0.15)';
                e.currentTarget.style.borderColor = 'rgba(168,29,55,0.35)';
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
                    textTransform: 'uppercase', color: '#A81D37',
                    fontFamily: 'var(--font-mono)', marginBottom: 2,
                  }}
                >
                  Staff Access
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#FFFFFF' }}>
                  Operational Control
                </div>
              </div>
              <span style={{ fontSize: 12, color: '#A81D37' }}>→</span>
            </Link>
          </div>
        )}

        {/* User section */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
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
                  {(user?.first_name || user?.username || 'D')[0].toUpperCase()}
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
              width: '100%', padding: '8px 0',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#4B5563', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#4B5563';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ══ MAIN ════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Top bar */}
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
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 6, flexDirection: 'column', gap: 4,
              }}
              aria-label="Toggle sidebar"
            >
              <span style={{ display: 'block', width: 18, height: 2, background: '#4B5563' }} />
              <span style={{ display: 'block', width: 18, height: 2, background: '#4B5563' }} />
              <span style={{ display: 'block', width: 18, height: 2, background: '#4B5563' }} />
            </button>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 12,
                fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
              }}
            >
              <span style={{ color: '#4B5563' }}>Console</span>
              <span style={{ color: '#1F2937' }}>/</span>
              <span style={{ color: '#FFFFFF', fontWeight: 700 }}>
                {currentItem?.label || 'Dashboard'}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {user?.is_staff && (
              <>
                <Link
                  to="/admin-console"
                  style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: '#D4AF37',
                    textDecoration: 'none', fontFamily: 'var(--font-mono)',
                    padding: '4px 10px',
                    border: '1px solid rgba(212,175,55,0.35)',
                    background: 'rgba(212,175,55,0.08)',
                    transition: 'background 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(212,175,55,0.2)';
                    e.currentTarget.style.borderColor = '#D4AF37';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(212,175,55,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(212,175,55,0.35)';
                  }}
                >
                  ADMIN
                </Link>
                <Link
                  to="/ops"
                  style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: '#A81D37',
                    textDecoration: 'none', fontFamily: 'var(--font-mono)',
                    padding: '4px 10px',
                    border: '1px solid rgba(168,29,55,0.4)',
                    background: 'rgba(168,29,55,0.1)',
                    transition: 'background 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(168,29,55,0.25)';
                    e.currentTarget.style.borderColor = '#A81D37';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(168,29,55,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(168,29,55,0.4)';
                  }}
                >
                  OPS
                </Link>
              </>
            )}
            <Link
              to="/"
              style={{
                fontSize: 11, color: '#4B5563', textDecoration: 'none',
                fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#4B5563'; }}
            >
              ← Back to Site
            </Link>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
