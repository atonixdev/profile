import React, { useState } from 'react';

// ── demo data ──────────────────────────────────────────────────────────────
const STEPS = [
  { id: 'step_1', name: 'build_container',  image: 'python:3.11-slim',          status: 'completed', exit_code: 0,    order: 1, start: '14:22:01', end: '14:22:49', duration: '0m 48s' },
  { id: 'step_2', name: 'data_validation',  image: 'atonixdev/validator:2.1',   status: 'completed', exit_code: 0,    order: 2, start: '14:22:50', end: '14:23:09', duration: '0m 19s' },
  { id: 'step_3', name: 'feature_eng',      image: 'atonixdev/spark:3.4',       status: 'completed', exit_code: 0,    order: 3, start: '14:22:50', end: '14:23:27', duration: '0m 37s' },
  { id: 'step_4', name: 'train_model',      image: 'atonixdev/torch:2.0-gpu',   status: 'completed', exit_code: 0,    order: 4, start: '14:23:28', end: '14:25:39', duration: '2m 11s' },
  { id: 'step_5', name: 'evaluate_model',   image: 'atonixdev/eval:1.3',        status: 'completed', exit_code: 0,    order: 5, start: '14:25:40', end: '14:26:01', duration: '0m 21s' },
  { id: 'step_6', name: 'generate_report',  image: 'atonixdev/report:0.9',      status: 'completed', exit_code: 0,    order: 6, start: '14:26:02', end: '14:26:17', duration: '0m 15s' },
  { id: 'step_7', name: 'upload_artifact',  image: 'atonixdev/publish:1.0',     status: 'completed', exit_code: 0,    order: 7, start: '14:26:18', end: '14:26:26', duration: '0m 08s' },
];
// ──────────────────────────────────────────────────────────────────────────

const STATUS_FILTERS = ['all', 'completed', 'failed', 'running', 'pending', 'skipped'];
const statusColor  = (s) => ({ completed: '#10B981', failed: '#EF4444', running: '#3B82F6', cancelled: '#4B5563', pending: '#F59E0B', skipped: '#4B5563' }[s] || '#4B5563');
const statusBg     = (s) => ({ completed: '#F0FDF4', failed: '#FEF2F2', running: '#EFF6FF', cancelled: '#F9FAFB', pending: '#FFFBEB', skipped: '#F9FAFB' }[s] || '#F9FAFB');
const statusBorder = (s) => ({ completed: '#BBF7D0', failed: '#FECACA', running: '#BFDBFE', cancelled: '#E5E7EB', pending: '#FDE68A', skipped: '#E5E7EB' }[s] || '#E5E7EB');

const eyebrow = { fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A81D37', fontFamily: 'var(--font-mono)', marginBottom: 6 };
const card = { background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '24px 28px', marginBottom: 24 };
const th = { padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4B5563', borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' };
const td = { padding: '12px 16px', fontSize: 12, color: '#1F2937', borderBottom: '1px solid #F3F4F6', verticalAlign: 'middle' };

const PipelineSteps = () => {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = filter === 'all' ? STEPS : STEPS.filter((s) => s.status === filter);
  const detail   = selected ? STEPS.find((s) => s.id === selected) : null;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={eyebrow}>Pipeline Console — Steps</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 6, lineHeight: 1.2 }}>
          Pipeline Steps
        </h1>
        <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.65 }}>
          All steps executed in <strong style={{ color: '#111827' }}>run #47</strong>. Click a row to inspect step details.
        </p>
      </div>

      {/* Summary pills */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {STATUS_FILTERS.map((f) => {
          const count = f === 'all' ? STEPS.length : STEPS.filter((s) => s.status === f).length;
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px', border: active ? `1px solid ${statusColor(f === 'all' ? 'completed' : f)}` : '1px solid #E5E7EB',
                background: active ? (f === 'all' ? '#F9FAFB' : statusBg(f)) : '#FFFFFF',
                color: active ? (f === 'all' ? '#111827' : statusColor(f)) : '#4B5563',
                fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-mono)',
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}
            >
              {f} ({count})
            </button>
          );
        })}
      </div>

      {/* Step detail card */}
      {detail && (
        <div style={{ ...card, borderLeft: `3px solid ${statusColor(detail.status)}`, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={eyebrow}>Step Detail</div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{detail.name}</h2>
            </div>
            <button
              onClick={() => setSelected(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4B5563', fontSize: 16 }}
            >
              ✕
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 16 }}>
            {[
              { l: 'Image', v: detail.image },
              { l: 'Exit Code', v: detail.exit_code !== null ? String(detail.exit_code) : 'N/A' },
              { l: 'Started', v: detail.start },
              { l: 'Finished', v: detail.end },
            ].map(({ l, v }) => (
              <div key={l}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4, fontFamily: 'var(--font-mono)' }}>{l}</div>
                <div style={{ fontSize: 12, color: '#111827', fontFamily: 'var(--font-mono)', fontWeight: 600, wordBreak: 'break-all' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Steps table */}
      <div style={card}>
        <div style={eyebrow}>Step List</div>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>
          {filtered.length} step{filtered.length !== 1 ? 's' : ''}
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>#</th>
              <th style={th}>Name</th>
              <th style={th}>Status</th>
              <th style={th}>Image</th>
              <th style={th}>Duration</th>
              <th style={th}>Exit Code</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((step) => (
              <tr
                key={step.id}
                onClick={() => setSelected(step.id === selected ? null : step.id)}
                style={{ cursor: 'pointer', background: selected === step.id ? '#F9FAFB' : 'transparent', transition: 'background 0.1s' }}
              >
                <td style={{ ...td, fontFamily: 'var(--font-mono)', color: '#4B5563', width: 32 }}>{step.order}</td>
                <td style={{ ...td, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#111827' }}>{step.name}</td>
                <td style={td}>
                  <span
                    style={{
                      padding: '2px 8px', fontSize: 10, fontWeight: 700,
                      background: statusBg(step.status), color: statusColor(step.status),
                      border: `1px solid ${statusBorder(step.status)}`,
                      fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}
                  >
                    {step.status}
                  </span>
                </td>
                <td style={{ ...td, fontSize: 11, fontFamily: 'var(--font-mono)', color: '#4B5563' }}>{step.image}</td>
                <td style={{ ...td, fontFamily: 'var(--font-mono)', fontSize: 11 }}>{step.duration}</td>
                <td style={{ ...td, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                  {step.exit_code !== null ? (
                    <span style={{ color: step.exit_code === 0 ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                      {step.exit_code}
                    </span>
                  ) : '—'}
                </td>
                <td style={td}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelected(step.id); }}
                    style={{
                      padding: '4px 10px', background: 'none', border: '1px solid #E5E7EB',
                      fontSize: 10, color: '#4B5563', cursor: 'pointer', fontFamily: 'inherit',
                      fontWeight: 700, letterSpacing: '0.06em',
                    }}
                  >
                    Inspect
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PipelineSteps;
