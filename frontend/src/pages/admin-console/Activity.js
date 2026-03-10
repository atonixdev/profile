import React from 'react';

const A = '#D4AF37';
const BD = '1px solid rgba(212,175,55,0.12)';
const CARD = { background: 'rgba(255,255,255,0.02)', border: BD, padding: '20px 24px' };

const ACTIVITY = [
  { id: 'ADM-2091', ts: '2026-03-09 11:42', admin: 'Samuel Realm',   action: 'Suspended user account',      target: 'zara.a@atonix.io',   context: 'Policy violation'      },
  { id: 'ADM-2090', ts: '2026-03-09 11:30', admin: 'Atonix Dev',     action: 'Rotated API key',              target: 'api-key-0044',        context: 'Scheduled rotation'    },
  { id: 'ADM-2089', ts: '2026-03-09 10:31', admin: 'Samuel Realm',   action: 'Assigned role Staff',          target: 'jordan@atonix.io',    context: 'Onboarding'            },
  { id: 'ADM-2088', ts: '2026-03-09 09:44', admin: 'Jordan Okafor',  action: 'Deleted pipeline',             target: 'pipeline-77b',        context: 'Stale resource cleanup'},
  { id: 'ADM-2087', ts: '2026-03-09 09:12', admin: 'Priya Nair',     action: 'Updated config: mfa_required', target: 'auth.config',         context: 'Security hardening'    },
  { id: 'ADM-2086', ts: '2026-03-08 22:41', admin: 'Samuel Realm',   action: 'Blocked IP address',           target: '41.80.3.22',          context: 'Brute-force detected'  },
  { id: 'ADM-2085', ts: '2026-03-08 20:05', admin: 'Atonix Dev',     action: 'Created webhook',              target: 'wh-04',               context: 'Monitoring integration'},
  { id: 'ADM-2084', ts: '2026-03-08 18:30', admin: 'System',         action: 'Auto-backup completed',        target: 'db.sqlite3',          context: 'Scheduled job'         },
];

export default function Activity() {
  return (
    <div style={{ padding: '32px 36px', color: '#F9FAFB', minHeight: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', color: A, textTransform: 'uppercase', marginBottom: 6 }}>
          ACT — Admin Activity Logs
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#FFFFFF' }}>Admin Activity</h1>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '6px 0 0' }}>
          All administrator actions, tagged by actor, resource, and context. Used for internal accountability.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Actions Today',   value: '14'  },
          { label: 'Active Admins',   value: '4'   },
          { label: 'Last Incident',   value: '7d ago' },
          { label: 'Pending Reviews', value: '0'   },
        ].map((s) => (
          <div key={s.label} style={CARD}>
            <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#FFFFFF' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Admin overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { name: 'Samuel Realm',  role: 'Superadmin', actions: 312, last: '11:42 today' },
          { name: 'Atonix Dev',    role: 'Admin',       actions: 148, last: '11:30 today' },
          { name: 'Jordan Okafor', role: 'Staff',        actions: 84,  last: '09:44 today' },
          { name: 'Priya Nair',    role: 'Staff',        actions: 61,  last: '09:12 today' },
        ].map((a) => (
          <div key={a.name} style={{ ...CARD, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', marginBottom: 3 }}>{a.name}</div>
              <div style={{ fontSize: 11, color: '#4B5563' }}>{a.role} · Last active: {a.last}</div>
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: A }}>{a.actions}</span>
          </div>
        ))}
      </div>

      {/* Activity log */}
      <div style={{ background: 'rgba(255,255,255,0.015)', border: BD }}>
        <div style={{ padding: '14px 20px', borderBottom: BD }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF' }}>Recent Activity</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Ref', 'Timestamp', 'Admin', 'Action', 'Target', 'Context'].map((h) => (
                <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#374151', borderBottom: BD, fontFamily: 'var(--font-mono)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ACTIVITY.map((a) => (
              <tr
                key={a.id}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '11px 20px', fontSize: 11, color: '#374151', fontFamily: 'var(--font-mono)' }}>{a.id}</td>
                <td style={{ padding: '11px 20px', fontSize: 11, color: '#4B5563', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{a.ts}</td>
                <td style={{ padding: '11px 20px', fontSize: 12, fontWeight: 600, color: '#9CA3AF' }}>{a.admin}</td>
                <td style={{ padding: '11px 20px', fontSize: 12, color: '#D1D5DB' }}>{a.action}</td>
                <td style={{ padding: '11px 20px', fontSize: 11, color: '#6B7280', fontFamily: 'var(--font-mono)' }}>{a.target}</td>
                <td style={{ padding: '11px 20px', fontSize: 11, color: '#4B5563' }}>{a.context}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
