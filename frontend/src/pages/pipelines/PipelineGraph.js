import React, { useState } from 'react';

// ── demo graph data ────────────────────────────────────────────────────────
// Nodes laid out in a left-to-right columnar DAG
const COLUMNS = [
  [
    { id: 'step_1', name: 'build_container', image: 'python:3.11-slim', status: 'completed', duration: '0m 48s' },
  ],
  [
    { id: 'step_2', name: 'data_validation', image: 'atonixdev/validator:2.1', status: 'completed', duration: '0m 19s' },
    { id: 'step_3', name: 'feature_eng',     image: 'atonixdev/spark:3.4',     status: 'completed', duration: '0m 37s' },
  ],
  [
    { id: 'step_4', name: 'train_model', image: 'atonixdev/torch:2.0-gpu', status: 'completed', duration: '2m 11s' },
  ],
  [
    { id: 'step_5', name: 'evaluate_model', image: 'atonixdev/eval:1.3', status: 'completed', duration: '0m 21s' },
    { id: 'step_6', name: 'generate_report', image: 'atonixdev/report:0.9', status: 'completed', duration: '0m 15s' },
  ],
  [
    { id: 'step_7', name: 'upload_artifact', image: 'atonixdev/publish:1.0', status: 'completed', duration: '0m 08s' },
  ],
];

// Edges: [fromCol, fromRowIdx, toCol, toRowIdx]
const EDGES = [
  [0, 0, 1, 0],
  [0, 0, 1, 1],
  [1, 0, 2, 0],
  [1, 1, 2, 0],
  [2, 0, 3, 0],
  [2, 0, 3, 1],
  [3, 0, 4, 0],
  [3, 1, 4, 0],
];
// ──────────────────────────────────────────────────────────────────────────

const statusColor = (s) => ({ completed: '#10B981', failed: '#EF4444', running: '#3B82F6', cancelled: '#9CA3AF', pending: '#F59E0B', skipped: '#6B7280' }[s] || '#9CA3AF');
const statusBg    = (s) => ({ completed: '#F0FDF4', failed: '#FEF2F2', running: '#EFF6FF', cancelled: '#F9FAFB', pending: '#FFFBEB', skipped: '#F9FAFB' }[s] || '#F9FAFB');

