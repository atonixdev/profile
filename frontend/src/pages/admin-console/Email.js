import React, { useState, useEffect, useCallback, useRef } from 'react';

const A = '#D4AF37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#F9FAFB', border: BD, padding: '20px 24px' };

const DOMAINS = [
  { domain: 'atonix.io',       mx: 'Configured', spf: 'Pass', dkim: 'Pass',  dmarc: 'Pass',   status: 'Verified' },
  { domain: 'mail.atonix.io',  mx: 'Configured', spf: 'Pass', dkim: 'Pass',  dmarc: 'Pass',   status: 'Verified' },
  { domain: 'noreply.atonix.io', mx: 'Configured', spf: 'Pass', dkim: 'Pending', dmarc: 'Pass', status: 'Pending' },
];

const STATUS_COLOR = { sent: '#22C55E', failed: '#EF4444', skipped: '#F59E0B' };
const TYPE_LABELS = {
  account_created: 'Account Created', email_verification: 'Email Verification',
  new_login: 'New Login', login_failed: 'Login Failed',
  password_reset: 'Password Reset', password_changed: 'Password Changed',
  email_changed: 'Email Changed', role_changed: 'Role Changed',
  mfa_enabled: 'MFA Enabled', mfa_disabled: 'MFA Disabled',
  security_alert: 'Security Alert', incident_alert: 'Incident Alert',
  billing_alert: 'Billing Alert',
};

const CAT_COLOR = {
  system: '#3B82F6', security: '#EF4444', notification: '#F59E0B',
  marketing: '#22C55E', custom: '#8B5CF6',
};

const BLANK_TMPL = {
  template_id: '', name: '', category: 'system', permission: 'global',
  subject: '', html_body: '', text_body: '', variables: '', preview_text: '',
};

function getCsrf() {
  const m = document.cookie.match(/csrftoken=([^;]+)/);
  return m ? m[1] : '';
}

