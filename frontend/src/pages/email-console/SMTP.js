import React, { useState } from 'react';

const A = '#D4AF37';
const BD = '1px solid #E5E7EB';

function getCsrf() {
  const m = document.cookie.match(/csrftoken=([^;]+)/);
  return m ? m[1] : '';
}

const FIELDS = [
  { key: 'host',     label: 'SMTP Host',      value: 'smtp.sendgrid.net', type: 'text'     },
  { key: 'port',     label: 'SMTP Port',      value: '587',               type: 'text'     },
  { key: 'from_name',label: 'From Name',      value: 'AtonixDev',         type: 'text'     },
  { key: 'from_addr',label: 'From Address',   value: 'noreply@atonix.io', type: 'email'    },
  { key: 'reply_to', label: 'Reply-To',       value: 'support@atonix.io', type: 'email'    },
  { key: 'enc',      label: 'Encryption',     value: 'TLS',               type: 'text'     },
  { key: 'api_key',  label: 'API Key / Password', value: '••••••••••••••••', type: 'password' },
];

export default function EmailSMTP() {
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testEmail, setTestEmail] = useState('');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleTest = async () => {
    if (!testEmail) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/smtp/test/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCsrf() },
        body: JSON.stringify({ to: testEmail }),
      });
      if (res.ok) {
        setTestResult({ ok: true, text: `Test email sent to ${testEmail}` });
      } else {
        const d = await res.json().catch(() => ({}));
        setTestResult({ ok: false, text: d.detail || `Error ${res.status}` });
      }
    } catch (err) {
      setTestResult({ ok: false, text: err.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{ padding: '32px 36px', color: '#1F2937', minHeight: '100%' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', color: A, textTransform: 'uppercase', marginBottom: 6 }}>SMP — SMTP Configuration</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111827' }}>SMTP Settings</h1>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '6px 0 0' }}>Outbound mail server credentials and delivery configuration.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>

        {/* Config form */}
        <div style={{ background: '#FFFFFF', border: BD, padding: '28px 32px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: A, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20, fontFamily: 'var(--font-mono)' }}>Outbound Mail Server</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            {FIELDS.map((f) => (
              <div key={f.key} style={f.key === 'api_key' ? { gridColumn: '1 / -1' } : {}}>
                <label style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 5, fontFamily: 'var(--font-mono)' }}>{f.label}</label>
                <input
                  type={f.type}
                  defaultValue={f.value}
                  style={{ width: '100%', padding: '9px 12px', background: '#FFFFFF', border: BD, color: '#111827', fontSize: 13, outline: 'none', fontFamily: f.key === 'api_key' ? 'var(--font-mono)' : 'inherit', boxSizing: 'border-box' }}
                />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24, display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={handleSave} style={{ padding: '9px 24px', background: A, border: 'none', color: '#06080D', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>
              Save Configuration
            </button>
            {saved && <span style={{ fontSize: 11, color: '#22C55E', fontFamily: 'var(--font-mono)' }}>✓ Saved</span>}
          </div>
        </div>

        {/* Side panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Connection status */}
          <div style={{ background: '#FFFFFF', border: BD, padding: '20px 24px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: A, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14, fontFamily: 'var(--font-mono)' }}>Connection Status</div>
            {[
              { label: 'SMTP Connection',  status: 'Connected',  ok: true },
              { label: 'Authentication',   status: 'Valid',       ok: true },
              { label: 'TLS Certificate',  status: 'Valid',       ok: true },
              { label: 'Port 587',         status: 'Open',        ok: true },
            ].map((r) => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: BD }}>
                <span style={{ fontSize: 12, color: '#374151' }}>{r.label}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: r.ok ? '#22C55E' : '#EF4444', fontFamily: 'var(--font-mono)', background: r.ok ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', padding: '2px 7px' }}>{r.status}</span>
              </div>
            ))}
          </div>

          {/* Send test email */}
          <div style={{ background: '#FFFFFF', border: BD, padding: '20px 24px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: A, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14, fontFamily: 'var(--font-mono)' }}>Send Test Email</div>
            <label style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 5, fontFamily: 'var(--font-mono)' }}>Recipient Address</label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', border: BD, color: '#111827', fontSize: 12, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 10 }}
            />
            <button onClick={handleTest} disabled={testing || !testEmail} style={{ width: '100%', padding: '9px 0', background: testing ? '#E5E7EB' : 'transparent', border: `1px solid ${A}`, color: testing ? '#9CA3AF' : A, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: testing ? 'wait' : 'pointer', fontFamily: 'inherit' }}>
              {testing ? 'Sending…' : 'Send Test'}
            </button>
            {testResult && (
              <div style={{ marginTop: 10, fontSize: 11, color: testResult.ok ? '#22C55E' : '#EF4444', fontFamily: 'var(--font-mono)' }}>{testResult.ok ? '✓ ' : '✕ '}{testResult.text}</div>
            )}
          </div>

          {/* Provider info */}
          <div style={{ background: '#F9FAFB', border: BD, padding: '16px 20px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>Provider</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 4 }}>SendGrid</div>
            <div style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.6 }}>Transactional &amp; marketing email delivery. 99.95% uptime SLA.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
