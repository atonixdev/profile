import React, { useState } from 'react';

// ── demo data ──────────────────────────────────────────────────────────────
const ARTIFACTS = [
  { id: 'art_1', name: 'fraud_detection_v1.3.0.pkl',   type: 'model',            size: 19267584,  run: 'run_047', created: 'Mar 9, 14:26' },
  { id: 'art_2', name: 'features.parquet',              type: 'feature_set',      size: 142606336, run: 'run_047', created: 'Mar 9, 14:23' },
  { id: 'art_3', name: 'run_047_eval.json',             type: 'report',           size: 4218,      run: 'run_047', created: 'Mar 9, 14:26' },
  { id: 'art_4', name: 'roc_curve.png',                 type: 'chart',            size: 87431,     run: 'run_047', created: 'Mar 9, 14:26' },
  { id: 'art_5', name: 'confusion_matrix.png',          type: 'chart',            size: 61092,     run: 'run_047', created: 'Mar 9, 14:26' },
  { id: 'art_6', name: 'training_log.txt',              type: 'log',              size: 38144,     run: 'run_047', created: 'Mar 9, 14:25' },
  { id: 'art_7', name: 'fraud_detection_v1.3.0.tar.gz', type: 'deployment_bundle', size: 52428800, run: 'run_047', created: 'Mar 9, 14:26' },
  { id: 'art_8', name: 'pipeline_metrics.json',         type: 'report',           size: 1843,      run: 'run_047', created: 'Mar 9, 14:26' },
];
// ──────────────────────────────────────────────────────────────────────────

const TYPE_META = {
  model:            { label: 'Model',             color: '#7C3AED', bg: '#F5F3FF' },
  feature_set:      { label: 'Feature Set',       color: '#0284C7', bg: '#E0F2FE' },
  report:           { label: 'Report',            color: '#059669', bg: '#ECFDF5' },
  chart:            { label: 'Chart',             color: '#D97706', bg: '#FFFBEB' },
  log:              { label: 'Log',               color: '#6B7280', bg: '#F9FAFB' },
  deployment_bundle:{ label: 'Deploy Bundle',     color: '#A81D37', bg: '#FFF1F2' },
  other:            { label: 'Other',             color: '#6B7280', bg: '#F9FAFB' },
};

const TYPE_FILTERS = ['all', ...Object.keys(TYPE_META)];

const formatSize = (bytes) => {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' GB';
  if (bytes >= 1048576)    return (bytes / 1048576).toFixed(1) + ' MB';
  if (bytes >= 1024)       return (bytes / 1024).toFixed(1) + ' KB';
  return bytes + ' B';
};

const eyebrow = { fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A81D37', fontFamily: 'var(--font-mono)', marginBottom: 6 };
const card = { background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '24px 28px', marginBottom: 24 };

const PipelineArtifacts = () => {
  const [filter, setFilter] = useState('all');

  const visible = filter === 'all' ? ARTIFACTS : ARTIFACTS.filter((a) => a.type === filter);
  const totalSize = ARTIFACTS.reduce((sum, a) => sum + a.size, 0);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={eyebrow}>Pipeline Console — Artifacts</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 6, lineHeight: 1.2 }}>
          Artifact Registry
        </h1>
        <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65 }}>
          {ARTIFACTS.length} artifacts produced in <strong style={{ color: '#111827' }}>run #47</strong>.
          Total size: <strong style={{ color: '#111827' }}>{formatSize(totalSize)}</strong>.
        </p>
      </div>

      {/* Stats */}
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}
      >
        {[
          { label: 'Total Artifacts', value: ARTIFACTS.length },
          { label: 'Models',          value: ARTIFACTS.filter((a) => a.type === 'model').length },
          { label: 'Reports',         value: ARTIFACTS.filter((a) => a.type === 'report').length },
          { label: 'Total Size',      value: formatSize(totalSize) },
        ].map((s) => (
          <div key={s.label} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '18px 20px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
              {s.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Type filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {TYPE_FILTERS.map((t) => {
          const meta  = TYPE_META[t] || { color: '#6B7280', bg: '#F9FAFB', label: 'All' };
          const count = t === 'all' ? ARTIFACTS.length : ARTIFACTS.filter((a) => a.type === t).length;
          if (t !== 'all' && count === 0) return null;
          const active = filter === t;
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              style={{
                padding: '5px 12px',
                border: `1px solid ${active ? meta.color : '#E5E7EB'}`,
                background: active ? meta.bg : '#FFFFFF',
                color: active ? meta.color : '#6B7280',
                fontSize: 10, cursor: 'pointer', fontFamily: 'var(--font-mono)',
                fontWeight: 700, letterSpacing: '0.06em',
              }}
            >
              {t === 'all' ? 'All' : meta.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Artifact cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {visible.map((a) => {
          const meta = TYPE_META[a.type] || TYPE_META.other;
          return (
            <div
              key={a.id}
              style={{ ...card, marginBottom: 0, display: 'flex', flexDirection: 'column', gap: 0 }}
            >
              {/* Type badge */}
              <div style={{ marginBottom: 12 }}>
                <span
                  style={{
                    padding: '3px 10px', fontSize: 9, fontWeight: 700,
                    background: meta.bg, color: meta.color,
                    fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}
                >
                  {meta.label}
                </span>
              </div>

              {/* Name */}
              <div
                style={{
                  fontSize: 12, fontWeight: 700, color: '#111827',
                  fontFamily: 'var(--font-mono)', marginBottom: 6,
                  wordBreak: 'break-all', lineHeight: 1.4,
                }}
              >
                {a.name}
              </div>

              {/* Meta */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 9, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>Size</div>
                  <div style={{ fontSize: 11, color: '#374151', fontFamily: 'var(--font-mono)' }}>{formatSize(a.size)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>Created</div>
                  <div style={{ fontSize: 11, color: '#374151' }}>{a.created}</div>
                </div>
              </div>

              {/* Download button */}
              <div style={{ marginTop: 'auto' }}>
                <button
                  style={{
                    width: '100%', padding: '8px 0',
                    background: meta.bg, border: `1px solid ${meta.color}`,
                    color: meta.color, fontSize: 11, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    transition: 'background 0.15s',
                  }}
                >
                  ↓ Download
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineArtifacts;
