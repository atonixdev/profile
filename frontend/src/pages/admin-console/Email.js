import React, { useState } from 'react';

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

export default function Email() {
  const [tab, setTab] = useState('domains');
  const [saved, setSaved] = useState(false);

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
        {[['domains', 'Sending Domains'], ['smtp', 'SMTP Settings'], ['templates', 'Templates']].map(([id, label]) => (
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
    </div>
  );
}
