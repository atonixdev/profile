import React, { useState } from 'react';

const A = '#D4AF37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#F9FAFB', border: BD, padding: '20px 24px' };

const EVENTS = [
  { id: 'EVT-8821', time: '2026-03-09 11:42', user: 'ofidohub@gmail.com', type: 'AUTH',    severity: 'Info',     msg: 'Admin login from 41.77.12.8' },
  { id: 'EVT-8820', time: '2026-03-09 11:14', user: 'tobias@atonix.io',   type: 'AUTH',    severity: 'Warning',  msg: '3 consecutive failed logins' },
  { id: 'EVT-8819', time: '2026-03-09 10:55', user: 'system',             type: 'SESSION', severity: 'Info',     msg: 'Expired session purge: 24 records' },
  { id: 'EVT-8818', time: '2026-03-09 09:30', user: 'zara.a@atonix.io',   type: 'ACCESS',  severity: 'Critical', msg: 'Blocked access to /admin-console (not staff)' },
  { id: 'EVT-8817', time: '2026-03-09 08:12', user: 'dev@atonix.io',      type: 'KEY',     severity: 'Info',     msg: 'API key rotated: key-0044' },
  { id: 'EVT-8816', time: '2026-03-08 22:05', user: 'unknown',            type: 'AUTH',    severity: 'Critical', msg: 'Brute-force pattern: 41.80.3.22 (blocked)' },
  { id: 'EVT-8815', time: '2026-03-08 20:41', user: 'priya@atonix.io',    type: 'MFA',     severity: 'Info',     msg: 'MFA method updated to TOTP' },
  { id: 'EVT-8814', time: '2026-03-08 18:30', user: 'system',             type: 'POLICY',  severity: 'Info',     msg: 'Password policy version 3 applied' },
];

const SEV = {
  Info:     { color: '#22C55E',  bg: 'rgba(34,197,94,0.1)'   },
  Warning:  { color: '#F59E0B',  bg: 'rgba(245,158,11,0.1)'  },
  Critical: { color: '#EF4444',  bg: 'rgba(239,68,68,0.1)'   },
};

export default function Security() {
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? EVENTS : EVENTS.filter((e) => e.severity === filter);

  return (
    <div style={{ padding: '32px 36px', color: '#1F2937', minHeight: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', color: A, textTransform: 'uppercase', marginBottom: 6 }}>
          SEC — Security & Access Control
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111827' }}>Security Events</h1>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '6px 0 0' }}>
          Real-time visibility into authentication, access, and threat events across the platform.
        </p>
      </div>

      {/* Stats */}
      <div className="console-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Events (24h)',    value: '142',  color: '#111827' },
          { label: 'Failed Logins',   value: '18',   color: '#F59E0B' },
          { label: 'Critical Alerts', value: '2',    color: '#EF4444' },
          { label: 'Blocked IPs',     value: '5',    color: '#A81D37' },
        ].map((s) => (
          <div key={s.label} style={CARD}>
            <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Policies row */}
      <div className="console-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Password Policy',   status: 'Active', detail: 'Min 12 chars, mixed case, special' },
          { label: 'MFA Enforcement',   status: 'Optional', detail: 'Enabled for: Admin, Staff roles' },
          { label: 'Session Policy',    status: 'Active', detail: '24h expiry · 1h idle timeout' },
        ].map((p) => (
          <div key={p.label} style={{ ...CARD, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{p.label}</div>
              <div style={{ fontSize: 11, color: '#4B5563' }}>{p.detail}</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#22C55E', fontFamily: 'var(--font-mono)' }}>{p.status}</span>
          </div>
        ))}
      </div>

      {/* Event log */}
      <div style={{ background: '#FFFFFF', border: BD }}>
        <div style={{ padding: '14px 20px', borderBottom: BD, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>Event Log</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {['All', 'Info', 'Warning', 'Critical'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '4px 12px', fontSize: 10, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase',
                  background: filter === f ? A : 'transparent',
                  border: filter === f ? `1px solid ${A}` : BD,
                  color: filter === f ? '#06080D' : '#6B7280',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Event ID', 'Time', 'User', 'Type', 'Severity', 'Description'].map((h) => (
                <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#374151', borderBottom: BD, fontFamily: 'var(--font-mono)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr
                key={e.id}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                onMouseEnter={(ev) => (ev.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                onMouseLeave={(ev) => (ev.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '11px 20px', fontSize: 11, color: '#374151', fontFamily: 'var(--font-mono)' }}>{e.id}</td>
                <td style={{ padding: '11px 20px', fontSize: 11, color: '#4B5563', fontFamily: 'var(--font-mono)' }}>{e.time}</td>
                <td style={{ padding: '11px 20px', fontSize: 12, color: '#9CA3AF' }}>{e.user}</td>
                <td style={{ padding: '11px 20px' }}>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: A, letterSpacing: '0.06em' }}>{e.type}</span>
                </td>
                <td style={{ padding: '11px 20px' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', background: SEV[e.severity]?.bg, color: SEV[e.severity]?.color, fontFamily: 'var(--font-mono)' }}>
                    {e.severity}
                  </span>
                </td>
                <td style={{ padding: '11px 20px', fontSize: 12, color: '#D1D5DB' }}>{e.msg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
