import React, { useState } from 'react';

const A = '#D4AF37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px' };

const DOMAINS = [
  { domain: 'atonix.io',         mx: 'Configured', spf: 'Pass', dkim: 'Pass',    dmarc: 'Pass',  status: 'Verified' },
  { domain: 'mail.atonix.io',    mx: 'Configured', spf: 'Pass', dkim: 'Pass',    dmarc: 'Pass',  status: 'Verified' },
  { domain: 'noreply.atonix.io', mx: 'Configured', spf: 'Pass', dkim: 'Pending', dmarc: 'Pass',  status: 'Pending'  },
];

const statusColor = (v) => (v === 'Pass' || v === 'Configured' || v === 'Verified' ? '#22C55E' : '#F59E0B');

export default function EmailDomains() {
  const [showAdd, setShowAdd] = useState(false);
  const [newDomain, setNewDomain] = useState('');

  return (
    <div style={{ padding: '32px 36px', color: '#1F2937', minHeight: '100%' }}>
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', color: A, textTransform: 'uppercase', marginBottom: 6 }}>DOM — Sending Domains</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111827' }}>Sending Domains</h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '6px 0 0' }}>Configure and verify DKIM, SPF, and DMARC records for all sending domains.</p>
        </div>
        <button onClick={() => setShowAdd((v) => !v)} style={{ padding: '9px 20px', background: showAdd ? 'transparent' : A, border: `1px solid ${A}`, color: showAdd ? A : '#06080D', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>
          {showAdd ? '✕ Cancel' : '+ Add Domain'}
        </button>
      </div>

      {showAdd && (
        <div style={{ ...CARD, marginBottom: 24, border: `1px solid rgba(212,175,55,0.35)` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: A, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14, fontFamily: 'var(--font-mono)' }}>Add New Domain</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 5, fontFamily: 'var(--font-mono)' }}>Domain Name</label>
              <input
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="e.g. alerts.atonix.io"
                style={{ width: '100%', padding: '9px 12px', background: '#FFFFFF', border: BD, color: '#111827', fontSize: 13, outline: 'none', fontFamily: 'var(--font-mono)', boxSizing: 'border-box' }}
              />
            </div>
            <button style={{ padding: '9px 24px', background: A, border: 'none', color: '#06080D', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>
              Add &amp; Verify
            </button>
          </div>
          <p style={{ fontSize: 11, color: '#9CA3AF', margin: '12px 0 0', fontFamily: 'var(--font-mono)' }}>
            DNS records (MX, SPF TXT, DKIM TXT, DMARC TXT) will be generated after submission.
          </p>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Domains',    value: DOMAINS.length },
          { label: 'Verified',         value: DOMAINS.filter((d) => d.status === 'Verified').length },
          { label: 'Pending Verification', value: DOMAINS.filter((d) => d.status === 'Pending').length },
        ].map((s) => (
          <div key={s.label} style={CARD}>
            <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Domain Table */}
      <div style={{ background: '#FFFFFF', border: BD }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Domain', 'MX', 'SPF', 'DKIM', 'DMARC', 'Status', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#374151', borderBottom: BD, fontFamily: 'var(--font-mono)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DOMAINS.map((d) => (
              <tr key={d.domain}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FAFB')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                style={{ borderBottom: BD }}>
                <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: '#111827', fontFamily: 'var(--font-mono)' }}>{d.domain}</td>
                {[d.mx, d.spf, d.dkim, d.dmarc].map((v, i) => (
                  <td key={i} style={{ padding: '14px 20px' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: statusColor(v), fontFamily: 'var(--font-mono)' }}>{v}</span>
                  </td>
                ))}
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', fontFamily: 'var(--font-mono)', background: d.status === 'Verified' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', color: d.status === 'Verified' ? '#22C55E' : '#F59E0B' }}>{d.status}</span>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ fontSize: 10, padding: '4px 10px', cursor: 'pointer', background: 'transparent', border: BD, color: A, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>DNS Records</button>
                    <button style={{ fontSize: 10, padding: '4px 10px', cursor: 'pointer', background: 'transparent', border: BD, color: '#6B7280', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>Re-verify</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info panel */}
      <div style={{ marginTop: 24, ...CARD, background: '#F9FAFB' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: A, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12, fontFamily: 'var(--font-mono)' }}>Required DNS Records</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { type: 'SPF', record: 'TXT', value: '"v=spf1 include:sendgrid.net ~all"', desc: 'Authorises SendGrid to send on your behalf.' },
            { type: 'DKIM', record: 'CNAME', value: 'em1234._domainkey → sendgrid.net', desc: 'Cryptographic signature to authenticate emails.' },
            { type: 'DMARC', record: 'TXT', value: '"v=DMARC1; p=quarantine; rua=mailto:dmarc@atonix.io"', desc: 'Policy for failed SPF/DKIM alignment.' },
          ].map((r) => (
            <div key={r.type} style={{ padding: '14px 16px', border: BD, background: '#FFFFFF' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: A, letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>{r.type} — {r.record}</div>
              <div style={{ fontSize: 11, color: '#374151', fontFamily: 'var(--font-mono)', marginBottom: 8, wordBreak: 'break-all' }}>{r.value}</div>
              <div style={{ fontSize: 11, color: '#6B7280' }}>{r.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
