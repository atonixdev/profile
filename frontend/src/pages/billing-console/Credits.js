import React, { useState, useEffect } from 'react';

const A  = '#A81D37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px', borderRadius: 4 };
const MONO = { fontFamily: 'var(--font-mono)' };

const TYPE_COLOR = {
  credit: '#16A34A', adjustment: '#2563EB', refund: '#7C3AED', promo: '#D97706',
};
const STATUS_COLOR = { active: '#16A34A', applied: '#2563EB', expired: '#9CA3AF', void: '#DC2626' };

const fmt$ = v => {
  const n = parseFloat(v);
  if (isNaN(n)) return '$0.00';
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const fmtDate = iso => iso ? new Date(iso).toLocaleDateString('en-CA') : '—';

const Credits = () => {
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [typeF, setTypeF]     = useState('ALL');

  useEffect(() => {
    setLoading(true);
    fetch('/api/billing/credits/', { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setCredits(Array.isArray(d) ? d : (d.results || [])); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const filtered = typeF === 'ALL' ? credits : credits.filter(c => c.credit_type === typeF);

  const activeTotal  = credits.filter(c => c.status === 'active').reduce((s, c) => s + parseFloat(c.amount || 0), 0);
  const appliedTotal = credits.filter(c => c.status === 'applied').reduce((s, c) => s + parseFloat(c.amount || 0), 0);
  const refunds      = credits.filter(c => c.credit_type === 'refund').reduce((s, c) => s + parseFloat(c.amount || 0), 0);
  const total        = credits.reduce((s, c) => s + parseFloat(c.amount || 0), 0);

  if (loading) return <div style={{ padding: '40px 32px', color: '#6B7280', ...MONO, fontSize: 12 }}>Loading…</div>;
  if (error)   return <div style={{ padding: '40px 32px', color: '#DC2626', ...MONO, fontSize: 12 }}>Error: {error}</div>;

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1280 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: A, ...MONO }}>CRD</span>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Credits & Adjustments</h1>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Issued credits, billing adjustments, refunds, and promotional balances.</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <div style={{ ...CARD, borderTop: `3px solid #16A34A` }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', ...MONO }}>Active Balance</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginTop: 4 }}>{fmt$(activeTotal)}</div>
          <div style={{ fontSize: 11, color: '#16A34A', marginTop: 4 }}>{credits.filter(c => c.status === 'active').length} active</div>
        </div>
        <div style={{ ...CARD, borderTop: `3px solid #2563EB` }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', ...MONO }}>Applied to Invoices</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginTop: 4 }}>{fmt$(appliedTotal)}</div>
          <div style={{ fontSize: 11, color: '#2563EB', marginTop: 4 }}>{credits.filter(c => c.status === 'applied').length} applied</div>
        </div>
        <div style={{ ...CARD, borderTop: `3px solid #D97706` }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', ...MONO }}>Total Issued</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginTop: 4 }}>{fmt$(total)}</div>
          <div style={{ fontSize: 11, color: '#D97706', marginTop: 4 }}>{credits.length} entries</div>
        </div>
        <div style={{ ...CARD, borderTop: `3px solid #7C3AED` }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', ...MONO }}>Refunds Issued</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginTop: 4 }}>{fmt$(refunds)}</div>
          <div style={{ fontSize: 11, color: '#7C3AED', marginTop: 4 }}>{credits.filter(c => c.credit_type === 'refund').length} refunds</div>
        </div>
      </div>

      {/* Table */}
      <div style={CARD}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO }}>Credit Ledger</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['ALL', 'credit', 'adjustment', 'refund', 'promo'].map(t => (
              <button
                key={t}
                onClick={() => setTypeF(t)}
                style={{ padding: '5px 10px', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', ...MONO, textTransform: 'uppercase', border: `1px solid ${typeF === t ? (TYPE_COLOR[t] || A) : '#E5E7EB'}`, background: typeF === t ? `${(TYPE_COLOR[t] || A)}12` : '#fff', color: typeF === t ? (TYPE_COLOR[t] || A) : '#6B7280', cursor: 'pointer', borderRadius: 3 }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid #E5E7EB` }}>
                {['ID', 'Organization', 'Type', 'Amount', 'Reason', 'Issued', 'Expires', 'Status'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#9CA3AF', ...MONO, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ padding: '20px 12px', color: '#9CA3AF', fontSize: 12 }}>No credits found.</td></tr>
              )}
              {filtered.map((c, i) => (
                <tr
                  key={c.id}
                  style={{ borderBottom: BD, background: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FFF5F7'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#FFFFFF' : '#FAFAFA'}
                >
                  <td style={{ padding: '10px 12px', ...MONO, fontSize: 10, fontWeight: 700, color: '#374151' }}>{c.credit_number}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 500, color: '#111827' }}>{c.organization_name || c.organization}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', background: `${TYPE_COLOR[c.credit_type] || '#9CA3AF'}18`, color: TYPE_COLOR[c.credit_type] || '#9CA3AF', borderRadius: 3, ...MONO, letterSpacing: '0.06em' }}>
                      {(c.credit_type || '').toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#16A34A' }}>{fmt$(c.amount)}</td>
                  <td style={{ padding: '10px 12px', color: '#6B7280', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.reason}</td>
                  <td style={{ padding: '10px 12px', color: '#6B7280', fontSize: 11 }}>{fmtDate(c.created_at)}</td>
                  <td style={{ padding: '10px 12px', color: '#6B7280', fontSize: 11 }}>{fmtDate(c.expires_at)}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', background: `${STATUS_COLOR[c.status] || '#9CA3AF'}18`, color: STATUS_COLOR[c.status] || '#9CA3AF', borderRadius: 3, ...MONO, letterSpacing: '0.06em' }}>
                      {(c.status || '').toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 12, fontSize: 11, color: '#9CA3AF', ...MONO }}>
          {filtered.length} of {credits.length} credit entries
        </div>
      </div>
    </div>
  );
};

export default Credits;
