import React, { useState, useEffect } from 'react';

const A = '#A81D37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px', borderRadius: 4 };
const MONO = { fontFamily: 'var(--font-mono)' };

const fmt$ = v => {
  const n = parseFloat(v) || 0;
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const ProductRevenueView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/finance/dashboard/revenue/', { credentials: 'include' })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: '40px', color: '#6B7280', ...MONO }}>Loading…</div>;
  if (error) return <div style={{ padding: '40px', color: '#DC2626', ...MONO }}>Error: {error}</div>;
  if (!data) return null;

  const churn = data.churn_metrics || {};
  const adj = data.adjustments || {};
  const services = data.revenue_by_service || [];

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 28px) clamp(16px, 4vw, 32px)', maxWidth: 1440 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: A, ...MONO }}>REV</span>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Product Revenue Dashboard</h1>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Revenue performance by product and service</p>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 16, marginBottom: 28 }}>
        <div style={{ ...CARD, borderTop: `3px solid ${A}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 8 }}>Active Organizations</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>{churn.active_orgs?.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>{churn.suspended_orgs} suspended</div>
        </div>

        <div style={{ ...CARD, borderTop: `3px solid #16A34A` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 8 }}>Churn Rate</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: churn.churn_rate_pct >= 5 ? '#DC2626' : '#16A34A' }}>{churn.churn_rate_pct}%</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>Month-over-month</div>
        </div>

        <div style={{ ...CARD, borderTop: `3px solid #7C3AED` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 8 }}>Total Adjustments</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>{fmt$(adj.total_adjustments)}</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>Refunds + Credits</div>
        </div>

        <div style={{ ...CARD, borderTop: `3px solid #D97706` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 8 }}>Refunds MTD</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>{fmt$(adj.refunds_mtd)}</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>Customer refunds</div>
        </div>
      </div>

      {/* Revenue by Service Table */}
      <div style={CARD}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>
          Revenue by Service
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: BD }}>
                <th style={{ textAlign: 'left', padding: '10px 0', fontSize: 11, fontWeight: 700, color: '#6B7280', ...MONO }}>SERVICE</th>
                <th style={{ textAlign: 'right', padding: '10px 0', fontSize: 11, fontWeight: 700, color: '#6B7280', ...MONO }}>MTD REVENUE</th>
                <th style={{ textAlign: 'right', padding: '10px 0', fontSize: 11, fontWeight: 700, color: '#6B7280', ...MONO }}>ARR (EST.)</th>
                <th style={{ textAlign: 'right', padding: '10px 0', fontSize: 11, fontWeight: 700, color: '#6B7280', ...MONO }}>ORGS</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s, i) => (
                <tr key={i} style={{ borderBottom: BD }}>
                  <td style={{ padding: '12px 0', fontSize: 12, color: '#374151', textTransform: 'capitalize' }}>{s.service}</td>
                  <td style={{ padding: '12px 0', fontSize: 12, fontWeight: 600, color: '#111827', textAlign: 'right' }}>{fmt$(s.mtd_revenue)}</td>
                  <td style={{ padding: '12px 0', fontSize: 12, color: '#6B7280', textAlign: 'right' }}>{fmt$(s.arr_estimated)}</td>
                  <td style={{ padding: '12px 0', fontSize: 12, fontWeight: 600, color: '#111827', textAlign: 'right' }}>{s.org_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Credits Issued */}
      <div style={{ ...CARD, marginTop: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 12 }}>
          Credits Issued (MTD)
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#7C3AED', marginBottom: 4 }}>{fmt$(adj.credits_mtd)}</div>
        <div style={{ fontSize: 12, color: '#6B7280' }}>Promotional credits and billing adjustments</div>
      </div>
    </div>
  );
};

export default ProductRevenueView;
