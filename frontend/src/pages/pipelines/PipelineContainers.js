import React from 'react';

// ── demo data ──────────────────────────────────────────────────────────────
const CONTAINERS = [
  {
    id: 'c7f3a1b2d4e5',
    step: 'build_container',
    image: 'python:3.11-slim',
    status: 'completed',
    cpu_pct: 12.4,
    mem_used: 182,
    mem_limit: 512,
    started: '14:22:01',
    finished: '14:22:49',
  },
  {
    id: 'ab8c12fe394d',
    step: 'data_validation',
    image: 'atonixdev/validator:2.1',
    status: 'completed',
    cpu_pct: 6.1,
    mem_used: 94,
    mem_limit: 256,
    started: '14:22:50',
    finished: '14:23:09',
  },
  {
    id: '9d1e4f7a2bc3',
    step: 'feature_eng',
    image: 'atonixdev/spark:3.4',
    status: 'completed',
    cpu_pct: 84.7,
    mem_used: 1024,
    mem_limit: 2048,
    started: '14:22:50',
    finished: '14:23:27',
  },
  {
    id: 'e5a7b3c1d2f4',
    step: 'train_model',
    image: 'atonixdev/torch:2.0-gpu',
    status: 'completed',
    cpu_pct: 97.3,
    mem_used: 3840,
    mem_limit: 8192,
    started: '14:23:28',
    finished: '14:25:39',
  },
  {
    id: 'f1c2d3e4a5b6',
    step: 'evaluate_model',
    image: 'atonixdev/eval:1.3',
    status: 'completed',
    cpu_pct: 41.2,
    mem_used: 512,
    mem_limit: 1024,
    started: '14:25:40',
    finished: '14:26:01',
  },
  {
    id: '2b3c4d1e5f6a',
    step: 'upload_artifact',
    image: 'atonixdev/publish:1.0',
    status: 'completed',
    cpu_pct: 3.8,
    mem_used: 48,
    mem_limit: 128,
    started: '14:26:18',
    finished: '14:26:26',
  },
];
// ──────────────────────────────────────────────────────────────────────────

const statusColor = (s) => ({ completed: '#10B981', failed: '#EF4444', running: '#3B82F6', terminated: '#4B5563', pending: '#F59E0B' }[s] || '#4B5563');
const statusBg    = (s) => ({ completed: '#F0FDF4', failed: '#FEF2F2', running: '#EFF6FF', terminated: '#F9FAFB', pending: '#FFFBEB' }[s] || '#F9FAFB');

const cpuColor    = (pct) => pct > 80 ? '#EF4444' : pct > 50 ? '#F59E0B' : '#10B981';
const memColor    = (used, limit) => {
  const pct = (used / limit) * 100;
  return pct > 80 ? '#EF4444' : pct > 50 ? '#F59E0B' : '#3B82F6';
};

const eyebrow = { fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A81D37', fontFamily: 'var(--font-mono)', marginBottom: 6 };
const card = { background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '24px 28px', marginBottom: 24 };

const ProgressBar = ({ pct, color }) => (
  <div style={{ height: 6, background: '#F3F4F6', width: '100%', overflow: 'hidden' }}>
    <div
      style={{
        height: '100%',
        width: `${Math.min(pct, 100).toFixed(1)}%`,
        background: color,
        transition: 'width 0.4s',
      }}
    />
  </div>
);

const PipelineContainers = () => (
  <div>
    {/* Header */}
    <div style={{ marginBottom: 28 }}>
      <div style={eyebrow}>Pipeline Console — Containers</div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 6, lineHeight: 1.2 }}>
        Container Runtime
      </h1>
      <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.65 }}>
        All containers spawned in <strong style={{ color: '#111827' }}>run #47</strong>.
        CPU and memory stats reflect peak usage captured at container exit.
      </p>
    </div>

    {/* Summary row */}
    <div
      style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16, marginBottom: 28,
      }}
    >
      {[
        { label: 'Total Containers',   value: CONTAINERS.length },
        { label: 'Completed',          value: CONTAINERS.filter((c) => c.status === 'completed').length, color: '#10B981' },
        { label: 'Failed',             value: CONTAINERS.filter((c) => c.status === 'failed').length, color: '#EF4444' },
        { label: 'Peak Memory (MB)',   value: Math.max(...CONTAINERS.map((c) => c.mem_used)).toLocaleString() },
      ].map((s) => (
        <div
          key={s.label}
          style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '18px 20px' }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4B5563', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
            {s.label}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: s.color || '#111827', lineHeight: 1 }}>
            {s.value}
          </div>
        </div>
      ))}
    </div>

    {/* Container cards grid */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
      {CONTAINERS.map((c) => {
        const memPct = ((c.mem_used / c.mem_limit) * 100).toFixed(1);
        return (
          <div key={c.id} style={card} >
            {/* Card header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#4B5563', marginBottom: 3 }}>
                  {c.id.substring(0, 12)}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', fontFamily: 'var(--font-mono)' }}>
                  {c.step}
                </div>
              </div>
              <span
                style={{
                  padding: '3px 9px', fontSize: 10, fontWeight: 700,
                  background: statusBg(c.status), color: statusColor(c.status),
                  fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em',
                }}
              >
                {c.status}
              </span>
            </div>

            {/* Image */}
            <div style={{ fontSize: 11, color: '#4B5563', fontFamily: 'var(--font-mono)', marginBottom: 14, padding: '6px 10px', background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              {c.image}
            </div>

            {/* CPU */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>CPU</span>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: cpuColor(c.cpu_pct), fontWeight: 700 }}>{c.cpu_pct.toFixed(1)}%</span>
              </div>
              <ProgressBar pct={c.cpu_pct} color={cpuColor(c.cpu_pct)} />
            </div>

            {/* Memory */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>Memory</span>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: memColor(c.mem_used, c.mem_limit), fontWeight: 700 }}>
                  {c.mem_used.toLocaleString()} / {c.mem_limit.toLocaleString()} MB ({memPct}%)
                </span>
              </div>
              <ProgressBar pct={parseFloat(memPct)} color={memColor(c.mem_used, c.mem_limit)} />
            </div>

            {/* Timestamps */}
            <div style={{ display: 'flex', gap: 16 }}>
              <div>
                <div style={{ fontSize: 9, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>Started</div>
                <div style={{ fontSize: 10, color: '#4B5563', fontFamily: 'var(--font-mono)' }}>{c.started}</div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>Finished</div>
                <div style={{ fontSize: 10, color: '#4B5563', fontFamily: 'var(--font-mono)' }}>{c.finished}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default PipelineContainers;
