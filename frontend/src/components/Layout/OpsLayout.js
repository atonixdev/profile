import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AtonixDevLogo from '../AtonixDevLogo';

// GS-WSF — Operational Control Shell
const NAV_ITEMS = [
  { path: '/ops',              exact: true,  label: 'System Overview'   },
  { path: '/ops/services',     exact: false, label: 'Service Health'    },
  { path: '/ops/logs',         exact: false, label: 'Operational Logs'  },
  { path: '/ops/security',     exact: false, label: 'Security Events'   },
  { path: '/ops/resources',    exact: false, label: 'Resource Usage'    },
  { path: '/ops/pipelines',    exact: false, label: 'Pipeline Activity' },
  { path: '/ops/models',       exact: false, label: 'Model Flows'       },
  { path: '/ops/environments', exact: false, label: 'Environments'      },
  { path: '/ops/incidents',    exact: false, label: 'Incident Center'   },
  { path: '/ops/audit',        exact: false, label: 'Audit Center'      },
];

const OpsLayout = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
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
    .filter(Boolean).join(' ') || user?.username || 'Operator';

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
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 49 }}
        />
      )}

      {/* ══ SIDEBAR ═════════════════════════════════════════ */}
      <aside
        className={`app-sidebar${sidebarOpen ? ' sidebar-open' : ''}`}
        style={{
          width: 232,
          background: '#23395b',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Brand */}
        <div style={{ padding: '20px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'block' }}>
            <AtonixDevLogo size={26} variant="dark" textColor="#FFFFFF" />
          </Link>
          <div
            style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)',
              marginTop: 10, fontFamily: 'var(--font-mono)',
            }}
          >
            Operational Control
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
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center',
                  padding: '10px 20px',
                  fontSize: 13,
                  fontWeight: active ? 700 : 400,
                  color: active ? '#FFFFFF' : 'rgba(255,255,255,0.65)',
                  textDecoration: 'none',
                  borderLeft: active ? '2px solid rgba(255,255,255,0.9)' : '2px solid transparent',
                  background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                  letterSpacing: '0.01em',
                  transition: 'color 0.15s, background 0.15s',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = '#FFFFFF'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF', marginBottom: 2 }}>
            {displayName}
          </div>
          <div
            style={{
              fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 14,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            {user?.user?.email || ''}
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '8px 0',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.18)',
              color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#9CA3AF';
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
            background: '#23395b', borderBottom: '1px solid rgba(255,255,255,0.12)',
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
              <span style={{ display: 'block', width: 18, height: 2, background: 'rgba(255,255,255,0.8)' }} />
              <span style={{ display: 'block', width: 18, height: 2, background: 'rgba(255,255,255,0.8)' }} />
              <span style={{ display: 'block', width: 18, height: 2, background: 'rgba(255,255,255,0.8)' }} />
            </button>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
              }}
            >
              <span style={{ color: '#FFFFFF', fontWeight: 700 }}>OPS</span>
              <span style={{ color: 'rgba(255,255,255,0.45)' }}>/</span>
              <span style={{ color: 'rgba(255,255,255,0.85)' }}>{currentItem?.label || 'Overview'}</span>
            </div>
          </div>

          {/* Right controls */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 16 }}>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 11, fontFamily: 'var(--font-mono)',
              }}
            >
              <span
                style={{
                  display: 'inline-block', width: 7, height: 7,
                  borderRadius: '50%', background: '#22C55E',
                }}
              />
              <span style={{ color: 'rgba(255,255,255,0.65)', letterSpacing: '0.08em' }}>ALL SYSTEMS NOMINAL</span>
            </div>
            <Link
              to="/admin-console"
              style={{
                fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.85)', textDecoration: 'none',
                fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase',
              }}
            >
              ADMIN →
            </Link>
            <Link
              to="/dashboard"
              style={{
                fontSize: 11, color: 'rgba(255,255,255,0.65)', textDecoration: 'none',
                fontFamily: 'var(--font-mono)', letterSpacing: '0.08em',
              }}
            >
              DEV CONSOLE →
            </Link>
          </div>
        </div>

        {/* Content area */}
        <div className="ops-content" style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default OpsLayout;
