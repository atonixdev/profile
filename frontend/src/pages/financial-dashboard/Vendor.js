import React, { useState, useEffect } from 'react';

const A = '#A81D37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px', borderRadius: 4 };
const MONO = { fontFamily: 'var(--font-mono)' };

const fmt$ = v => {
  const n = parseFloat(v) || 0;
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const VendorProcurementView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/finance/dashboard/vendor-procurement/', { credentials: 'include' })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: '40px', color: '#6B7280', ...MONO }}>Loading…</div>;
  if (error) return <div style={{ padding: '40px', color: '#DC2626', ...MONO }}>Error: {error}</div>;
  if (!data) return null;

  const vendors = data.vendors || [];
  const proc = data.procurement_status || {};

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 28px) clamp(16px, 4vw, 32px)', maxWidth: 1440 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: A, ...MONO }}>VND</span>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Vendor & Procurement Dashboard</h1>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Vendor contracts, procurement requests, and payment tracking</p>
      </div>

      {/* Procurement Status KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 16, marginBottom: 28 }}>
        <div style={{ ...CARD, borderTop: `3px solid ${A}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 8 }}>Pending Requests</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#D97706' }}>{proc.pending}</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>Awaiting approval</div>
        </div>

        <div style={{ ...CARD, borderTop: `3px solid #16A34A` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 8 }}>Approved</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#16A34A' }}>{proc.approved}</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>Ready to order</div>
        </div>

        <div style={{ ...CARD, borderTop: `3px solid #2563EB` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 8 }}>Ordered</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#2563EB' }}>{proc.ordered}</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>In transit/ delivered</div>
        </div>

        <div style={{ ...CARD, borderTop: `3px solid #7C3AED` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 8 }}>Active Vendors</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#7C3AED' }}>{vendors.length}</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>External partners</div>
        </div>
      </div>

      {/* Vendors List */}
      <div style={CARD}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>
          Vendor Registry
        </div>
        {vendors.length === 0 ? (
          <div style={{ fontSize: 12, color: '#9CA3AF' }}>No vendors configured</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 12 }}>
            {vendors.map((v, i) => (
              <div key={i} style={{ padding: 12, background: '#F9FAFB', borderRadius: 4, border: '1px solid #E5E7EB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: A, ...MONO }}>{v.code}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', marginTop: 2 }}>{v.name}</div>
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', background: v.risk_score > 50 ? '#FEE2E2' : '#ECFDF5', color: v.risk_score > 50 ? '#DC2626' : '#16A34A', borderRadius: 2, ...MONO }}>
                    Risk: {v.risk_score}
                  </div>
                </div>
                {v.category && <div style={{ fontSize: 10, color: '#6B7280', marginBottom: 4 }}>Category: {v.category}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, paddingTop: 8, borderTop: '1px solid #E5E7EB' }}>
                  <div>
                    <div style={{ fontSize: 9, color: '#6B7280' }}>Active Contracts</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{v.active_contracts}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: '#6B7280' }}>Total Value</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{fmt$(v.total_contract_value)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorProcurementView;
