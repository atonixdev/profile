import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AtonixDevLogo from '../AtonixDevLogo';

// GS-WSF — Pipeline-Centric Model Flow Dashboard Shell (Dashboard 2)
const PipelineDashboardLayout = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { pipelineId } = useParams();
  const { user, logout } = useAuth();
  const [running, setRunning] = useState(false);

  const base = `/pipelines/${pipelineId}`;

  const TAB_ITEMS = [
    { path: base,                    exact: true,  label: 'Overview'       },
    { path: `${base}/graph`,         exact: false, label: 'Pipeline Graph' },
    { path: `${base}/steps`,         exact: false, label: 'Steps'          },
    { path: `${base}/containers`,    exact: false, label: 'Containers'     },
    { path: `${base}/logs`,          exact: false, label: 'Logs'           },
    { path: `${base}/artifacts`,     exact: false, label: 'Artifacts'      },
    { path: `${base}/reports`,       exact: false, label: 'Reports'        },
    { path: `${base}/metrics`,       exact: false, label: 'Metrics'        },
    { path: `${base}/settings`,      exact: false, label: 'Settings'       },
  ];

  const isActive = (item) =>
    item.exact
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path);

  const currentItem = TAB_ITEMS.find(isActive) || TAB_ITEMS[0];

  const displayName = [user?.user?.first_name, user?.user?.last_name]
    .filter(Boolean).join(' ') || user?.username || 'Developer';

  const handleLogout = () => { logout(); navigate('/'); };

  const handleRun = () => {
    setRunning(true);
    setTimeout(() => setRunning(false), 3000);
  };

  // Derive a human-readable label from the pipelineId param
  const pipelineLabel = pipelineId
    ? pipelineId.replace(/-/g, '_')
    : 'pipeline_001';

  return (
    <div
      style={{
        display: 'flex', height: '100vh', overflow: 'hidden',
        background: '#F8FAFC', fontFamily: 'inherit',
      }}
    >
      {/* ══ SIDEBAR ═════════════════════════════════════════ */}
      <aside
        style={{
          width: 224, flexShrink: 0, background: '#393E41',
          display: 'flex', flexDirection: 'column',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}
      >
        {/* Brand */}
        <div style={{ padding: '20px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
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
            Pipeline Console
          </div>
        </div>

        {/* Pipeline identity */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div
            style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: '#6B7280',
              fontFamily: 'var(--font-mono)', marginBottom: 6,
            }}
          >
            Active Pipeline
          </div>
          <div
            style={{
              fontSize: 12, fontWeight: 700, color: '#FFFFFF',
              marginBottom: 5, lineHeight: 1.3, wordBreak: 'break-all',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {pipelineLabel}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span
              style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#10B981', display: 'inline-block', flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 10, color: '#9CA3AF' }}>completed</span>
          </div>
          <div style={{ fontSize: 10, color: '#4B5563', fontFamily: 'var(--font-mono)' }}>
            model: fraud_detection
          </div>
        </div>

        {/* Tab navigation */}
        <nav style={{ flex: 1, paddingTop: 12, paddingBottom: 12, overflowY: 'auto' }}>
          {TAB_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex', alignItems: 'center',
                  padding: '10px 20px', fontSize: 13,
                  fontWeight: active ? 700 : 400,
                  color: active ? '#FFFFFF' : '#6B7280',
                  textDecoration: 'none',
                  borderLeft: active ? '2px solid #A81D37' : '2px solid transparent',
                  background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                  letterSpacing: '0.01em',
                  transition: 'color 0.15s, background 0.15s',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = '#D1D5DB'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = '#6B7280'; }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Run button + back link */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={handleRun}
            style={{
              width: '100%', padding: '10px 0',
              background: running ? '#7C1626' : '#A81D37',
              border: 'none', color: '#FFFFFF',
              fontSize: 11, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
          >
            {running ? '⏳ Queuing Run…' : '▷ Run Pipeline'}
          </button>
          <Link
            to="/dashboard/pipelines"
            style={{
              display: 'block', textAlign: 'center',
              marginTop: 10, fontSize: 11, color: '#6B7280',
              textDecoration: 'none', letterSpacing: '0.04em',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#9CA3AF'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7280'; }}
          >
            ← Developer Console
          </Link>
        </div>

        {/* User section */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF', marginBottom: 2 }}>
            {displayName}
          </div>
          <div
            style={{
              fontSize: 11, color: '#6B7280', marginBottom: 14,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            {user?.user?.email || ''}
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '8px 0',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#9CA3AF', fontSize: 11, fontWeight: 700,
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <div
          style={{
            height: 52, flexShrink: 0,
            background: '#393E41',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
          }}
        >
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 12, fontFamily: 'var(--font-mono)',
              letterSpacing: '0.06em',
            }}
          >
            <Link
              to="/dashboard"
              style={{ color: '#4B5563', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#9CA3AF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#4B5563'; }}
            >
              Dashboard
            </Link>
            <span style={{ color: '#374151' }}>/</span>
            <Link
              to="/dashboard/pipelines"
              style={{ color: '#4B5563', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#9CA3AF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#4B5563'; }}
            >
              Pipelines
            </Link>
            <span style={{ color: '#374151' }}>/</span>
            <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{pipelineLabel}</span>
            <span
              style={{
                marginLeft: 4, padding: '2px 8px',
                background: 'rgba(16,185,129,0.15)',
                color: '#10B981', fontSize: 10, fontWeight: 700,
                fontFamily: 'var(--font-mono)',
              }}
            >
              completed
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ fontSize: 11, color: '#6B7280', fontFamily: 'var(--font-mono)' }}>
              <span style={{ color: '#9CA3AF' }}>run #47</span>
              <span style={{ margin: '0 8px', color: '#374151' }}>|</span>
              <span>3m 42s</span>
              <span style={{ margin: '0 8px', color: '#374151' }}>|</span>
              <span>Mar 9, 14:22 UTC</span>
            </div>
            <span
              style={{
                fontSize: 11, fontWeight: 700, color: '#A81D37',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {currentItem.label}
            </span>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default PipelineDashboardLayout;
