import React, { useState, useEffect } from 'react';

const A = '#A81D37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px', borderRadius: 4 };
const MONO = { fontFamily: 'var(--font-mono)' };

const fmt$ = v => {
  const n = parseFloat(v) || 0;
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const BillingPaymentsView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/finance/dashboard/billing-payments/', { credentials: 'include' })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: '40px', color: '#6B7280', ...MONO }}>Loading…</div>;
  if (error) return <div style={{ padding: '40px', color: '#DC2626', ...MONO }}>Error: {error}</div>;
  if (!data) return null;

  const invoices = data.invoices || {};
  const payments = data.payments || {};
  const refunds = data.refunds || {};

  const successColor = parseFloat(payments.success_rate_pct) >= 95 ? '#16A34A' : parseFloat(payments.success_rate_pct) >= 80 ? '#D97706' : '#DC2626';

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 28px) clamp(16px, 4vw, 32px)', maxWidth: 1440 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontFont: 700, letterSpacing: '0.14em', color: A, ...MONO }}>BLP</span>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Billing & Payments Dashboard</h1>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Real-time payment status, invoices, and collections</p>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 16, marginBottom: 28 }}>
        <div style={{ ...CARD, borderTop: `3px solid ${A}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 8 }}>Outstanding Balance</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#DC2626' }}>{fmt$(invoices.outstanding_balance)}</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>{invoices.outstanding} invoices</div>
        </div>

        <div style={{ ...CARD, borderTop: `3px solid #16A34A` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 8 }}>Payment Success Rate</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: successColor }}>{payments.success_rate_pct}%</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>{payments.successful} of {payments.total}</div>
        </div>

        <div style={{ ...CARD, borderTop: `3px solid #D97706` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 8 }}>Overdue Invoices</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#DC2626' }}>{invoices.overdue}</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>Requires immediate follow-up</div>
        </div>

        <div style={{ ...CARD, borderTop: `3px solid #7C3AED` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 8 }}>Refunds (MTD)</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>{fmt$(refunds.mtd_total)}</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>Customer refunds</div>
        </div>
      </div>

      {/* Invoice & Payment Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 20 }}>
        {/* Invoice Summary */}
        <div style={CARD}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>
            Invoice Status
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: BD, paddingBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#6B7280' }}>Issued</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{invoices.issued}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: BD, paddingBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#6B7280' }}>Paid</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#16A34A' }}>{invoices.paid}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: BD, paddingBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#6B7280' }}>Outstanding</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#D97706' }}>{invoices.outstanding}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Overdue</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#DC2626' }}>{invoices.overdue}</span>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div style={CARD}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>
            Payment Summary
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: BD, paddingBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#6B7280' }}>Successful</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#16A34A' }}>{payments.successful}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: BD, paddingBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#6B7280' }}>Failed</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#DC2626' }}>{payments.failed}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Success Rate</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: successColor }}>{payments.success_rate_pct}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPaymentsView;
