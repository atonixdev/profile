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
  { path: '/admin-console/email',           exact: false, label: 'Email & Domain',        code: 'EML' },
  { path: '/admin-console/settings',        exact: false, label: 'System Settings',       code: 'SYS' },
  { path: '/admin-console/activity',  exact: false, label: 'Admin Activity',        code: 'ACT' },
  { path: '/admin-console/features',   exact: false, label: 'Feature Flags',         code: 'FLG' },
  { path: '/admin-console/campaigns',  exact: false, label: 'Campaigns',              code: 'CMP' },
  { path: '/admin-console/support',    exact: false, label: 'Support Inbox',           code: 'SUP' },
];

const ACCENT = '#D4AF37';
const SIDEBAR_BG = '#406e8e';
const SIDEBAR_BORDER = 'rgba(255,255,255,0.12)';

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

      {/* ══ SIDEBAR ═════════════════════════════════════════ */}
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
        <div
          style={{
            padding: '20px 20px 18px',
            borderBottom: `1px solid rgba(255,255,255,0.15)`,
          }}
        >
          <Link to="/" style={{ textDecoration: 'none', display: 'block' }}>
            <AtonixDevLogo size={26} variant="dark" textColor="#FFFFFF" />
          </Link>
          <div
            style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: '#FFFFFF',
              marginTop: 10, fontFamily: 'var(--font-mono)',
            }}
          >
            Admin Console
          </div>
          <div
            style={{
              fontSize: 9, color: 'rgba(255,255,255,0.55)', marginTop: 3,
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
                  padding: item.sub ? '7px 20px 7px 36px' : '9px 20px',
                  fontSize: item.sub ? 11 : 12,
                  fontWeight: active ? 700 : 400,
                  color: active ? '#FFFFFF' : 'rgba(255,255,255,0.65)',
                  textDecoration: 'none',
                  borderLeft: active ? `2px solid #FFFFFF` : '2px solid transparent',
                  background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  letterSpacing: '0.01em',
                  transition: 'color 0.15s, background 0.15s',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = '#FFFFFF'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
              >
                <span
                  style={{
                    fontSize: 8, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
                    color: active ? '#FFFFFF' : 'rgba(255,255,255,0.45)', minWidth: 26, fontWeight: 700,
                  }}
                >
                  {item.code}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Founder Portal link — admin only */}
        {user?.is_staff && (
          <div style={{ padding: '10px 16px', borderTop: `1px solid rgba(255,255,255,0.15)` }}>
            <Link
              to="/founder-portal"
              style={{
                display: 'block', padding: '7px 6px', fontSize: 9, fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase', color: '#FFFFFF',
                textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.1)', textAlign: 'center',
                fontFamily: 'var(--font-mono)',
              }}
            >
              ← FOUNDER PORTAL
            </Link>
          </div>
        )}

        {/* User section */}
        <div style={{ padding: '14px 20px', borderTop: `1px solid rgba(255,255,255,0.15)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            {/* Avatar */}
            <div
              style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                background: '#A81D37', border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {user?.oauth_avatar ? (
                <img src={user.oauth_avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', userSelect: 'none' }}>
                  {(user?.first_name || user?.username || 'A')[0].toUpperCase()}
                </span>
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em',
                  color: 'rgba(255,255,255,0.6)', marginBottom: 2, textTransform: 'uppercase',
                }}
              >
                Administrator
              </div>
              <div
                style={{
                  fontSize: 11, color: 'rgba(255,255,255,0.55)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}
              >
                {user?.user_email || user?.user?.email || ''}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '7px 0',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.55)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
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
            background: '#406e8e',
            borderBottom: '1px solid rgba(255,255,255,0.12)',
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
              <span style={{ color: '#FFFFFF', fontWeight: 700 }}>ADMIN</span>
              <span style={{ color: 'rgba(255,255,255,0.45)' }}>/</span>
              <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>
                {currentItem?.label || 'Console'}
              </span>
            </div>
          </div>

          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontFamily: 'var(--font-mono)' }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.7)' }} />
              <span style={{ color: 'rgba(255,255,255,0.65)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Governance Active
              </span>
            </div>
            {user?.is_staff && (
              <Link
                to="/founder-portal"
                style={{
                  fontSize: 10, color: '#FFB3BF', textDecoration: 'none',
                  fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', fontWeight: 700,
                  textTransform: 'uppercase', opacity: 0.9,
                }}
              >
                FOUNDER PORTAL →
              </Link>
            )}
          </div>
        </div>

        {/* Page content */}
        <div className="console-content" style={{ flex: 1, overflowY: 'auto', background: '#FFFFFF' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
