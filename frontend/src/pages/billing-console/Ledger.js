import React, { useState, useEffect } from 'react';

const A  = '#A81D37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px', borderRadius: 4 };
const MONO = { fontFamily: 'var(--font-mono)' };

const TYPE_COLOR = {
  charge:     '#DC2626', payment:    '#16A34A', credit:     '#2563EB',
  refund:     '#7C3AED', adjustment: '#D97706', promo:      '#D97706',
  void:       '#9CA3AF', writeoff:   '#374151',
};

const fmt$ = v => {
  const n = parseFloat(v);
  if (isNaN(n)) return '$0.00';
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const fmtTs = iso => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
};

const Ledger = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [typeF, setTypeF]     = useState('ALL');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: 200 });
    if (typeF !== 'ALL') params.set('type', typeF.toLowerCase());
    fetch(`/api/billing/ledger/?${params}`, { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setEntries(Array.isArray(d) ? d : (d.results || [])); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [typeF]);

  const totalCharges  = entries.filter(e => e.entry_type === 'charge').reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const totalPayments = entries.filter(e => e.entry_type === 'payment').reduce((s, e) => s + Math.abs(parseFloat(e.amount || 0)), 0);
  const totalCredits  = entries.filter(e => ['credit','refund','promo','adjustment'].includes(e.entry_type)).reduce((s, e) => s + Math.abs(parseFloat(e.amount || 0)), 0);

  const types = ['ALL', ...new Set(entries.map(e => e.entry_type))];

  if (loading) return <div style={{ padding: '40px 32px', color: '#6B7280', ...MONO, fontSize: 12 }}>Loading…</div>;
  if (error)   return <div style={{ padding: '40px 32px', color: '#DC2626', ...MONO, fontSize: 12 }}>Error: {error}</div>;

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1280 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: A, ...MONO }}>LDG</span>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Billing Ledger</h1>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Immutable double-entry ledger — all financial movements platform-wide.</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Charges',  value: fmt$(totalCharges),  accent: '#DC2626' },
          { label: 'Total Payments', value: fmt$(totalPayments), accent: '#16A34A' },
          { label: 'Total Credits',  value: fmt$(totalCredits),  accent: '#2563EB' },
          { label: 'Ledger Entries', value: entries.length,       accent: '#7C3AED' },
        ].map(s => (
          <div key={s.label} style={{ ...CARD, borderTop: `3px solid ${s.accent}` }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', ...MONO }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginTop: 4 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Ledger table */}
      <div style={CARD}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO }}>Ledger Entries</div>
            <span style={{ fontSize: 9, padding: '2px 6px', background: '#FEF2F2', color: A, border: `1px solid ${A}30`, ...MONO, fontWeight: 700, letterSpacing: '0.06em', borderRadius: 3 }}>IMMUTABLE</span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {types.map(t => (
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
                {['Seq', 'Timestamp', 'Type', 'Organization', 'Service', 'Amount', 'Running Balance', 'Note'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#9CA3AF', ...MONO, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 && (
                <tr><td colSpan={8} style={{ padding: '20px 12px', color: '#9CA3AF', fontSize: 12 }}>No ledger entries found.</td></tr>
              )}
              {entries.map((e, i) => {
                const isDebit  = e.entry_type === 'charge';
                const amtColor = isDebit ? '#DC2626' : '#16A34A';
                const amtStr   = isDebit ? `+${fmt$(e.amount)}` : `-${fmt$(Math.abs(e.amount))}`;
                return (
                  <tr key={e.id} style={{ borderBottom: BD, background: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                    <td style={{ padding: '10px 12px', ...MONO, fontSize: 10, color: '#9CA3AF' }}>#{e.seq}</td>
                    <td style={{ padding: '10px 12px', ...MONO, fontSize: 10, color: '#6B7280', whiteSpace: 'nowrap' }}>{fmtTs(e.created_at)}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', background: `${TYPE_COLOR[e.entry_type] || '#9CA3AF'}12`, color: TYPE_COLOR[e.entry_type] || '#9CA3AF', borderRadius: 3, ...MONO, letterSpacing: '0.06em', border: `1px solid ${TYPE_COLOR[e.entry_type] || '#9CA3AF'}30`, textTransform: 'uppercase' }}>
                        {e.entry_type}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 500, color: '#111827' }}>{e.organization_name || e.organization}</td>
                    <td style={{ padding: '10px 12px', color: '#6B7280', fontSize: 11, textTransform: 'capitalize' }}>{e.service || '—'}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: amtColor, ...MONO }}>{amtStr}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#374151', ...MONO }}>{fmt$(e.running_balance)}</td>
                    <td style={{ padding: '10px 12px', color: '#6B7280', fontSize: 11 }}>{e.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 12, fontSize: 11, color: '#9CA3AF', ...MONO }}>
          Showing {entries.length} ledger entries · Read-only
        </div>
      </div>
    </div>
  );
};

export default Ledger;
