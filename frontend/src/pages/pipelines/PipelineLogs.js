import React, { useState } from 'react';

// ── demo log lines ─────────────────────────────────────────────────────────
const ALL_LOGS = [
  { id: 1, step: 'build_container', ts: '14:22:01.031', level: 'INFO',  msg: 'Pulling image python:3.11-slim …' },
  { id: 2, step: 'build_container', ts: '14:22:03.412', level: 'INFO',  msg: 'Digest: sha256:3a7f1b9c pull complete' },
  { id: 3, step: 'build_container', ts: '14:22:08.119', level: 'INFO',  msg: 'Running pip install -r requirements.txt' },
  { id: 4, step: 'build_container', ts: '14:22:44.892', level: 'INFO',  msg: 'Dependencies installed successfully' },
  { id: 5, step: 'build_container', ts: '14:22:49.003', level: 'INFO',  msg: 'Container exited with code 0' },
  { id: 6, step: 'data_validation', ts: '14:22:50.110', level: 'INFO',  msg: 'Loading dataset fraud_transactions_v3.parquet' },
  { id: 7, step: 'data_validation', ts: '14:22:51.780', level: 'INFO',  msg: 'Rows: 1,482,391  Columns: 42' },
  { id: 8, step: 'data_validation', ts: '14:22:53.014', level: 'WARN',  msg: 'Column "merchant_city" has 0.3% null values — imputing' },
  { id: 9, step: 'data_validation', ts: '14:23:08.550', level: 'INFO',  msg: 'Validation passed. Schema v1.4 ✓' },
  { id: 10, step: 'feature_eng',    ts: '14:22:50.122', level: 'INFO',  msg: 'Starting Spark session (local[4])' },
  { id: 11, step: 'feature_eng',    ts: '14:23:01.445', level: 'INFO',  msg: 'Encoding 14 categorical features' },
  { id: 12, step: 'feature_eng',    ts: '14:23:18.337', level: 'WARN',  msg: 'Feature "card_brand" cardinality=1049, consider hashing' },
  { id: 13, step: 'feature_eng',    ts: '14:23:26.999', level: 'INFO',  msg: 'Feature matrix shape: (1482391, 87). Saved to artifacts/features.parquet' },
  { id: 14, step: 'train_model',    ts: '14:23:28.002', level: 'INFO',  msg: 'Initializing XGBoost gradient boosting model' },
  { id: 15, step: 'train_model',    ts: '14:23:29.410', level: 'INFO',  msg: 'Epoch 1/50 — loss=0.6821 val_auc=0.7314' },
  { id: 16, step: 'train_model',    ts: '14:23:55.092', level: 'INFO',  msg: 'Epoch 10/50 — loss=0.4193 val_auc=0.8812' },
  { id: 17, step: 'train_model',    ts: '14:24:22.311', level: 'INFO',  msg: 'Epoch 25/50 — loss=0.3017 val_auc=0.9204' },
  { id: 18, step: 'train_model',    ts: '14:24:58.714', level: 'INFO',  msg: 'Epoch 40/50 — loss=0.2641 val_auc=0.9371' },
  { id: 19, step: 'train_model',    ts: '14:25:38.990', level: 'INFO',  msg: 'Training complete. Best epoch 48. val_auc=0.9421' },
  { id: 20, step: 'evaluate_model', ts: '14:25:40.003', level: 'INFO',  msg: 'Loading test split (20% holdout, N=296,478)' },
  { id: 21, step: 'evaluate_model', ts: '14:25:48.813', level: 'INFO',  msg: 'Precision=0.9118  Recall=0.8894  F1=0.9005' },
  { id: 22, step: 'evaluate_model', ts: '14:25:59.001', level: 'INFO',  msg: 'AUC-ROC: 0.9421  AUPRC: 0.8877' },
  { id: 23, step: 'generate_report', ts: '14:26:02.004', level: 'INFO', msg: 'Generating confusion matrix and ROC curve' },
  { id: 24, step: 'generate_report', ts: '14:26:15.777', level: 'INFO', msg: 'Report written to reports/run_047_eval.json' },
  { id: 25, step: 'upload_artifact', ts: '14:26:18.001', level: 'INFO', msg: 'Uploading model.pkl (18.4 MB) to artifact store' },
  { id: 26, step: 'upload_artifact', ts: '14:26:25.302', level: 'INFO', msg: 'Artifact registered: fraud_detection v1.3.0 ✓' },
];

const STEPS_LIST = ['all', ...Array.from(new Set(ALL_LOGS.map((l) => l.step)))];
const LEVELS      = ['all', 'INFO', 'WARN', 'ERROR'];
// ──────────────────────────────────────────────────────────────────────────

