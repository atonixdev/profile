import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AtonixDevLogo from '../AtonixDevLogo';

// GS-WSF — Enterprise Admin Console Shell
const NAV_ITEMS = [
  { path: '/admin-console',           exact: true,  label: 'User Management',       code: 'USM' },
  { path: '/admin-console/roles',     exact: false, label: 'Roles & Permissions',   code: 'RPM' },
  { path: '/admin-console/config',    exact: false, label: 'Platform Config',       code: 'CFG' },
  { path: '/admin-console/security',  exact: false, label: 'Security & Access',     code: 'SEC' },
  { path: '/admin-console/audit',     exact: false, label: 'Audit Logs',            code: 'AUD' },
  { path: '/admin-console/billing',   exact: false, label: 'Billing & Subscriptions', code: 'BIL' },
  { path: '/admin-console/api',       exact: false, label: 'Developer Tools & API', code: 'API' },
  { path: '/admin-console/email',     exact: false, label: 'Email & Domain',        code: 'EML' },
  { path: '/admin-console/settings',  exact: false, label: 'System Settings',       code: 'SYS' },
  { path: '/admin-console/activity',  exact: false, label: 'Admin Activity',        code: 'ACT' },
  { path: '/admin-console/features',  exact: false, label: 'Feature Flags',         code: 'FLG' },
];

const ACCENT = '#D4AF37';

const AdminLayout = () => {
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
        background: '#0D1117', fontFamily: 'inherit', position: 'relative',
      }}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 49 }}
        />
      )}

      {/* ══ SIDEBAR ═════════════════════════════════════════ */}
      <aside
        className={`app-sidebar${sidebarOpen ? ' sidebar-open' : ''}`}
        style={{
          width: 244,
          background: '#06080D',
          display: 'flex',
          flexDirection: 'column',
          borderRight: `1px solid rgba(212,175,55,0.12)`,
          overflow: 'hidden',
        }}
      >
        {/* Brand */}
        <div
          style={{
            padding: '20px 20px 18px',
            borderBottom: `1px solid rgba(212,175,55,0.1)`,
          }}
        >
          <Link to="/" style={{ textDecoration: 'none', display: 'block' }}>
            <AtonixDevLogo size={26} variant="dark" textColor="#FFFFFF" />
          </Link>
          <div
            style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: ACCENT,
              marginTop: 10, fontFamily: 'var(--font-mono)',
            }}
          >
            Admin Console
          </div>
          <div
            style={{
              fontSize: 9, color: '#374151', marginTop: 3,
              fontFamily: 'var(--font-mono)', letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Enterprise Governance
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
                  color: active ? '#FFFFFF' : '#4B5563',
                  textDecoration: 'none',
                  borderLeft: active ? `2px solid ${ACCENT}` : '2px solid transparent',
                  background: active ? 'rgba(212,175,55,0.08)' : 'transparent',
                  letterSpacing: '0.01em',
                  transition: 'color 0.15s, background 0.15s',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = '#9CA3AF'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = '#4B5563'; }}
              >
                <span
                  style={{
                    fontSize: 8, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
                    color: active ? ACCENT : '#374151', minWidth: 26, fontWeight: 700,
                  }}
                >
                  {item.code}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Console crosslinks */}
        <div style={{ padding: '10px 16px', borderTop: `1px solid rgba(212,175,55,0.1)` }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link
              to="/ops"
              style={{
                flex: 1, padding: '7px 6px', fontSize: 9, fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A81D37',
                textDecoration: 'none', border: '1px solid rgba(168,29,55,0.3)',
                background: 'rgba(168,29,55,0.06)', textAlign: 'center',
                fontFamily: 'var(--font-mono)',
              }}
            >
              OPS CTRL
            </Link>
            <Link
              to="/dashboard"
              style={{
                flex: 1, padding: '7px 6px', fontSize: 9, fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B7280',
                textDecoration: 'none', border: '1px solid rgba(107,114,128,0.25)',
                background: 'rgba(107,114,128,0.04)', textAlign: 'center',
                fontFamily: 'var(--font-mono)',
              }}
            >
              DEV CON.
            </Link>
          </div>
        </div>

        {/* User section */}
        <div style={{ padding: '14px 20px', borderTop: `1px solid rgba(212,175,55,0.1)` }}>
          <div
            style={{
              fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em',
              color: ACCENT, marginBottom: 4, textTransform: 'uppercase',
            }}
          >
            Administrator
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF', marginBottom: 2 }}>
            {displayName}
          </div>
          <div
            style={{
              fontSize: 11, color: '#6B7280', marginBottom: 12,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            {user?.user_email || user?.user?.email || ''}
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '7px 0',
              background: `rgba(212,175,55,0.06)`,
              border: `1px solid rgba(212,175,55,0.2)`,
              color: '#6B7280', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.borderColor = `rgba(212,175,55,0.5)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#6B7280';
              e.currentTarget.style.borderColor = `rgba(212,175,55,0.2)`;
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
            background: '#06080D',
            borderBottom: `1px solid rgba(212,175,55,0.1)`,
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="flex md:hidden"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 6, flexDirection: 'column', gap: 4,
              }}
              aria-label="Toggle sidebar"
            >
              <span style={{ display: 'block', width: 18, height: 2, background: '#9CA3AF' }} />
              <span style={{ display: 'block', width: 18, height: 2, background: '#9CA3AF' }} />
              <span style={{ display: 'block', width: 18, height: 2, background: '#9CA3AF' }} />
            </button>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
              }}
            >
              <span style={{ color: ACCENT, fontWeight: 700 }}>ADMIN</span>
              <span style={{ color: '#374151' }}>/</span>
              <span style={{ color: '#FFFFFF', fontWeight: 700 }}>
                {currentItem?.label || 'Console'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontFamily: 'var(--font-mono)' }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: ACCENT }} />
              <span style={{ color: '#374151', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Governance Active
              </span>
            </div>
            <Link
              to="/ops"
              style={{
                fontSize: 10, color: '#A81D37', textDecoration: 'none',
                fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              OPS →
            </Link>
            <Link
              to="/dashboard"
              style={{
                fontSize: 10, color: '#6B7280', textDecoration: 'none',
                fontFamily: 'var(--font-mono)', letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              DEV CONSOLE →
            </Link>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#0D1117' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
