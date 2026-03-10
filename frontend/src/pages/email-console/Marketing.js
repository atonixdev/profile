import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

const A = '#D4AF37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#F9FAFB', border: BD, padding: '20px 24px' };

const STATUS_CONFIG = {
  draft:      { color: '#6B7280', label: 'Draft'     },
  scheduled:  { color: '#3B82F6', label: 'Scheduled' },
  sending:    { color: A,         label: 'Sending'   },
  sent:       { color: '#22C55E', label: 'Sent'      },
  paused:     { color: '#F59E0B', label: 'Paused'    },
  cancelled:  { color: '#EF4444', label: 'Cancelled' },
  failed:     { color: '#DC2626', label: 'Failed'    },
};

function getCsrf() { const m = document.cookie.match(/csrftoken=([^;]+)/); return m ? m[1] : ''; }
function fmtPct(n) { return typeof n === 'number' ? `${n.toFixed(1)}%` : '—'; }

export default function EmailMarketing() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/admin/campaigns/?page_size=100', { credentials: 'include', headers: { Accept: 'application/json' } });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) throw new Error(`Backend not reachable (${res.status})`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCampaigns(data.results || data);
    } catch (err) { setError(err.message); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const sent = campaigns.filter((c) => c.status === 'sent');
  const totalSent = sent.reduce((a, c) => a + (c.recipient_count || 0), 0);
  const totalDelivered = sent.reduce((a, c) => a + (c.delivered_count || 0), 0);
  const totalOpened = sent.reduce((a, c) => a + (c.opened_count || 0), 0);
  const totalClicked = sent.reduce((a, c) => a + (c.clicked_count || 0), 0);
  const deliverRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
  const openRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
  const ctr = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;

  const METRICS = [
    { label: 'Total Campaigns', value: campaigns.length, sub: `${sent.length} completed` },
    { label: 'Emails Sent',     value: totalSent.toLocaleString(), sub: 'across all sent campaigns' },
    { label: 'Delivery Rate',   value: fmtPct(deliverRate), sub: `${totalDelivered.toLocaleString()} delivered` },
    { label: 'Open Rate',       value: fmtPct(openRate), sub: `${totalOpened.toLocaleString()} opens` },
    { label: 'Click-Through',   value: fmtPct(ctr), sub: `${totalClicked.toLocaleString()} clicks` },
    { label: 'Scheduled',       value: campaigns.filter((c) => c.status === 'scheduled').length, sub: 'queued campaigns' },
  ];

  return (
    <div style={{ padding: '32px 36px', color: '#1F2937', minHeight: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', color: A, textTransform: 'uppercase', marginBottom: 6 }}>MKT — Marketing Overview</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111827' }}>Marketing</h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '6px 0 0' }}>High-level performance metrics for all marketing campaigns.</p>
        </div>
        <Link to="/email-console/campaigns" style={{ padding: '9px 20px', background: A, border: `1px solid ${A}`, color: '#06080D', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', display: 'inline-block', fontFamily: 'inherit' }}>
          Manage Campaigns →
        </Link>
      </div>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: 12, marginBottom: 20 }}>Failed to load: {error}</div>}

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {METRICS.map((m) => (
          <div key={m.label} style={CARD}>
            <div style={{ fontSize: 10, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>{m.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>{loading ? '—' : m.value}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 5 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent Campaigns Performance Table */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#374151', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14, fontFamily: 'var(--font-mono)' }}>Recent Campaign Performance</div>
        <div style={{ ...CARD, padding: 0, overflow: 'hidden' }}>
          {loading ? <div style={{ padding: '32px 20px', textAlign: 'center', color: '#6B7280', fontSize: 13 }}>Loading…</div>
           : campaigns.length === 0 ? (
             <div style={{ padding: '36px 20px', textAlign: 'center', color: '#6B7280', fontSize: 13 }}>No campaigns yet. <Link to="/email-console/campaigns" style={{ color: A, textDecoration: 'none', fontWeight: 600 }}>Create your first campaign →</Link></div>
           ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#F1F5F9' }}>
                  {['Campaign', 'Status', 'Recipients', 'Delivered', 'Opened', 'Clicked', 'Date'].map((h) => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', fontFamily: 'var(--font-mono)', borderBottom: BD, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.slice(0, 15).map((c, i) => {
                  const sc = STATUS_CONFIG[c.status] || { color: '#6B7280', label: c.status };
                  const rc = c.recipient_count || 0;
                  const dc = c.delivered_count || 0;
                  const oc = c.opened_count || 0;
                  const cc = c.clicked_count || 0;
                  return (
                    <tr key={c.id || i} style={{ borderBottom: BD }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#111827', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontSize: 9, padding: '2px 7px', color: sc.color, background: `${sc.color}18`, fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase' }}>{sc.label}</span>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#374151', fontFamily: 'var(--font-mono)' }}>{rc.toLocaleString()}</td>
                      <td style={{ padding: '10px 14px', color: '#374151', fontFamily: 'var(--font-mono)' }}>{rc > 0 ? `${dc.toLocaleString()} (${fmtPct(dc / rc * 100)})` : '—'}</td>
                      <td style={{ padding: '10px 14px', color: '#374151', fontFamily: 'var(--font-mono)' }}>{dc > 0 ? `${oc.toLocaleString()} (${fmtPct(oc / dc * 100)})` : '—'}</td>
                      <td style={{ padding: '10px 14px', color: '#374151', fontFamily: 'var(--font-mono)' }}>{oc > 0 ? `${cc.toLocaleString()} (${fmtPct(cc / oc * 100)})` : '—'}</td>
                      <td style={{ padding: '10px 14px', color: '#9CA3AF', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', fontSize: 11 }}>{c.sent_at ? new Date(c.sent_at).toLocaleDateString() : c.scheduled_at ? new Date(c.scheduled_at).toLocaleDateString() : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
           )}
        </div>
      </div>

      {/* Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[
          { title: 'Manage Campaigns', desc: 'Create, schedule, and dispatch email campaigns.', href: '/email-console/campaigns', icon: '📣' },
          { title: 'Email Templates', desc: 'Library of reusable templates for your campaigns.', href: '/email-console/templates', icon: '📝' },
          { title: 'Sender Identities', desc: 'Manage from-address identities and defaults.', href: '/email-console/senders', icon: '👤' },
        ].map((item) => (
          <Link key={item.title} to={item.href} style={{ ...CARD, display: 'block', textDecoration: 'none', transition: 'opacity .15s' }}>
            <div style={{ fontSize: 22, marginBottom: 10 }}>{item.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 5 }}>{item.title}</div>
            <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>{item.desc}</div>
            <div style={{ marginTop: 12, fontSize: 11, color: A, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>Go →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
