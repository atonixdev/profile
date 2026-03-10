import React, { useState } from 'react';

const A = '#D4AF37';
const BD = '1px solid rgba(212,175,55,0.12)';
const CARD = { background: 'rgba(255,255,255,0.02)', border: BD, padding: '20px 24px' };

const ROLES = [
  {
    id: 'role-superadmin',
    name: 'Superadmin',
    color: '#D4AF37',
    users: 1,
    description: 'Unrestricted platform access. Full governance authority.',
    permissions: ['all.*'],
  },
  {
    id: 'role-admin',
    name: 'Admin',
    color: '#A78BFA',
    users: 3,
    description: 'Full access to all admin modules except system-level settings.',
    permissions: ['users.*', 'roles.read', 'audit.read', 'billing.*', 'config.write'],
  },
  {
    id: 'role-staff',
    name: 'Staff',
    color: '#38BDF8',
    users: 14,
    description: 'Operational access. Can manage services and view logs.',
    permissions: ['ops.*', 'dashboard.read', 'logs.read', 'incidents.write'],
  },
  {
    id: 'role-developer',
    name: 'Developer',
    color: '#34D399',
    users: 312,
    description: 'Developer dashboard, pipelines, and project access.',
    permissions: ['dashboard.*', 'pipelines.*', 'registries.read', 'workspaces.*'],
  },
  {
    id: 'role-viewer',
    name: 'Viewer',
    color: '#6B7280',
    users: 517,
    description: 'Read-only access to public portfolio and documentation.',
    permissions: ['portfolio.read', 'docs.read'],
  },
];

export default function Roles() {
  const [selected, setSelected] = useState(ROLES[0]);

  return (
    <div style={{ padding: '32px 36px', color: '#F9FAFB', minHeight: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', color: A, textTransform: 'uppercase', marginBottom: 6 }}>
            RPM — Roles & Permissions
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#FFFFFF' }}>Access Control</h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '6px 0 0' }}>
            Define roles, assign permissions, and enforce least-privilege access across the platform.
          </p>
        </div>
        <button
          style={{
            padding: '9px 20px', background: A, border: 'none', color: '#06080D',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          + Create Role
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Roles',       value: '5'  },
          { label: 'Active Assignments', value: '847' },
          { label: 'Custom Roles',       value: '2'  },
          { label: 'Total Permissions',  value: '38' },
        ].map((s) => (
          <div key={s.label} style={CARD}>
            <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#FFFFFF' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Role grid + detail */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
        {/* Role list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ROLES.map((role) => (
            <div
              key={role.id}
              onClick={() => setSelected(role)}
              style={{
                padding: '14px 18px', cursor: 'pointer',
                background: selected.id === role.id ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.02)',
                border: selected.id === role.id ? `1px solid rgba(212,175,55,0.35)` : BD,
                transition: 'background 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>{role.name}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: role.color, fontFamily: 'var(--font-mono)' }}>
                  {role.users} users
                </span>
              </div>
              <p style={{ fontSize: 11, color: '#4B5563', margin: '4px 0 0', lineHeight: 1.5 }}>{role.description.slice(0, 55)}…</p>
            </div>
          ))}
        </div>

        {/* Role detail */}
        <div style={{ background: 'rgba(255,255,255,0.015)', border: BD, padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', color: selected.color, textTransform: 'uppercase', marginBottom: 4 }}>
                Role Detail
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#FFFFFF' }}>{selected.name}</h2>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ padding: '7px 16px', background: 'transparent', border: BD, color: A, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.08em' }}>
                Edit Role
              </button>
              {selected.id !== 'role-superadmin' && (
                <button style={{ padding: '7px 16px', background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.08em' }}>
                  Delete
                </button>
              )}
            </div>
          </div>

          <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 24, lineHeight: 1.7 }}>{selected.description}</p>

          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#374151', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
              Permission Set
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {selected.permissions.map((p) => (
                <span
                  key={p}
                  style={{
                    fontSize: 11, fontFamily: 'var(--font-mono)', padding: '4px 10px',
                    background: 'rgba(212,175,55,0.08)', border: `1px solid rgba(212,175,55,0.2)`,
                    color: A, letterSpacing: '0.04em',
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 28, paddingTop: 20, borderTop: BD }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#374151', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
              Assigned Users ({selected.users})
            </div>
            <div style={{ fontSize: 12, color: '#4B5563' }}>
              {selected.users === 0
                ? 'No users assigned to this role.'
                : `${selected.users} user${selected.users > 1 ? 's' : ''} currently assigned.`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
