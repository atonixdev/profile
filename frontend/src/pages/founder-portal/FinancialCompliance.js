import React, { useState, useEffect } from 'react';

const A    = '#A81D37';
const BD   = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px', borderRadius: 4 };
const MONO = { fontFamily: 'var(--font-mono)' };

const fmt = n => (n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

const FinancialCompliance = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    fetch('/api/portal/dashboard/financial-compliance/', { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: '40px 32px', color: '#6B7280', ...MONO, fontSize: 12 }}>Loading…</div>;
  if (error) return <div style={{ padding: '40px 32px', color: '#DC2626', ...MONO, fontSize: 12 }}>Error: {error}</div>;
  if (!data) return null;

  const budget = data.budgets || {};
  const compliance = data.compliance || {};
  const payments = data.payments || {};

  const statusColor = { compliant: '#16A34A', non_compliant: '#DC2626', in_review: '#D97706' };
  const utilization = budget.total_allocated ? ((budget.total_spent / budget.total_allocated) * 100).toFixed(1) : '0.0';

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 28px) clamp(16px, 4vw, 32px)', maxWidth: 1440 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: A, ...MONO }}>FIN</span>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Financial & Compliance</h1>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Budget allocation, compliance checks, and payment analytics</p>
      </div>

      {/* Budget KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14, marginBottom: 28 }}>
        <div style={{ ...CARD, borderTop: '3px solid #2563EB' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Total Allocated</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{fmt(budget.total_allocated)}</div>
        </div>
        <div style={{ ...CARD, borderTop: `3px solid ${A}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Total Spent</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{fmt(budget.total_spent)}</div>
        </div>
        <div style={{ ...CARD, borderTop: '3px solid #16A34A' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Remaining</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{fmt(budget.remaining)}</div>
        </div>
        <div style={{ ...CARD, borderTop: '3px solid #7C3AED' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Utilization</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{utilization}%</div>
          <div style={{ height: 4, background: '#E5E7EB', borderRadius: 2, marginTop: 10 }}>
            <div style={{ height: '100%', borderRadius: 2, background: parseFloat(utilization) > 90 ? A : '#2563EB', width: `${Math.min(parseFloat(utilization), 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Compliance & Payments Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 16 }}>
        {/* Compliance Status */}
        <div style={CARD}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>
            Compliance Status
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {Object.entries(statusColor).map(([key, color]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: BD, paddingBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
                  <span style={{ fontSize: 12, color: '#374151', textTransform: 'capitalize' }}>
                    {key.replace(/_/g, ' ')}
                  </span>
                </div>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#111827', ...MONO }}>{compliance[key] || 0}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Total Checks</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#111827', ...MONO }}>{(compliance.compliant || 0) + (compliance.non_compliant || 0) + (compliance.in_review || 0)}</span>
            </div>
          </div>
        </div>

        {/* Payment Analytics */}
        <div style={CARD}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>
            Payment Analytics
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: BD, paddingBottom: 10 }}>
              <span style={{ fontSize: 12, color: '#6B7280' }}>Total Payments</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#111827', ...MONO }}>{payments.total || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: BD, paddingBottom: 10 }}>
              <span style={{ fontSize: 12, color: '#6B7280' }}>Cleared</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#16A34A', ...MONO }}>{payments.cleared || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Success Rate</span>
              <span style={{
                fontSize: 15, fontWeight: 700, ...MONO,
                color: parseFloat(payments.success_rate || 0) >= 95 ? '#16A34A' : parseFloat(payments.success_rate || 0) >= 80 ? '#D97706' : '#DC2626',
              }}>
                {parseFloat(payments.success_rate || 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Tags */}
      <div style={{ ...CARD, marginTop: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 14 }}>
          Compliance Framework Tags
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['SOC-2 TYPE II', 'GDPR', 'RBAC', 'AUDIT-TRAIL', 'PCI-DSS', 'ISO-27001'].map(tag => (
            <span key={tag} style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', padding: '4px 10px',
              border: `1px solid ${A}`, borderRadius: 2, color: A, ...MONO,
            }}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinancialCompliance;