const levelColor = (l) => ({ INFO: '#3B82F6', WARN: '#F59E0B', ERROR: '#EF4444' }[l] || '#4B5563');
const levelBg    = (l) => ({ INFO: '#EFF6FF', WARN: '#FFFBEB', ERROR: '#FEF2F2' }[l] || '#F9FAFB');

const eyebrow = { fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A81D37', fontFamily: 'var(--font-mono)', marginBottom: 6 };

const PipelineLogs = () => {
  const [stepFilter,  setStepFilter]  = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  const logs = ALL_LOGS.filter((l) =>
    (stepFilter  === 'all' || l.step  === stepFilter) &&
    (levelFilter === 'all' || l.level === levelFilter),
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={eyebrow}>Pipeline Console — Logs</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 6, lineHeight: 1.2 }}>
          Live Logs
        </h1>
        <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.65 }}>
          Captured log output from all steps in <strong style={{ color: '#111827' }}>run #47</strong>.
          Filter by step or log level.
        </p>
      </div>

      {/* Filter bar */}
      <div
        style={{
          background: '#FFFFFF', border: '1px solid #E5E7EB',
          padding: '14px 20px', marginBottom: 16,
          display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>Step:</span>
          {STEPS_LIST.map((s) => (
            <button
              key={s}
              onClick={() => setStepFilter(s)}
              style={{
                padding: '4px 10px', border: `1px solid ${stepFilter === s ? '#A81D37' : '#E5E7EB'}`,
                background: stepFilter === s ? '#A81D37' : '#FFFFFF',
                color: stepFilter === s ? '#FFFFFF' : '#4B5563',
                fontSize: 10, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontWeight: 700,
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>Level:</span>
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setLevelFilter(l)}
              style={{
                padding: '4px 10px',
                border: `1px solid ${levelFilter === l ? levelColor(l === 'all' ? 'INFO' : l) : '#E5E7EB'}`,
                background: levelFilter === l ? levelBg(l === 'all' ? 'INFO' : l) : '#FFFFFF',
                color: levelFilter === l ? levelColor(l === 'all' ? 'INFO' : l) : '#4B5563',
                fontSize: 10, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontWeight: 700,
              }}
            >
              {l}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#4B5563', fontFamily: 'var(--font-mono)' }}>
          {logs.length} lines
        </div>
      </div>

      {/* Terminal log viewer */}
      <div
        style={{
          background: '#111827', border: '1px solid #1F2937',
          padding: 0, borderRadius: 0, overflow: 'hidden',
        }}
      >
        {/* Terminal title bar */}
        <div
          style={{
            background: '#1F2937', padding: '8px 16px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
          <span style={{ marginLeft: 12, fontSize: 11, color: '#4B5563', fontFamily: 'var(--font-mono)' }}>
            pipeline run #47 — stdout
          </span>
        </div>

        {/* Log lines */}
        <div style={{ padding: '12px 0', maxHeight: 520, overflowY: 'auto' }}>
          {logs.length === 0 ? (
            <div style={{ padding: '24px', fontSize: 12, color: '#4B5563', fontFamily: 'var(--font-mono)' }}>
              No log lines match current filters.
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 0,
                  padding: '3px 16px',
                  background: log.level === 'ERROR' ? 'rgba(239,68,68,0.08)' : log.level === 'WARN' ? 'rgba(245,158,11,0.05)' : 'transparent',
                }}
              >
                {/* Line num */}
                <span
                  style={{
                    fontSize: 10, color: '#1F2937', fontFamily: 'var(--font-mono)',
                    minWidth: 28, userSelect: 'none', flexShrink: 0,
                  }}
                >
                  {log.id}
                </span>
                {/* Timestamp */}
                <span
                  style={{
                    fontSize: 10, color: '#4B5563', fontFamily: 'var(--font-mono)',
                    minWidth: 96, flexShrink: 0,
                  }}
                >
                  {log.ts}
                </span>
                {/* Level badge */}
                <span
                  style={{
                    fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-mono)',
                    color: levelColor(log.level),
                    minWidth: 36, flexShrink: 0,
                  }}
                >
                  {log.level}
                </span>
                {/* Step */}
                <span
                  style={{
                    fontSize: 9, color: '#4B5563', fontFamily: 'var(--font-mono)',
                    minWidth: 120, flexShrink: 0, marginRight: 12,
                  }}
                >
                  [{log.step}]
                </span>
                {/* Message */}
                <span
                  style={{
                    fontSize: 11, color: '#D1D5DB', fontFamily: 'var(--font-mono)',
                    lineHeight: 1.5,
                  }}
                >
                  {log.msg}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PipelineLogs;