const eyebrow = { fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A81D37', fontFamily: 'var(--font-mono)', marginBottom: 6 };
const card = { background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '24px 28px', marginBottom: 24 };

const NODE_W = 148;
const NODE_H = 76;
const COL_GAP = 80;
const ROW_GAP = 24;

const PipelineGraph = () => {
  const [hover, setHover] = useState(null);

  // Compute positions
  const colCount  = COLUMNS.length;
  const maxRows   = Math.max(...COLUMNS.map((c) => c.length));
  const svgW      = colCount  * NODE_W + (colCount  - 1) * COL_GAP + 40;
  const svgH      = maxRows   * NODE_H + (maxRows - 1)   * ROW_GAP + 40;

  // Center each column's nodes vertically
  const pos = (colIdx, rowIdx) => {
    const rows      = COLUMNS[colIdx].length;
    const totalH    = rows * NODE_H + (rows - 1) * ROW_GAP;
    const startY    = (svgH - totalH) / 2;
    return {
      x: 20 + colIdx * (NODE_W + COL_GAP),
      y: startY + rowIdx * (NODE_H + ROW_GAP),
    };
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={eyebrow}>Pipeline Console — Pipeline Graph</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 6, lineHeight: 1.2 }}>
          Pipeline Graph
        </h1>
        <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65 }}>
          DAG visualization of all pipeline steps for <strong style={{ color: '#111827' }}>run #47</strong>.
          Hover a node to see step details.
        </p>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
        {['completed', 'running', 'failed', 'pending', 'skipped'].map((s) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor(s), display: 'inline-block' }} />
            <span style={{ fontSize: 11, color: '#6B7280', fontFamily: 'var(--font-mono)' }}>{s}</span>
          </div>
        ))}
      </div>

      {/* Graph canvas */}
      <div style={{ ...card, overflowX: 'auto' }}>
        <svg
          width={svgW}
          height={svgH}
          style={{ display: 'block', minWidth: 600 }}
        >
          {/* Edges */}
          {EDGES.map(([fc, fr, tc, tr], i) => {
            const from = pos(fc, fr);
            const to   = pos(tc, tr);
            const x1   = from.x + NODE_W;
            const y1   = from.y + NODE_H / 2;
            const x2   = to.x;
            const y2   = to.y + NODE_H / 2;
            const mx   = (x1 + x2) / 2;
            return (
              <path
                key={i}
                d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                fill="none"
                stroke="#D1D5DB"
                strokeWidth={1.5}
                markerEnd="url(#arrow)"
              />
            );
          })}

          {/* Arrow marker */}
          <defs>
            <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#D1D5DB" />
            </marker>
          </defs>

          {/* Nodes */}
          {COLUMNS.map((col, ci) =>
            col.map((step, ri) => {
              const { x, y } = pos(ci, ri);
              const isHover  = hover === step.id;
              return (
                <g
                  key={step.id}
                  onMouseEnter={() => setHover(step.id)}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x={x} y={y} width={NODE_W} height={NODE_H}
                    rx={3}
                    fill={statusBg(step.status)}
                    stroke={isHover ? statusColor(step.status) : '#D1D5DB'}
                    strokeWidth={isHover ? 2 : 1}
                  />
                  {/* Status dot */}
                  <circle
                    cx={x + NODE_W - 14} cy={y + 14}
                    r={5} fill={statusColor(step.status)}
                  />
                  {/* Step name */}
                  <text
                    x={x + 12} y={y + 26}
                    fontSize={11} fontWeight={700} fill="#111827"
                    fontFamily="var(--font-mono)"
                    style={{ pointerEvents: 'none' }}
                  >
                    {step.name.length > 16 ? step.name.substring(0, 14) + '…' : step.name}
                  </text>
                  {/* Image */}
                  <text
                    x={x + 12} y={y + 42}
                    fontSize={9} fill="#6B7280"
                    fontFamily="var(--font-mono)"
                    style={{ pointerEvents: 'none' }}
                  >
                    {step.image.length > 22 ? step.image.substring(0, 20) + '…' : step.image}
                  </text>
                  {/* Duration */}
                  <text
                    x={x + 12} y={y + 60}
                    fontSize={9} fill="#9CA3AF"
                    fontFamily="var(--font-mono)"
                    style={{ pointerEvents: 'none' }}
                  >
                    ⏱ {step.duration}
                  </text>
                </g>
              );
            })
          )}
        </svg>
      </div>

      {/* Detail panel on hover */}
      {hover && (() => {
        const step = COLUMNS.flat().find((s) => s.id === hover);
        if (!step) return null;
        return (
          <div style={{ ...card, borderLeft: `3px solid ${statusColor(step.status)}` }}>
            <div style={eyebrow}>Step Detail</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {[
                { l: 'Step ID', v: step.id },
                { l: 'Name', v: step.name },
                { l: 'Image', v: step.image },
                { l: 'Duration', v: step.duration },
              ].map(({ l, v }) => (
                <div key={l}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4, fontFamily: 'var(--font-mono)' }}>{l}</div>
                  <div style={{ fontSize: 12, color: '#111827', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Step list table */}
      <div style={card}>
        <div style={eyebrow}>All Steps</div>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Step Registry</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {COLUMNS.flat().map((step) => (
            <div
              key={step.id}
              style={{
                padding: '12px 14px', background: '#F9FAFB',
                border: '1px solid #E5E7EB',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#111827', fontFamily: 'var(--font-mono)' }}>
                  {step.name}
                </div>
                <div style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'var(--font-mono)', marginTop: 3 }}>
                  {step.duration}
                </div>
              </div>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor(step.status), display: 'inline-block' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PipelineGraph;
