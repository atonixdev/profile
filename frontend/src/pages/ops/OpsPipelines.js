import React, { useState } from 'react';

// GS-WSF — Operational Control: Pipeline Activity
const STATUS_FILTER = ['All', 'Running', 'Success', 'Failed', 'Queued', 'Cancelled'];

const PIPELINES = [
  { id: 'pl-001', name: 'atonixdev/api-gateway',       branch: 'main',    trigger: 'push',     status: 'Success',   duration: '2m 14s', ts: '2026-03-09T07:58:00Z' },
  { id: 'pl-002', name: 'atonixdev/frontend',           branch: 'main',    trigger: 'push',     status: 'Running',   duration: '1m 05s', ts: '2026-03-09T08:00:01Z' },
  { id: 'pl-003', name: 'atonixdev/model-server',       branch: 'develop', trigger: 'manual',   status: 'Failed',    duration: '0m 47s', ts: '2026-03-09T07:52:30Z' },
  { id: 'pl-004', name: 'atonixdev/iot-agent',          branch: 'main',    trigger: 'schedule', status: 'Success',   duration: '3m 22s', ts: '2026-03-09T07:45:00Z' },
  { id: 'pl-005', name: 'atonixdev/kernel-service',     branch: 'feature', trigger: 'push',     status: 'Queued',    duration: '—',      ts: '2026-03-09T08:01:12Z' },
  { id: 'pl-006', name: 'atonixdev/ops-dashboard',      branch: 'main',    trigger: 'push',     status: 'Success',   duration: '1m 58s', ts: '2026-03-09T07:38:00Z' },
  { id: 'pl-007', name: 'atonixdev/backend-core',       branch: 'hotfix',  trigger: 'push',     status: 'Cancelled', duration: '0m 12s', ts: '2026-03-09T07:30:00Z' },
];

const STATUS_STYLES = {
  Success:   { bg: '#F0FDF4', color: '#16A34A', dot: '#22C55E' },
  Running:   { bg: '#EFF6FF', color: '#2563EB', dot: '#3B82F6' },
  Failed:    { bg: '#FEF2F2', color: '#DC2626', dot: '#EF4444' },
  Queued:    { bg: '#F5F3FF', color: '#7C3AED', dot: '#8B5CF6' },
  Cancelled: { bg: '#F9FAFB', color: '#4B5563', dot: '#4B5563' },
};

const OpsPipelines = () => {
  const [filter, setFilter] = useState('All');

  const visible = filter === 'All' ? PIPELINES : PIPELINES.filter((p) => p.status === filter);

  const stats = {
    total:   PIPELINES.length,
    running: PIPELINES.filter((p) => p.status === 'Running').length,
    failed:  PIPELINES.filter((p) => p.status === 'Failed').length,
    success: PIPELINES.filter((p) => p.status === 'Success').length,
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
          Pipeline Activity
        </h1>
        <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.7, maxWidth: 560 }}>
          Traceable records of every pipeline execution — trigger source, status, branch, and duration.
        </p>
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
          { label: 'Total (24h)', value: stats.total,   color: '#111827' },
          { label: 'Running',     value: stats.running, color: '#2563EB' },
          { label: 'Failed',      value: stats.failed,  color: '#DC2626' },
          { label: 'Successful',  value: stats.success, color: '#16A34A' },
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

      {/* Filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {STATUS_FILTER.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase',
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

      {/* Table */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
        <div
          style={{
            display: 'grid', gridTemplateColumns: '80px 2.5fr 1fr 1fr 1fr 1fr 1.2fr',
            padding: '10px 20px',
            background: '#F9FAFB', borderBottom: '1px solid #E5E7EB',
          }}
        >
          {['ID', 'Pipeline', 'Branch', 'Trigger', 'Duration', 'Status', 'Started'].map((h) => (
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

        {visible.map((p, i) => {
          const sc = STATUS_STYLES[p.status] || { bg: '#F9FAFB', color: '#4B5563', dot: '#4B5563' };
          return (
            <div
              key={p.id}
              style={{
                display: 'grid', gridTemplateColumns: '80px 2.5fr 1fr 1fr 1fr 1fr 1.2fr',
                padding: '12px 20px',
                borderBottom: i < visible.length - 1 ? '1px solid #F3F4F6' : 'none',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 10, color: '#4B5563', fontFamily: 'var(--font-mono)' }}>{p.id}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{p.name}</span>
              <span style={{ fontSize: 11, color: '#4B5563', fontFamily: 'var(--font-mono)' }}>{p.branch}</span>
              <span style={{ fontSize: 10, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>{p.trigger}</span>
              <span style={{ fontSize: 12, color: '#1F2937', fontFamily: 'var(--font-mono)' }}>{p.duration}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span
                  style={{
                    display: 'inline-block', width: 6, height: 6,
                    borderRadius: '50%', background: sc.dot, flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: sc.color, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                  {p.status}
                </span>
              </div>
              <span style={{ fontSize: 10, color: '#4B5563', fontFamily: 'var(--font-mono)' }}>
                {p.ts.replace('T', ' ').replace('Z', '')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OpsPipelines;
