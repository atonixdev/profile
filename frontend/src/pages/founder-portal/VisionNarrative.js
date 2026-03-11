import React, { useState, useEffect, useCallback } from 'react';

const A    = '#A81D37';
const BD   = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px', borderRadius: 4 };
const MONO = { fontFamily: 'var(--font-mono)' };

const priorityColors = { critical: '#DC2626', high: '#D97706', normal: '#2563EB', low: '#6B7280' };
const statusColors   = { active: '#16A34A', draft: '#9CA3AF', archived: '#6B7280' };

const api = (url, opts = {}) => fetch(url, {
  credentials: 'include',
  headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...opts.headers },
  ...opts,
}).then(r => {
  if (r.status === 204) return null;
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
});

const OVERLAY = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', zIndex: 999,
};
const MODAL = { background: '#FFFFFF', borderRadius: 6, padding: '28px 32px', width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto' };
const INPUT = { width: '100%', padding: '8px 12px', border: BD, borderRadius: 4, fontSize: 13, boxSizing: 'border-box' };
const TEXTAREA = { ...INPUT, minHeight: 120, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 };
const BTN = (bg, fg) => ({
  padding: '8px 18px', border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 700,
  background: bg, color: fg, cursor: 'pointer', letterSpacing: '0.04em', ...MONO,
});

const VisionNarrative = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [modal, setModal]     = useState(null); // 'directive' | 'guideline'
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState({});

  const fetchData = useCallback(() => {
    setLoading(true);
    api('/api/portal/dashboard/vision/')
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openDirective = (item = null) => {
    setEditing(item);
    setForm(item ? { title: item.title, content: item.content, priority: item.priority, status: item.status, pinned: item.pinned } : { title: '', content: '', priority: 'normal', status: 'active', pinned: false });
    setModal('directive');
  };

  const saveDirective = () => {
    const method = editing ? 'PUT' : 'POST';
    const body = editing ? { ...form, id: editing.id } : form;
    api('/api/portal/directives/manage/', { method, body: JSON.stringify(body) })
      .then(() => { setModal(null); fetchData(); });
  };

  const deleteDirective = id => {
    if (!window.confirm('Delete this directive?')) return;
    api(`/api/portal/directives/manage/?id=${id}`, { method: 'DELETE' })
      .then(() => fetchData());
  };

  const openGuideline = (item = null) => {
    setEditing(item);
    setForm(item ? { title: item.title, content: item.content, category: item.category, pinned: item.pinned } : { title: '', content: '', category: 'core_value', pinned: false });
    setModal('guideline');
  };

  const saveGuideline = () => {
    const method = editing ? 'PUT' : 'POST';
    const body = editing ? { ...form, id: editing.id } : form;
    api('/api/portal/guidelines/', { method, body: JSON.stringify(body) })
      .then(() => { setModal(null); fetchData(); });
  };

  const deleteGuideline = id => {
    if (!window.confirm('Delete this guideline?')) return;
    api(`/api/portal/guidelines/?id=${id}`, { method: 'DELETE' })
      .then(() => fetchData());
  };

  if (loading) return <div style={{ padding: '40px 32px', color: '#6B7280', ...MONO, fontSize: 12 }}>Loading…</div>;
  if (error) return <div style={{ padding: '40px 32px', color: '#DC2626', ...MONO, fontSize: 12 }}>Error: {error}</div>;
  if (!data) return null;

  const directives = data.directives || [];
  const guidelines = data.cultural_guidelines || [];
  const summary    = data.directives_summary || {};
  const byPriority = summary.by_priority || {};
  const pinned     = directives.filter(d => d.pinned);
  const rest       = directives.filter(d => !d.pinned);

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 28px) clamp(16px, 4vw, 32px)', maxWidth: 1440 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: A, ...MONO }}>VIS</span>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Vision & Narrative</h1>
          </div>
          <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Founder directives, cultural guidelines, and organizational narrative</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => openDirective()} style={BTN(A, '#FFF')}>+ Directive</button>
          <button onClick={() => openGuideline()} style={BTN('#374151', '#FFF')}>+ Guideline</button>
        </div>
      </div>

      {/* Priority Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: 14, marginBottom: 28 }}>
        {Object.entries(priorityColors).map(([key, color]) => (
          <div key={key} style={{ ...CARD, borderTop: `3px solid ${color}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>{key}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{byPriority[key] || 0}</div>
          </div>
        ))}
      </div>

      {/* Pinned Directives */}
      {pinned.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 14 }}>Pinned Directives</div>
          <div style={{ display: 'grid', gap: 12 }}>
            {pinned.map(d => (
              <div key={d.id} style={{ ...CARD, borderLeft: `3px solid ${priorityColors[d.priority] || '#6B7280'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{d.title}</span>
                    <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.08em', padding: '2px 6px', borderRadius: 2, background: `${priorityColors[d.priority]}18`, color: priorityColors[d.priority], ...MONO }}>{d.priority?.toUpperCase()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button onClick={() => openDirective(d)} style={{ fontSize: 10, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', ...MONO }}>Edit</button>
                    <button onClick={() => deleteDirective(d.id)} style={{ fontSize: 10, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', ...MONO }}>Delete</button>
                  </div>
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
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>Directives ({directives.length})</div>
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
                  <button onClick={() => openDirective(d)} style={{ fontSize: 10, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', ...MONO }}>Edit</button>
                  <button onClick={() => deleteDirective(d.id)} style={{ fontSize: 10, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', ...MONO }}>Del</button>
                  <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.06em', padding: '2px 6px', borderRadius: 2, border: `1px solid ${statusColors[d.status] || '#6B7280'}`, color: statusColors[d.status] || '#6B7280', ...MONO }}>{d.status?.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cultural Guidelines */}
      <div style={CARD}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO }}>Cultural Guidelines ({guidelines.length})</div>
        </div>
        {guidelines.length === 0 ? (
          <div style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', padding: '20px 0' }}>No cultural guidelines defined yet</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: 12 }}>
            {guidelines.map(g => (
              <div key={g.id} style={{ padding: '14px 16px', border: BD, borderRadius: 4, background: g.pinned ? '#FEF2F2' : '#F9FAFB' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {g.pinned && <span style={{ fontSize: 8, fontWeight: 700, color: A, ...MONO }}>PINNED</span>}
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{g.title}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => openGuideline(g)} style={{ fontSize: 10, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', ...MONO }}>Edit</button>
                    <button onClick={() => deleteGuideline(g.id)} style={{ fontSize: 10, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', ...MONO }}>Del</button>
                  </div>
                </div>
                <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.06em', padding: '1px 6px', borderRadius: 2, background: '#E5E7EB', color: '#6B7280', ...MONO }}>{g.category?.toUpperCase()}</span>
                <p style={{ fontSize: 12, color: '#6B7280', margin: '8px 0 0', lineHeight: 1.5 }}>
                  {(g.content || '').slice(0, 200)}{(g.content || '').length > 200 ? '…' : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MODALS ─────────────────────────────────────────── */}
      {modal === 'directive' && (
        <div style={OVERLAY} onClick={() => setModal(null)}>
          <div style={MODAL} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 20px' }}>{editing ? 'Edit Directive' : 'New Directive'}</h2>
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Title</label>
                <input style={INPUT} value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Content (Markdown)</label>
                <textarea style={TEXTAREA} value={form.content || ''} onChange={e => setForm({ ...form, content: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Priority</label>
                  <select style={INPUT} value={form.priority || 'normal'} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Status</label>
                  <select style={INPUT} value={form.status || 'active'} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#374151', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.pinned || false} onChange={e => setForm({ ...form, pinned: e.target.checked })} />
                Pin this directive
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button onClick={() => setModal(null)} style={BTN('#F3F4F6', '#374151')}>Cancel</button>
              <button onClick={saveDirective} style={BTN(A, '#FFF')}>Save</button>
            </div>
          </div>
        </div>
      )}

      {modal === 'guideline' && (
        <div style={OVERLAY} onClick={() => setModal(null)}>
          <div style={MODAL} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 20px' }}>{editing ? 'Edit Guideline' : 'New Guideline'}</h2>
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Title</label>
                <input style={INPUT} value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Content (Markdown)</label>
                <textarea style={TEXTAREA} value={form.content || ''} onChange={e => setForm({ ...form, content: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Category</label>
                <select style={INPUT} value={form.category || 'core_value'} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="core_value">Core Value</option>
                  <option value="work_ethic">Work Ethic</option>
                  <option value="communication">Communication</option>
                  <option value="leadership">Leadership</option>
                  <option value="innovation">Innovation</option>
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#374151', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.pinned || false} onChange={e => setForm({ ...form, pinned: e.target.checked })} />
                Pin this guideline
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button onClick={() => setModal(null)} style={BTN('#F3F4F6', '#374151')}>Cancel</button>
              <button onClick={saveGuideline} style={BTN(A, '#FFF')}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisionNarrative;
