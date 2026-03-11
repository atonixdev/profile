import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';

const A    = '#A81D37';
const BD   = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px', borderRadius: 4 };
const MONO = { fontFamily: 'var(--font-mono)' };

const fmt$ = v => '$' + (parseFloat(v) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const KPI = ({ label, value, sub, accent }) => (
  <div style={{ ...CARD, borderTop: `3px solid ${accent || A}` }}>
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 700, color: '#111827', lineHeight: 1, margin: '6px 0' }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>{sub}</div>}
  </div>
);

const MODULES = [
  { code: 'WRK', label: 'Working Dashboard',         path: '/founder-portal/working-dashboard', accent: A,         desc: 'Centralized hub listing all platform dashboards. Founders manage per-user access and RBAC.' },
  { code: 'INV', label: 'Investor Hub',           path: '/founder-portal/investor',   accent: '#2563EB', desc: 'Secure document repository, pitch decks, stakeholder management and investor updates.' },
  { code: 'TEM', label: 'Team Management',        path: '/founder-portal/team',       accent: '#16A34A', desc: 'Hiring pipelines, task assignment, performance tracking, departments and access control.' },
  { code: 'FIN', label: 'Financial & Compliance',  path: '/founder-portal/financial',  accent: '#D97706', desc: 'Budgeting dashboards, vendor workflows, compliance audit logs with exportable reports.' },
  { code: 'VIS', label: 'Vision & Narrative',      path: '/founder-portal/vision',     accent: '#7C3AED', desc: 'Founder directives, motivational notes, cultural guidelines and narrative space.' },
  { code: 'DEV', label: 'Developer Dashboard',    path: '/founder-portal/developer',  accent: '#0891B2', desc: 'Deployment flows, container registry, resource allocation, monitoring and alerts.' },
  { code: 'MKT', label: 'Marketing Dashboard',    path: '/founder-portal/marketing',  accent: '#EA580C', desc: 'Social hub, engagement analytics, campaign scheduling and performance tracking.' },
  { code: 'BRD', label: 'Branding Systems',       path: '/founder-portal/branding',   accent: '#DC2626', desc: 'Color token management, UI/UX standards, typography and design integration.' },
];

const DEFAULT_WIDGETS = ['finance', 'growth', 'product', 'governance', 'modules'];
const STORAGE_KEY = 'fp_exec_widgets';

const loadWidgets = () => {
  try { const v = localStorage.getItem(STORAGE_KEY); return v ? JSON.parse(v) : DEFAULT_WIDGETS; }
  catch { return DEFAULT_WIDGETS; }
};
const saveWidgets = w => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(w)); } catch {} };

