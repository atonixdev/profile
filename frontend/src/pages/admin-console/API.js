import React, { useState } from 'react';

const A = '#D4AF37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#F9FAFB', border: BD, padding: '20px 24px' };

const KEYS = [
  { id: 'key-0041', name: 'Production API',      scope: 'read:all write:projects', created: '2025-12-01', last_used: '2026-03-09', status: 'Active'   },
  { id: 'key-0042', name: 'CI/CD Integration',   scope: 'write:pipelines read:envs', created: '2026-01-15', last_used: '2026-03-09', status: 'Active'   },
  { id: 'key-0043', name: 'Monitoring Exporter', scope: 'read:metrics',             created: '2026-02-10', last_used: '2026-03-07', status: 'Active'   },
  { id: 'key-0044', name: 'Webhook Consumer',    scope: 'webhooks:receive',         created: '2026-03-01', last_used: '2026-03-09', status: 'Active'   },
  { id: 'key-0040', name: 'Legacy Mobile App',   scope: 'read:all',                 created: '2025-06-20', last_used: '2025-11-01', status: 'Revoked'  },
];

const WEBHOOKS = [
  { id: 'wh-01', url: 'https://hooks.slack.com/services/…',     events: 'deploy.success deploy.fail', status: 'Active' },
  { id: 'wh-02', url: 'https://sentry.io/webhooks/atonix/…',   events: 'error.critical',              status: 'Active' },
  { id: 'wh-03', url: 'https://notify.example.com/hook',       events: 'user.register',               status: 'Inactive' },
];

export default function API() {
  const [tab, setTab] = useState('keys');

  return (
    <div style={{ padding: '32px 36px', color: '#1F2937', minHeight: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', color: A, textTransform: 'uppercase', marginBottom: 6 }}>
            API — Developer Tools & API Management
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111827' }}>API & Developer Tools</h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '6px 0 0' }}>
            Manage API keys, webhooks, rate limits, and developer integrations.
          </p>
        </div>
        <button
          style={{
            padding: '9px 20px', background: A, border: 'none', color: '#06080D',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          + Generate Key
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Active API Keys',    value: '4'      },
          { label: 'API Calls (24h)',    value: '18,442' },
          { label: 'Active Webhooks',    value: '2'      },
          { label: 'Avg Latency (ms)',   value: '142'    },
        ].map((s) => (
          <div key={s.label} style={CARD}>
            <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 16, borderBottom: BD, paddingBottom: 0 }}>
        {[['keys', 'API Keys'], ['webhooks', 'Webhooks'], ['docs', 'API Docs']].map(([id, label]) => (
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

      {/* API Keys */}
      {tab === 'keys' && (
        <div style={{ background: '#FFFFFF', border: BD }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Key ID', 'Name', 'Scope', 'Created', 'Last Used', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#374151', borderBottom: BD, fontFamily: 'var(--font-mono)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {KEYS.map((k) => (
                <tr key={k.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F0F9FF')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '11px 20px', fontSize: 11, color: A, fontFamily: 'var(--font-mono)' }}>{k.id}</td>
                  <td style={{ padding: '11px 20px', fontSize: 13, fontWeight: 600, color: '#111827' }}>{k.name}</td>
                  <td style={{ padding: '11px 20px', fontSize: 11, color: '#6B7280', fontFamily: 'var(--font-mono)' }}>{k.scope}</td>
                  <td style={{ padding: '11px 20px', fontSize: 11, color: '#4B5563' }}>{k.created}</td>
                  <td style={{ padding: '11px 20px', fontSize: 11, color: '#4B5563' }}>{k.last_used}</td>
                  <td style={{ padding: '11px 20px' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: k.status === 'Active' ? '#22C55E' : '#EF4444', fontFamily: 'var(--font-mono)' }}>{k.status}</span>
                  </td>
                  <td style={{ padding: '11px 20px' }}>
                    {k.status === 'Active' && (
                      <button style={{ fontSize: 10, padding: '4px 10px', cursor: 'pointer', background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Webhooks */}
      {tab === 'webhooks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {WEBHOOKS.map((w) => (
            <div key={w.id} style={{ ...CARD, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#111827', marginBottom: 4, fontFamily: 'var(--font-mono)' }}>{w.url}</div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>Events: {w.events}</div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: w.status === 'Active' ? '#22C55E' : '#6B7280', fontFamily: 'var(--font-mono)' }}>{w.status}</span>
            </div>
          ))}
        </div>
      )}

      {/* Docs */}
      {tab === 'docs' && (
        <div style={{ ...CARD, padding: '28px 32px' }}>
          <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 16 }}>
            Access the AtonixDev REST API documentation to integrate third-party systems.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { method: 'GET',    path: '/api/v1/users/',         desc: 'List all platform users' },
              { method: 'POST',   path: '/api/v1/users/',         desc: 'Create a new user account' },
              { method: 'GET',    path: '/api/v1/pipelines/',     desc: 'List all CI/CD pipelines' },
              { method: 'POST',   path: '/api/v1/pipelines/',     desc: 'Trigger a new pipeline run' },
              { method: 'GET',    path: '/api/v1/audit-logs/',    desc: 'Retrieve audit log entries' },
            ].map((e) => (
              <div key={e.path} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', width: 40, color: e.method === 'GET' ? '#22C55E' : '#38BDF8' }}>{e.method}</span>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: A, minWidth: 220 }}>{e.path}</span>
                <span style={{ fontSize: 12, color: '#6B7280' }}>{e.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
