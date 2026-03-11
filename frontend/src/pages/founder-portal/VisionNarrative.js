import React, { useState, useEffect } from 'react';

const A    = '#A81D37';
const BD   = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px', borderRadius: 4 };
const MONO = { fontFamily: 'var(--font-mono)' };

const priorityColors = { critical: '#DC2626', high: '#D97706', normal: '#2563EB', low: '#6B7280' };
const statusColors   = { active: '#16A34A', draft: '#9CA3AF', archived: '#6B7280' };

const VisionNarrative = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    fetch('/api/portal/dashboard/vision/', { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: '40px 32px', color: '#6B7280', ...MONO, fontSize: 12 }}>Loading…</div>;
  if (error) return <div style={{ padding: '40px 32px', color: '#DC2626', ...MONO, fontSize: 12 }}>Error: {error}</div>;
  if (!data) return null;

  const directives = data.directives || [];
  const guidelines = data.cultural_guidelines || [];
  const summary    = data.directive_summary || {};
  const pinned     = directives.filter(d => d.is_pinned);
  const rest       = directives.filter(d => !d.is_pinned);

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 28px) clamp(16px, 4vw, 32px)', maxWidth: 1440 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: A, ...MONO }}>VIS</span>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Vision & Narrative</h1>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Founder directives, cultural guidelines, and organizational narrative</p>
      </div>

      {/* Priority Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: 14, marginBottom: 28 }}>
        {Object.entries(priorityColors).map(([key, color]) => (
          <div key={key} style={{ ...CARD, borderTop: `3px solid ${color}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>
              {key}
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{summary[key] || 0}</div>
          </div>
        ))}
      </div>

      {/* Pinned Directives */}
      {pinned.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 14 }}>
            Pinned Directives
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {pinned.map(d => (
              <div key={d.id} style={{ ...CARD, borderLeft: `3px solid ${priorityColors[d.priority] || '#6B7280'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{d.title}</span>
                    <span style={{
                      fontSize: 8, fontWeight: 700, letterSpacing: '0.08em', padding: '2px 6px',
                      borderRadius: 2, background: `${priorityColors[d.priority]}18`,
                      color: priorityColors[d.priority], ...MONO,
                    }}>{d.priority?.toUpperCase()}</span>
                  </div>
                  <span style={{
                    fontSize: 8, fontWeight: 700, letterSpacing: '0.08em', padding: '2px 6px',
                    borderRadius: 2, background: `${statusColors[d.status] || '#6B7280'}18`,
                    color: statusColors[d.status] || '#6B7280', ...MONO,
                  }}>{d.status?.toUpperCase()}</span>
                </div>
                <p style={{ fontSize: 12, color: '#6B7280', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {(d.content || '').slice(0, 300)}{(d.content || '').length > 300 ? '…' : ''}
                </p>
                <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 8, ...MONO }}>
                  by {d.author_name || 'System'} · {d.created_at ? new Date(d.created_at).toLocaleDateString() : '—'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Directives */}
      <div style={{ ...CARD, marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>
          Directives ({directives.length})
        </div>
        {rest.length === 0 && pinned.length === 0 ? (
          <div style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', padding: '20px 0' }}>No directives created yet</div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {rest.map(d => (
              <div key={d.id} style={{ padding: '12px 14px', border: BD, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: priorityColors[d.priority] || '#6B7280', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{d.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.06em', padding: '2px 6px', borderRadius: 2, border: `1px solid ${statusColors[d.status] || '#6B7280'}`, color: statusColors[d.status] || '#6B7280', ...MONO }}>
                    {d.status?.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 10, color: '#9CA3AF', ...MONO }}>
                    {d.created_at ? new Date(d.created_at).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cultural Guidelines */}
      <div style={CARD}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>
          Cultural Guidelines ({guidelines.length})
        </div>
        {guidelines.length === 0 ? (
          <div style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', padding: '20px 0' }}>No cultural guidelines defined yet</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: 12 }}>
            {guidelines.map(g => (
              <div key={g.id} style={{ padding: '14px 16px', border: BD, borderRadius: 4, background: g.is_pinned ? '#FEF2F2' : '#F9FAFB' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  {g.is_pinned && <span style={{ fontSize: 8, fontWeight: 700, color: A, ...MONO }}>PINNED</span>}
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{g.title}</span>
                </div>
                <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.06em', padding: '1px 6px', borderRadius: 2, background: '#E5E7EB', color: '#6B7280', ...MONO }}>
                  {g.category?.toUpperCase()}
                </span>
                <p style={{ fontSize: 12, color: '#6B7280', margin: '8px 0 0', lineHeight: 1.5 }}>
                  {(g.content || '').slice(0, 200)}{(g.content || '').length > 200 ? '…' : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VisionNarrative;
