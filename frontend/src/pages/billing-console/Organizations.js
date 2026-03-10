import React, { useState, useEffect } from 'react';

const A  = '#A81D37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px', borderRadius: 4 };
const MONO = { fontFamily: 'var(--font-mono)' };

const STATUS_COLOR = {
  active: '#16A34A', suspended: '#DC2626', trial: '#D97706', pending: '#2563EB',
  Active: '#16A34A', Suspended: '#DC2626', Trial: '#D97706', Pending: '#2563EB',
};
const PLAN_COLOR = { enterprise: '#7C3AED', pro: '#2563EB', starter: '#16A34A' };

const fmt$ = v => {
  const n = parseFloat(v);
  if (isNaN(n)) return '$0.00';
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const Organizations = () => {
  const [orgs, setOrgs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/billing/organizations/', { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setOrgs(Array.isArray(d) ? d : (d.results || [])); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const filtered = orgs.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    (o.plan || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.status || '').toLowerCase().includes(search.toLowerCase())
  );

  const byPlan = plan => orgs.filter(o => o.plan === plan).length;

  if (loading) return <div style={{ padding: '40px 32px', color: '#6B7280', ...MONO, fontSize: 12 }}>Loading…</div>;
  if (error)   return <div style={{ padding: '40px 32px', color: '#DC2626', ...MONO, fontSize: 12 }}>Error: {error}</div>;

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1280 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: A, ...MONO }}>ORG</span>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Organizations</h1>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Per-organization usage, billing history, and balance management.</p>
      </div>

      {/* Stat pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Orgs',  value: orgs.length,          accent: A },
          { label: 'Enterprise',  value: byPlan('enterprise'),  accent: '#7C3AED' },
          { label: 'Pro Plan',    value: byPlan('pro'),         accent: '#2563EB' },
          { label: 'Starter',     value: byPlan('starter'),     accent: '#16A34A' },
        ].map(s => (
          <div key={s.label} style={{ ...CARD, borderTop: `3px solid ${s.accent}` }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', ...MONO }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginTop: 4 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div style={CARD}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO }}>
            Organization Registry
          </div>
          <input
            type="text"
            placeholder="Search orgs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '6px 12px', fontSize: 12, border: BD, outline: 'none', borderRadius: 3, width: 200 }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid #E5E7EB` }}>
                {['Name', 'Plan', 'Members', 'Outstanding', 'Status', 'Created'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#9CA3AF', ...MONO, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => {
                const outstanding = parseFloat(o.outstanding || 0);
                const plan = (o.plan || '').toLowerCase();
                const status = (o.status || '').toLowerCase();
                return (
                  <tr
                    key={o.id}
                    onClick={() => setSelected(selected === o.id ? null : o.id)}
                    style={{ borderBottom: BD, cursor: 'pointer', background: selected === o.id ? '#FFF5F7' : i % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FFF5F7'}
                    onMouseLeave={e => e.currentTarget.style.background = selected === o.id ? '#FFF5F7' : i % 2 === 0 ? '#FFFFFF' : '#FAFAFA'}
                  >
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#111827' }}>{o.name}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', background: `${PLAN_COLOR[plan] || '#9CA3AF'}18`, color: PLAN_COLOR[plan] || '#9CA3AF', borderRadius: 3, ...MONO, letterSpacing: '0.06em' }}>
                        {plan.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#374151' }}>{o.member_count ?? 0}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: outstanding > 0 ? '#DC2626' : '#16A34A' }}>{fmt$(outstanding)}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', background: `${STATUS_COLOR[status] || '#9CA3AF'}18`, color: STATUS_COLOR[status] || '#9CA3AF', borderRadius: 3, ...MONO, letterSpacing: '0.06em' }}>
                        {status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#6B7280', fontSize: 11 }}>
                      {o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 12, fontSize: 11, color: '#9CA3AF', ...MONO }}>
          Showing {filtered.length} of {orgs.length} organizations
        </div>
      </div>
    </div>
  );
};

export default Organizations;
