import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AtonixDevLogo from '../AtonixDevLogo';

// Employment Console Navigation
const NAV_ITEMS = [
  { path: '/application-console',         exact: true,  label: 'Dashboard',          code: 'DSH' },
  { path: '/application-console/jobs',    exact: false, label: 'Job Postings',      code: 'JOB' },
  { path: '/application-console/ats',     exact: false, label: 'Applicant Tracking', code: 'ATS' },
  { path: '/application-console/pipeline',exact: false, label: 'Hiring Pipeline',    code: 'PIP' },
  { path: '/application-console/interviews', exact: false, label: 'Interviews',       code: 'INT' },
  { path: '/application-console/evaluations', exact: false, label: 'Evaluations',     code: 'EVL' },
  { path: '/application-console/employees', exact: false, label: 'Employee Directory', code: 'EMP' },
  { path: '/application-console/compliance', exact: false, label: 'Audit & Compliance', code: 'AUD' },
];

const ACCENT  = '#1F4788';
const SIDEBAR_BG     = '#0f1623';
const SIDEBAR_BORDER = 'rgba(255,255,255,0.10)';

const ApplicationConsoleLayout = () => {
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
            Employment Console
          </div>
          <div style={{
            fontSize: 9, color: 'rgba(255,255,255,0.45)', marginTop: 3,
            fontFamily: 'var(--font-mono)', letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            Talent & Hiring
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
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 20px',
                  color: active ? '#FFFFFF' : 'rgba(255,255,255,0.70)',
                  textDecoration: 'none',
                  borderLeft: active ? `3px solid ${ACCENT}` : '3px solid transparent',
                  background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = active ? 'rgba(255,255,255,0.05)' : 'transparent';
                  e.currentTarget.style.color = active ? '#FFFFFF' : 'rgba(255,255,255,0.70)';
                }}
              >
                <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700, minWidth: 30, color: ACCENT }}>
                  {item.code}
                </span>
                <span style={{ marginLeft: 12, fontSize: 13, fontWeight: 500 }}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer — User & Logout */}
        <div style={{ padding: 20, borderTop: `1px solid rgba(255,255,255,0.12)` }}>
          <div style={{
            fontSize: 11, color: 'rgba(255,255,255,0.60)',
            fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
            textTransform: 'uppercase', marginBottom: 8,
          }}>
            Logged In As
          </div>
          <div style={{
            fontSize: 13, fontWeight: 600, color: '#FFFFFF', marginBottom: 12,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {displayName}
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: 12,
              fontWeight: 600,
              border: `1px solid ${ACCENT}`,
              background: 'transparent',
              color: ACCENT,
              borderRadius: 4,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = ACCENT;
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = ACCENT;
            }}
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* ══ MAIN CONTENT ═════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{
          background: '#FFFFFF',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          padding: '16px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="sidebar-toggle"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                flexDirection: 'column',
                gap: 4,
              }}
              aria-label="Toggle sidebar"
            >
              <span style={{ display: 'block', width: 18, height: 2, background: '#1A202C' }} />
              <span style={{ display: 'block', width: 18, height: 2, background: '#1A202C' }} />
              <span style={{ display: 'block', width: 18, height: 2, background: '#1A202C' }} />
            </button>
            <div style={{
              fontSize: 18, fontWeight: 700, color: '#1A202C',
              fontFamily: 'var(--font-mono)', letterSpacing: '0.02em',
            }}>
              {currentItem?.label || 'Employment Console'}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="console-content console-padded-content" style={{ flex: 1, overflow: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ApplicationConsoleLayout;
