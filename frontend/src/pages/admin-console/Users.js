import React, { useState } from 'react';

const A = '#D4AF37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#F9FAFB', border: BD, padding: '20px 24px' };

const USERS = [
  { id: 'USR-001', name: 'Samuel Realm',     email: 'ofidohub@gmail.com',    role: 'Superadmin', status: 'Active',    joined: '2024-01-10' },
  { id: 'USR-002', name: 'Atonix Dev',        email: 'dev@atonix.io',         role: 'Admin',       status: 'Active',    joined: '2024-02-14' },
  { id: 'USR-003', name: 'Jordan Okafor',     email: 'jordan@atonix.io',      role: 'Staff',       status: 'Active',    joined: '2024-03-20' },
  { id: 'USR-004', name: 'Clara Mensah',      email: 'clara.m@atonix.io',     role: 'Developer',   status: 'Active',    joined: '2024-04-05' },
  { id: 'USR-005', name: 'Tobias Klein',      email: 'tobias@atonix.io',      role: 'Developer',   status: 'Active',    joined: '2024-05-12' },
  { id: 'USR-006', name: 'Zara Adekunle',     email: 'zara.a@atonix.io',      role: 'Viewer',      status: 'Suspended', joined: '2024-06-18' },
  { id: 'USR-007', name: 'Mihail Popescu',    email: 'mihail@external.io',    role: 'Viewer',      status: 'Active',    joined: '2024-07-01' },
  { id: 'USR-008', name: 'Priya Nair',        email: 'priya@atonix.io',       role: 'Staff',       status: 'Active',    joined: '2024-08-09' },
];

const ROLE_COLOR = {
  Superadmin: '#D4AF37',
  Admin:      '#A78BFA',
  Staff:      '#38BDF8',
  Developer:  '#34D399',
  Viewer:     '#6B7280',
};

const STATUS_COLOR = { Active: '#22C55E', Suspended: '#EF4444', Pending: '#F59E0B' };

export default function Users() {
  const [search, setSearch] = useState('');

  const filtered = USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '32px 36px', color: '#1F2937', minHeight: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', color: A, textTransform: 'uppercase', marginBottom: 6 }}>
            USM — User Management
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111827' }}>Platform Users</h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '6px 0 0' }}>
            Full lifecycle management of all registered platform accounts.
          </p>
        </div>
        <button
          style={{
            padding: '9px 20px', background: A, border: 'none', color: '#06080D',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          + Invite User
        </button>
      </div>

      {/* Stats */}
      <div className="console-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Users',     value: '847',  delta: '+12 this month' },
          { label: 'Active',          value: '791',  delta: '93.4% of total' },
          { label: 'Suspended',       value: '34',   delta: '4.0% of total' },
          { label: 'New This Month',  value: '22',   delta: '↑ 18% vs last' },
        ].map((s) => (
          <div key={s.label} style={CARD}>
            <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>
              {s.label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#4B5563', marginTop: 4 }}>{s.delta}</div>
          </div>
        ))}
      </div>

      {/* Search + Table */}
      <div style={{ background: '#FFFFFF', border: BD }}>
        <div style={{ padding: '14px 20px', borderBottom: BD, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>All Users</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users…"
            style={{
              background: '#FFFFFF', border: BD,
              color: '#374151', fontSize: 12, padding: '6px 12px',
              outline: 'none', fontFamily: 'inherit', width: 220,
            }}
          />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['ID', 'Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '10px 20px', textAlign: 'left', fontSize: 10,
                    fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: '#374151', borderBottom: BD, fontFamily: 'var(--font-mono)',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr
                key={u.id}
                style={{ borderBottom: 'rgba(255,255,255,0.04) solid 1px' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#F0F9FF')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '12px 20px', fontSize: 11, color: '#374151', fontFamily: 'var(--font-mono)' }}>{u.id}</td>
                <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 600, color: '#111827' }}>{u.name}</td>
                <td style={{ padding: '12px 20px', fontSize: 12, color: '#6B7280' }}>{u.email}</td>
                <td style={{ padding: '12px 20px' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: ROLE_COLOR[u.role] || '#6B7280', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '12px 20px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLOR[u.status] || '#6B7280', display: 'inline-block' }} />
                    <span style={{ color: STATUS_COLOR[u.status] || '#6B7280' }}>{u.status}</span>
                  </span>
                </td>
                <td style={{ padding: '12px 20px', fontSize: 11, color: '#4B5563' }}>{u.joined}</td>
                <td style={{ padding: '12px 20px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['Edit', u.status === 'Active' ? 'Suspend' : 'Activate'].map((act) => (
                      <button
                        key={act}
                        style={{
                          fontSize: 10, padding: '4px 10px', cursor: 'pointer',
                          background: 'transparent', fontFamily: 'inherit', fontWeight: 700,
                          letterSpacing: '0.06em', textTransform: 'uppercase',
                          color: act === 'Suspend' ? '#EF4444' : act === 'Activate' ? '#22C55E' : A,
                          border: `1px solid ${act === 'Suspend' ? 'rgba(239,68,68,0.3)' : act === 'Activate' ? 'rgba(34,197,94,0.3)' : 'rgba(212,175,55,0.3)'}`,
                        }}
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '12px 20px', borderTop: BD, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: '#4B5563' }}>Showing {filtered.length} of {USERS.length} users</span>
          <span style={{ fontSize: 11, color: A, cursor: 'pointer' }}>Export CSV</span>
        </div>
      </div>
    </div>
  );
}
