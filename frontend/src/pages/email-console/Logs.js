import React, { useState, useEffect, useCallback } from 'react';

const A = '#D4AF37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#F9FAFB', border: BD, padding: '18px 22px' };

const TYPE_OPTS = [
  { value: '', label: 'All Types' },
  { value: 'verification', label: 'Verification' },
  { value: 'password_reset', label: 'Password Reset' },
  { value: 'notification', label: 'Notification' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'custom', label: 'Custom' },
];
const STATUS_COLOR = { sent: '#22C55E', failed: '#EF4444', queued: '#F59E0B', pending: '#4B5563' };
const PAGE_SIZE = 20;

export default function EmailLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchLogs = useCallback(async (p = 1, f = '') => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ page: p, page_size: PAGE_SIZE });
      if (f) params.set('email_type', f);
      const res = await fetch(`/api/admin/email-logs/?${params}`, { credentials: 'include', headers: { Accept: 'application/json' } });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) throw new Error(`Backend not reachable (${res.status})`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLogs(data.results || data);
      setTotal(data.count || (Array.isArray(data) ? data.length : 0));
    } catch (err) { setError(err.message); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchLogs(1, filter); setPage(1); }, [filter, fetchLogs]);

  const handlePage = (dir) => {
    const next = page + dir;
    if (next < 1 || next > Math.ceil(total / PAGE_SIZE)) return;
    setPage(next); fetchLogs(next, filter);
  };

  const fmt = (ts) => ts ? new Date(ts).toLocaleString() : '—';
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px) clamp(16px, 4vw, 36px)', color: '#1F2937', minHeight: '100%' }}>

      {/* Log detail drawer */}
      {selected && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', zIndex: 9900, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: 460, background: '#FFF', borderLeft: BD, height: '100%', overflowY: 'auto', padding: '28px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: A, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Log Entry Detail</span>
              <button onClick={() => setSelected(null)} style={{ background: 'transparent', border: 'none', color: '#4B5563', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>✕</button>
            </div>
            {[
              ['ID', selected.id],
              ['Recipient', selected.recipient_email],
              ['Subject', selected.subject],
              ['Type', selected.email_type],
              ['Status', selected.status],
              ['IP Address', selected.ip_address || '—'],
              ['Sent At', fmt(selected.sent_at)],
              ['Template ID', selected.template_id || '—'],
            ].map(([l, v]) => (
              <div key={l} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#4B5563', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>{l}</div>
                <div style={{ fontSize: 13, color: '#111827', wordBreak: 'break-all' }}>{v}</div>
              </div>
            ))}
            {selected.error_message && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#EF4444', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 5 }}>Error</div>
                <div style={{ fontSize: 12, color: '#EF4444', background: 'rgba(239,68,68,0.06)', padding: '10px 14px', border: '1px solid rgba(239,68,68,0.15)', fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{selected.error_message}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', color: A, textTransform: 'uppercase', marginBottom: 6 }}>LOG — Email Logs</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111827' }}>Email Delivery Logs</h1>
          <p style={{ fontSize: 13, color: '#4B5563', margin: '6px 0 0' }}>Full audit trail of all outbound emails. {total > 0 && `${total.toLocaleString()} total entries.`}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '9px 12px', background: '#FFF', border: BD, color: '#1F2937', fontSize: 12, fontFamily: 'var(--font-mono)', outline: 'none', cursor: 'pointer' }}>
            {TYPE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={() => fetchLogs(page, filter)} style={{ padding: '9px 18px', background: 'transparent', border: BD, color: '#1F2937', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>⟳ Refresh</button>
        </div>
      </div>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: 12, marginBottom: 16 }}>Failed to load: {error}</div>}

      {/* Table */}
      <div style={{ ...CARD, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#F1F5F9' }}>
                {['Time', 'Type', 'Recipient', 'Subject', 'Status', 'IP', ''].map((h) => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4B5563', fontFamily: 'var(--font-mono)', borderBottom: BD, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} style={{ padding: '32px 20px', textAlign: 'center', color: '#4B5563', fontSize: 12 }}>Loading…</td></tr>
              )}
              {!loading && logs.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '32px 20px', textAlign: 'center', color: '#4B5563', fontSize: 12 }}>No log entries found.</td></tr>
              )}
              {!loading && logs.map((l, i) => (
                <tr key={l.id || i} style={{ borderBottom: BD, transition: 'background .1s', cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  onClick={() => setSelected(l)}>
                  <td style={{ padding: '10px 14px', color: '#1F2937', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{fmt(l.sent_at)}</td>
                  <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: 9, padding: '2px 7px', background: '#EEF2FF', color: '#6366F1', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l.email_type || '—'}</span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#1F2937', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.recipient_email || '—'}</td>
                  <td style={{ padding: '10px 14px', color: '#1F2937', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.subject || '—'}</td>
                  <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: 9, padding: '2px 7px', color: STATUS_COLOR[l.status] || '#4B5563', background: `${STATUS_COLOR[l.status] || '#4B5563'}18`, fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l.status || '—'}</span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#4B5563', fontFamily: 'var(--font-mono)', fontSize: 11, whiteSpace: 'nowrap' }}>{l.ip_address || '—'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <button onClick={(e) => { e.stopPropagation(); setSelected(l); }} style={{ fontSize: 9, color: A, fontFamily: 'var(--font-mono)', fontWeight: 700, background: 'transparent', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em' }}>View →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div style={{ padding: '12px 16px', borderTop: BD, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFAFA' }}>
            <span style={{ fontSize: 11, color: '#4B5563', fontFamily: 'var(--font-mono)' }}>Page {page} of {totalPages} — {total.toLocaleString()} total</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => handlePage(-1)} disabled={page === 1} style={{ padding: '5px 14px', border: BD, color: page === 1 ? '#D1D5DB' : '#1F2937', background: '#FFF', fontSize: 11, cursor: page === 1 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>← Prev</button>
              <button onClick={() => handlePage(1)} disabled={page === totalPages} style={{ padding: '5px 14px', border: BD, color: page === totalPages ? '#D1D5DB' : '#1F2937', background: '#FFF', fontSize: 11, cursor: page === totalPages ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
