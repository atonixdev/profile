import React, { useState, useEffect, useCallback } from 'react';

const A  = '#A81D37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px', borderRadius: 4 };
const MONO = { fontFamily: 'var(--font-mono)' };

const KPI = ({ label, value, sub, accent }) => (
  <div style={{ ...CARD, borderTop: `3px solid ${accent || A}` }}>
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>{sub}</div>}
  </div>
);

const EVENT_TYPE_COLOR = {
  INVOICE: '#2563EB', PAYMENT: '#16A34A', CREDIT: '#7C3AED',
  OVERDUE: '#DC2626', NEW_ORG: '#D97706',
  charge: '#DC2626', payment: '#16A34A', credit: '#7C3AED',
  refund: '#7C3AED', adjustment: '#D97706', promo: '#D97706',
  void: '#9CA3AF', writeoff: '#374151',
};

const fmt$ = v => {
  const n = parseFloat(v);
  if (isNaN(n)) return '$0.00';
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const fmtDate = iso => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
};

const BillingOverview = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch('/api/billing/summary/platform/', { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div style={{ padding: '40px 32px', color: '#6B7280', ...MONO, fontSize: 12 }}>Loading…</div>;
  if (error)   return <div style={{ padding: '40px 32px', color: '#DC2626', ...MONO, fontSize: 12 }}>Error: {error}</div>;
  if (!data)   return null;

  const rev   = data.revenue || {};
  const orgs  = data.organizations || {};
  const users = data.users || {};
  const invs  = data.invoices || {};
  const creds = data.credits || {};
  const usage = data.usage_by_service || [];
  const events = data.recent_events || [];

  const maxCost = usage.reduce((m, r) => Math.max(m, parseFloat(r.total_cost) || 0), 1);

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 28px) clamp(16px, 4vw, 32px)', maxWidth: 1280 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: A, ...MONO }}>OVW</span>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Platform Overview</h1>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Executive financial summary across all organizations and services.</p>
      </div>

      {/* KPI row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 16, marginBottom: 16 }}>
        <KPI label="MTD Revenue"    value={fmt$(rev.mtd_charges)}             sub={`Net: ${fmt$(rev.net_revenue)}`}              accent={A} />
        <KPI label="Active Orgs"    value={orgs.active}                        sub={`${orgs.new_mtd} onboarded this month`}        accent="#2563EB" />
        <KPI label="Active Users"   value={users.total_active?.toLocaleString()} sub="Across all organizations"                   accent="#7C3AED" />
        <KPI label="Outstanding Bal." value={fmt$(invs.outstanding_balance)}  sub={`${invs.outstanding_count} invoices unpaid`}  accent="#D97706" />
      </div>

      {/* KPI row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 16, marginBottom: 28 }}>
        <KPI label="Total Payments" value={fmt$(rev.mtd_payments)}  sub="MTD collected"               accent="#16A34A" />
        <KPI label="Overdue Count"  value={invs.overdue_count}       sub="Requires follow-up"          accent="#DC2626" />
        <KPI label="Failed Payments" value={invs.failed_payments}   sub="Retry pending"               accent="#DC2626" />
        <KPI label="Credits Issued" value={fmt$(creds.issued_mtd)}  sub="Adjustments + Refunds MTD"   accent="#7C3AED" />
      </div>

      {/* Two-column: top services + live events */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 20 }}>
        {/* Service Revenue */}
        <div style={CARD}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 14 }}>
            Revenue by Service
          </div>
          {usage.length === 0 && <div style={{ fontSize: 12, color: '#9CA3AF' }}>No usage data this period.</div>}
          {usage.map((s, i) => {
            const cost = parseFloat(s.total_cost) || 0;
            const pct  = maxCost > 0 ? Math.round((cost / maxCost) * 100) : 0;
            return (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: '#374151', textTransform: 'capitalize' }}>{s.service}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{fmt$(s.total_cost)}</span>
                </div>
                <div style={{ height: 4, background: '#F3F4F6', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: A, borderRadius: 2 }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Activity Feed */}
        <div style={CARD}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO }}>
              Recent Events
            </div>
            <button
              onClick={load}
              style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: A, background: 'none', border: 'none', cursor: 'pointer', ...MONO, textTransform: 'uppercase' }}
            >
              Refresh
            </button>
          </div>
          {events.length === 0 && <div style={{ fontSize: 12, color: '#9CA3AF' }}>No events yet.</div>}
          {events.map((ev, i) => (
            <div key={ev.id || i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: 10, borderBottom: i < events.length - 1 ? BD : 'none', marginBottom: 10 }}>
              <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 5px', background: (EVENT_TYPE_COLOR[ev.event_type] || EVENT_TYPE_COLOR[ev.status] || '#6B7280'), color: '#fff', borderRadius: 2, ...MONO, minWidth: 54, textAlign: 'center', letterSpacing: '0.04em', marginTop: 1, textTransform: 'uppercase' }}>
                {(ev.service || ev.event_type || 'EVT').slice(0, 7)}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: '#374151' }}>
                  {ev.event_type} — {ev.organization || ev.organization_id_raw || 'unknown'}
                  {ev.total_cost && parseFloat(ev.total_cost) > 0 ? ` — ${fmt$(ev.total_cost)}` : ''}
                </div>
                <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2, ...MONO }}>{fmtDate(ev.event_timestamp || ev.received_at)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BillingOverview;
