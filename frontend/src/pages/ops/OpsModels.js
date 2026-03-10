import React, { useState } from 'react';

// GS-WSF — Operational Control: Model Flow Activity
const FILTER_LIST = ['All', 'Training', 'Inference', 'Evaluation', 'Registered', 'Failed'];

const MODEL_FLOWS = [
  { id: 'mf-001', model: 'sentiment-classifier-v2', version: 'v2.1.0', type: 'Inference',  accuracy: '94.2%', duration: '0m 12s', status: 'Success',  ts: '2026-03-09T08:01:00Z' },
  { id: 'mf-002', model: 'anomaly-detector-iot',     version: 'v1.3.1', type: 'Inference',  accuracy: '—',     duration: '0m 08s', status: 'Success',  ts: '2026-03-09T07:59:44Z' },
  { id: 'mf-003', model: 'churn-predictor',          version: 'v3.0.0', type: 'Training',   accuracy: '87.6%', duration: '18m 41s',status: 'Success',  ts: '2026-03-09T07:40:00Z' },
  { id: 'mf-004', model: 'nlp-intent-parser',        version: 'v1.0.0', type: 'Evaluation', accuracy: '91.0%', duration: '4m 02s', status: 'Success',  ts: '2026-03-09T07:28:00Z' },
  { id: 'mf-005', model: 'time-series-forecaster',   version: 'v2.0.0', type: 'Training',   accuracy: '—',     duration: '—',      status: 'Failed',   ts: '2026-03-09T07:15:00Z' },
  { id: 'mf-006', model: 'image-classifier-v1',      version: 'v1.2.0', type: 'Registered', accuracy: '96.1%', duration: '—',      status: 'Success',  ts: '2026-03-09T06:58:00Z' },
];

const STATUS_STYLES = {
  Success:    { bg: '#F0FDF4', color: '#16A34A', dot: '#22C55E' },
  Failed:     { bg: '#FEF2F2', color: '#DC2626', dot: '#EF4444' },
  Running:    { bg: '#EFF6FF', color: '#2563EB', dot: '#3B82F6' },
  Registered: { bg: '#F5F3FF', color: '#7C3AED', dot: '#8B5CF6' },
};

const OpsModels = () => {
  const [filter, setFilter] = useState('All');

  const visible = filter === 'All'
    ? MODEL_FLOWS
    : MODEL_FLOWS.filter((m) => m.type === filter || m.status === filter);

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
          Model Flow Activity
        </h1>
        <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.7, maxWidth: 560 }}>
          Accountable tracking of every model training run, inference call, evaluation, and registry event.
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          border: '1px solid #E5E7EB', borderRight: 'none',
          marginBottom: 28,
        }}
        className="ops-stats-grid"
      >
        {[
          { label: 'Total Flows (24h)', value: MODEL_FLOWS.length,                                              color: '#111827' },
          { label: 'Training Jobs',     value: MODEL_FLOWS.filter((m) => m.type === 'Training').length,        color: '#7C3AED' },
          { label: 'Inference Calls',   value: MODEL_FLOWS.filter((m) => m.type === 'Inference').length,       color: '#2563EB' },
          { label: 'Failed Flows',      value: MODEL_FLOWS.filter((m) => m.status === 'Failed').length,        color: '#DC2626' },
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
        {FILTER_LIST.map((f) => (
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
            display: 'grid', gridTemplateColumns: '70px 2.5fr 1fr 1fr 1fr 1fr 1fr 1.2fr',
            padding: '10px 20px',
            background: '#F9FAFB', borderBottom: '1px solid #E5E7EB',
          }}
        >
          {['ID', 'Model', 'Version', 'Type', 'Accuracy', 'Duration', 'Status', 'Timestamp'].map((h) => (
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

        {visible.map((m, i) => {
          const sc = STATUS_STYLES[m.status] || { bg: '#F9FAFB', color: '#4B5563', dot: '#4B5563' };
          return (
            <div
              key={m.id}
              style={{
                display: 'grid', gridTemplateColumns: '70px 2.5fr 1fr 1fr 1fr 1fr 1fr 1.2fr',
                padding: '12px 20px',
                borderBottom: i < visible.length - 1 ? '1px solid #F3F4F6' : 'none',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 10, color: '#4B5563', fontFamily: 'var(--font-mono)' }}>{m.id}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{m.model}</span>
              <span style={{ fontSize: 11, color: '#4B5563', fontFamily: 'var(--font-mono)' }}>{m.version}</span>
              <span style={{ fontSize: 10, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>{m.type}</span>
              <span style={{ fontSize: 12, color: '#1F2937' }}>{m.accuracy}</span>
              <span style={{ fontSize: 12, color: '#1F2937', fontFamily: 'var(--font-mono)' }}>{m.duration}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: sc.dot, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: sc.color, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                  {m.status}
                </span>
              </div>
              <span style={{ fontSize: 10, color: '#4B5563', fontFamily: 'var(--font-mono)' }}>
                {m.ts.replace('T', ' ').replace('Z', '')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OpsModels;
