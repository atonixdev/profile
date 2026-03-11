import React, { useState, useEffect } from 'react';

const A = '#A81D37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px', borderRadius: 4 };
const MONO = { fontFamily: 'var(--font-mono)' };

const fmt$ = v => {
  const n = parseFloat(v) || 0;
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const BudgetForecastingView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/finance/dashboard/budget-forecast/', { credentials: 'include' })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: '40px', color: '#6B7280', ...MONO }}>Loading…</div>;
  if (error) return <div style={{ padding: '40px', color: '#DC2626', ...MONO }}>Error: {error}</div>;
  if (!data) return null;

  const budgets = data.budgets || [];
  const forecasts = data.forecasts || [];

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 28px) clamp(16px, 4vw, 32px)', maxWidth: 1440 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: A, ...MONO }}>BDG</span>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Budget & Forecasting Dashboard</h1>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Budget planning, allocation, and scenario modeling</p>
      </div>

      {/* Active Budgets */}
      <div style={CARD}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>
          Active Budgets
        </div>
        {budgets.length === 0 ? (
          <div style={{ fontSize: 12, color: '#9CA3AF' }}>No active budgets</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {budgets.map((b, i) => {
              const util = parseFloat(b.utilization_pct) || 0;
              const color = util <= 50 ? '#16A34A' : util <= 80 ? '#D97706' : '#DC2626';
              return (
                <div key={i} style={{ padding: 12, background: '#F9FAFB', borderRadius: 4, border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{b.name}</div>
                      <div style={{ fontSize: 10, color: '#6B7280', marginTop: 2, ...MONO }}>{b.period}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{fmt$(b.allocated)}</div>
                      <div style={{ fontSize: 10, color: '#6B7280', marginTop: 2 }}>Allocated</div>
                    </div>
                  </div>
                  <div style={{ height: 6, background: '#E5E7EB', borderRadius: 3, marginBottom: 8 }}>
                    <div style={{ height: '100%', width: `${Math.min(util, 100)}%`, background: color, borderRadius: 3 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                    <span style={{ color: '#6B7280' }}>Spent: {fmt$(b.spent)}</span>
                    <span style={{ fontWeight: 700, color }}>
                      {util}% • Remaining: {fmt$(b.remaining)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Forecasts */}
      {forecasts.length > 0 && (
        <div style={{ ...CARD, marginTop: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>
            Financial Forecasts
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 12 }}>
            {forecasts.map((f, i) => (
              <div key={i} style={{ padding: 12, background: '#F9FAFB', borderRadius: 4, border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{f.name}</div>
                <div style={{ fontSize: 10, color: '#6B7280', marginBottom: 10, ...MONO, textTransform: 'uppercase' }}>
                  {f.scenario}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 9, color: '#6B7280', marginBottom: 2 }}>Projected Revenue</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#16A34A' }}>{fmt$(f.projected_revenue)}</div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 9, color: '#6B7280', marginBottom: 2 }}>Projected Costs</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#DC2626' }}>{fmt$(f.projected_cost)}</div>
                </div>
                <div style={{ paddingTop: 8, borderTop: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: 9, color: '#6B7280', marginBottom: 2 }}>Projected Profit</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: parseFloat(f.projected_profit) >= 0 ? '#16A34A' : '#DC2626' }}>
                    {fmt$(f.projected_profit)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetForecastingView;
