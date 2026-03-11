import React, { useState, useEffect } from 'react';

const A  = '#A81D37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px', borderRadius: 4 };
const MONO = { fontFamily: 'var(--font-mono)' };

const STATUS_COLOR = {
  paid: '#16A34A', outstanding: '#D97706', overdue: '#DC2626', draft: '#9CA3AF', void: '#6B7280',
  Paid: '#16A34A', Outstanding: '#D97706', Overdue: '#DC2626', Draft: '#9CA3AF', Void: '#6B7280',
};

const fmt$ = v => {
  const n = parseFloat(v);
  if (isNaN(n)) return '$0.00';
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const fmtDate = iso => iso ? new Date(iso).toLocaleDateString('en-CA') : '—';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState('');
  const [statusF, setStatusF]   = useState('ALL');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusF !== 'ALL') params.set('status', statusF.toLowerCase());
    fetch(`/api/billing/invoices/?${params}`, { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setInvoices(Array.isArray(d) ? d : (d.results || [])); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [statusF]);

  const filtered = invoices.filter(inv =>
    (inv.invoice_number || '').toLowerCase().includes(search.toLowerCase()) ||
    (inv.organization_name || inv.organization || '').toLowerCase().includes(search.toLowerCase())
  );

  const byStatus = s => invoices.filter(i => i.status === s);
  const sumStatus = s => byStatus(s).reduce((acc, i) => acc + parseFloat(i.total || 0), 0);

  if (loading) return <div style={{ padding: '40px 32px', color: '#6B7280', ...MONO, fontSize: 12 }}>Loading…</div>;
  if (error)   return <div style={{ padding: '40px 32px', color: '#DC2626', ...MONO, fontSize: 12 }}>Error: {error}</div>;

  return (
    <div style={{ padding: 'clamp(14px, 3.5vw, 28px) clamp(14px, 3.5vw, 32px)', maxWidth: 1280 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: A, ...MONO }}>INV</span>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Invoices</h1>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Invoice management, status tracking, and collection workflow.</p>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 14, marginBottom: 24 }}>
        <div style={{ ...CARD, borderTop: `3px solid #16A34A` }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', ...MONO }}>Paid</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginTop: 4 }}>{fmt$(sumStatus('paid'))}</div>
          <div style={{ fontSize: 11, color: '#16A34A', marginTop: 4 }}>{byStatus('paid').length} invoices</div>
        </div>
        <div style={{ ...CARD, borderTop: `3px solid #D97706` }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', ...MONO }}>Outstanding</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginTop: 4 }}>{fmt$(sumStatus('outstanding') + sumStatus('issued'))}</div>
          <div style={{ fontSize: 11, color: '#D97706', marginTop: 4 }}>{byStatus('outstanding').length + byStatus('issued').length} invoices</div>
        </div>
        <div style={{ ...CARD, borderTop: `3px solid #DC2626` }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', ...MONO }}>Overdue</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginTop: 4 }}>{fmt$(sumStatus('overdue'))}</div>
          <div style={{ fontSize: 11, color: '#DC2626', marginTop: 4 }}>{byStatus('overdue').length} invoices</div>
        </div>
        <div style={{ ...CARD, borderTop: `3px solid #9CA3AF` }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', ...MONO }}>Total Invoices</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginTop: 4 }}>{invoices.length}</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>All time</div>
        </div>
      </div>

      {/* Table */}
      <div style={CARD}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {['ALL', 'paid', 'outstanding', 'overdue', 'draft'].map(s => (
              <button
                key={s}
                onClick={() => setStatusF(s)}
                style={{ padding: '5px 10px', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', ...MONO, textTransform: 'uppercase', border: `1px solid ${statusF === s ? (STATUS_COLOR[s] || A) : '#E5E7EB'}`, background: statusF === s ? `${(STATUS_COLOR[s] || A)}12` : '#fff', color: statusF === s ? (STATUS_COLOR[s] || A) : '#6B7280', cursor: 'pointer', borderRadius: 3 }}
              >
                {s === 'ALL' ? 'ALL' : s}
              </button>
            ))}
          </div>
          <input
            type="text" placeholder="Search invoices..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '6px 12px', fontSize: 12, border: BD, outline: 'none', borderRadius: 3, width: 200 }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid #E5E7EB` }}>
                {['Invoice', 'Organization', 'Amount', 'Issued', 'Period', 'Status'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#9CA3AF', ...MONO, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv, i) => (
                <tr
                  key={inv.id}
                  style={{ borderBottom: BD, background: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FFF5F7'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#FFFFFF' : '#FAFAFA'}
                >
                  <td style={{ padding: '10px 12px', ...MONO, fontSize: 11, fontWeight: 700, color: '#374151' }}>{inv.invoice_number}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 500, color: '#111827' }}>{inv.organization_name || inv.organization}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#111827' }}>{fmt$(inv.total)}</td>
                  <td style={{ padding: '10px 12px', color: '#6B7280', fontSize: 11 }}>{fmtDate(inv.created_at)}</td>
                  <td style={{ padding: '10px 12px', color: '#6B7280', fontSize: 11 }}>
                    {fmtDate(inv.period_start)} – {fmtDate(inv.period_end)}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', background: `${STATUS_COLOR[inv.status] || '#9CA3AF'}18`, color: STATUS_COLOR[inv.status] || '#9CA3AF', borderRadius: 3, ...MONO, letterSpacing: '0.06em' }}>
                      {(inv.status || '').toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 12, fontSize: 11, color: '#9CA3AF', ...MONO }}>
          Showing {filtered.length} of {invoices.length} invoices
        </div>
      </div>
    </div>
  );
};

export default Invoices;
