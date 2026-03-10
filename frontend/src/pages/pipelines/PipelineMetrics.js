import React, { useState } from 'react';

// ── demo metric series ─────────────────────────────────────────────────────
// Each metric has a history of (step, value) pairs
const METRIC_SERIES = [
  {
    metric_name: 'train_loss',
    unit: '',
    direction: 'down',
    color: '#EF4444',
    history: [0.6821,0.5912,0.5104,0.4613,0.4193,0.3882,0.3615,0.3401,0.3217,0.3059,0.2914,0.2793,0.2681,0.2583,0.2641],
    current: 0.2641,
    prev: 0.2789,
  },
  {
    metric_name: 'val_auc',
    unit: '',
    direction: 'up',
    color: '#10B981',
    history: [0.7314,0.7821,0.8103,0.8412,0.8812,0.8991,0.9083,0.9147,0.9204,0.9261,0.9314,0.9351,0.9381,0.9403,0.9421],
    current: 0.9421,
    prev: 0.9241,
  },
  {
    metric_name: 'precision',
    unit: '%',
    direction: 'up',
    color: '#3B82F6',
    history: [0.71,0.758,0.793,0.821,0.844,0.862,0.873,0.882,0.889,0.895,0.899,0.903,0.907,0.910,0.9118].map((v) => v * 100),
    current: 91.18,
    prev: 90.57,
  },
  {
    metric_name: 'recall',
    unit: '%',
    direction: 'up',
    color: '#7C3AED',
    history: [0.81,0.834,0.848,0.857,0.864,0.869,0.873,0.877,0.880,0.882,0.884,0.886,0.887,0.889,0.8894].map((v) => v * 100),
    current: 88.94,
    prev: 89.06,
  },
  {
    metric_name: 'f1_score',
    unit: '%',
    direction: 'up',
    color: '#D97706',
    history: [0.756,0.793,0.819,0.839,0.854,0.865,0.873,0.879,0.884,0.888,0.891,0.894,0.897,0.899,0.9005].map((v) => v * 100),
    current: 90.05,
    prev: 89.82,
  },
  {
    metric_name: 'epoch_time_s',
    unit: 's',
    direction: 'neutral',
    color: '#4B5563',
    history: [3.2,3.1,3.0,3.1,3.0,2.9,3.0,3.1,3.0,2.9,3.1,3.0,2.9,3.0,3.1],
    current: 3.1,
    prev: 3.0,
  },
];
// ──────────────────────────────────────────────────────────────────────────

const eyebrow = { fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A81D37', fontFamily: 'var(--font-mono)', marginBottom: 6 };
const card    = { background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '24px 28px', marginBottom: 24 };

const MiniBarChart = ({ values, color, height = 40 }) => {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height }}>
      {values.map((v, i) => {
        const pct = ((v - min) / range) * 100;
        const isLast = i === values.length - 1;
        return (
          <div
            key={i}
            title={`Step ${i + 1}: ${v.toFixed(4)}`}
            style={{
              flex: 1, height: `${Math.max(pct, 6)}%`,
              background: isLast ? color : `${color}55`,
              borderRadius: 1,
              minHeight: 2,
              transition: 'height 0.3s',
            }}
          />
        );
      })}
    </div>
  );
};

const trendIcon = (curr, prev, dir) => {
  if (dir === 'neutral') return { icon: '→', color: '#4B5563' };
  const up = curr >= prev;
  if (dir === 'up')   return up ? { icon: '↑', color: '#10B981' } : { icon: '↓', color: '#EF4444' };
  if (dir === 'down') return up ? { icon: '↑', color: '#EF4444' } : { icon: '↓', color: '#10B981' };
  return { icon: '→', color: '#4B5563' };
};

