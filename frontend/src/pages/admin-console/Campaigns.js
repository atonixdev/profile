import React, { useState, useEffect, useCallback } from 'react';

const A = '#D4AF37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#F9FAFB', border: BD, padding: '20px 24px' };

const STATUS_CONFIG = {
  draft:      { color: '#4B5563', label: 'Draft'     },
  scheduled:  { color: '#3B82F6', label: 'Scheduled' },
  sending:    { color: A,         label: 'Sending'   },
  sent:       { color: '#22C55E', label: 'Sent'      },
  paused:     { color: '#F59E0B', label: 'Paused'    },
  cancelled:  { color: '#EF4444', label: 'Cancelled' },
  failed:     { color: '#DC2626', label: 'Failed'    },
};

const LOG_STATUS_COLOR = {
  queued: '#4B5563', sent: '#3B82F6', delivered: '#22C55E',
  opened: A, clicked: '#8B5CF6', bounced: '#F59E0B',
  failed: '#EF4444', unsubscribed: '#4B5563',
};

const BLANK_CAMPAIGN = {
  name: '', template: '', sender_identity: '', subject: '', recipients: '', scheduled_at: '',
};

function getCsrf() {
  const m = document.cookie.match(/csrftoken=([^;]+)/);
  return m ? m[1] : '';
}

function fmtPct(n) {
  return typeof n === 'number' ? `${n.toFixed(1)}%` : '—';
}

