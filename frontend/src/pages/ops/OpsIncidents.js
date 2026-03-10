import React, { useState } from 'react';

// GS-WSF — Operational Control: Incident Center
const STATUS_FILTERS = ['All', 'Open', 'Investigating', 'Resolved', 'Closed'];

const INCIDENTS = [
  {
    id: 'INC-0003',
    title: 'Pipeline runner timeout causing build failures',
    severity: 'HIGH',
    status: 'Investigating',
    service: 'Pipeline Engine',
    assignee: 'DevOps Team',
    opened: '2026-03-09T07:49:00Z',
    updated: '2026-03-09T08:00:00Z',
    detail: 'Multiple builds timing out after 47 seconds. Runner pool exhausted during peak load.',
  },
  {
    id: 'INC-0002',
    title: 'API Gateway elevated latency — upstream timeout',
    severity: 'MEDIUM',
    status: 'Resolved',
    service: 'API Gateway',
    assignee: 'Backend Team',
    opened: '2026-03-09T07:00:00Z',
    updated: '2026-03-09T07:45:00Z',
    detail: 'Upstream service responded slowly causing p95 latency spike to 1,240ms. Root cause: cold start after scaled-down.',
  },
  {
    id: 'INC-0001',
    title: 'Unauthorized access attempt — admin panel',
    severity: 'HIGH',
    status: 'Closed',
    service: 'Security Monitor',
    assignee: 'Security Team',
    opened: '2026-03-09T06:30:00Z',
    updated: '2026-03-09T07:10:00Z',
    detail: 'Single request to /admin/ops with no valid session. IP blocked. No data accessed.',
  },
];

const SEV_STYLES = {
  CRITICAL: { bg: '#7F1D1D', color: '#FCA5A5' },
  HIGH:     { bg: '#FEF2F2', color: '#DC2626' },
  MEDIUM:   { bg: '#FFFBEB', color: '#D97706' },
  LOW:      { bg: '#EFF6FF', color: '#2563EB' },
};

const STATUS_STYLES = {
  Open:          { bg: '#FEF2F2', color: '#DC2626' },
  Investigating: { bg: '#FFFBEB', color: '#D97706' },
  Resolved:      { bg: '#F0FDF4', color: '#16A34A' },
  Closed:        { bg: '#F9FAFB', color: '#6B7280' },
};

const OpsIncidents = () => {
  const [filter, setFilter] = useState('All');
  const [expanded, setExpanded] = useState(null);

  const visible = filter === 'All' ? INCIDENTS : INCIDENTS.filter((i) => i.status === filter);

  const openCount  = INCIDENTS.filter((i) => i.status === 'Open' || i.status === 'Investigating').length;
  const highCount  = INCIDENTS.filter((i) => i.severity === 'HIGH' || i.severity === 'CRITICAL').length;

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
          Incident Center
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7, maxWidth: 560 }}>
          Detect, classify, assign, resolve, and document every operational incident on the platform.
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          border: '1px solid #E5E7EB', borderRight: 'none',
          marginBottom: 28,
        }}
        className="ops-stats-grid"
      >
        {[
          { label: 'Total (30d)',  value: INCIDENTS.length,  color: '#111827' },
          { label: 'Active',       value: openCount,          color: '#DC2626' },
          { label: 'High / Crit.', value: highCount,          color: '#D97706' },
          { label: 'Resolved',     value: INCIDENTS.filter((i) => i.status === 'Resolved' || i.status === 'Closed').length, color: '#16A34A' },
        ].map((s) => (
          <div key={s.label} style={{ background: '#FFFFFF', padding: '18px 20px', borderRight: '1px solid #E5E7EB' }}>
            <div
              style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: '#9CA3AF',
                fontFamily: 'var(--font-mono)', marginBottom: 6,
              }}
            >
              {s.label}
            </div>
            <div style={{ fontSize: 30, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              background: filter === f ? '#A81D37' : '#F9FAFB',
              color: filter === f ? '#FFFFFF' : '#6B7280',
              border: filter === f ? '1px solid #A81D37' : '1px solid #E5E7EB',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Incident list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {visible.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9CA3AF', fontSize: 13, background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
            No incidents match the selected filter.
          </div>
        )}
        {visible.map((inc) => {
          const sc = SEV_STYLES[inc.severity] || { bg: '#F9FAFB', color: '#6B7280' };
          const stc = STATUS_STYLES[inc.status] || { bg: '#F9FAFB', color: '#6B7280' };
          const isOpen = expanded === inc.id;
          return (
            <div key={inc.id} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
              <button
                onClick={() => setExpanded(isOpen ? null : inc.id)}
                style={{
                  width: '100%', background: 'none', border: 'none',
                  cursor: 'pointer', padding: '16px 20px', textAlign: 'left',
                  display: 'flex', alignItems: 'flex-start', gap: 16,
                }}
              >
                {/* ID + Severity */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0, minWidth: 80 }}>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#9CA3AF' }}>{inc.id}</span>
                  <span
                    style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
                      padding: '2px 6px', background: sc.bg, color: sc.color,
                      textAlign: 'center',
                    }}
                  >
                    {inc.severity}
                  </span>
                </div>

                {/* Title + Meta */}
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{inc.title}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 11, color: '#6B7280' }}>
                    <span>{inc.service}</span>
                    <span>Assignee: {inc.assignee}</span>
                    <span>Opened: {inc.opened.replace('T', ' ').replace('Z', '')}</span>
                  </div>
                </div>

                {/* Status */}
                <span
                  style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                    padding: '4px 10px', background: stc.bg, color: stc.color,
                    textTransform: 'uppercase', flexShrink: 0, alignSelf: 'center',
                  }}
                >
                  {inc.status}
                </span>
                <span style={{ fontSize: 14, color: '#9CA3AF', alignSelf: 'center', flexShrink: 0 }}>
                  {isOpen ? '▲' : '▼'}
                </span>
              </button>

              {isOpen && (
                <div style={{ padding: '0 20px 16px', borderTop: '1px solid #F3F4F6' }}>
                  <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.7, margin: '16px 0 0' }}>
                    {inc.detail}
                  </p>
                  <div style={{ marginTop: 12, fontSize: 11, color: '#9CA3AF', fontFamily: 'var(--font-mono)' }}>
                    Updated: {inc.updated.replace('T', ' ').replace('Z', '')}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OpsIncidents;
