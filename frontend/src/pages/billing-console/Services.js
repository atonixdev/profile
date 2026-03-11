import React, { useState, useEffect } from 'react';

const A  = '#A81D37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px', borderRadius: 4 };
const MONO = { fontFamily: 'var(--font-mono)' };

const fmt$ = v => {
  const n = parseFloat(v);
  if (isNaN(n)) return '$0.00';
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const ServiceAnalytics = () => {
  const [usage, setUsage]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [highlight, setHighlight] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/billing/summary/usage/', { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setUsage(d.usage || []); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: '40px 32px', color: '#6B7280', ...MONO, fontSize: 12 }}>Loading…</div>;
  if (error)   return <div style={{ padding: '40px 32px', color: '#DC2626', ...MONO, fontSize: 12 }}>Error: {error}</div>;

  // Aggregate by service (there may be multiple unit_types per service)
  const byService = {};
  for (const row of usage) {
    if (!byService[row.service]) {
      byService[row.service] = { service: row.service, total_cost: 0, total_units: 0, org_count: 0, event_count: 0 };
    }
    byService[row.service].total_cost   += parseFloat(row.total_cost) || 0;
    byService[row.service].total_units  += parseFloat(row.total_units) || 0;
    byService[row.service].org_count     = Math.max(byService[row.service].org_count, parseInt(row.org_count) || 0);
    byService[row.service].event_count  += parseInt(row.event_count) || 0;
  }
  const services = Object.values(byService).sort((a, b) => b.total_cost - a.total_cost);
  const totalRevenue = services.reduce((s, r) => s + r.total_cost, 0);
  const maxCost      = services.reduce((m, r) => Math.max(m, r.total_cost), 1);

  return (
    <div style={{ padding: 'clamp(14px, 3.5vw, 28px) clamp(14px, 3.5vw, 32px)', maxWidth: 1280 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: A, ...MONO }}>SVC</span>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Service Analytics</h1>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Revenue and usage breakdown across all platform services.</p>
      </div>

      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Revenue',     value: fmt$(totalRevenue),                       accent: A },
          { label: 'Active Services',   value: services.length,                          accent: '#2563EB' },
          { label: 'Total Events',      value: services.reduce((s,r) => s + r.event_count, 0).toLocaleString(), accent: '#D97706' },
          { label: 'Avg Rev / Service', value: fmt$(services.length ? totalRevenue / services.length : 0), accent: '#7C3AED' },
        ].map(s => (
          <div key={s.label} style={{ ...CARD, borderTop: `3px solid ${s.accent}` }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', ...MONO }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginTop: 4 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Revenue bar chart */}
      {services.length > 0 && (
        <div style={{ ...CARD, marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>
            Revenue Distribution
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 100 }}>
            {services.map((s, i) => {
              const h = Math.max(4, Math.round((s.total_cost / maxCost) * 90));
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    style={{ width: '100%', height: h, background: highlight === i ? '#7C3AED' : A, borderRadius: '2px 2px 0 0', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={() => setHighlight(i)}
                    onMouseLeave={() => setHighlight(null)}
                  />
                  <div style={{ fontSize: 8, color: '#9CA3AF', marginTop: 4, ...MONO, textTransform: 'uppercase' }}>{s.service.slice(0, 7)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Services table */}
      <div style={CARD}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>
          Service Registry
        </div>
        {services.length === 0 && <div style={{ fontSize: 12, color: '#9CA3AF' }}>No usage data this period.</div>}
        {services.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid #E5E7EB` }}>
                  {['Service', 'Total Units', 'Revenue', 'Orgs', 'Events'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#9CA3AF', ...MONO, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {services.map((s, i) => (
                  <tr
                    key={s.service}
                    style={{ borderBottom: BD, background: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FFF5F7'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#FFFFFF' : '#FAFAFA'}
                  >
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#111827', textTransform: 'capitalize' }}>{s.service}</td>
                    <td style={{ padding: '10px 12px', color: '#374151', ...MONO, fontSize: 11 }}>{parseFloat(s.total_units).toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#111827' }}>{fmt$(s.total_cost)}</td>
                    <td style={{ padding: '10px 12px', color: '#374151' }}>{s.org_count}</td>
                    <td style={{ padding: '10px 12px', color: '#374151', ...MONO }}>{s.event_count.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceAnalytics;
