import React, { useState, useEffect } from 'react';

const A = '#A81D37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px', borderRadius: 4 };
const MONO = { fontFamily: 'var(--font-mono)' };

const KPI = ({ label, value, sub, accent, size = 'md' }) => {
  const sizeStyles = size === 'lg'
    ? { fontSize: 32, margin: '8px 0' }
    : { fontSize: 26, margin: '6px 0' };

  return (
    <div style={{ ...CARD, borderTop: `3px solid ${accent || A}` }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>{label}</div>
      <div style={{ ...sizeStyles, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>{sub}</div>}
    </div>
  );
};

const fmt$ = v => {
  const n = parseFloat(v) || 0;
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const MasterFinanceDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/finance/dashboard/master/', { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: '40px 32px', color: '#6B7280', ...MONO, fontSize: 12 }}>Loading…</div>;
  if (error) return <div style={{ padding: '40px 32px', color: '#DC2626', ...MONO, fontSize: 12 }}>Error: {error}</div>;
  if (!data) return null;

  const rev = data.revenue || {};
  const prof = data.profitability || {};
  const cf = data.cash_flow || {};
  const hi = data.health_indicators || {};

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 28px) clamp(16px, 4vw, 32px)', maxWidth: 1440 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: A, ...MONO }}>MFA</span>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Master Finance Dashboard</h1>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>{data.header?.subtitle || 'Global financial command center for AtonixCorp operations'}</p>
      </div>

      {/* Revenue & Profitability Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 16, marginBottom: 20 }}>
        <KPI label="MTD Revenue" value={fmt$(rev.mtd)} sub="Month-to-date charges" accent={A} />
        <KPI label="YTD Revenue" value={fmt$(rev.ytd)} sub="Year-to-date total" accent="#2563EB" />
        <KPI label="MTD Profit" value={fmt$(prof.mtd_profit)} sub={`${prof.margin_pct}% margin`} accent="#16A34A" />
        <KPI label="Collections" value={fmt$(rev.collected_mtd)} sub="Payments collected" accent="#7C3AED" />
      </div>

      {/* Health Indicators Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 16, marginBottom: 32 }}>
        <KPI label="Active Orgs" value={hi.active_organizations?.toLocaleString()} sub="Customers" accent="#2563EB" />
        <KPI label="Active Vendors" value={hi.active_vendors?.toLocaleString()} sub="External partners" accent="#D97706" />
        <KPI label="Departments" value={hi.active_departments?.toLocaleString()} sub="Internal units" accent="#7C3AED" />
        <KPI label="Outstanding Balance" value={fmt$(cf.outstanding_balance)} sub="Receivables" accent="#DC2626" />
      </div>

      {/* Cards Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 20 }}>
        {/* Profitability Summary */}
        <div style={CARD}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>
            Profitability Summary
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: BD, paddingBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#6B7280' }}>Revenue</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#16A34A' }}>{fmt$(prof.mtd_revenue)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: BD, paddingBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#6B7280' }}>Total Costs</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#DC2626' }}>{fmt$(prof.mtd_costs)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Net Profit</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: prof.mtd_profit >= 0 ? '#16A34A' : '#DC2626' }}>{fmt$(prof.mtd_profit)}</span>
            </div>
          </div>
        </div>

        {/* Cash Flow */}
        <div style={CARD}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>
            Cash Flow Status
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: '#6B7280', marginBottom: 4, ...MONO, letterSpacing: '0.05em' }}>OUTSTANDING</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#DC2626' }}>{fmt$(cf.outstanding_balance)}</div>
              <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>Awaiting collection</div>
            </div>
            <div style={{ borderTop: BD, paddingTop: 12 }}>
              <div style={{ fontSize: 10, color: '#6B7280', marginBottom: 4, ...MONO, letterSpacing: '0.05em' }}>COLLECTIONS (MTD)</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#16A34A' }}>{fmt$(cf.collections_pending)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-currency Info */}
      {data.multi_currency?.available_currencies && (
        <div style={{ ...CARD, marginTop: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 12 }}>
            Multi-Currency Support
          </div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>
            Supported currencies: <span style={{ fontWeight: 600 }}>{data.multi_currency.available_currencies.join(', ')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterFinanceDashboard;
