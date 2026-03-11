import React, { useState, useEffect } from 'react';

const A = '#A81D37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px', borderRadius: 4 };
const MONO = { fontFamily: 'var(--font-mono)' };

const fmt$ = v => {
  const n = parseFloat(v) || 0;
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const ProductCostView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/finance/dashboard/cost/', { credentials: 'include' })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: '40px', color: '#6B7280', ...MONO }}>Loading…</div>;
  if (error) return <div style={{ padding: '40px', color: '#DC2626', ...MONO }}>Error: {error}</div>;
  if (!data) return null;

  const categories = data.cost_by_category || [];
  const depts = data.cost_by_department || [];

  const totalCost = categories.reduce((sum, c) => sum + parseFloat(c.mtd_cost || 0), 0);
  const maxCost = Math.max(...categories.map(c => parseFloat(c.mtd_cost || 0)), 1);

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 28px) clamp(16px, 4vw, 32px)', maxWidth: 1440 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: A, ...MONO }}>CST</span>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Product Cost Dashboard</h1>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Operational cost tracking and attribution by product</p>
      </div>

      {/* Total Cost KPI */}
      <div style={{ ...CARD, borderTop: `3px solid ${A}`, marginBottom: 28 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 8 }}>Total MTD Cost</div>
        <div style={{ fontSize: 32, fontWeight: 700, color: '#111827' }}>{fmt$(totalCost)}</div>
        <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>Across all categories and departments</div>
      </div>

      {/* Cost Breakdown by Category */}
      <div style={CARD}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>
          Cost Breakdown by Category
        </div>
        {categories.map((cat, i) => {
          const cost = parseFloat(cat.mtd_cost || 0);
          const pct = maxCost > 0 ? Math.round((cost / maxCost) * 100) : 0;
          return (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#374151', textTransform: 'capitalize', fontWeight: 500 }}>{cat.category.replace('_', ' ')}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{fmt$(cat.mtd_cost)}</span>
              </div>
              <div style={{ height: 6, background: '#F3F4F6', borderRadius: 3 }}>
                <div style={{ height: '100%', width: `${pct}%`, background: A, borderRadius: 3 }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Department Cost Allocation */}
      <div style={{ ...CARD, marginTop: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>
          Cost by Department
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 12 }}>
          {depts.map((dept, i) => {
            const cost = parseFloat(dept.total || 0);
            const pctOfTotal = totalCost > 0 ? Math.round((cost / totalCost) * 100) : 0;
            return (
              <div key={i} style={{ padding: 12, background: '#F9FAFB', borderRadius: 4, border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 4, textTransform: 'uppercase', ...MONO }}>{dept.department}</div>
                <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>{dept.name}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{fmt$(dept.total)}</div>
                <div style={{ fontSize: 10, color: '#9CA3AF' }}>{pctOfTotal}% of total</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductCostView;
