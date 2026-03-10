import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AtonixDevLogo from '../AtonixDevLogo';

// GS-WSF — Email & Communications Console Shell
const NAV_ITEMS = [
  { path: '/email-console',            exact: true,  label: 'Overview',           code: 'OVW' },
  { path: '/email-console/inbox',      exact: false, label: 'Inbox',              code: 'INB' },
  { path: '/email-console/marketing',  exact: false, label: 'Marketing',          code: 'MKT' },
  { path: '/email-console/campaigns',  exact: false, label: 'Campaigns',          code: 'CMP' },
  { path: '/email-console/templates',  exact: false, label: 'Templates',          code: 'TPL' },
  { path: '/email-console/logs',       exact: false, label: 'Email Logs',         code: 'LOG' },
  { path: '/email-console/domains',    exact: false, label: 'Sending Domains',    code: 'DOM' },
  { path: '/email-console/smtp',       exact: false, label: 'SMTP Settings',      code: 'SMP' },
  { path: '/email-console/senders',    exact: false, label: 'Sender Identities',  code: 'SND' },
];

const ACCENT = '#D4AF37';
const SIDEBAR_BG = '#2c1654';
const BORDER = 'rgba(255,255,255,0.12)';

const EmailConsoleLayout = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (item) =>
    item.exact
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path);

  const currentItem = NAV_ITEMS.find(isActive);

  const handleLogout = () => { logout(); navigate('/'); };

  const displayName = [user?.user?.first_name, user?.user?.last_name]
    .filter(Boolean).join(' ') || user?.username || 'Administrator';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F8FAFC', fontFamily: 'inherit', position: 'relative' }}>

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 49 }} />
      )}

      {/* ══ SIDEBAR ═══════════════════════════════════════════════ */}
      <aside
        className={`app-sidebar${sidebarOpen ? ' sidebar-open' : ''}`}
        style={{ width: 244, background: SIDEBAR_BG, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${BORDER}`, overflow: 'hidden' }}
      >
        {/* Brand */}
        <div style={{ padding: '20px 20px 18px', borderBottom: `1px solid rgba(255,255,255,0.15)` }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'block' }}>
            <AtonixDevLogo size={26} variant="dark" textColor="#FFFFFF" />
          </Link>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#FFFFFF', marginTop: 10, fontFamily: 'var(--font-mono)' }}>
            Email Console
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 3, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Communications &amp; Marketing
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
                  padding: '9px 20px', fontSize: 12,
                  fontWeight: active ? 700 : 400,
                  color: active ? '#FFFFFF' : 'rgba(255,255,255,0.65)',
                  textDecoration: 'none',
                  borderLeft: active ? `2px solid ${ACCENT}` : '2px solid transparent',
                  background: active ? 'rgba(212,175,55,0.12)' : 'transparent',
                  letterSpacing: '0.01em',
                  transition: 'color 0.15s, background 0.15s',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = '#FFFFFF'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
              >
                <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', color: active ? ACCENT : 'rgba(255,255,255,0.4)', minWidth: 26, fontWeight: 700 }}>
                  {item.code}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Crosslinks */}
        <div style={{ padding: '10px 16px', borderTop: `1px solid rgba(255,255,255,0.15)` }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/admin-console" style={{ flex: 1, padding: '7px 6px', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
              ADMIN
            </Link>
            <Link to="/ops" style={{ flex: 1, padding: '7px 6px', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
              OPS
            </Link>
            <Link to="/dashboard" style={{ flex: 1, padding: '7px 6px', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
              DEV
            </Link>
          </div>
        </div>

        {/* User section */}
        <div style={{ padding: '14px 20px', borderTop: `1px solid rgba(255,255,255,0.15)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: '#A81D37', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {user?.oauth_avatar ? (
                <img src={user.oauth_avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', userSelect: 'none' }}>
                  {(user?.first_name || user?.username || 'A')[0].toUpperCase()}
                </span>
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', marginBottom: 2, textTransform: 'uppercase' }}>
                Administrator
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.user_email || user?.user?.email || ''}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{ width: '100%', padding: '7px 0', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.15s, border-color 0.15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.55)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ══ MAIN ══════════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Top bar */}
        <div style={{ height: 52, flexShrink: 0, background: SIDEBAR_BG, borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="flex md:hidden"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, flexDirection: 'column', gap: 4 }}
              aria-label="Toggle sidebar"
            >
              <span style={{ display: 'block', width: 18, height: 2, background: 'rgba(255,255,255,0.8)' }} />
              <span style={{ display: 'block', width: 18, height: 2, background: 'rgba(255,255,255,0.8)' }} />
              <span style={{ display: 'block', width: 18, height: 2, background: 'rgba(255,255,255,0.8)' }} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
              <span style={{ color: ACCENT, fontWeight: 700 }}>EMAIL</span>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>/</span>
              <span style={{ color: 'rgba(255,255,255,0.85)' }}>{currentItem?.label || 'Overview'}</span>
            </div>
          </div>

          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>SMTP ONLINE</span>
            </div>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-mono)' }}>{displayName}</span>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default EmailConsoleLayout;
