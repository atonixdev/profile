import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AtonixDevLogo from '../AtonixDevLogo';

const NAV_ITEMS = [
  { path: '/support-console',             exact: true,  label: 'Ticket Inbox',       code: 'INB' },
  { path: '/support-console/escalated',   exact: false, label: 'Escalated',          code: 'ESC' },
  { path: '/support-console/pending',     exact: false, label: 'Pending',            code: 'PND' },
  { path: '/support-console/resolved',    exact: false, label: 'Resolved',           code: 'RES' },
  { path: '/support-console/overview',    exact: false, label: 'Analytics',          code: 'ANL' },
];

const SIDEBAR_BG = '#1B3A4B';

const SupportConsoleLayout = () => {
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

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F8FAFC', fontFamily: 'inherit', position: 'relative' }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 49 }} />
      )}

      {/* ══ SIDEBAR ══════════════════════════════════════════════ */}
      <aside
        className={`app-sidebar${sidebarOpen ? ' sidebar-open' : ''}`}
        style={{ width: 244, background: SIDEBAR_BG, display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}
      >
        {/* Brand */}
        <div style={{ padding: '20px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'block' }}>
            <AtonixDevLogo size={26} variant="dark" textColor="#FFFFFF" />
          </Link>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#FFFFFF', marginTop: 10, fontFamily: 'var(--font-mono)' }}>
            Support Console
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 3, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Enterprise Support System
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
                  color: active ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  borderLeft: active ? '2px solid #22C55E' : '2px solid transparent',
                  background: active ? 'rgba(34,197,94,0.12)' : 'transparent',
                  letterSpacing: '0.01em',
                  transition: 'color 0.15s, background 0.15s',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = '#FFFFFF'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
              >
                <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', color: active ? '#22C55E' : 'rgba(255,255,255,0.38)', minWidth: 26, fontWeight: 700 }}>
                  {item.code}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Console crosslinks */}
        <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/admin-console" style={{ flex: 1, padding: '7px 6px', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#FFFFFF', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
              ADMIN
            </Link>
            <Link to="/ops" style={{ flex: 1, padding: '7px 6px', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
              OPS
            </Link>
            <Link to="/dashboard" style={{ flex: 1, padding: '7px 6px', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
              DEV
            </Link>
          </div>
        </div>

        {/* User section */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: '#A81D37', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {user?.oauth_avatar ? (
                <img src={user.oauth_avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', userSelect: 'none' }}>
                  {(user?.first_name || user?.username || 'S')[0].toUpperCase()}
                </span>
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', marginBottom: 2, textTransform: 'uppercase' }}>Support Agent</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.user_email || user?.user?.email || ''}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{ width: '100%', padding: '7px 0', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.15s, border-color 0.15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ══ MAIN ══════════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Top bar */}
        <div style={{ height: 52, flexShrink: 0, background: SIDEBAR_BG, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
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
              <span style={{ color: '#22C55E', fontWeight: 700 }}>SUPPORT</span>
              <span style={{ color: 'rgba(255,255,255,0.35)' }}>/</span>
              <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>
                {currentItem?.label || 'Console'}
              </span>
            </div>
          </div>

          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontFamily: 'var(--font-mono)' }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
              <span style={{ color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Support Active</span>
            </div>
            <Link to="/support" style={{ fontSize: 10, color: '#86EFAC', textDecoration: 'none', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', fontWeight: 700, textTransform: 'uppercase' }}>
              PUBLIC FORM →
            </Link>
            <Link to="/admin-console" style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              ADMIN →
            </Link>
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

export default SupportConsoleLayout;
