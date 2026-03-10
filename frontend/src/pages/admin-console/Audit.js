import React, { useState } from 'react';

const A = '#D4AF37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#F9FAFB', border: BD, padding: '20px 24px' };

const LOGS = [
  { id: 'LOG-19041', ts: '2026-03-09 11:42:08', actor: 'ofidohub@gmail.com',  action: 'user.update',           target: 'zara.a@atonix.io',     result: 'Success' },
  { id: 'LOG-19040', ts: '2026-03-09 11:30:14', actor: 'dev@atonix.io',       action: 'key.rotate',            target: 'api-key-0044',         result: 'Success' },
  { id: 'LOG-19039', ts: '2026-03-09 10:55:00', actor: 'system',              action: 'session.purge',         target: 'expired_sessions',     result: 'Success' },
  { id: 'LOG-19038', ts: '2026-03-09 10:31:22', actor: 'ofidohub@gmail.com',  action: 'role.assign',           target: 'jordan@atonix.io',     result: 'Success' },
  { id: 'LOG-19037', ts: '2026-03-09 09:44:51', actor: 'jordan@atonix.io',    action: 'pipeline.delete',       target: 'pipeline-77b',         result: 'Success' },
  { id: 'LOG-19036', ts: '2026-03-09 09:12:07', actor: 'priya@atonix.io',     action: 'config.write',          target: 'auth.mfa_required',    result: 'Success' },
  { id: 'LOG-19035', ts: '2026-03-09 08:30:00', actor: 'system',              action: 'backup.create',         target: 'db.sqlite3',           result: 'Success' },
  { id: 'LOG-19034', ts: '2026-03-08 23:17:43', actor: 'tobias@atonix.io',    action: 'user.suspend',          target: 'external@domain.com',  result: 'Denied'  },
  { id: 'LOG-19033', ts: '2026-03-08 22:05:12', actor: 'system',              action: 'ip.block',              target: '41.80.3.22',           result: 'Success' },
  { id: 'LOG-19032', ts: '2026-03-08 20:41:00', actor: 'priya@atonix.io',     action: 'mfa.update',            target: 'self',                 result: 'Success' },
];

export default function Audit() {
  const [dateFilter, setDateFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const filtered = LOGS.filter(
    (l) =>
      (!dateFilter || l.ts.includes(dateFilter)) &&
      (!actionFilter || l.action.toLowerCase().includes(actionFilter.toLowerCase()))
  );

  return (
    <div style={{ padding: '32px 36px', color: '#1F2937', minHeight: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', color: A, textTransform: 'uppercase', marginBottom: 6 }}>
            AUD — Audit Logs & Compliance
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111827' }}>Audit Trail</h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '6px 0 0' }}>
            Immutable record of all administrative and platform actions. Every entry is append-only.
          </p>
        </div>
        <button
          style={{
            padding: '9px 20px', background: 'transparent', border: `1px solid ${A}`, color: A,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Export Report
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Log Entries', value: '19,041' },
          { label: "Today's Actions",   value: '38'      },
          { label: 'Denial Events',     value: '4'       },
          { label: 'Compliance Score',  value: '98%'     },
        ].map((s) => (
          <div key={s.label} style={CARD}>
            <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter + Table */}
      <div style={{ background: '#FFFFFF', border: BD }}>
        <div style={{ padding: '14px 20px', borderBottom: BD, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>Audit Log</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              placeholder="Filter by date…"
              style={{
                background: '#FFFFFF', border: BD, color: '#111827',
                fontSize: 12, padding: '6px 12px', outline: 'none', fontFamily: 'inherit', width: 160,
              }}
            />
            <input
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              placeholder="Filter by action…"
              style={{
                background: '#FFFFFF', border: BD, color: '#111827',
                fontSize: 12, padding: '6px 12px', outline: 'none', fontFamily: 'inherit', width: 160,
              }}
            />
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Log ID', 'Timestamp', 'Actor', 'Action', 'Target', 'Result'].map((h) => (
                <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#374151', borderBottom: BD, fontFamily: 'var(--font-mono)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr
                key={l.id}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#F0F9FF')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '11px 20px', fontSize: 11, color: '#374151', fontFamily: 'var(--font-mono)' }}>{l.id}</td>
                <td style={{ padding: '11px 20px', fontSize: 11, color: '#4B5563', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{l.ts}</td>
                <td style={{ padding: '11px 20px', fontSize: 12, color: '#9CA3AF' }}>{l.actor}</td>
                <td style={{ padding: '11px 20px' }}>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: A, letterSpacing: '0.04em' }}>{l.action}</span>
                </td>
                <td style={{ padding: '11px 20px', fontSize: 12, color: '#6B7280', fontFamily: 'var(--font-mono)' }}>{l.target}</td>
                <td style={{ padding: '11px 20px' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: l.result === 'Success' ? '#22C55E' : '#EF4444', fontFamily: 'var(--font-mono)' }}>
                    {l.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '12px 20px', borderTop: BD }}>
          <span style={{ fontSize: 11, color: '#374151', fontFamily: 'var(--font-mono)' }}>
            {filtered.length} entries · Immutable · Append-only storage
          </span>
        </div>
      </div>
    </div>
  );
}