export default function Campaigns() {
  const [campaigns, setCampaigns]     = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  // Metadata for dropdowns
  const [templates, setTemplates]         = useState([]);
  const [senders, setSenders]             = useState([]);

  // New campaign form
  const [showNew, setShowNew]   = useState(false);
  const [newCampaign, setNewCampaign] = useState(BLANK_CAMPAIGN);
  const [saving, setSaving]     = useState(false);
  const [saveMsg, setSaveMsg]   = useState(null);

  // Campaign logs drawer
  const [logsOpen, setLogsOpen]       = useState(false);
  const [logsCampaign, setLogsCampaign] = useState(null);
  const [logs, setLogs]               = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Sending state
  const [sendingId, setSendingId]   = useState(null);
  const [sendResult, setSendResult] = useState({}); // { [campaignId]: { sent, failed, total } }

  const fetchCampaigns = useCallback(async (filter = '') => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filter) params.set('status', filter);
      const res = await fetch(`/api/admin/campaigns/?${params}`, { credentials: 'include', headers: { Accept: 'application/json' } });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) throw new Error(`Backend not reachable (got ${res.status} ${res.statusText || 'non-JSON'})`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCampaigns(data.results || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMeta = useCallback(async () => {
    try {
      const JSON_HEADERS = { Accept: 'application/json' };
      const [tRes, sRes] = await Promise.all([
        fetch('/api/admin/templates/?page_size=200', { credentials: 'include', headers: JSON_HEADERS }),
        fetch('/api/admin/senders/', { credentials: 'include', headers: JSON_HEADERS }),
      ]);
      if (tRes.ok) {
        const d = await tRes.json();
        setTemplates(d.results || d);
      }
      if (sRes.ok) {
        const d = await sRes.json();
        setSenders(d.results || d);
      }
    } catch (_) {}
  }, []);

  const fetchLogs = useCallback(async (campaignId) => {
    setLogsLoading(true);
    setLogs([]);
    try {
      const res = await fetch(`/api/admin/campaigns/${campaignId}/logs/`, { credentials: 'include', headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLogs(data.results || data);
    } catch (_) {
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns(statusFilter);
    fetchMeta();
  }, [statusFilter, fetchCampaigns, fetchMeta]);

  const handleCreate = useCallback(async () => {
    setSaving(true);
    setSaveMsg(null);
    const payload = {
      name: newCampaign.name,
      template: newCampaign.template,
      sender_identity: newCampaign.sender_identity || undefined,
      subject: newCampaign.subject,
      recipients: newCampaign.recipients
        ? newCampaign.recipients.split(',').map((r) => r.trim()).filter(Boolean)
        : [],
      scheduled_at: newCampaign.scheduled_at || undefined,
    };
    try {
      const res = await fetch('/api/admin/campaigns/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCsrf() },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(err));
      }
      setSaveMsg({ ok: true, text: 'Campaign created.' });
      setNewCampaign(BLANK_CAMPAIGN);
      setShowNew(false);
      fetchCampaigns(statusFilter);
    } catch (err) {
      setSaveMsg({ ok: false, text: err.message });
    } finally {
      setSaving(false);
    }
  }, [newCampaign, statusFilter, fetchCampaigns]);

  const handleSend = useCallback(async (campaignId) => {
    if (!window.confirm('Send this campaign now? This will dispatch emails to all recipients.')) return;
    setSendingId(campaignId);
    setSendResult((p) => ({ ...p, [campaignId]: null }));
    try {
      const res = await fetch(`/api/admin/campaigns/${campaignId}/send/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRFToken': getCsrf() },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setSendResult((p) => ({ ...p, [campaignId]: data }));
      fetchCampaigns(statusFilter);
    } catch (err) {
      setSendResult((p) => ({ ...p, [campaignId]: { error: err.message } }));
    } finally {
      setSendingId(null);
    }
  }, [statusFilter, fetchCampaigns]);

  const handleDelete = useCallback(async (campaignId) => {
    if (!window.confirm('Delete this campaign permanently?')) return;
    try {
      await fetch(`/api/admin/campaigns/${campaignId}/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'X-CSRFToken': getCsrf() },
      });
      fetchCampaigns(statusFilter);
    } catch (_) {}
  }, [statusFilter, fetchCampaigns]);

  const openLogs = (campaign) => {
    setLogsCampaign(campaign);
    setLogsOpen(true);
    fetchLogs(campaign.id);
  };

  // --- Stats derived from campaigns ---
  const stats = {
    total:     campaigns.length,
    sent:      campaigns.filter((c) => c.status === 'sent').length,
    scheduled: campaigns.filter((c) => c.status === 'scheduled').length,
    draft:     campaigns.filter((c) => c.status === 'draft').length,
  };

  return (
    <div style={{ padding: '32px 36px', color: '#1F2937', minHeight: '100%' }}>

      {/* Logs drawer */}
      {logsOpen && logsCampaign && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setLogsOpen(false); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ width: 900, maxWidth: '96vw', maxHeight: '88vh', background: '#FFFFFF', border: BD, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
            <div style={{ padding: '14px 20px', borderBottom: BD, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: A, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
                  CAMPAIGN LOGS — {logsCampaign.name}
                </span>
                <span style={{ marginLeft: 12, fontSize: 11, color: '#1F2937', fontFamily: 'var(--font-mono)' }}>
                  {logsCampaign.recipient_count} recipients
                </span>
              </div>
              <button onClick={() => setLogsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#4B5563', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              {logsLoading ? (
                <div style={{ padding: 32, textAlign: 'center', color: '#4B5563', fontSize: 13 }}>Loading logs…</div>
              ) : logs.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: '#1F2937', fontSize: 13 }}>No logs yet.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Recipient', 'Status', 'Sent At', 'Error'].map((h) => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1F2937', borderBottom: BD, fontFamily: 'var(--font-mono)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((l, i) => (
                      <tr key={l.id || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '9px 16px', fontSize: 12, color: '#1F2937', fontFamily: 'var(--font-mono)' }}>{l.recipient}</td>
                        <td style={{ padding: '9px 16px' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: LOG_STATUS_COLOR[l.status] || '#4B5563', fontFamily: 'var(--font-mono)' }}>
                            {(l.status || '').toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '9px 16px', fontSize: 11, color: '#4B5563', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                          {l.sent_at ? new Date(l.sent_at).toLocaleString() : '—'}
                        </td>
                        <td style={{ padding: '9px 16px', fontSize: 11, color: '#EF4444', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {l.error_message || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', color: A, textTransform: 'uppercase', marginBottom: 6 }}>
            CMP — Marketing Campaign Management
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111827' }}>Campaigns</h1>
          <p style={{ fontSize: 13, color: '#4B5563', margin: '6px 0 0' }}>
            Create, schedule, and dispatch email marketing campaigns.
          </p>
        </div>
        <button
          onClick={() => { setShowNew((v) => !v); setSaveMsg(null); }}
          style={{
            padding: '9px 20px', background: showNew ? 'rgba(212,175,55,0.15)' : A,
            border: `1px solid ${A}`, color: showNew ? A : '#06080D',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          {showNew ? '✕ Cancel' : '+ New Campaign'}
        </button>
      </div>

      {/* Stats */}
      <div className="console-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Campaigns', value: stats.total },
          { label: 'Sent',            value: stats.sent  },
          { label: 'Scheduled',       value: stats.scheduled },
          { label: 'Drafts',          value: stats.draft },
        ].map((s) => (
          <div key={s.label} style={CARD}>
            <div style={{ fontSize: 11, color: '#4B5563', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {saveMsg && (
        <div style={{ padding: '10px 16px', background: saveMsg.ok ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${saveMsg.ok ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`, color: saveMsg.ok ? '#22C55E' : '#EF4444', fontSize: 12, marginBottom: 16, fontFamily: 'var(--font-mono)' }}>
          {saveMsg.text}
        </div>
      )}

      {/* New Campaign Form */}
      {showNew && (
        <div style={{ ...CARD, marginBottom: 24, border: '1px solid rgba(212,175,55,0.35)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: A, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 18, fontFamily: 'var(--font-mono)' }}>New Campaign</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 5, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Campaign Name</label>
              <input
                value={newCampaign.name}
                onChange={(e) => setNewCampaign((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Spring 2026 Promo"
                style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', border: BD, color: '#111827', fontSize: 12, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 5, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Subject Line</label>
              <input
                value={newCampaign.subject}
                onChange={(e) => setNewCampaign((p) => ({ ...p, subject: e.target.value }))}
                placeholder="e.g. Exclusive deal inside 🎉"
                style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', border: BD, color: '#111827', fontSize: 12, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 5, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Template</label>
              <select
                value={newCampaign.template}
                onChange={(e) => setNewCampaign((p) => ({ ...p, template: e.target.value }))}
                style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', border: BD, color: '#111827', fontSize: 12, outline: 'none', fontFamily: 'inherit', cursor: 'pointer', boxSizing: 'border-box' }}
              >
                <option value=''>— Select template —</option>
                {templates.map((t) => (
                  <option key={t.template_id} value={t.template_id}>{t.name} ({t.template_id})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 5, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sender Identity</label>
              <select
                value={newCampaign.sender_identity}
                onChange={(e) => setNewCampaign((p) => ({ ...p, sender_identity: e.target.value }))}
                style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', border: BD, color: '#111827', fontSize: 12, outline: 'none', fontFamily: 'inherit', cursor: 'pointer', boxSizing: 'border-box' }}
              >
                <option value=''>— Default sender —</option>
                {senders.map((s) => (
                  <option key={s.id} value={s.id}>{s.display_name} &lt;{s.email}&gt;</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 5, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Scheduled At (optional)</label>
              <input
                type="datetime-local"
                value={newCampaign.scheduled_at}
                onChange={(e) => setNewCampaign((p) => ({ ...p, scheduled_at: e.target.value }))}
                style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', border: BD, color: '#111827', fontSize: 12, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', colorScheme: 'dark' }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 5, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Recipients (comma-separated email addresses)
              </label>
              <textarea
                value={newCampaign.recipients}
                onChange={(e) => setNewCampaign((p) => ({ ...p, recipients: e.target.value }))}
                rows={3}
                placeholder="user@example.com, another@example.com, ..."
                style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', border: BD, color: '#111827', fontSize: 12, outline: 'none', fontFamily: 'var(--font-mono)', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }}
              />
              <div style={{ fontSize: 10, color: '#1F2937', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                {newCampaign.recipients
                  ? newCampaign.recipients.split(',').map((r) => r.trim()).filter(Boolean).length
                  : 0} recipient(s)
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            <button
              onClick={handleCreate}
              disabled={saving || !newCampaign.name || !newCampaign.template}
              style={{ padding: '9px 22px', background: A, border: 'none', color: '#06080D', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Creating…' : 'Create Campaign'}
            </button>
          </div>
        </div>
      )}

      {/* Filter toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '7px 12px', background: '#FFFFFF', border: BD, color: '#D1D5DB', fontSize: 12, fontFamily: 'var(--font-mono)', outline: 'none', cursor: 'pointer' }}
        >
          <option value=''>All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <button
          onClick={() => fetchCampaigns(statusFilter)}
          style={{ padding: '7px 14px', background: 'transparent', border: BD, color: A, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
        >
          Refresh
        </button>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#1F2937', fontFamily: 'var(--font-mono)' }}>
          {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '14px 20px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: 13, marginBottom: 16 }}>
          Failed to load campaigns: {error}
        </div>
      )}

      {/* Campaign table */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#4B5563', fontSize: 13 }}>Loading campaigns…</div>
      ) : campaigns.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#1F2937', fontSize: 13, border: BD }}>
          No campaigns found. Create one with the button above.
        </div>
      ) : (
        <div style={{ background: '#FFFFFF', border: BD }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Campaign', 'Template', 'Status', 'Recipients', 'Delivery', 'Open', 'Click', 'Bounce', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1F2937', borderBottom: BD, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => {
                const sc = STATUS_CONFIG[c.status] || { color: '#4B5563', label: c.status };
                const sr = sendResult[c.id];
                return (
                  <tr key={c.id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F0F9FF')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 14px', maxWidth: 200 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                      <div style={{ fontSize: 10, color: '#1F2937', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                        {c.sent_at ? `Sent ${new Date(c.sent_at).toLocaleDateString()}` : c.scheduled_at ? `Sched. ${new Date(c.scheduled_at).toLocaleDateString()}` : 'Not scheduled'}
                      </div>
                      {sr && (
                        <div style={{ fontSize: 10, color: sr.error ? '#EF4444' : '#22C55E', marginTop: 3, fontFamily: 'var(--font-mono)' }}>
                          {sr.error ? `✕ ${sr.error}` : `✓ ${sr.sent}/${sr.total} sent`}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 11, color: '#4B5563', fontFamily: 'var(--font-mono)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.template || '—'}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: sc.color, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
                        {sc.label.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#1F2937', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
                      {c.recipient_count ?? '—'}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#22C55E', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
                      {fmtPct(c.delivery_rate)}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: A, fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
                      {fmtPct(c.open_rate)}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#8B5CF6', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
                      {fmtPct(c.click_rate)}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#F59E0B', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
                      {fmtPct(c.bounce_rate)}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'nowrap' }}>
                        {(c.status === 'draft' || c.status === 'scheduled') && (
                          <button
                            onClick={() => handleSend(c.id)}
                            disabled={sendingId === c.id}
                            style={{ fontSize: 9, padding: '4px 10px', cursor: 'pointer', background: 'transparent', border: `1px solid ${A}`, color: A, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap', opacity: sendingId === c.id ? 0.6 : 1 }}
                          >
                            {sendingId === c.id ? '…' : 'Send'}
                          </button>
                        )}
                        <button
                          onClick={() => openLogs(c)}
                          style={{ fontSize: 9, padding: '4px 10px', cursor: 'pointer', background: 'transparent', border: BD, color: '#4B5563', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}
                        >
                          Logs
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          style={{ fontSize: 9, padding: '4px 10px', cursor: 'pointer', background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}
                        >
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
