import React, { useState, useEffect, useCallback } from 'react';

const A = '#D4AF37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#F9FAFB', border: BD, padding: '20px 24px' };

function getCsrf() { const m = document.cookie.match(/csrftoken=([^;]+)/); return m ? m[1] : ''; }

const BLANK = { from_name: '', from_email: '', reply_to: '', is_default: false, description: '' };

export default function EmailSenders() {
  const [senders, setSenders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  const fetchSenders = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/admin/senders/', { credentials: 'include', headers: { Accept: 'application/json' } });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) throw new Error(`Backend not reachable (${res.status})`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSenders(data.results || data);
    } catch (err) { setError(err.message); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSenders(); }, [fetchSenders]);

  const handleCreate = async () => {
    setSaving(true); setSaveMsg(null);
    try {
      const res = await fetch('/api/admin/senders/', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCsrf() },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(JSON.stringify(e)); }
      setSaveMsg({ ok: true, text: 'Sender created.' }); setForm(BLANK); setShowNew(false);
      fetchSenders();
    } catch (e) { setSaveMsg({ ok: false, text: e.message }); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this sender identity permanently?')) return;
    try { await fetch(`/api/admin/senders/${id}/`, { method: 'DELETE', credentials: 'include', headers: { 'X-CSRFToken': getCsrf() } }); fetchSenders(); } catch (_) {}
  };

  const handleSetDefault = async (id) => {
    try {
      await fetch(`/api/admin/senders/${id}/`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCsrf() }, body: JSON.stringify({ is_default: true }) });
      fetchSenders();
    } catch (_) {}
  };

  const inp = { width: '100%', padding: '8px 10px', background: '#FFF', border: BD, color: '#111827', fontSize: 12, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px) clamp(16px, 4vw, 36px)', color: '#1F2937', minHeight: '100%' }}>

      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', color: A, textTransform: 'uppercase', marginBottom: 6 }}>SND — Sender Identities</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111827' }}>Sender Identities</h1>
          <p style={{ fontSize: 13, color: '#4B5563', margin: '6px 0 0' }}>Manage from-address identities used for sending emails and campaigns.</p>
        </div>
        <button onClick={() => { setShowNew((v) => !v); setSaveMsg(null); }} style={{ padding: '9px 20px', background: showNew ? 'transparent' : A, border: `1px solid ${A}`, color: showNew ? A : '#06080D', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>
          {showNew ? '✕ Cancel' : '+ New Sender'}
        </button>
      </div>

      {saveMsg && <div style={{ padding: '10px 16px', background: saveMsg.ok ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${saveMsg.ok ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`, color: saveMsg.ok ? '#22C55E' : '#EF4444', fontSize: 12, marginBottom: 16, fontFamily: 'var(--font-mono)' }}>{saveMsg.text}</div>}

      {showNew && (
        <div style={{ ...CARD, marginBottom: 20, border: '1px solid rgba(212,175,55,0.3)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: A, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16, fontFamily: 'var(--font-mono)' }}>New Sender Identity</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 14 }}>
            {[{ k: 'from_name', l: 'From Name', ph: 'AtonixDev Notifications' }, { k: 'from_email', l: 'From Email', ph: 'noreply@atonixdev.com' }, { k: 'reply_to', l: 'Reply-To (optional)', ph: 'support@atonixdev.com' }, { k: 'description', l: 'Description (optional)', ph: 'Transactional emails' }].map(({ k, l, ph }) => (
              <div key={k}>
                <label style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 5, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{l}</label>
                <input value={form[k]} onChange={(e) => setForm((p) => ({ ...p, [k]: e.target.value }))} placeholder={ph} style={inp} />
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="is_default" checked={form.is_default} onChange={(e) => setForm((p) => ({ ...p, is_default: e.target.checked }))} style={{ width: 15, height: 15, accentColor: A, cursor: 'pointer' }} />
              <label htmlFor="is_default" style={{ fontSize: 12, color: '#1F2937', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>Set as default sender</label>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <button onClick={handleCreate} disabled={saving || !form.from_name || !form.from_email} style={{ padding: '9px 22px', background: A, border: 'none', color: '#06080D', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Creating…' : 'Add Sender'}
            </button>
          </div>
        </div>
      )}

      {error && <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: 12, marginBottom: 16 }}>Failed to load: {error}</div>}

      {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#4B5563', fontSize: 13 }}>Loading…</div>
       : senders.length === 0 ? (
         <div style={{ ...CARD, textAlign: 'center', padding: '48px 20px' }}>
           <div style={{ fontSize: 28, marginBottom: 12 }}>📬</div>
           <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2937', marginBottom: 6 }}>No sender identities yet</div>
           <div style={{ fontSize: 12, color: '#4B5563' }}>Add a sender identity to use as the from-address for campaigns and automated emails.</div>
         </div>
       ) : (
         <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
           {senders.map((s) => (
             <div key={s.id} style={{ ...CARD, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
               <div style={{ flex: 1, minWidth: 0 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3, flexWrap: 'wrap' }}>
                   <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{s.from_name || s.display_name}</span>
                   {(s.is_default) && <span style={{ fontSize: 9, padding: '2px 7px', background: `${A}20`, color: A, fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Default</span>}
                 </div>
                 <div style={{ fontSize: 12, color: '#1F2937', fontFamily: 'var(--font-mono)' }}>{s.from_email || s.email}</div>
                 {s.reply_to && <div style={{ fontSize: 11, color: '#4B5563', marginTop: 3, fontFamily: 'var(--font-mono)' }}>reply-to: {s.reply_to}</div>}
                 {s.description && <div style={{ fontSize: 11, color: '#4B5563', marginTop: 3 }}>{s.description}</div>}
               </div>
               <div style={{ display: 'flex', gap: 6 }}>
                 {!s.is_default && (
                   <button onClick={() => handleSetDefault(s.id)} style={{ fontSize: 10, padding: '5px 12px', cursor: 'pointer', background: 'transparent', border: `1px solid ${A}`, color: A, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>Set Default</button>
                 )}
                 <button onClick={() => handleDelete(s.id)} style={{ fontSize: 10, padding: '5px 12px', cursor: 'pointer', background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>Remove</button>
               </div>
             </div>
           ))}
         </div>
       )}

      {/* DNS Note */}
      <div style={{ marginTop: 28, ...CARD, border: '1px solid rgba(212,175,55,0.2)', background: 'rgba(212,175,55,0.04)' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: A, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>SPF / DKIM Verification</div>
        <div style={{ fontSize: 12, color: '#4B5563', lineHeight: 1.7 }}>
          To prevent emails landing in spam, ensure your sending domain has valid SPF, DKIM, and DMARC records.
          Go to <a href="/email-console/domains" style={{ color: A, textDecoration: 'none', fontWeight: 600 }}>Domains</a> to view required DNS records and verification status for each domain.
        </div>
      </div>
    </div>
  );
}
