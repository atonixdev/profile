import React, { useState, useEffect, useCallback } from 'react';

const A = '#D4AF37';
const BD = '1px solid rgba(212,175,55,0.12)';
const CARD = { background: 'rgba(255,255,255,0.02)', border: BD, padding: '20px 24px' };

const DOMAINS = [
  { domain: 'atonix.io',       mx: 'Configured', spf: 'Pass', dkim: 'Pass',  dmarc: 'Pass',   status: 'Verified' },
  { domain: 'mail.atonix.io',  mx: 'Configured', spf: 'Pass', dkim: 'Pass',  dmarc: 'Pass',   status: 'Verified' },
  { domain: 'noreply.atonix.io', mx: 'Configured', spf: 'Pass', dkim: 'Pending', dmarc: 'Pass', status: 'Pending' },
];

const TEMPLATES = [
  { id: 'TMPL-01', name: 'Welcome Email',          subject: 'Welcome to AtonixDev — Your Account is Ready', last_modified: '2026-02-15' },
  { id: 'TMPL-02', name: 'Password Reset',          subject: 'Reset your AtonixDev password',                last_modified: '2026-01-20' },
  { id: 'TMPL-03', name: 'Email Verification',      subject: 'Verify your email address',                    last_modified: '2026-01-20' },
  { id: 'TMPL-04', name: 'Pipeline Failure Alert',  subject: '[AtonixDev] Pipeline {{name}} failed',         last_modified: '2026-02-28' },
  { id: 'TMPL-05', name: 'Invoice Notification',    subject: 'Your AtonixDev invoice is ready',              last_modified: '2026-03-01' },
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

export default function Email() {
  const [tab, setTab] = useState('domains');
  const [saved, setSaved] = useState(false);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState(null);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsFilter, setLogsFilter] = useState('');

  const fetchLogs = useCallback(async (page = 1, filter = '') => {
    setLogsLoading(true);
    setLogsError(null);
    try {
      const params = new URLSearchParams({ page, page_size: 20 });
      if (filter) params.set('email_type', filter);
      const res = await fetch(`/api/admin/email-logs/?${params}`, { credentials: 'include' });
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

  useEffect(() => {
    if (tab === 'logs') fetchLogs(logsPage, logsFilter);
  }, [tab, logsPage, logsFilter, fetchLogs]);

  return (
    <div style={{ padding: '32px 36px', color: '#F9FAFB', minHeight: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', color: A, textTransform: 'uppercase', marginBottom: 6 }}>
            EML — Email & Domain Configuration
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#FFFFFF' }}>Email & Domain</h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '6px 0 0' }}>
            Configure sending domains, DKIM/SPF/DMARC records, and transactional email templates.
          </p>
        </div>
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

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Verified Domains',   value: '2'    },
          { label: 'Deliverability',     value: '98.7%' },
          { label: 'Email Templates',    value: '5'    },
          { label: 'Bounce Rate',        value: '0.4%' },
        ].map((s) => (
          <div key={s.label} style={CARD}>
            <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#FFFFFF' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 16, borderBottom: BD }}>
        {[['domains', 'Sending Domains'], ['smtp', 'SMTP Settings'], ['templates', 'Templates'], ['logs', 'Email Logs']].map(([id, label]) => (
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
        <div style={{ background: 'rgba(255,255,255,0.015)', border: BD }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Domain', 'MX', 'SPF', 'DKIM', 'DMARC', 'Status'].map((h) => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#374151', borderBottom: BD, fontFamily: 'var(--font-mono)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DOMAINS.map((d) => (
                <tr key={d.domain} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 600, color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>{d.domain}</td>
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
        <div style={{ background: 'rgba(255,255,255,0.015)', border: BD, padding: '28px 32px' }}>
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
                <label style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>
                  {f.label}
                </label>
                <input
                  defaultValue={f.value}
                  style={{ width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,0.03)', border: BD, color: '#FFFFFF', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
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

      {/* Templates */}
      {tab === 'templates' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {TEMPLATES.map((t) => (
            <div key={t.id} style={{ ...CARD, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: '#4B5563', fontFamily: 'var(--font-mono)' }}>{t.subject}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#374151' }}>Modified: {t.last_modified}</span>
                <button style={{ fontSize: 10, padding: '4px 12px', cursor: 'pointer', background: 'transparent', border: BD, color: A, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.06em' }}>
                  Edit
                </button>
              </div>
            </div>
          ))}
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
              style={{ padding: '7px 12px', background: 'rgba(255,255,255,0.04)', border: BD, color: '#D1D5DB', fontSize: 12, fontFamily: 'var(--font-mono)', outline: 'none', cursor: 'pointer' }}
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
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#374151', fontFamily: 'var(--font-mono)' }}>
              {logsTotal} total
            </span>
          </div>

          {logsError && (
            <div style={{ padding: '14px 20px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: 13, marginBottom: 16 }}>
              Failed to load email logs: {logsError}
            </div>
          )}

          <div style={{ background: 'rgba(255,255,255,0.015)', border: BD }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Time', 'Type', 'Recipient', 'Subject', 'Status', 'IP'].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#374151', borderBottom: BD, fontFamily: 'var(--font-mono)' }}>
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
                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#374151', fontSize: 13 }}>No email logs found.</td>
                  </tr>
                ) : (
                  logs.map((log, i) => (
                    <tr
                      key={log.id || i}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '10px 16px', fontSize: 11, color: '#6B7280', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                        {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: A, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
                          {TYPE_LABELS[log.email_type] || log.email_type || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 16px', fontSize: 12, color: '#D1D5DB', fontFamily: 'var(--font-mono)' }}>
                        {log.recipient || '—'}
                      </td>
                      <td style={{ padding: '10px 16px', fontSize: 12, color: '#9CA3AF', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.subject || '—'}
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: STATUS_COLOR[log.status] || '#6B7280', fontFamily: 'var(--font-mono)' }}>
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
                style={{ padding: '6px 14px', background: 'transparent', border: BD, color: logsPage === 1 ? '#374151' : A, fontSize: 11, fontWeight: 700, cursor: logsPage === 1 ? 'default' : 'pointer', fontFamily: 'var(--font-mono)' }}
              >
                ← Prev
              </button>
              <span style={{ padding: '6px 12px', fontSize: 11, color: '#6B7280', fontFamily: 'var(--font-mono)' }}>
                Page {logsPage} / {Math.ceil(logsTotal / 20)}
              </span>
              <button
                onClick={() => setLogsPage((p) => p + 1)}
                disabled={logsPage >= Math.ceil(logsTotal / 20)}
                style={{ padding: '6px 14px', background: 'transparent', border: BD, color: logsPage >= Math.ceil(logsTotal / 20) ? '#374151' : A, fontSize: 11, fontWeight: 700, cursor: logsPage >= Math.ceil(logsTotal / 20) ? 'default' : 'pointer', fontFamily: 'var(--font-mono)' }}
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
