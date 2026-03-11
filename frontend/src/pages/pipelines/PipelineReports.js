import React from 'react';

// ── demo report data ───────────────────────────────────────────────────────
const REPORT_META = {
  run: 'run_047',
  model_version: 'fraud_detection v1.3.0',
  pipeline: 'fraud_detection_pipeline',
  evaluated_at: 'Mar 9, 2026 14:26 UTC',
  dataset: 'fraud_transactions_v3.parquet (20% holdout — 296,478 rows)',
};

const METRICS = [
  { label: 'Accuracy',  value: '94.21%', sub: '+0.34% vs v1.2',  color: '#10B981', bg: '#F0FDF4', border: '#BBF7D0' },
  { label: 'Precision', value: '91.18%', sub: '+0.61% vs v1.2',  color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' },
  { label: 'Recall',    value: '88.94%', sub: '-0.12% vs v1.2',  color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  { label: 'F1 Score',  value: '90.05%', sub: '+0.23% vs v1.2',  color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  { label: 'AUC-ROC',   value: '0.9421', sub: '+0.018 vs v1.2',  color: '#059669', bg: '#ECFDF5', border: '#6EE7B7' },
  { label: 'AUPRC',     value: '0.8877', sub: '+0.031 vs v1.2',  color: '#0284C7', bg: '#E0F2FE', border: '#BAE6FD' },
];

// Confusion matrix: [[TN, FP], [FN, TP]]
const CM = [
  [281934, 3719],
  [12891, 9934],
];

// ROC curve: array of [fpr, tpr] normalized 0-1 control points
// Approximated as a smooth polyline
const ROC_POINTS = [
  [0, 0], [0.01, 0.41], [0.02, 0.61], [0.04, 0.74],
  [0.08, 0.84], [0.15, 0.90], [0.25, 0.94], [0.40, 0.96],
  [0.60, 0.97], [0.80, 0.98], [1.0, 1.0],
];
// ──────────────────────────────────────────────────────────────────────────

const eyebrow = { fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A81D37', fontFamily: 'var(--font-mono)', marginBottom: 6 };
const card = { background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '24px 28px', marginBottom: 24 };

// Scale ROC points to SVG coords (200×200 chart area)
const W = 200, H = 200;

const PipelineReports = () => (
  <div>
    {/* Header */}
    <div style={{ marginBottom: 28 }}>
      <div style={eyebrow}>Pipeline Console — Reports</div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 6, lineHeight: 1.2 }}>
        Evaluation Report
      </h1>
      <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.65 }}>
        Model performance report for <strong style={{ color: '#111827' }}>{REPORT_META.model_version}</strong>.
        Generated from <strong style={{ color: '#111827' }}>{REPORT_META.run}</strong>.
      </p>
    </div>

    {/* Run metadata */}
    <div style={{ ...card, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
      {Object.entries(REPORT_META).map(([k, v]) => (
        <div key={k}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
            {k.replace(/_/g, ' ')}
          </div>
          <div style={{ fontSize: 11, color: '#111827', fontFamily: 'var(--font-mono)', fontWeight: 600, wordBreak: 'break-all' }}>{v}</div>
        </div>
      ))}
    </div>

    {/* Metrics grid */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 16, marginBottom: 24 }}>
      {METRICS.map((m) => (
        <div
          key={m.label}
          style={{ background: m.bg, border: `1px solid ${m.border}`, padding: '18px 20px' }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4B5563', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
            {m.label}
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: m.color, lineHeight: 1 }}>{m.value}</div>
          <div style={{ fontSize: 11, color: m.color, marginTop: 6, fontFamily: 'var(--font-mono)', opacity: 0.8 }}>
            {m.sub}
          </div>
        </div>
      ))}
    </div>

    {/* Confusion matrix + ROC curve side by side */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 24 }}>
      {/* Confusion matrix */}
      <div style={card}>
        <div style={eyebrow}>Confusion Matrix</div>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>
          Holdout Set Results
        </h2>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px 12px', background: '#F9FAFB', border: '1px solid #E5E7EB', fontSize: 10, color: '#4B5563', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                Predicted ↓ · Actual →
              </th>
              <th style={{ padding: '8px 12px', background: '#EFF6FF', border: '1px solid #BFDBFE', fontSize: 11, color: '#3B82F6', fontWeight: 700, fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
                Negative
              </th>
              <th style={{ padding: '8px 12px', background: '#FEF2F2', border: '1px solid #FECACA', fontSize: 11, color: '#EF4444', fontWeight: 700, fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
                Positive (Fraud)
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '12px', background: '#EFF6FF', border: '1px solid #BFDBFE', fontSize: 11, color: '#3B82F6', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                Predicted Neg.
              </td>
              <td style={{ padding: '14px 12px', border: '1px solid #E5E7EB', textAlign: 'center', background: '#F0FDF4' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#10B981' }}>{CM[0][0].toLocaleString()}</div>
                <div style={{ fontSize: 10, color: '#4B5563', fontFamily: 'var(--font-mono)' }}>TN</div>
              </td>
              <td style={{ padding: '14px 12px', border: '1px solid #E5E7EB', textAlign: 'center', background: '#FEF2F2' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#EF4444' }}>{CM[0][1].toLocaleString()}</div>
                <div style={{ fontSize: 10, color: '#4B5563', fontFamily: 'var(--font-mono)' }}>FP</div>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '12px', background: '#FEF2F2', border: '1px solid #FECACA', fontSize: 11, color: '#EF4444', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                Predicted Pos.
              </td>
              <td style={{ padding: '14px 12px', border: '1px solid #E5E7EB', textAlign: 'center', background: '#FEF2F2' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#EF4444' }}>{CM[1][0].toLocaleString()}</div>
                <div style={{ fontSize: 10, color: '#4B5563', fontFamily: 'var(--font-mono)' }}>FN</div>
              </td>
              <td style={{ padding: '14px 12px', border: '1px solid #E5E7EB', textAlign: 'center', background: '#F0FDF4' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#10B981' }}>{CM[1][1].toLocaleString()}</div>
                <div style={{ fontSize: 10, color: '#4B5563', fontFamily: 'var(--font-mono)' }}>TP</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ROC Curve */}
      <div style={card}>
        <div style={eyebrow}>ROC Curve</div>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>
          AUC = 0.9421
        </h2>
        <svg viewBox={`0 0 ${W + 40} ${H + 30}`} style={{ width: '100%', maxWidth: 260 }}>
          {/* Axes */}
          <line x1={30} y1={0} x2={30} y2={H} stroke="#E5E7EB" strokeWidth={1} />
          <line x1={30} y1={H} x2={W + 30} y2={H} stroke="#E5E7EB" strokeWidth={1} />
          {/* Random classifier diagonal */}
          <line x1={30} y1={H} x2={W + 30} y2={0} stroke="#D1D5DB" strokeWidth={1} strokeDasharray="4,3" />
          {/* ROC curve */}
          <polyline
            points={ROC_POINTS.map(([f, t]) => `${30 + f * W},${t === 0 ? H : H - t * H}`).join(' ')}
            fill="none"
            stroke="#A81D37"
            strokeWidth={2}
          />
          {/* Fill under curve */}
          <polygon
            points={[
              `30,${H}`,
              ...ROC_POINTS.map(([f, t]) => `${30 + f * W},${H - t * H}`),
              `${30 + W},${H}`,
            ].join(' ')}
            fill="rgba(168,29,55,0.08)"
          />
          {/* Axis labels */}
          <text x={30 + W / 2} y={H + 22} fontSize={9} fill="#4B5563" textAnchor="middle" fontFamily="var(--font-mono)">
            False Positive Rate
          </text>
          <text x={12} y={H / 2} fontSize={9} fill="#4B5563" textAnchor="middle" fontFamily="var(--font-mono)"
            transform={`rotate(-90, 12, ${H / 2})`}>
            True Positive Rate
          </text>
        </svg>
      </div>
    </div>
  </div>
);

export default PipelineReports;
