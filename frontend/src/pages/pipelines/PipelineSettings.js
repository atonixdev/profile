import React, { useState } from 'react';

// ── demo settings data ─────────────────────────────────────────────────────
const PIPELINE_DEF = `name: fraud_detection_pipeline
on:
  push:
    branches: [main, 'feature/*']
  schedule:
    - cron: '0 2 * * *'   # nightly at 02:00 UTC

model_flow: fraud_detection
versioning: auto

resources:
  cpu: 4
  memory: 8192  # MB
  gpu: 1

steps:
  - name: build_container
    image: python:3.11-slim
    script:
      - pip install -r requirements.txt

  - name: data_validation
    image: atonixdev/validator:2.1
    script:
      - python validate.py --schema=v1.4

  - name: feature_eng
    image: atonixdev/spark:3.4
    parallel: true
    script:
      - python feature_engineering.py

  - name: train_model
    image: atonixdev/torch:2.0-gpu
    resources:
      cpu: 8
      memory: 16384
      gpu: 2
    script:
      - python train.py --epochs=50 --lr=0.001

  - name: evaluate_model
    image: atonixdev/eval:1.3
    script:
      - python evaluate.py --threshold=0.5

  - name: generate_report
    image: atonixdev/report:0.9
    script:
      - python generate_report.py

  - name: upload_artifact
    image: atonixdev/publish:1.0
    script:
      - python upload.py --registry=atonixdev`;

const ENV_VARS = [
  { key: 'ATONIX_REGISTRY_URL',   value: 'https://registry.atonixdev.com', secret: false },
  { key: 'MODEL_ARTIFACT_PATH',   value: '/mnt/artifacts',                 secret: false },
  { key: 'DATASET_PATH',          value: '/mnt/datasets/fraud_v3',         secret: false },
  { key: 'MLFLOW_TRACKING_URI',   value: 'https://mlflow.atonixdev.com',  secret: false },
  { key: 'REGISTRY_TOKEN',        value: '••••••••••••••••',               secret: true  },
  { key: 'SLACK_WEBHOOK',         value: '••••••••••••••••',               secret: true  },
];

const MODEL_FLOW = {
  id:          'mf_fraud_detection_001',
  name:        'fraud_detection',
  owner:       'samuel.realm',
  versioning:  'auto',
  active_ver:  'v1.3.0',
  total_ver:   11,
  created:     'Jan 15, 2026',
};
// ──────────────────────────────────────────────────────────────────────────

const eyebrow = { fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A81D37', fontFamily: 'var(--font-mono)', marginBottom: 6 };
const card    = { background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '24px 28px', marginBottom: 24 };
const label   = { fontSize: 9, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', marginBottom: 4 };

const PipelineSettings = () => {
  const [yamlOpen, setYamlOpen] = useState(true);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={eyebrow}>Pipeline Console — Settings</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 6, lineHeight: 1.2 }}>
          Pipeline Settings
        </h1>
        <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65 }}>
          Configuration for <strong style={{ color: '#111827' }}>fraud_detection_pipeline</strong>.
          Changes take effect on the next triggered run.
        </p>
      </div>

      {/* Model Flow binding */}
      <div style={card}>
        <div style={eyebrow}>Model Flow Binding</div>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>
          Bound Model Flow
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, padding: '16px', background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
          {Object.entries(MODEL_FLOW).map(([k, v]) => (
            <div key={k}>
              <div style={label}>{k.replace(/_/g, ' ')}</div>
              <div style={{ fontSize: 12, color: '#111827', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Resource limits */}
      <div style={card}>
        <div style={eyebrow}>Default Resource Limits</div>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>
          Pipeline-Level Resources
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { l: 'CPU Cores',     v: '4 vCPU',   note: 'Overridable per-step' },
            { l: 'Memory',        v: '8,192 MB',  note: 'Overridable per-step' },
            { l: 'GPU Units',     v: '1 GPU',     note: 'NVIDIA A100 40 GB' },
          ].map(({ l, v, note }) => (
            <div
              key={l}
              style={{ padding: '16px 18px', background: '#F9FAFB', border: '1px solid #E5E7EB' }}
            >
              <div style={label}>{l}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#111827', lineHeight: 1, marginBottom: 4 }}>{v}</div>
              <div style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'var(--font-mono)' }}>{note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Environment variables */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={eyebrow}>Environment</div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Environment Variables</h2>
          </div>
          <button
            style={{
              padding: '7px 14px', background: '#A81D37', border: 'none',
              color: '#FFFFFF', fontSize: 11, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            + Add Variable
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Key', 'Value', 'Type'].map((h) => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B7280', borderBottom: '1px solid #E5E7EB', background: '#F9FAFB', fontFamily: 'var(--font-mono)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ENV_VARS.map((ev) => (
              <tr key={ev.key}>
                <td style={{ padding: '11px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#111827', fontSize: 12, borderBottom: '1px solid #F3F4F6' }}>
                  {ev.key}
                </td>
                <td style={{ padding: '11px 16px', fontFamily: 'var(--font-mono)', color: '#6B7280', fontSize: 11, borderBottom: '1px solid #F3F4F6', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ev.value}
                </td>
                <td style={{ padding: '11px 16px', borderBottom: '1px solid #F3F4F6' }}>
                  <span
                    style={{
                      padding: '2px 8px', fontSize: 9, fontWeight: 700,
                      background: ev.secret ? '#FEF2F2' : '#F0FDF4',
                      color: ev.secret ? '#EF4444' : '#10B981',
                      fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}
                  >
                    {ev.secret ? 'secret' : 'plain'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* YAML definition */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={eyebrow}>Pipeline Definition</div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>YAML Source</h2>
          </div>
          <button
            onClick={() => setYamlOpen((o) => !o)}
            style={{ background: 'none', border: '1px solid #E5E7EB', padding: '6px 12px', fontSize: 11, color: '#6B7280', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}
          >
            {yamlOpen ? 'Collapse ↑' : 'Expand ↓'}
          </button>
        </div>
        {yamlOpen && (
          <pre
            style={{
              margin: 0, padding: '16px 20px',
              background: '#111827', color: '#E5E7EB',
              fontSize: 11, fontFamily: 'var(--font-mono)',
              lineHeight: 1.65, overflowX: 'auto',
              border: '1px solid #1F2937',
              maxHeight: 460, overflowY: 'auto',
            }}
          >
            {PIPELINE_DEF}
          </pre>
        )}
      </div>

      {/* Danger zone */}
      <div
        style={{
          border: '1px solid #FECACA', background: '#FEF2F2', padding: '20px 24px',
        }}
      >
        <div style={{ ...eyebrow, color: '#EF4444' }}>Danger Zone</div>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Destructive Actions</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Archive Pipeline',  note: 'Disables future runs. Reversible.' },
            { label: 'Delete All Runs',   note: 'Purge run history. Irreversible.' },
            { label: 'Unbind Model Flow', note: 'Removes model flow association.' },
          ].map(({ label: lbl, note }) => (
            <div
              key={lbl}
              style={{ background: '#FFFFFF', border: '1px solid #FECACA', padding: '14px 18px', flex: '1 1 200px' }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{lbl}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 12 }}>{note}</div>
              <button
                style={{
                  padding: '7px 14px', background: 'none',
                  border: '1px solid #EF4444', color: '#EF4444',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'inherit', letterSpacing: '0.06em', textTransform: 'uppercase',
                }}
              >
                {lbl}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PipelineSettings;
