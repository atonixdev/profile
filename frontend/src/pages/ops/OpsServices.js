import React, { useState } from 'react';

// GS-WSF — Operational Control: Service Health
const SERVICES = [
  { name: 'API Gateway',            category: 'Infrastructure',  uptime: '99.99%', latency: '—',   status: 'Operational', color: '#22C55E' },
  { name: 'Authentication Service', category: 'Platform',        uptime: '99.99%', latency: '—',   status: 'Operational', color: '#22C55E' },
  { name: 'Authorization Service',  category: 'Platform',        uptime: '99.99%', latency: '—',   status: 'Operational', color: '#22C55E' },
  { name: 'User Management',        category: 'Platform',        uptime: '99.99%', latency: '—',   status: 'Operational', color: '#22C55E' },
  { name: 'Pipeline Engine',        category: 'Developer',       uptime: '—',      latency: '—',   status: 'Operational', color: '#22C55E' },
  { name: 'Container Runtime',      category: 'Developer',       uptime: '—',      latency: '—',   status: 'Operational', color: '#22C55E' },
  { name: 'Artifact Registry',      category: 'Developer',       uptime: '—',      latency: '—',   status: 'Operational', color: '#22C55E' },
  { name: 'Environment Manager',    category: 'Developer',       uptime: '—',      latency: '—',   status: 'Operational', color: '#22C55E' },
  { name: 'Model Flow Engine',      category: 'Intelligence',    uptime: '—',      latency: '—',   status: 'Operational', color: '#22C55E' },
  { name: 'Model Registry',         category: 'Intelligence',    uptime: '—',      latency: '—',   status: 'Operational', color: '#22C55E' },
  { name: 'Metrics Collector',      category: 'Observability',   uptime: '—',      latency: '—',   status: 'Operational', color: '#22C55E' },
  { name: 'Log Aggregator',         category: 'Observability',   uptime: '—',      latency: '—',   status: 'Operational', color: '#22C55E' },
  { name: 'Trace Collector',        category: 'Observability',   uptime: '—',      latency: '—',   status: 'Operational', color: '#22C55E' },
  { name: 'Audit Service',          category: 'Security',        uptime: '99.99%', latency: '—',   status: 'Operational', color: '#22C55E' },
  { name: 'Security Monitor',       category: 'Security',        uptime: '99.99%', latency: '—',   status: 'Operational', color: '#22C55E' },
  { name: 'Notification Router',    category: 'Operations',      uptime: '—',      latency: '—',   status: 'Operational', color: '#22C55E' },
  { name: 'Incident Manager',       category: 'Operations',      uptime: '—',      latency: '—',   status: 'Operational', color: '#22C55E' },
  { name: 'Policy Engine',          category: 'Governance',      uptime: '—',      latency: '—',   status: 'Operational', color: '#22C55E' },
];

const CATEGORIES = ['All', 'Infrastructure', 'Platform', 'Developer', 'Intelligence', 'Observability', 'Security', 'Operations', 'Governance'];

const STATUS_COLORS = {
  Operational:    '#22C55E',
  Degraded:       '#F59E0B',
  'Major Outage': '#EF4444',
  Maintenance:    '#6B7280',
};

const OpsServices = () => {
  const [filter, setFilter] = useState('All');

  const visible = filter === 'All' ? SERVICES : SERVICES.filter((s) => s.category === filter);

  const counts = {
    operational: SERVICES.filter((s) => s.status === 'Operational').length,
    total: SERVICES.length,
  };

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
          Service Health
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7, maxWidth: 560 }}>
          Live operational status for every registered AtonixDev platform service.
        </p>
      </div>

      {/* Summary bar */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 24,
          padding: '14px 20px', background: '#FFFFFF',
          border: '1px solid #E5E7EB', marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              display: 'inline-block', width: 8, height: 8,
              borderRadius: '50%', background: '#22C55E',
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
            {counts.operational} / {counts.total} Services Operational
          </span>
        </div>
        <div style={{ height: 16, width: 1, background: '#E5E7EB' }} />
        <span
          style={{
            fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700,
            letterSpacing: '0.1em', color: '#22C55E', textTransform: 'uppercase',
          }}
        >
          All Systems Nominal
        </span>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            style={{
              padding: '6px 14px', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              background: filter === c ? '#A81D37' : '#F9FAFB',
              color: filter === c ? '#FFFFFF' : '#6B7280',
              border: filter === c ? '1px solid #A81D37' : '1px solid #E5E7EB',
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Service table */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
        {/* Table header */}
        <div
          style={{
            display: 'grid', gridTemplateColumns: '3fr 1.5fr 1fr 1fr 1.5fr',
            padding: '10px 20px',
            background: '#F9FAFB', borderBottom: '1px solid #E5E7EB',
          }}
        >
          {['Service', 'Category', 'Uptime', 'Latency', 'Status'].map((h) => (
            <div
              key={h}
              style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: '#9CA3AF',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {h}
            </div>
          ))}
        </div>

        {visible.map((s, i) => (
          <div
            key={s.name}
            style={{
              display: 'grid', gridTemplateColumns: '3fr 1.5fr 1fr 1fr 1.5fr',
              padding: '13px 20px',
              borderBottom: i < visible.length - 1 ? '1px solid #F3F4F6' : 'none',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{s.name}</span>
            <span
              style={{
                fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700,
                letterSpacing: '0.08em', color: '#6B7280', textTransform: 'uppercase',
              }}
            >
              {s.category}
            </span>
            <span style={{ fontSize: 12, color: '#374151' }}>{s.uptime}</span>
            <span style={{ fontSize: 12, color: '#374151' }}>{s.latency}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  display: 'inline-block', width: 6, height: 6,
                  borderRadius: '50%', background: STATUS_COLORS[s.status] || '#6B7280', flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700,
                  letterSpacing: '0.08em', color: STATUS_COLORS[s.status] || '#6B7280',
                  textTransform: 'uppercase',
                }}
              >
                {s.status}
              </span>
            </div>
          </div>
        ))}

        {visible.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
            No services match the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};

export default OpsServices;