export default function Email() {
  const [tab, setTab] = useState('domains');
  const [saved, setSaved] = useState(false);

  // Email Logs state
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState(null);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsFilter, setLogsFilter] = useState('');

  // Template Library state
  const [templates, setTemplates] = useState([]);
  const [tmplLoading, setTmplLoading] = useState(false);
  const [tmplError, setTmplError]   = useState(null);
  const [tmplFilter, setTmplFilter] = useState('');
  const [showNewTmpl, setShowNewTmpl] = useState(false);
  const [newTmpl, setNewTmpl] = useState(BLANK_TMPL);
  const [savingTmpl, setSavingTmpl] = useState(false);
  const [saveTmplMsg, setSaveTmplMsg] = useState(null);
  const [editingTmpl, setEditingTmpl] = useState(null); // template_id string
  const [editForm, setEditForm] = useState({});

  // Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewTitle, setPreviewTitle] = useState('');
  const previewRef = useRef(null);

  const fetchLogs = useCallback(async (page = 1, filter = '') => {
    setLogsLoading(true);
    setLogsError(null);
    try {
      const params = new URLSearchParams({ page, page_size: 20 });
      if (filter) params.set('email_type', filter);
      const res = await fetch(`/api/admin/email-logs/?${params}`, { credentials: 'include', headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLogs(data.results || data);
      setLogsTotal(data.count || (data.results || data).length);
    } catch (err) {
      setLogsError(err.message);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  const fetchTemplates = useCallback(async (filter = '') => {
    setTmplLoading(true);
    setTmplError(null);
    try {
      const params = new URLSearchParams();
      if (filter) params.set('category', filter);
      const res = await fetch(`/api/admin/templates/?${params}`, { credentials: 'include', headers: { Accept: 'application/json' } });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) throw new Error(`Backend not reachable (got ${res.status} ${res.statusText || 'non-JSON'})`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTemplates(data.results || data);
    } catch (err) {
      setTmplError(err.message);
    } finally {
      setTmplLoading(false);
    }
  }, []);

  const handlePreview = useCallback(async (tmpl) => {
    setPreviewTitle(tmpl.name);
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewHtml('');
    try {
      // Build sample variables: fill each declared variable with a placeholder value
      const vars = {};
      (tmpl.variables || []).forEach((v) => { vars[v] = `[${v}]`; });
      const res = await fetch(`/api/admin/templates/${tmpl.template_id}/preview/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCsrf() },
        body: JSON.stringify({ variables: vars }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPreviewHtml(data.html || '<p style="color:#999">No HTML content.</p>');
    } catch (err) {
      setPreviewHtml(`<p style="color:#EF4444">Preview failed: ${err.message}</p>`);
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  const handleCreateTemplate = useCallback(async () => {
    setSavingTmpl(true);
    setSaveTmplMsg(null);
    const payload = {
      ...newTmpl,
      variables: newTmpl.variables
        ? newTmpl.variables.split(',').map((v) => v.trim()).filter(Boolean)
        : [],
    };
    try {
      const res = await fetch('/api/admin/templates/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCsrf() },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(err));
      }
      setSaveTmplMsg({ ok: true, text: 'Template created.' });
      setNewTmpl(BLANK_TMPL);
      setShowNewTmpl(false);
      fetchTemplates(tmplFilter);
    } catch (err) {
      setSaveTmplMsg({ ok: false, text: err.message });
    } finally {
      setSavingTmpl(false);
    }
  }, [newTmpl, tmplFilter, fetchTemplates]);

  const handleSaveEdit = useCallback(async (templateId) => {
    setSavingTmpl(true);
    setSaveTmplMsg(null);
    const payload = {
      ...editForm,
      variables: typeof editForm.variables === 'string'
        ? editForm.variables.split(',').map((v) => v.trim()).filter(Boolean)
        : editForm.variables,
    };
    try {
      const res = await fetch(`/api/admin/templates/${templateId}/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCsrf() },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(err));
      }
      setSaveTmplMsg({ ok: true, text: 'Saved.' });
      setEditingTmpl(null);
      fetchTemplates(tmplFilter);
    } catch (err) {
      setSaveTmplMsg({ ok: false, text: err.message });
    } finally {
      setSavingTmpl(false);
    }
  }, [editForm, tmplFilter, fetchTemplates]);

  const handleDeleteTemplate = useCallback(async (templateId) => {
    if (!window.confirm(`Delete template "${templateId}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/templates/${templateId}/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'X-CSRFToken': getCsrf() },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fetchTemplates(tmplFilter);
    } catch (err) {
      setSaveTmplMsg({ ok: false, text: err.message });
    }
  }, [tmplFilter, fetchTemplates]);

  useEffect(() => {
    if (tab === 'logs') fetchLogs(logsPage, logsFilter);
  }, [tab, logsPage, logsFilter, fetchLogs]);

  useEffect(() => {
    if (tab === 'templates') fetchTemplates(tmplFilter);
  }, [tab, tmplFilter, fetchTemplates]);

  // Close preview on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setPreviewOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div style={{ padding: '32px 36px', color: '#1F2937', minHeight: '100%' }}>

      {/* Preview Modal */}
      {previewOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setPreviewOpen(false); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div ref={previewRef} style={{ width: '820px', maxWidth: '96vw', maxHeight: '90vh', background: '#FFFFFF', border: BD, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
            <div style={{ padding: '14px 20px', borderBottom: BD, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: A, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
                PREVIEW — {previewTitle}
              </span>
              <button onClick={() => setPreviewOpen(false)} style={{ background: 'transparent', border: 'none', color: '#4B5563', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              {previewLoading ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#4B5563', fontSize: 13 }}>Rendering preview…</div>
              ) : (
                <iframe
                  srcDoc={previewHtml}
                  title="Email Preview"
                  style={{ width: '100%', height: '62vh', border: 'none', background: '#fff' }}
                  sandbox="allow-same-origin"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', color: A, textTransform: 'uppercase', marginBottom: 6 }}>
            EML — Email & Domain Configuration
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111827' }}>Email & Domain</h1>
          <p style={{ fontSize: 13, color: '#4B5563', margin: '6px 0 0' }}>
            Configure sending domains, DKIM/SPF/DMARC records, and transactional email templates.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            style={{
              padding: '9px 20px', background: A, border: 'none', color: '#06080D',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            + Add Domain
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="console-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Verified Domains',   value: '2'    },
          { label: 'Deliverability',     value: '98.7%' },
          { label: 'Email Templates',    value: templates.length || '—' },
          { label: 'Bounce Rate',        value: '0.4%' },
        ].map((s) => (
          <div key={s.label} style={CARD}>
            <div style={{ fontSize: 11, color: '#4B5563', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 16, borderBottom: BD }}>
        {[['domains', 'Sending Domains'], ['smtp', 'SMTP Settings'], ['templates', 'Template Library'], ['logs', 'Email Logs']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              padding: '9px 20px', fontSize: 12, fontWeight: tab === id ? 700 : 400,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: tab === id ? '#FFFFFF' : '#4B5563', fontFamily: 'inherit',
              borderBottom: tab === id ? `2px solid ${A}` : '2px solid transparent',
              marginBottom: -1, transition: 'color 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Domains */}
      {tab === 'domains' && (
        <div style={{ background: '#FFFFFF', border: BD }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Domain', 'MX', 'SPF', 'DKIM', 'DMARC', 'Status'].map((h) => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1F2937', borderBottom: BD, fontFamily: 'var(--font-mono)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DOMAINS.map((d) => (
                <tr key={d.domain} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F0F9FF')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 600, color: '#111827', fontFamily: 'var(--font-mono)' }}>{d.domain}</td>
                  {[d.mx, d.spf, d.dkim, d.dmarc].map((v, i) => (
                    <td key={i} style={{ padding: '12px 20px' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: v === 'Pass' || v === 'Configured' ? '#22C55E' : '#F59E0B', fontFamily: 'var(--font-mono)' }}>{v}</span>
                    </td>
                  ))}
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: d.status === 'Verified' ? '#22C55E' : A, fontFamily: 'var(--font-mono)' }}>{d.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SMTP */}
      {tab === 'smtp' && (
        <div style={{ background: '#FFFFFF', border: BD, padding: '28px 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {[
              { label: 'SMTP Host',    value: 'smtp.sendgrid.net' },
              { label: 'SMTP Port',    value: '587' },
              { label: 'From Name',    value: 'AtonixDev' },
              { label: 'From Address', value: 'noreply@atonix.io' },
              { label: 'Reply-To',     value: 'support@atonix.io' },
              { label: 'Encryption',   value: 'TLS' },
            ].map((f) => (
              <div key={f.label}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#4B5563', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>
                  {f.label}
                </label>
                <input
                  defaultValue={f.value}
                  style={{ width: '100%', padding: '9px 12px', background: '#FFFFFF', border: BD, color: '#111827', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            <button
              onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}
              style={{ padding: '9px 20px', background: A, border: 'none', color: '#06080D', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Save SMTP Config
            </button>
            {saved && <span style={{ fontSize: 11, color: '#22C55E', alignSelf: 'center', fontFamily: 'var(--font-mono)' }}>✓ Saved</span>}
          </div>
        </div>
      )}

      {/* Template Library */}
      {tab === 'templates' && (
        <div>
          {/* Toolbar */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={tmplFilter}
              onChange={(e) => setTmplFilter(e.target.value)}
              style={{ padding: '7px 12px', background: '#FFFFFF', border: BD, color: '#D1D5DB', fontSize: 12, fontFamily: 'var(--font-mono)', outline: 'none', cursor: 'pointer' }}
            >
              <option value=''>All Categories</option>
              {['system','security','notification','marketing','custom'].map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>
              ))}
            </select>
            <button
              onClick={() => fetchTemplates(tmplFilter)}
              style={{ padding: '7px 14px', background: 'transparent', border: BD, color: A, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
            >
              Refresh
            </button>
            <button
              onClick={() => { setShowNewTmpl((v) => !v); setSaveTmplMsg(null); }}
              style={{ padding: '7px 16px', background: showNewTmpl ? 'rgba(212,175,55,0.15)' : A, border: `1px solid ${A}`, color: showNewTmpl ? A : '#06080D', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
            >
              {showNewTmpl ? '✕ Cancel' : '+ New Template'}
            </button>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#1F2937', fontFamily: 'var(--font-mono)' }}>
              {templates.length} template{templates.length !== 1 ? 's' : ''}
            </span>
          </div>

          {saveTmplMsg && (
            <div style={{ padding: '10px 16px', background: saveTmplMsg.ok ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${saveTmplMsg.ok ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`, color: saveTmplMsg.ok ? '#22C55E' : '#EF4444', fontSize: 12, marginBottom: 16, fontFamily: 'var(--font-mono)' }}>
              {saveTmplMsg.text}
            </div>
          )}

          {/* New Template Form */}
          {showNewTmpl && (
            <div style={{ ...CARD, marginBottom: 20, border: `1px solid rgba(212,175,55,0.3)` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: A, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16, fontFamily: 'var(--font-mono)' }}>New Template</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { key: 'template_id', label: 'Template ID (slug)', placeholder: 'e.g. MKT-PROMO-02' },
                  { key: 'name',        label: 'Display Name',       placeholder: 'e.g. Promo Email' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 5, fontFamily: 'var(--font-mono)' }}>{label}</label>
                    <input
                      value={newTmpl[key]}
                      onChange={(e) => setNewTmpl((p) => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder}
                      style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', border: BD, color: '#111827', fontSize: 12, outline: 'none', fontFamily: 'var(--font-mono)', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 5, fontFamily: 'var(--font-mono)' }}>Category</label>
                  <select value={newTmpl.category} onChange={(e) => setNewTmpl((p) => ({ ...p, category: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', border: BD, color: '#111827', fontSize: 12, outline: 'none', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
                    {['system','security','notification','marketing','custom'].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 5, fontFamily: 'var(--font-mono)' }}>Permission</label>
                  <select value={newTmpl.permission} onChange={(e) => setNewTmpl((p) => ({ ...p, permission: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', border: BD, color: '#111827', fontSize: 12, outline: 'none', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
                    {['global','personal','marketing'].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 5, fontFamily: 'var(--font-mono)' }}>Subject Line</label>
                  <input
                    value={newTmpl.subject}
                    onChange={(e) => setNewTmpl((p) => ({ ...p, subject: e.target.value }))}
                    placeholder="e.g. Hello {{name}}, here's your update"
                    style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', border: BD, color: '#111827', fontSize: 12, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 5, fontFamily: 'var(--font-mono)' }}>Variables (comma-separated)</label>
                  <input
                    value={newTmpl.variables}
                    onChange={(e) => setNewTmpl((p) => ({ ...p, variables: e.target.value }))}
                    placeholder="name, cta_url, unsubscribe_url"
                    style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', border: BD, color: '#111827', fontSize: 12, outline: 'none', fontFamily: 'var(--font-mono)', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 5, fontFamily: 'var(--font-mono)' }}>Preview Text</label>
                  <input
                    value={newTmpl.preview_text}
                    onChange={(e) => setNewTmpl((p) => ({ ...p, preview_text: e.target.value }))}
                    placeholder="Short preview shown in inbox list"
                    style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', border: BD, color: '#111827', fontSize: 12, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 5, fontFamily: 'var(--font-mono)' }}>HTML Body</label>
                  <textarea
                    value={newTmpl.html_body}
                    onChange={(e) => setNewTmpl((p) => ({ ...p, html_body: e.target.value }))}
                    rows={10}
                    placeholder="Full HTML email body. Use {{variable}} for substitutions."
                    style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', border: BD, color: '#111827', fontSize: 11, outline: 'none', fontFamily: 'var(--font-mono)', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 5, fontFamily: 'var(--font-mono)' }}>Plain Text Body (optional)</label>
                  <textarea
                    value={newTmpl.text_body}
                    onChange={(e) => setNewTmpl((p) => ({ ...p, text_body: e.target.value }))}
                    rows={4}
                    placeholder="Fallback plain text version."
                    style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', border: BD, color: '#111827', fontSize: 11, outline: 'none', fontFamily: 'var(--font-mono)', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }}
                  />
                </div>
              </div>
              <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                <button
                  onClick={handleCreateTemplate}
                  disabled={savingTmpl || !newTmpl.template_id || !newTmpl.name}
                  style={{ padding: '9px 22px', background: A, border: 'none', color: '#06080D', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: savingTmpl ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: savingTmpl ? 0.7 : 1 }}
                >
                  {savingTmpl ? 'Saving…' : 'Create Template'}
                </button>
              </div>
            </div>
          )}

          {/* Template List */}
          {tmplError && (
            <div style={{ padding: '14px 20px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: 13, marginBottom: 16 }}>
              Failed to load templates: {tmplError}
            </div>
          )}

          {tmplLoading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#4B5563', fontSize: 13 }}>Loading templates…</div>
          ) : templates.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#1F2937', fontSize: 13, border: BD }}>
              No templates found. Create one with the button above.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {templates.map((t) => (
                <div key={t.template_id} style={{ ...CARD, border: editingTmpl === t.template_id ? `1px solid rgba(212,175,55,0.4)` : BD }}>
                  {editingTmpl === t.template_id ? (
                    /* Inline Edit Form */
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                        <div>
                          <label style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Name</label>
                          <input value={editForm.name || ''} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                            style={{ width: '100%', padding: '7px 10px', background: '#FFFFFF', border: BD, color: '#111827', fontSize: 12, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Subject</label>
                          <input value={editForm.subject || ''} onChange={(e) => setEditForm((p) => ({ ...p, subject: e.target.value }))}
                            style={{ width: '100%', padding: '7px 10px', background: '#FFFFFF', border: BD, color: '#111827', fontSize: 12, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Variables (comma-separated)</label>
                          <input
                            value={typeof editForm.variables === 'string' ? editForm.variables : (editForm.variables || []).join(', ')}
                            onChange={(e) => setEditForm((p) => ({ ...p, variables: e.target.value }))}
                            style={{ width: '100%', padding: '7px 10px', background: '#FFFFFF', border: BD, color: '#111827', fontSize: 12, outline: 'none', fontFamily: 'var(--font-mono)', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Preview Text</label>
                          <input value={editForm.preview_text || ''} onChange={(e) => setEditForm((p) => ({ ...p, preview_text: e.target.value }))}
                            style={{ width: '100%', padding: '7px 10px', background: '#FFFFFF', border: BD, color: '#111827', fontSize: 12, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ gridColumn: '1/-1' }}>
                          <label style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>HTML Body</label>
                          <textarea value={editForm.html_body || ''} onChange={(e) => setEditForm((p) => ({ ...p, html_body: e.target.value }))} rows={10}
                            style={{ width: '100%', padding: '7px 10px', background: '#FFFFFF', border: BD, color: '#111827', fontSize: 11, outline: 'none', fontFamily: 'var(--font-mono)', resize: 'vertical', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleSaveEdit(t.template_id)} disabled={savingTmpl}
                          style={{ padding: '7px 18px', background: A, border: 'none', color: '#06080D', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>
                          {savingTmpl ? 'Saving…' : 'Save'}
                        </button>
                        <button onClick={() => setEditingTmpl(null)}
                          style={{ padding: '7px 14px', background: 'transparent', border: BD, color: '#4B5563', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Read-only row */
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{t.name}</span>
                          <span style={{ fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', padding: '2px 7px', background: `${CAT_COLOR[t.category] || '#4B5563'}22`, color: CAT_COLOR[t.category] || '#4B5563', textTransform: 'uppercase' }}>
                            {t.category}
                          </span>
                          <span style={{ fontSize: 9, color: '#1F2937', fontFamily: 'var(--font-mono)' }}>v{t.version || 1}</span>
                        </div>
                        <div style={{ fontSize: 10, color: A, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: 4 }}>{t.template_id}</div>
                        <div style={{ fontSize: 12, color: '#4B5563', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 540 }}>{t.subject}</div>
                        {t.variables && t.variables.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {t.variables.map((v) => (
                              <span key={v} style={{ fontSize: 9, padding: '2px 6px', background: '#F1F5F9', color: '#4B5563', fontFamily: 'var(--font-mono)' }}>{'{{'+v+'}}'}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
                        <button
                          onClick={() => handlePreview(t)}
                          style={{ fontSize: 10, padding: '5px 12px', cursor: 'pointer', background: 'transparent', border: BD, color: A, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.06em' }}
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => { setEditingTmpl(t.template_id); setEditForm({ ...t, variables: (t.variables || []).join(', ') }); setSaveTmplMsg(null); }}
                          style={{ fontSize: 10, padding: '5px 12px', cursor: 'pointer', background: 'transparent', border: BD, color: '#4B5563', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.06em' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(t.template_id)}
                          style={{ fontSize: 10, padding: '5px 12px', cursor: 'pointer', background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.06em' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Email Logs */}
      {tab === 'logs' && (
        <div>
          {/* Toolbar */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
            <select
              value={logsFilter}
              onChange={(e) => { setLogsFilter(e.target.value); setLogsPage(1); }}
              style={{ padding: '7px 12px', background: '#FFFFFF', border: BD, color: '#D1D5DB', fontSize: 12, fontFamily: 'var(--font-mono)', outline: 'none', cursor: 'pointer' }}
            >
              <option value=''>All Types</option>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <button
              onClick={() => fetchLogs(logsPage, logsFilter)}
              style={{ padding: '7px 16px', background: 'transparent', border: BD, color: A, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
            >
              Refresh
            </button>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#1F2937', fontFamily: 'var(--font-mono)' }}>
              {logsTotal} total
            </span>
          </div>

          {logsError && (
            <div style={{ padding: '14px 20px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: 13, marginBottom: 16 }}>
              Failed to load email logs: {logsError}
            </div>
          )}

          <div style={{ background: '#FFFFFF', border: BD }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Time', 'Type', 'Recipient', 'Subject', 'Status', 'IP'].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1F2937', borderBottom: BD, fontFamily: 'var(--font-mono)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logsLoading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#4B5563', fontSize: 13 }}>Loading…</td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#1F2937', fontSize: 13 }}>No email logs found.</td>
                  </tr>
                ) : (
                  logs.map((log, i) => (
                    <tr
                      key={log.id || i}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F0F9FF')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '10px 16px', fontSize: 11, color: '#4B5563', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                        {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: A, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
                          {TYPE_LABELS[log.email_type] || log.email_type || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 16px', fontSize: 12, color: '#1F2937', fontFamily: 'var(--font-mono)' }}>
                        {log.recipient || '—'}
                      </td>
                      <td style={{ padding: '10px 16px', fontSize: 12, color: '#4B5563', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.subject || '—'}
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: STATUS_COLOR[log.status] || '#4B5563', fontFamily: 'var(--font-mono)' }}>
                          {(log.status || 'unknown').toUpperCase()}
                        </span>
                        {log.error_message && (
                          <div style={{ fontSize: 10, color: '#EF4444', marginTop: 2, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.error_message}>
                            {log.error_message}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '10px 16px', fontSize: 11, color: '#4B5563', fontFamily: 'var(--font-mono)' }}>
                        {log.ip_address || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {logsTotal > 20 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setLogsPage((p) => Math.max(1, p - 1))}
                disabled={logsPage === 1}
                style={{ padding: '6px 14px', background: 'transparent', border: BD, color: logsPage === 1 ? '#1F2937' : A, fontSize: 11, fontWeight: 700, cursor: logsPage === 1 ? 'default' : 'pointer', fontFamily: 'var(--font-mono)' }}
              >
                ← Prev
              </button>
              <span style={{ padding: '6px 12px', fontSize: 11, color: '#4B5563', fontFamily: 'var(--font-mono)' }}>
                Page {logsPage} / {Math.ceil(logsTotal / 20)}
              </span>
              <button
                onClick={() => setLogsPage((p) => p + 1)}
                disabled={logsPage >= Math.ceil(logsTotal / 20)}
                style={{ padding: '6px 14px', background: 'transparent', border: BD, color: logsPage >= Math.ceil(logsTotal / 20) ? '#1F2937' : A, fontSize: 11, fontWeight: 700, cursor: logsPage >= Math.ceil(logsTotal / 20) ? 'default' : 'pointer', fontFamily: 'var(--font-mono)' }}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
