import React, { useState, useEffect, useCallback, useRef } from 'react';

const A = '#D4AF37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#F9FAFB', border: BD, padding: '20px 24px' };

const CAT_COLOR = { system: '#3B82F6', security: '#EF4444', notification: '#F59E0B', marketing: '#22C55E', custom: '#8B5CF6' };
const BLANK = { template_id: '', name: '', category: 'system', permission: 'global', subject: '', html_body: '', text_body: '', variables: '', preview_text: '' };

function getCsrf() { const m = document.cookie.match(/csrftoken=([^;]+)/); return m ? m[1] : ''; }

export default function EmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newTmpl, setNewTmpl] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewTitle, setPreviewTitle] = useState('');
  const previewRef = useRef(null);

  const fetchTemplates = useCallback(async (cat = '') => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      if (cat) params.set('category', cat);
      const res = await fetch(`/api/admin/templates/?${params}`, { credentials: 'include', headers: { Accept: 'application/json' } });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) throw new Error(`Backend not reachable (${res.status})`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTemplates(data.results || data);
    } catch (err) { setError(err.message); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTemplates(filter); }, [filter, fetchTemplates]);
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') setPreviewOpen(false); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const handleCreate = useCallback(async () => {
    setSaving(true); setSaveMsg(null);
    const payload = { ...newTmpl, variables: newTmpl.variables ? newTmpl.variables.split(',').map((v) => v.trim()).filter(Boolean) : [] };
    try {
      const res = await fetch('/api/admin/templates/', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCsrf() }, body: JSON.stringify(payload) });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(JSON.stringify(e)); }
      setSaveMsg({ ok: true, text: 'Template created.' });
      setNewTmpl(BLANK); setShowNew(false);
      fetchTemplates(filter);
    } catch (e) { setSaveMsg({ ok: false, text: e.message }); }
    setSaving(false);
  }, [newTmpl, filter, fetchTemplates]);

  const handleSaveEdit = useCallback(async (id) => {
    setSaving(true); setSaveMsg(null);
    const payload = { ...editForm, variables: typeof editForm.variables === 'string' ? editForm.variables.split(',').map((v) => v.trim()).filter(Boolean) : editForm.variables };
    try {
      const res = await fetch(`/api/admin/templates/${id}/`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCsrf() }, body: JSON.stringify(payload) });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(JSON.stringify(e)); }
      setSaveMsg({ ok: true, text: 'Saved.' }); setEditing(null);
      fetchTemplates(filter);
    } catch (e) { setSaveMsg({ ok: false, text: e.message }); }
    setSaving(false);
  }, [editForm, filter, fetchTemplates]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm(`Delete template "${id}"? This cannot be undone.`)) return;
    try {
      await fetch(`/api/admin/templates/${id}/`, { method: 'DELETE', credentials: 'include', headers: { 'X-CSRFToken': getCsrf() } });
      fetchTemplates(filter);
    } catch (_) {}
  }, [filter, fetchTemplates]);

  const handlePreview = useCallback(async (tmpl) => {
    setPreviewTitle(tmpl.name); setPreviewOpen(true); setPreviewLoading(true); setPreviewHtml('');
    try {
      const vars = {}; (tmpl.variables || []).forEach((v) => { vars[v] = `[${v}]`; });
      const res = await fetch(`/api/admin/templates/${tmpl.template_id}/preview/`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCsrf() }, body: JSON.stringify({ variables: vars }) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPreviewHtml(data.html || '<p style="color:#999">No HTML content.</p>');
    } catch (err) { setPreviewHtml(`<p style="color:#EF4444">Preview failed: ${err.message}</p>`); }
    setPreviewLoading(false);
  }, []);

  const input = { width: '100%', padding: '8px 10px', background: '#FFFFFF', border: BD, color: '#111827', fontSize: 12, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };

  return (
    <div style={{ padding: '32px 36px', color: '#1F2937', minHeight: '100%' }}>

      {/* Preview Modal */}
      {previewOpen && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setPreviewOpen(false); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div ref={previewRef} style={{ width: 820, maxWidth: '96vw', maxHeight: '90vh', background: '#FFF', border: BD, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
            <div style={{ padding: '14px 20px', borderBottom: BD, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: A, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>PREVIEW — {previewTitle}</span>
              <button onClick={() => setPreviewOpen(false)} style={{ background: 'transparent', border: 'none', color: '#4B5563', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              {previewLoading ? <div style={{ padding: 40, textAlign: 'center', color: '#4B5563', fontSize: 13 }}>Rendering…</div>
                : <iframe srcDoc={previewHtml} title="Email Preview" style={{ width: '100%', height: '62vh', border: 'none', background: '#fff' }} sandbox="allow-same-origin" />}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', color: A, textTransform: 'uppercase', marginBottom: 6 }}>TPL — Template Library</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111827' }}>Email Templates</h1>
          <p style={{ fontSize: 13, color: '#4B5563', margin: '6px 0 0' }}>Manage transactional and marketing email templates.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '9px 12px', background: '#FFF', border: BD, color: '#1F2937', fontSize: 12, fontFamily: 'var(--font-mono)', outline: 'none', cursor: 'pointer' }}>
            <option value=''>All Categories</option>
            {['system','security','notification','marketing','custom'].map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
          </select>
          <button onClick={() => { setShowNew((v) => !v); setSaveMsg(null); }} style={{ padding: '9px 20px', background: showNew ? 'transparent' : A, border: `1px solid ${A}`, color: showNew ? A : '#06080D', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>
            {showNew ? '✕ Cancel' : '+ New Template'}
          </button>
        </div>
      </div>

      {saveMsg && <div style={{ padding: '10px 16px', background: saveMsg.ok ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${saveMsg.ok ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`, color: saveMsg.ok ? '#22C55E' : '#EF4444', fontSize: 12, marginBottom: 16, fontFamily: 'var(--font-mono)' }}>{saveMsg.text}</div>}

      {/* New Template form */}
      {showNew && (
        <div style={{ ...CARD, marginBottom: 20, border: `1px solid rgba(212,175,55,0.3)` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: A, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16, fontFamily: 'var(--font-mono)' }}>New Template</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[{ key: 'template_id', label: 'Template ID', ph: 'e.g. MKT-PROMO-02' }, { key: 'name', label: 'Display Name', ph: 'e.g. Promo Email' }].map(({ key, label, ph }) => (
              <div key={key}>
                <label style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 5, fontFamily: 'var(--font-mono)' }}>{label}</label>
                <input value={newTmpl[key]} onChange={(e) => setNewTmpl((p) => ({ ...p, [key]: e.target.value }))} placeholder={ph} style={input} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 5, fontFamily: 'var(--font-mono)' }}>Category</label>
              <select value={newTmpl.category} onChange={(e) => setNewTmpl((p) => ({ ...p, category: e.target.value }))} style={{ ...input, cursor: 'pointer' }}>
                {['system','security','notification','marketing','custom'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 5, fontFamily: 'var(--font-mono)' }}>Variables (comma-separated)</label>
              <input value={newTmpl.variables} onChange={(e) => setNewTmpl((p) => ({ ...p, variables: e.target.value }))} placeholder="name, cta_url" style={input} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 5, fontFamily: 'var(--font-mono)' }}>Subject Line</label>
              <input value={newTmpl.subject} onChange={(e) => setNewTmpl((p) => ({ ...p, subject: e.target.value }))} placeholder="Hello {{name}}, here's your update" style={input} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 5, fontFamily: 'var(--font-mono)' }}>HTML Body</label>
              <textarea value={newTmpl.html_body} onChange={(e) => setNewTmpl((p) => ({ ...p, html_body: e.target.value }))} rows={10} placeholder="Full HTML body. Use {{variable}} for substitutions." style={{ ...input, resize: 'vertical', lineHeight: 1.6, fontFamily: 'var(--font-mono)', fontSize: 11 }} />
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            <button onClick={handleCreate} disabled={saving || !newTmpl.template_id || !newTmpl.name} style={{ padding: '9px 22px', background: A, border: 'none', color: '#06080D', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : 'Create Template'}
            </button>
          </div>
        </div>
      )}

      {error && <div style={{ padding: '14px 20px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: 13, marginBottom: 16 }}>Failed to load: {error}</div>}

      {/* Template List */}
      {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#4B5563', fontSize: 13 }}>Loading templates…</div>
       : templates.length === 0 ? <div style={{ padding: '40px 20px', textAlign: 'center', color: '#1F2937', fontSize: 13, border: BD }}>No templates found. Create one above.</div>
       : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {templates.map((t) => (
            <div key={t.template_id} style={{ ...CARD, border: editing === t.template_id ? `1px solid rgba(212,175,55,0.4)` : BD }}>
              {editing === t.template_id ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    {[{ k: 'name', l: 'Name' }, { k: 'subject', l: 'Subject' }, { k: 'preview_text', l: 'Preview Text' }].map(({ k, l }) => (
                      <div key={k}>
                        <label style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{l}</label>
                        <input value={editForm[k] || ''} onChange={(e) => setEditForm((p) => ({ ...p, [k]: e.target.value }))} style={input} />
                      </div>
                    ))}
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Variables</label>
                      <input value={typeof editForm.variables === 'string' ? editForm.variables : (editForm.variables || []).join(', ')} onChange={(e) => setEditForm((p) => ({ ...p, variables: e.target.value }))} style={{ ...input, fontFamily: 'var(--font-mono)' }} />
                    </div>
                    <div style={{ gridColumn: '1/-1' }}>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>HTML Body</label>
                      <textarea value={editForm.html_body || ''} onChange={(e) => setEditForm((p) => ({ ...p, html_body: e.target.value }))} rows={10} style={{ ...input, resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: 11 }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleSaveEdit(t.template_id)} disabled={saving} style={{ padding: '7px 18px', background: A, border: 'none', color: '#06080D', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>{saving ? 'Saving…' : 'Save'}</button>
                    <button onClick={() => setEditing(null)} style={{ padding: '7px 14px', background: 'transparent', border: BD, color: '#4B5563', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{t.name}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', padding: '2px 7px', background: `${CAT_COLOR[t.category] || '#4B5563'}22`, color: CAT_COLOR[t.category] || '#4B5563', textTransform: 'uppercase' }}>{t.category}</span>
                    </div>
                    <div style={{ fontSize: 10, color: A, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: 4 }}>{t.template_id}</div>
                    <div style={{ fontSize: 12, color: '#4B5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 540 }}>{t.subject}</div>
                    {t.variables?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                        {t.variables.map((v) => <span key={v} style={{ fontSize: 9, padding: '2px 6px', background: '#F1F5F9', color: '#4B5563', fontFamily: 'var(--font-mono)' }}>{`{{${v}}}`}</span>)}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
                    <button onClick={() => handlePreview(t)} style={{ fontSize: 10, padding: '5px 12px', cursor: 'pointer', background: 'transparent', border: BD, color: A, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>Preview</button>
                    <button onClick={() => { setEditing(t.template_id); setEditForm({ ...t, variables: (t.variables || []).join(', ') }); setSaveMsg(null); }} style={{ fontSize: 10, padding: '5px 12px', cursor: 'pointer', background: 'transparent', border: BD, color: '#4B5563', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>Edit</button>
                    <button onClick={() => handleDelete(t.template_id)} style={{ fontSize: 10, padding: '5px 12px', cursor: 'pointer', background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
