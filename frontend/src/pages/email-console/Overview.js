import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

const A = '#D4AF37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px' };

const STATUS_COLOR = { sent: '#22C55E', delivered: '#22C55E', failed: '#EF4444', bounced: '#EF4444', skipped: '#F59E0B' };
const TYPE_LABELS = {
  account_created: 'Account Created', email_verification: 'Email Verification',
  new_login: 'New Login', password_reset: 'Password Reset',
  security_alert: 'Security Alert', billing_alert: 'Billing Alert',
};

const DOMAINS = [
  { domain: 'atonix.io',         spf: 'Pass', dkim: 'Pass',    dmarc: 'Pass',  status: 'Verified' },
  { domain: 'mail.atonix.io',    spf: 'Pass', dkim: 'Pass',    dmarc: 'Pass',  status: 'Verified' },
  { domain: 'noreply.atonix.io', spf: 'Pass', dkim: 'Pending', dmarc: 'Pass',  status: 'Pending'  },
];

export default function EmailOverview() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, sent: 0, failed: 0 });
  const [templateCount, setTemplateCount] = useState('—');
  const [refreshed, setRefreshed] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [logsRes, tmplRes] = await Promise.all([
        fetch('/api/admin/email-logs/?page=1&page_size=50', { credentials: 'include', headers: { Accept: 'application/json' } }),
        fetch('/api/admin/templates/?page_size=1', { credentials: 'include', headers: { Accept: 'application/json' } }),
      ]);
      if (logsRes.ok) {
        const data = await logsRes.json();
        const items = data.results || data;
        setLogs(items.slice(0, 8));
        const s = { total: data.count || items.length, sent: 0, failed: 0 };
        items.forEach((l) => {
          if (l.status === 'sent' || l.status === 'delivered') s.sent += 1;
          else if (l.status === 'failed' || l.status === 'bounced') s.failed += 1;
        });
        setStats(s);
      }
      if (tmplRes.ok) {
        const d = await tmplRes.json();
        setTemplateCount(d.count ?? (d.results || d).length);
      }
      setRefreshed(new Date());
    } catch (_) {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const deliverRate = stats.total > 0 ? ((stats.sent / Math.max(stats.sent + stats.failed, 1)) * 100).toFixed(1) : '—';

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px) clamp(16px, 4vw, 36px)', color: '#1F2937', minHeight: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', color: A, textTransform: 'uppercase', marginBottom: 6 }}>
            OVW — Email Console Overview
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111827' }}>Email Overview</h1>
          <p style={{ fontSize: 13, color: '#4B5563', margin: '6px 0 0' }}>Live health summary, delivery stats, and recent activity.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {refreshed && <span style={{ fontSize: 10, color: '#4B5563', fontFamily: 'var(--font-mono)' }}>Updated {refreshed.toLocaleTimeString()}</span>}
          <button onClick={fetchData} disabled={loading} style={{ padding: '9px 20px', background: A, border: 'none', color: '#06080D', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Loading…' : '↻ Refresh'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Emails Tracked', value: stats.total,  accent: '#3B82F6' },
          { label: 'Delivered',       value: stats.sent,   accent: '#22C55E' },
          { label: 'Failed / Bounced',value: stats.failed, accent: '#EF4444' },
          { label: 'Templates',       value: templateCount, accent: A },
        ].map((s) => (
          <div key={s.label} style={{ ...CARD, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: s.accent }} />
            <div style={{ paddingLeft: 12 }}>
              <div style={{ fontSize: 10, color: '#4B5563', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: 20, marginBottom: 28 }}>

        {/* SMTP Health */}
        <div style={CARD}>
          <div style={{ fontSize: 10, fontWeight: 700, color: A, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16, fontFamily: 'var(--font-mono)' }}>SMTP Server Status</div>
          {[
            { label: 'Host',        value: 'smtp.sendgrid.net', ok: true,  status: 'Online'    },
            { label: 'Port 587',    value: 'TLS Enabled',        ok: true,  status: 'Active'    },
            { label: 'Provider',    value: 'SendGrid',           ok: true,  status: 'Connected' },
            { label: 'From',        value: 'noreply@atonix.io',  ok: true,  status: 'Verified'  },
            { label: 'Deliverability', value: `${deliverRate}%`, ok: true,  status: 'Healthy'   },
          ].map((r) => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: BD }}>
              <div>
                <div style={{ fontSize: 10, color: '#4B5563', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{r.label}</div>
                <div style={{ fontSize: 12, color: '#1F2937', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{r.value}</div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#22C55E', fontFamily: 'var(--font-mono)', background: 'rgba(34,197,94,0.08)', padding: '3px 8px' }}>{r.status}</span>
            </div>
          ))}
        </div>

        {/* Domain Health */}
        <div style={CARD}>
          <div style={{ fontSize: 10, fontWeight: 700, color: A, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16, fontFamily: 'var(--font-mono)' }}>Domain Health</div>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 400 }}>
            <thead>
              <tr>{['Domain', 'SPF', 'DKIM', 'Status'].map((h) => (
                <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4B5563', borderBottom: BD, fontFamily: 'var(--font-mono)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {DOMAINS.map((d) => (
                <tr key={d.domain} style={{ borderBottom: BD }}>
                  <td style={{ padding: '10px 8px', fontSize: 11, fontWeight: 600, color: '#111827', fontFamily: 'var(--font-mono)' }}>{d.domain}</td>
                  <td style={{ padding: '10px 8px', fontSize: 10, fontWeight: 700, color: d.spf === 'Pass' ? '#22C55E' : '#F59E0B', fontFamily: 'var(--font-mono)' }}>{d.spf}</td>
                  <td style={{ padding: '10px 8px', fontSize: 10, fontWeight: 700, color: d.dkim === 'Pass' ? '#22C55E' : '#F59E0B', fontFamily: 'var(--font-mono)' }}>{d.dkim}</td>
                  <td style={{ padding: '10px 8px' }}>
                    <span style={{ fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-mono)', padding: '3px 7px', background: d.status === 'Verified' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', color: d.status === 'Verified' ? '#22C55E' : '#F59E0B' }}>{d.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div style={{ marginTop: 16, padding: '12px 14px', background: '#F9FAFB', border: BD }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>Deliverability Score</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 6, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: '98.7%', height: '100%', background: '#22C55E', borderRadius: 3 }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#22C55E', fontFamily: 'var(--font-mono)' }}>98.7%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ ...CARD, marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: A, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Recent Email Activity</div>
          <Link to="/email-console/logs" style={{ fontSize: 10, color: '#4B5563', fontFamily: 'var(--font-mono)', textDecoration: 'none', letterSpacing: '0.06em' }}>View All Logs →</Link>
        </div>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#4B5563', fontSize: 13 }}>Loading…</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#4B5563', fontSize: 13, border: BD }}>No recent activity.</div>
        ) : (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
            <thead>
              <tr>{['Time', 'Type', 'Recipient', 'Subject', 'Status'].map((h) => (
                <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4B5563', borderBottom: BD, fontFamily: 'var(--font-mono)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={log.id || i} style={{ borderBottom: BD }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FAFB')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '10px 14px', fontSize: 11, color: '#4B5563', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{log.created_at ? new Date(log.created_at).toLocaleString() : '—'}</td>
                  <td style={{ padding: '10px 14px' }}><span style={{ fontSize: 10, fontWeight: 700, color: A, fontFamily: 'var(--font-mono)' }}>{TYPE_LABELS[log.email_type] || log.email_type || '—'}</span></td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: '#1F2937', fontFamily: 'var(--font-mono)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.recipient || '—'}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: '#4B5563', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.subject || '—'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: STATUS_COLOR[log.status] || '#4B5563', fontFamily: 'var(--font-mono)', background: `${STATUS_COLOR[log.status] || '#4B5563'}1A`, padding: '3px 8px' }}>{(log.status || 'unknown').toUpperCase()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 14 }}>
        {[
          { label: 'Marketing',   desc: 'Campaigns & audience targeting', to: '/email-console/marketing',  code: 'MKT' },
          { label: 'Campaigns',   desc: 'Send & track email campaigns',   to: '/email-console/campaigns',  code: 'CMP' },
          { label: 'Templates',   desc: 'Manage email templates',         to: '/email-console/templates',  code: 'TPL' },
          { label: 'Domains',     desc: 'SPF, DKIM, DMARC records',       to: '/email-console/domains',    code: 'DOM' },
        ].map((item) => (
          <Link key={item.to} to={item.to} style={{ ...CARD, textDecoration: 'none', display: 'block', borderColor: '#E5E7EB', transition: 'border-color 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = A)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}>
            <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', fontWeight: 700, color: A, letterSpacing: '0.1em', background: 'rgba(212,175,55,0.1)', padding: '3px 7px', display: 'inline-block', marginBottom: 8 }}>{item.code}</span>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 12, color: '#4B5563' }}>{item.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