const ExecutiveDashboard = () => {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [hovered, setHovered]     = useState(null);
  const [widgets, setWidgets]     = useState(loadWidgets);
  const [showConfig, setShowConfig] = useState(false);
  const [lastPoll, setLastPoll]   = useState(null);
  const timerRef = useRef(null);

  const fetchData = useCallback(() => {
    fetch('/api/portal/dashboard/executive/', { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); setError(null); setLastPoll(new Date()); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    timerRef.current = setInterval(fetchData, 30000);
    return () => clearInterval(timerRef.current);
  }, [fetchData]);

  const toggleWidget = key => {
    const next = widgets.includes(key) ? widgets.filter(w => w !== key) : [...widgets, key];
    setWidgets(next);
    saveWidgets(next);
  };

  if (loading) return <div style={{ padding: '40px 32px', color: '#6B7280', ...MONO, fontSize: 12 }}>Loading…</div>;
  if (error) return <div style={{ padding: '40px 32px', color: '#DC2626', ...MONO, fontSize: 12 }}>Error: {error}</div>;
  if (!data) return null;

  const fin = data.finance || {};
  const gr  = data.growth || {};
  const pr  = data.product || {};
  const gov = data.governance || {};

  const WIDGET_MAP = {
    finance: { label: 'Financial KPIs', accent: A },
    growth: { label: 'Growth Metrics', accent: '#2563EB' },
    product: { label: 'Product & Ops', accent: '#D97706' },
    governance: { label: 'Governance', accent: '#7C3AED' },
    modules: { label: 'Portal Modules', accent: '#0891B2' },
  };

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px)', maxWidth: 1440 }}>
      {/* ── HEADER ──────────────────────────────────────────── */}
      <div style={{
        background: '#0a0e17', borderRadius: 4, padding: '28px 32px',
        marginBottom: 28, borderLeft: `4px solid ${A}`, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 24px,rgba(255,255,255,.5) 24px,rgba(255,255,255,.5) 25px),repeating-linear-gradient(90deg,transparent,transparent 24px,rgba(255,255,255,.5) 24px,rgba(255,255,255,.5) 25px)',
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: A, ...MONO }}>ATONIXDEV</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.25)' }} />
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.40)', ...MONO }}>FOUNDER PORTAL — SOVEREIGN COMMAND CENTER</span>
          </div>
          <h1 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 800, color: '#FFFFFF', margin: '6px 0 4px', lineHeight: 1.2 }}>
            Executive Dashboard
          </h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.6, maxWidth: 640 }}>
            Unified command center for AtonixDev leadership. Technical, financial, marketing, and cultural
            flows converge here — enterprise-grade discipline, sharpness, minimalism, scalability.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 16 }}>
            {['RBAC-ENFORCED', 'E2E-ENCRYPTED', 'AUDIT-TRAIL', 'CI/CD', 'SSO'].map(t => (
              <span key={t} style={{
                fontSize: 7, fontWeight: 700, letterSpacing: '0.10em', padding: '2px 7px', borderRadius: 2,
                background: 'rgba(168,29,55,0.18)', border: '1px solid rgba(168,29,55,0.35)',
                color: 'rgba(255,255,255,0.55)', ...MONO,
              }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── TOOLBAR ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ fontSize: 10, color: '#9CA3AF', ...MONO }}>
          Auto-refresh: 30s {lastPoll && `· Last: ${lastPoll.toLocaleTimeString()}`}
        </div>
        <button
          onClick={() => setShowConfig(!showConfig)}
          style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', padding: '5px 14px',
            border: BD, borderRadius: 3, background: showConfig ? '#F3F4F6' : '#FFFFFF',
            color: '#374151', cursor: 'pointer', ...MONO,
          }}
        >{showConfig ? 'Done' : 'Customize Widgets'}</button>
      </div>

      {showConfig && (
        <div style={{ ...CARD, marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {Object.entries(WIDGET_MAP).map(([key, w]) => (
            <button key={key} onClick={() => toggleWidget(key)} style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', padding: '6px 14px',
              borderRadius: 3, cursor: 'pointer', ...MONO,
              background: widgets.includes(key) ? `${w.accent}18` : '#F9FAFB',
              border: `1px solid ${widgets.includes(key) ? w.accent : '#E5E7EB'}`,
              color: widgets.includes(key) ? w.accent : '#9CA3AF',
            }}>{widgets.includes(key) ? '✓ ' : ''}{w.label}</button>
          ))}
        </div>
      )}

      {/* ── KPI STRIPS ──────────────────────────────────────── */}
      {widgets.includes('finance') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14, marginBottom: 14 }}>
          <KPI label="MTD Revenue"   value={fmt$(fin.mtd_revenue)}       sub="Month-to-date"           accent={A} />
          <KPI label="YTD Revenue"   value={fmt$(fin.ytd_revenue)}       sub="Year-to-date"            accent="#2563EB" />
          <KPI label="Outstanding"   value={fmt$(fin.outstanding_balance)} sub="Pending collection"    accent="#DC2626" />
        </div>
      )}

      {widgets.includes('growth') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 14, marginBottom: 14 }}>
          <KPI label="Active Orgs"   value={gr.active_organizations?.toLocaleString() || '0'} sub={`of ${gr.total_organizations || 0} total`} accent="#16A34A" />
          <KPI label="Total Users"   value={gr.total_users?.toLocaleString() || '0'}       sub="Active accounts"    accent="#0891B2" />
          <KPI label="Staff"         value={gr.staff_count?.toLocaleString() || '0'}       sub="Staff members"      accent="#7C3AED" />
        </div>
      )}

      {widgets.includes('product') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 14, marginBottom: 14 }}>
          <KPI label="Departments"       value={pr.departments?.toLocaleString() || '0'}       sub="Active units"       accent="#D97706" />
          <KPI label="Vendors"           value={pr.active_vendors?.toLocaleString() || '0'}    sub="Active partners"    accent="#EA580C" />
          <KPI label="Budgets"           value={pr.active_budgets?.toLocaleString() || '0'}    sub="Active/Approved"    accent="#16A34A" />
        </div>
      )}

      {widgets.includes('governance') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 14, marginBottom: 32 }}>
          <KPI label="Directives"        value={gov.pinned_directives?.toLocaleString() || '0'} sub="Pinned & active"   accent={A} />
          <KPI label="Stakeholders"      value={gov.stakeholders?.toLocaleString() || '0'}     sub="Active registry"    accent="#2563EB" />
        </div>
      )}

      {/* ── MODULE GRID ─────────────────────────────────────── */}
      {widgets.includes('modules') && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{ width: 3, height: 16, background: A, borderRadius: 1 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#374151', ...MONO }}>
              Portal Modules — 8 Active Consoles
            </span>
            <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 14 }}>
            {MODULES.map(m => (
              <Link
                key={m.code}
                to={m.path}
                onMouseEnter={() => setHovered(m.code)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  textDecoration: 'none', display: 'block',
                  background: '#FFFFFF',
                  border: `1px solid ${hovered === m.code ? m.accent : '#E5E7EB'}`,
                  borderTop: `3px solid ${m.accent}`,
                  borderRadius: 4, padding: '16px 18px',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  boxShadow: hovered === m.code ? '0 4px 14px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{
                    fontSize: 8, fontWeight: 700, letterSpacing: '0.10em',
                    color: '#FFFFFF', background: m.accent,
                    padding: '3px 7px', borderRadius: 2, ...MONO,
                  }}>{m.code}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{m.label}</span>
                </div>
                <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 12px', lineHeight: 1.6 }}>{m.desc}</p>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.10em',
                  textTransform: 'uppercase', color: m.accent, ...MONO,
                }}>
                  <span>Open Console</span>
                  <span style={{ fontSize: 12 }}>→</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <div style={{ marginTop: 32, borderTop: BD, paddingTop: 18, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: A, ...MONO, marginBottom: 3 }}>ATONIXDEV — FOUNDER PORTAL</div>
          <div style={{ fontSize: 10, color: '#9CA3AF', ...MONO }}>Enterprise-grade · Sovereign hub · Zero visual drift</div>
        </div>
        <div style={{ fontSize: 9, color: '#9CA3AF', ...MONO, letterSpacing: '0.08em', textAlign: 'right' }}>
          <div>Clarity · Sovereignty · Enterprise trust</div>
          <div style={{ marginTop: 2 }}>Aligns technical execution with cultural vision</div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