const PipelineMetrics = () => {
  const [selected, setSelected] = useState(null);
  const detail = selected ? METRIC_SERIES.find((m) => m.metric_name === selected) : null;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={eyebrow}>Pipeline Console — Metrics</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 6, lineHeight: 1.2 }}>
          Training Metrics
        </h1>
        <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.65 }}>
          Epoch-by-epoch metrics captured during <strong style={{ color: '#111827' }}>run #47</strong>
          &nbsp;(50 epochs, best at epoch 48). Click a card to inspect.
        </p>
      </div>

      {/* Metric cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        {METRIC_SERIES.map((m) => {
          const trend   = trendIcon(m.current, m.prev, m.direction);
          const isActive = selected === m.metric_name;
          return (
            <div
              key={m.metric_name}
              onClick={() => setSelected(isActive ? null : m.metric_name)}
              style={{
                ...card,
                marginBottom: 0,
                cursor: 'pointer',
                borderColor: isActive ? m.color : '#E5E7EB',
                borderWidth: isActive ? 2 : 1,
                transition: 'border-color 0.15s',
              }}
            >
              {/* Top row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
                    {m.metric_name}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: m.color, lineHeight: 1 }}>
                    {m.current.toFixed(4)}{m.unit}
                  </div>
                </div>
                <span style={{ fontSize: 18, color: trend.color, fontWeight: 700 }}>{trend.icon}</span>
              </div>

              {/* Delta vs prev */}
              <div style={{ fontSize: 11, color: trend.color, marginBottom: 12, fontFamily: 'var(--font-mono)' }}>
                {m.current >= m.prev ? '+' : ''}{(m.current - m.prev).toFixed(4)}{m.unit} vs prev run
              </div>

              {/* Mini bar chart */}
              <MiniBarChart values={m.history} color={m.color} height={36} />

              <div style={{ fontSize: 9, color: '#4B5563', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                {m.history.length} epochs
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail panel */}
      {detail && (
        <div style={{ ...card, borderLeft: `3px solid ${detail.color}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={eyebrow}>Epoch Breakdown</div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>
                {detail.metric_name} — all epochs
              </h2>
            </div>
            <button
              onClick={() => setSelected(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4B5563', fontSize: 16 }}
            >
              ✕
            </button>
          </div>
          <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 80, marginBottom: 16 }}>
            {detail.history.map((v, i) => {
              const max   = Math.max(...detail.history);
              const min   = Math.min(...detail.history);
              const range = max - min || 1;
              const pct   = ((v - min) / range) * 100;
              const isLast = i === detail.history.length - 1;
              return (
                <div
                  key={i}
                  title={`Epoch ${i + 1}: ${v.toFixed(4)}${detail.unit}`}
                  style={{
                    flex: 1, height: `${Math.max(pct, 4)}%`,
                    background: isLast ? detail.color : `${detail.color}66`,
                    borderRadius: 1, minHeight: 3, cursor: 'default',
                  }}
                />
              );
            })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
            {[
              { l: 'Min', v: Math.min(...detail.history).toFixed(4) + detail.unit },
              { l: 'Max', v: Math.max(...detail.history).toFixed(4) + detail.unit },
              { l: 'Final', v: detail.current.toFixed(4) + detail.unit },
              { l: 'Prev Run', v: detail.prev.toFixed(4) + detail.unit },
              { l: 'Direction', v: detail.direction },
            ].map(({ l, v }) => (
              <div key={l}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 12, color: '#111827', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metric ledger table */}
      <div style={card}>
        <div style={eyebrow}>Metric Ledger</div>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Final Epoch Values</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Metric', 'Value', 'Prev Run', 'Change', 'Direction'].map((h) => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4B5563', borderBottom: '1px solid #E5E7EB', background: '#F9FAFB', fontFamily: 'var(--font-mono)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {METRIC_SERIES.map((m) => {
              const trend  = trendIcon(m.current, m.prev, m.direction);
              const delta  = m.current - m.prev;
              return (
                <tr key={m.metric_name}>
                  <td style={{ padding: '11px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#111827', fontSize: 12, borderBottom: '1px solid #F3F4F6' }}>
                    {m.metric_name}
                  </td>
                  <td style={{ padding: '11px 16px', fontFamily: 'var(--font-mono)', color: m.color, fontWeight: 700, fontSize: 12, borderBottom: '1px solid #F3F4F6' }}>
                    {m.current.toFixed(4)}{m.unit}
                  </td>
                  <td style={{ padding: '11px 16px', fontFamily: 'var(--font-mono)', color: '#4B5563', fontSize: 12, borderBottom: '1px solid #F3F4F6' }}>
                    {m.prev.toFixed(4)}{m.unit}
                  </td>
                  <td style={{ padding: '11px 16px', fontFamily: 'var(--font-mono)', color: trend.color, fontWeight: 700, fontSize: 12, borderBottom: '1px solid #F3F4F6' }}>
                    {delta >= 0 ? '+' : ''}{delta.toFixed(4)}{m.unit}
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: 16, color: trend.color, borderBottom: '1px solid #F3F4F6' }}>
                    {trend.icon}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PipelineMetrics;
