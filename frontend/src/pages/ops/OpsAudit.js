import React, { useState } from 'react';

// GS-WSF — Operational Control: Audit Center
const ACTION_FILTERS = ['All', 'Login', 'Logout', 'Create', 'Update', 'Delete', 'Deploy', 'Permission'];

const AUDIT_ENTRIES = [
  { id: 'AUD-0021', ts: '2026-03-09T08:01:05Z', actor: 'admin@atonixdev.io',   action: 'Deploy',     resource: 'Environment: production', detail: 'Deployed v4.2.1 to production environment', outcome: 'Success' },
  { id: 'AUD-0020', ts: '2026-03-09T07:58:30Z', actor: 'dev_user_7',           action: 'Create',     resource: 'Pipeline: atonixdev/api',  detail: 'New pipeline run triggered via git push',   outcome: 'Success' },
  { id: 'AUD-0019', ts: '2026-03-09T07:55:31Z', actor: 'admin@atonixdev.io',   action: 'Permission', resource: 'User: dev_user_7',         detail: 'Role elevated from Developer to Admin',      outcome: 'Success' },
  { id: 'AUD-0018', ts: '2026-03-09T07:48:12Z', actor: 'ops_user_2',           action: 'Update',     resource: 'Model: sentiment-v2',      detail: 'Model version v2.1.0 updated with new weights', outcome: 'Success' },
  { id: 'AUD-0017', ts: '2026-03-09T07:40:00Z', actor: 'system',               action: 'Create',     resource: 'Audit Log',                detail: 'Automated log retention policy executed',   outcome: 'Success' },
  { id: 'AUD-0016', ts: '2026-03-09T07:35:44Z', actor: 'admin@atonixdev.io',   action: 'Delete',     resource: 'Pipeline: old-worker',     detail: 'Decommissioned legacy pipeline runner',      outcome: 'Success' },
  { id: 'AUD-0015', ts: '2026-03-09T07:30:02Z', actor: 'dev_user_3',           action: 'Login',      resource: 'Auth Service',             detail: 'Successful login from 198.51.100.22',        outcome: 'Success' },
  { id: 'AUD-0014', ts: '2026-03-09T07:25:19Z', actor: 'pipeline-runner-03',   action: 'Create',     resource: 'Artifact: build-223',      detail: 'Build artifact created and stored in registry', outcome: 'Success' },
  { id: 'AUD-0013', ts: '2026-03-09T07:18:55Z', actor: 'dev_user_7',           action: 'Update',     resource: 'Environment: staging',     detail: 'Environment variable DB_POOL_SIZE updated',  outcome: 'Success' },
  { id: 'AUD-0012', ts: '2026-03-09T07:10:40Z', actor: 'admin@atonixdev.io',   action: 'Logout',     resource: 'Auth Service',             detail: 'Admin session terminated',                  outcome: 'Success' },
];

const ACTION_STYLES = {
  Login:      { bg: '#EFF6FF', color: '#2563EB' },
  Logout:     { bg: '#F9FAFB', color: '#4B5563' },
  Create:     { bg: '#F0FDF4', color: '#16A34A' },
  Update:     { bg: '#FFFBEB', color: '#D97706' },
  Delete:     { bg: '#FEF2F2', color: '#DC2626' },
  Deploy:     { bg: '#F5F3FF', color: '#7C3AED' },
  Permission: { bg: '#FFF7ED', color: '#C2410C' },
};

