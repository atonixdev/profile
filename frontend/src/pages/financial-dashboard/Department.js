import React, { useState, useEffect } from 'react';

const A = '#A81D37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px', borderRadius: 4 };
const MONO = { fontFamily: 'var(--font-mono)' };

const fmt$ = v => {
  const n = parseFloat(v) || 0;
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const DepartmentFinancialView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/finance/dashboard/department/', { credentials: 'include' })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: '40px', color: '#6B7280', ...MONO }}>Loading…</div>;
  if (error) return <div style={{ padding: '40px', color: '#DC2626', ...MONO }}>Error: {error}</div>;
  if (!data) return null;

  const departments = data.departments || [];

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 28px) clamp(16px, 4vw, 32px)', maxWidth: 1440 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: A, ...MONO }}>DPT</span>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Department & Team Financial Dashboard</h1>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Department budgets, spending, and cost allocation</p>
      </div>

      {/* Department Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 20 }}>
        {departments.length === 0 ? (
          <div style={{ ...CARD, gridColumn: '1 / -1' }}>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>No departments configured</div>
          </div>
        ) : (
          departments.map((dept, i) => (
            <div key={i} style={CARD}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: A, ...MONO, letterSpacing: '0.06em' }}>{dept.code}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginTop: 2 }}>{dept.name}</div>
                </div>
              </div>

              {dept.head_name && (
                <div style={{ fontSize: 10, color: '#6B7280', marginBottom: 8, borderBottom: BD, paddingBottom: 8 }}>
                  Head: <span style={{ fontWeight: 600, color: '#374151' }}>{dept.head_name}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 9, color: '#6B7280', ...MONO, letterSpacing: '0.05em', marginBottom: 4 }}>ALLOCATED</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{fmt$(dept.budget_allocated)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#6B7280', ...MONO, letterSpacing: '0.05em', marginBottom: 4 }}>SPENT</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#DC2626' }}>{fmt$(dept.budget_spent)}</div>
                </div>
              </div>

              <div style={{ fontSize: 10, color: '#6B7280', textAlign: 'center', paddingTop: 8, borderTop: BD }}>
                Total Expenses: <span style={{ fontWeight: 700, color: '#111827' }}>{fmt$(dept.total_expenses)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DepartmentFinancialView;
