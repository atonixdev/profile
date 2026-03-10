import React from 'react';

// GS-WSF — Operational Control: Resource Usage
const RESOURCE_METRICS = [
  { label: 'CPU Utilization',     value: '—', unit: '%',  sub: 'Avg across all nodes', bar: 0   },
  { label: 'Memory Usage',        value: '—', unit: '%',  sub: 'Heap + system memory',  bar: 0   },
  { label: 'Disk Usage',          value: '—', unit: '%',  sub: 'Persistent storage',    bar: 0   },
  { label: 'Network Throughput',  value: '—', unit: 'MB/s', sub: 'Inbound + Outbound',  bar: 0   },
];

const COMPUTE_NODES = [
  { name: 'api-node-01',      role: 'API Gateway',     cpu: '—', mem: '—', disk: '—', status: 'Running',  color: '#22C55E' },
  { name: 'api-node-02',      role: 'API Gateway',     cpu: '—', mem: '—', disk: '—', status: 'Running',  color: '#22C55E' },
  { name: 'worker-node-01',   role: 'Pipeline Runner', cpu: '—', mem: '—', disk: '—', status: 'Running',  color: '#22C55E' },
  { name: 'worker-node-02',   role: 'Pipeline Runner', cpu: '—', mem: '—', disk: '—', status: 'Running',  color: '#22C55E' },
  { name: 'ml-node-01',       role: 'Model Inference', cpu: '—', mem: '—', disk: '—', status: 'Running',  color: '#22C55E' },
  { name: 'db-node-01',       role: 'Database',        cpu: '—', mem: '—', disk: '—', status: 'Running',  color: '#22C55E' },
  { name: 'log-node-01',      role: 'Log Aggregator',  cpu: '—', mem: '—', disk: '—', status: 'Running',  color: '#22C55E' },
];

const MetricBar = ({ percent }) => (
  <div style={{ background: '#F3F4F6', height: 6, borderRadius: 0, overflow: 'hidden', marginTop: 10 }}>
    <div
      style={{
        height: '100%',
        width: `${Math.min(percent, 100)}%`,
        background: percent > 85 ? '#EF4444' : percent > 65 ? '#F59E0B' : '#22C55E',
        transition: 'width 0.4s',
      }}
    />
  </div>
);

const OpsResources = () => (
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
        Resource Usage
      </h1>
      <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.7, maxWidth: 560 }}>
        Real-time compute, memory, disk, and network consumption across all infrastructure nodes.
      </p>
    </div>

    {/* Top metrics */}
    <div
      style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        border: '1px solid #E5E7EB', borderRight: 'none',
        marginBottom: 36,
      }}
      className="ops-stats-grid"
    >
      {RESOURCE_METRICS.map((m) => (
        <div
          key={m.label}
          style={{
            background: '#FFFFFF', padding: '24px 20px',
            borderRight: '1px solid #E5E7EB',
          }}
        >
          <div
            style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: '#4B5563',
              fontFamily: 'var(--font-mono)', marginBottom: 6,
            }}
          >
            {m.label}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 36, fontWeight: 900, color: '#111827', lineHeight: 1 }}>{m.value}</span>
            <span style={{ fontSize: 13, color: '#4B5563' }}>{m.unit}</span>
          </div>
          <div style={{ fontSize: 11, color: '#4B5563', marginTop: 4 }}>{m.sub}</div>
          <MetricBar percent={m.bar} />
        </div>
      ))}
    </div>

    {/* Compute node table */}
    <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
      <div
        style={{
          padding: '14px 20px', borderBottom: '1px solid #E5E7EB',
          fontSize: 12, fontWeight: 700, color: '#111827',
        }}
      >
        Compute Nodes
      </div>

      {/* Header */}
      <div
        style={{
          display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr',
          padding: '10px 20px',
          background: '#F9FAFB', borderBottom: '1px solid #E5E7EB',
        }}
      >
        {['Node', 'Role', 'CPU', 'Memory', 'Disk', 'Status'].map((h) => (
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

      {COMPUTE_NODES.map((n, i) => (
        <div
          key={n.name}
          style={{
            display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr',
            padding: '12px 20px',
            borderBottom: i < COMPUTE_NODES.length - 1 ? '1px solid #F3F4F6' : 'none',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: '#111827', fontFamily: 'var(--font-mono)' }}>{n.name}</span>
          <span style={{ fontSize: 12, color: '#4B5563' }}>{n.role}</span>
          <span style={{ fontSize: 12, color: '#1F2937' }}>{n.cpu}</span>
          <span style={{ fontSize: 12, color: '#1F2937' }}>{n.mem}</span>
          <span style={{ fontSize: 12, color: '#1F2937' }}>{n.disk}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                display: 'inline-block', width: 6, height: 6,
                borderRadius: '50%', background: n.color, flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700,
                letterSpacing: '0.08em', color: n.color, textTransform: 'uppercase',
              }}
            >
              {n.status}
            </span>
          </div>
        </div>
      ))}
    </div>

    <div
      style={{
        marginTop: 16, padding: '14px 20px',
        background: '#FFFBEB', border: '1px solid #FEF3C7',
        fontSize: 12, color: '#92400E',
      }}
    >
      Connect the Metrics Collector API to populate real-time CPU, memory, disk, and network data per node.
    </div>
  </div>
);

export default OpsResources;
