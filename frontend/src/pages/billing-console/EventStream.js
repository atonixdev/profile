import React, { useState, useEffect, useRef, useCallback } from 'react';

const A  = '#A81D37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px', borderRadius: 4 };
const MONO = { fontFamily: 'var(--font-mono)' };

const SERVICE_COLOR = {
  compute:    '#2563EB', storage: '#16A34A', email:   '#D97706',
  pipeline:   '#7C3AED', networking: '#0891B2', monitoring: '#374151',
  auth:       '#A81D37', secrets: '#6B7280', domain: '#D97706',
};

const STATUS_COLOR = {
  processed: '#16A34A', pending: '#D97706', rejected: '#DC2626', duplicate: '#9CA3AF',
};

const fmt$ = v => {
  const n = parseFloat(v);
  if (!n) return null;
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
};

const fmtTs = iso => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
};

const EventStream = () => {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [paused, setPaused]   = useState(false);
  const [filter, setFilter]   = useState('ALL');
  const [svcFilter, setSvcFilter] = useState('ALL');
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const load = useCallback(() => {
    const params = new URLSearchParams({ limit: 200 });
    if (svcFilter !== 'ALL') params.set('service', svcFilter);
    if (filter !== 'ALL')    params.set('status', filter.toLowerCase());
    fetch(`/api/billing/events/?${params}`, { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setEvents(Array.isArray(d) ? d : (d.results || [])); setLoading(false); setError(null); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [filter, svcFilter]);

  // Initial load
  useEffect(() => { setLoading(true); load(); }, [load]);

  // Poll every 3s when not paused
  useEffect(() => {
    const id = setInterval(() => { if (!pausedRef.current) load(); }, 3000);
    return () => clearInterval(id);
  }, [load]);

  const services = ['ALL', 'compute', 'storage', 'email', 'pipeline', 'networking', 'monitoring', 'auth', 'secrets'];
  const statuses = ['ALL', 'PROCESSED', 'PENDING', 'REJECTED', 'DUPLICATE'];

  const displayed = events;
  const counts = { processed: 0, pending: 0, rejected: 0, duplicate: 0 };
  for (const ev of events) { if (counts[ev.status] !== undefined) counts[ev.status]++; }

  return (
    <div style={{ padding: 'clamp(14px, 3.5vw, 28px) clamp(14px, 3.5vw, 32px)', maxWidth: 1280 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: A, ...MONO }}>EVT</span>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Event Stream</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: paused ? '#D97706' : '#22C55E' }} />
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', color: paused ? '#D97706' : '#16A34A', ...MONO, textTransform: 'uppercase' }}>
              {paused ? 'PAUSED' : 'LIVE'}
            </span>
          </div>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Layer 1 usage events — processed, pending, and rejected.</p>
      </div>

      {/* Status chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{ padding: '4px 10px', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', ...MONO, textTransform: 'uppercase', border: `1px solid ${filter === s ? (STATUS_COLOR[s.toLowerCase()] || A) : '#E5E7EB'}`, background: filter === s ? `${STATUS_COLOR[s.toLowerCase()] || A}12` : '#fff', color: filter === s ? (STATUS_COLOR[s.toLowerCase()] || A) : '#6B7280', cursor: 'pointer', borderRadius: 3 }}
          >
            {s}{s !== 'ALL' ? ` (${counts[s.toLowerCase()] || 0})` : ` (${events.length})`}
          </button>
        ))}
        <div style={{ width: 1, background: '#E5E7EB', margin: '0 4px' }} />
        {services.map(s => (
          <button
            key={s}
            onClick={() => setSvcFilter(s)}
            style={{ padding: '4px 10px', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', ...MONO, textTransform: 'uppercase', border: `1px solid ${svcFilter === s ? (SERVICE_COLOR[s] || A) : '#E5E7EB'}`, background: svcFilter === s ? `${SERVICE_COLOR[s] || A}12` : '#fff', color: svcFilter === s ? (SERVICE_COLOR[s] || A) : '#6B7280', cursor: 'pointer', borderRadius: 3 }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <button
          onClick={() => setPaused(p => !p)}
          style={{ padding: '7px 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', border: BD, background: paused ? '#ECFDF5' : '#FFF5F7', color: paused ? '#16A34A' : A, cursor: 'pointer', borderRadius: 3, ...MONO, textTransform: 'uppercase' }}
        >
          {paused ? '▶  Resume' : '⏸  Pause'}
        </button>
        <button
          onClick={load}
          style={{ padding: '7px 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', border: BD, background: '#FFFFFF', color: '#374151', cursor: 'pointer', borderRadius: 3, ...MONO, textTransform: 'uppercase' }}
        >
          Refresh
        </button>
      </div>

      {loading && <div style={{ color: '#6B7280', ...MONO, fontSize: 12, marginBottom: 12 }}>Loading…</div>}
      {error   && <div style={{ color: '#DC2626', ...MONO, fontSize: 12, marginBottom: 12 }}>Error: {error}</div>}

      {/* Event feed */}
      <div style={{ ...CARD, padding: 0, overflow: 'hidden' }}>
        <div style={{ maxHeight: 520, overflowY: 'auto' }}>
          {displayed.length === 0 && !loading && (
            <div style={{ padding: '24px 20px', color: '#9CA3AF', fontSize: 12 }}>No events match the current filter.</div>
          )}
          {displayed.map((ev, i) => (
            <div
              key={ev.id}
              style={{
                display: 'flex', gap: 14, alignItems: 'flex-start',
                padding: '10px 20px',
                borderBottom: i < displayed.length - 1 ? BD : 'none',
              }}
            >
              <span style={{ fontSize: 8, fontWeight: 700, padding: '3px 6px', background: SERVICE_COLOR[ev.service] || '#6B7280', color: '#fff', borderRadius: 2, ...MONO, minWidth: 58, textAlign: 'center', letterSpacing: '0.04em', flexShrink: 0, marginTop: 1, textTransform: 'uppercase' }}>
                {(ev.service || 'SVC').slice(0, 7)}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: '#374151', marginBottom: 2 }}>
                  <strong>{ev.event_type}</strong> — {ev.organization_id_raw || ev.organization || 'unknown'}
                  {fmt$(ev.total_cost) ? <span style={{ color: '#DC2626', marginLeft: 8 }}>{fmt$(ev.total_cost)}</span> : null}
                </div>
                <div style={{ fontSize: 10, color: '#9CA3AF', ...MONO }}>{fmtTs(ev.event_timestamp)}</div>
              </div>
              <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 5px', background: `${STATUS_COLOR[ev.status] || '#9CA3AF'}18`, color: STATUS_COLOR[ev.status] || '#9CA3AF', borderRadius: 2, ...MONO, letterSpacing: '0.04em', flexShrink: 0, border: `1px solid ${STATUS_COLOR[ev.status] || '#9CA3AF'}30`, textTransform: 'uppercase' }}>
                {ev.status}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 10, fontSize: 10, color: '#9CA3AF', ...MONO }}>
        Showing {displayed.length} events · Polling every 3s
      </div>
    </div>
  );
};

export default EventStream;