const OpsAudit = () => {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const visible = AUDIT_ENTRIES.filter((e) => {
    if (filter !== 'All' && e.action !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!e.actor.toLowerCase().includes(q) && !e.resource.toLowerCase().includes(q) && !e.detail.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: '#A81D37',
            fontFamily: 'var(--font-mono)', marginBottom: 8,
          }}
        >
          Operational Control
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', marginBottom: 8, lineHeight: 1.2 }}>
          Audit Center
        </h1>
        <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.7, maxWidth: 560 }}>
          Immutable, indexed record of every action performed on the AtonixDev platform.
          Every change, login, deployment, and permission modification is preserved.
        </p>
      </div>

      {/* Compliance notice */}
      <div
        style={{
          background: '#0F172A', padding: '14px 20px',
          borderLeft: '3px solid #A81D37', marginBottom: 28,
          display: 'flex', alignItems: 'center', gap: 12,
        }}
      >
        <span
          style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#A81D37',
            fontFamily: 'var(--font-mono)', flexShrink: 0,
          }}
        >
          Immutable
        </span>
        <span style={{ fontSize: 12, color: '#4B5563', lineHeight: 1.5 }}>
          Audit logs are write-once. No entry may be modified or deleted after creation. Retention: 7 years.
        </span>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
          border: '1px solid #E5E7EB', borderRight: 'none',
          marginBottom: 28,
        }}
        className="ops-stats-grid"
      >
        {[
          { label: 'Total Entries (24h)', value: AUDIT_ENTRIES.length, color: '#111827' },
          { label: 'Deploy Actions',      value: AUDIT_ENTRIES.filter((e) => e.action === 'Deploy').length,     color: '#7C3AED' },
          { label: 'Permission Changes',  value: AUDIT_ENTRIES.filter((e) => e.action === 'Permission').length, color: '#C2410C' },
          { label: 'Delete Actions',      value: AUDIT_ENTRIES.filter((e) => e.action === 'Delete').length,     color: '#DC2626' },
        ].map((s) => (
          <div key={s.label} style={{ background: '#FFFFFF', padding: '18px 20px', borderRight: '1px solid #E5E7EB' }}>
            <div
              style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: '#4B5563',
                fontFamily: 'var(--font-mono)', marginBottom: 6,
              }}
            >
              {s.label}
            </div>
            <div style={{ fontSize: 30, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search actor, resource, detail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '8px 14px', fontSize: 13, border: '1px solid #E5E7EB',
            fontFamily: 'inherit', background: '#FFFFFF', color: '#111827',
            outline: 'none', minWidth: 260,
          }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {ACTION_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 12px', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                background: filter === f ? '#A81D37' : '#F9FAFB',
                color: filter === f ? '#FFFFFF' : '#4B5563',
                border: filter === f ? '1px solid #A81D37' : '1px solid #E5E7EB',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Log count */}
      <div style={{ fontSize: 11, color: '#4B5563', fontFamily: 'var(--font-mono)', marginBottom: 12, letterSpacing: '0.06em' }}>
        SHOWING {visible.length} OF {AUDIT_ENTRIES.length} ENTRIES
      </div>

      {/* Audit table */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
        <div
          style={{
            display: 'grid', gridTemplateColumns: '100px 150px 160px 1fr 1.5fr 1fr 80px',
            padding: '10px 20px',
            background: '#F9FAFB', borderBottom: '1px solid #E5E7EB',
          }}
        >
          {['Audit ID', 'Action', 'Actor', 'Resource', 'Detail', 'Timestamp', 'Outcome'].map((h) => (
            <div
              key={h}
              style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: '#4B5563',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {h}
            </div>
          ))}
        </div>

        {visible.map((e, i) => {
          const ac = ACTION_STYLES[e.action] || { bg: '#F9FAFB', color: '#4B5563' };
          return (
            <div
              key={e.id}
              style={{
                display: 'grid', gridTemplateColumns: '100px 150px 160px 1fr 1.5fr 1fr 80px',
                padding: '12px 20px',
                borderBottom: i < visible.length - 1 ? '1px solid #F3F4F6' : 'none',
                alignItems: 'start',
              }}
            >
              <span style={{ fontSize: 10, color: '#4B5563', fontFamily: 'var(--font-mono)', paddingTop: 2 }}>{e.id}</span>
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center',
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                  padding: '3px 8px', background: ac.bg, color: ac.color,
                  textTransform: 'uppercase', alignSelf: 'start', width: 'fit-content',
                }}
              >
                {e.action}
              </span>
              <span style={{ fontSize: 11, color: '#1F2937', fontFamily: 'var(--font-mono)' }}>{e.actor}</span>
              <span style={{ fontSize: 12, color: '#1F2937' }}>{e.resource}</span>
              <span style={{ fontSize: 12, color: '#4B5563', lineHeight: 1.5 }}>{e.detail}</span>
              <span style={{ fontSize: 10, color: '#4B5563', fontFamily: 'var(--font-mono)' }}>
                {e.ts.replace('T', ' ').replace('Z', '')}
              </span>
              <span
                style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
                  color: '#16A34A', textTransform: 'uppercase', fontFamily: 'var(--font-mono)',
                }}
              >
                {e.outcome}
              </span>
            </div>
          );
        })}

        {visible.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#4B5563', fontSize: 13 }}>
            No audit entries match the current filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default OpsAudit;
