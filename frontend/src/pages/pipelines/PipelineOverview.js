import React from 'react';
import { Link, useParams } from 'react-router-dom';

// ── demo data ──────────────────────────────────────────────────────────────
const STATS = [
  { label: 'Last Run Status', value: 'Completed',   sub: 'run #47',       color: '#10B981', bg: '#F0FDF4', border: '#BBF7D0' },
  { label: 'Duration',        value: '3m 42s',       sub: '↓ 8s vs prev',  color: '#111827', bg: '#F9FAFB', border: '#E5E7EB' },
  { label: 'Success Rate',    value: '94.1%',        sub: 'last 17 runs',  color: '#111827', bg: '#F9FAFB', border: '#E5E7EB' },
  { label: 'Total Runs',      value: '47',           sub: 'since Jan 2026', color: '#111827', bg: '#F9FAFB', border: '#E5E7EB' },
];

const RUNS = [
  { id: 'run_047', status: 'completed', trigger: 'push',     branch: 'main',              sha: 'a1b2c3d4', duration: '3m 42s', time: 'Mar 9, 14:22' },
  { id: 'run_046', status: 'failed',    trigger: 'push',     branch: 'feature/retrain',   sha: 'f9e8d7c6', duration: '1m 12s', time: 'Mar 9, 11:05' },
  { id: 'run_045', status: 'completed', trigger: 'schedule', branch: 'main',              sha: '4a3b2c1d', duration: '4m 01s', time: 'Mar 8, 02:00' },
  { id: 'run_044', status: 'completed', trigger: 'manual',   branch: 'main',              sha: 'c1d2e3f4', duration: '3m 55s', time: 'Mar 7, 16:30' },
  { id: 'run_043', status: 'cancelled', trigger: 'push',     branch: 'hotfix/threshold',  sha: '2a1b4c3d', duration: '0m 22s', time: 'Mar 7, 14:11' },
];

const STEPS = [
  { name: 'build_container',  status: 'completed', duration: '0m 48s' },
  { name: 'data_validation',  status: 'completed', duration: '0m 19s' },
  { name: 'train_model',      status: 'completed', duration: '2m 11s' },
  { name: 'evaluate_model',   status: 'completed', duration: '0m 21s' },
  { name: 'generate_report',  status: 'completed', duration: '0m 15s' },
  { name: 'upload_artifact',  status: 'completed', duration: '0m 08s' },
];
// ──────────────────────────────────────────────────────────────────────────

const statusColor  = (s) => ({ completed: '#10B981', failed: '#EF4444', running: '#3B82F6', cancelled: '#4B5563', pending: '#F59E0B' }[s] || '#4B5563');
const statusBg     = (s) => ({ completed: '#F0FDF4', failed: '#FEF2F2', running: '#EFF6FF', cancelled: '#F9FAFB', pending: '#FFFBEB' }[s] || '#F9FAFB');
const statusBorder = (s) => ({ completed: '#BBF7D0', failed: '#FECACA', running: '#BFDBFE', cancelled: '#E5E7EB', pending: '#FDE68A' }[s] || '#E5E7EB');
const triggerColor = (t) => ({ push: '#7C3AED', manual: '#0284C7', schedule: '#D97706', api: '#059669' }[t] || '#4B5563');
const triggerBg    = (t) => ({ push: '#F5F3FF', manual: '#E0F2FE', schedule: '#FFFBEB', api: '#ECFDF5' }[t] || '#F9FAFB');

const card = { background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '20px 24px', marginBottom: 24 };
const eyebrow = { fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A81D37', fontFamily: 'var(--font-mono)', marginBottom: 6 };
const th = { padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4B5563', borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' };
const td = { padding: '11px 16px', fontSize: 12, color: '#1F2937', borderBottom: '1px solid #F3F4F6', verticalAlign: 'middle' };

const PipelineOverview = () => {
  const { pipelineId } = useParams();
  const base = `/pipelines/${pipelineId}`;
  const pipelineLabel = pipelineId ? pipelineId.replace(/-/g, '_') : 'pipeline_001';

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={eyebrow}>Pipeline Console — Overview</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 6, lineHeight: 1.2 }}>
          {pipelineLabel}
        </h1>
        <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.65 }}>
          Model Flow: <strong style={{ color: '#111827' }}>fraud_detection</strong>
          &nbsp;·&nbsp;Versioning: auto
          &nbsp;·&nbsp;Branch: <code style={{ fontFamily: 'var(--font-mono)', background: '#F3F4F6', padding: '1px 5px' }}>main</code>
        </p>
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16, marginBottom: 28,
        }}
      >
        {STATS.map((s) => (
          <div
            key={s.label}
            style={{ background: s.bg, border: `1px solid ${s.border}`, padding: '18px 20px' }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4B5563', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
              {s.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: '#4B5563', marginTop: 5 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent runs */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={eyebrow}>Run History</div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Recent Pipeline Runs</h2>
          </div>
          <Link
            to={`${base}/steps`}
            style={{ fontSize: 11, fontWeight: 700, color: '#A81D37', textDecoration: 'none', letterSpacing: '0.06em' }}
          >
            View Steps →
          </Link>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Run ID</th>
              <th style={th}>Status</th>
              <th style={th}>Trigger</th>
              <th style={th}>Branch</th>
              <th style={th}>Commit</th>
              <th style={th}>Duration</th>
              <th style={th}>Time</th>
            </tr>
          </thead>
          <tbody>
            {RUNS.map((r) => (
              <tr key={r.id}>
                <td style={{ ...td, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#111827' }}>
                  {r.id}
                </td>
                <td style={td}>
                  <span
                    style={{
                      padding: '2px 8px', fontSize: 10, fontWeight: 700,
                      background: statusBg(r.status), color: statusColor(r.status),
                      border: `1px solid ${statusBorder(r.status)}`,
                      fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}
                  >
                    {r.status}
                  </span>
                </td>
                <td style={td}>
                  <span
                    style={{
                      padding: '2px 8px', fontSize: 10, fontWeight: 700,
                      background: triggerBg(r.trigger), color: triggerColor(r.trigger),
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {r.trigger}
                  </span>
                </td>
                <td style={{ ...td, fontFamily: 'var(--font-mono)', fontSize: 11 }}>{r.branch}</td>
                <td style={{ ...td, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#4B5563' }}>{r.sha}</td>
                <td style={{ ...td, fontFamily: 'var(--font-mono)', fontSize: 11 }}>{r.duration}</td>
                <td style={{ ...td, fontSize: 11, color: '#4B5563' }}>{r.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Last run step summary */}
      <div style={card}>
        <div style={eyebrow}>Last Run — run #47</div>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Step Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {STEPS.map((step) => (
            <div
              key={step.name}
              style={{
                padding: '14px 16px',
                background: '#F9FAFB',
                border: `1px solid ${statusBorder(step.status)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11, fontWeight: 700, color: '#111827',
                    fontFamily: 'var(--font-mono)', marginBottom: 3,
                  }}
                >
                  {step.name}
                </div>
                <div style={{ fontSize: 10, color: '#4B5563', fontFamily: 'var(--font-mono)' }}>
                  {step.duration}
                </div>
              </div>
              <span
                style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: statusColor(step.status), display: 'inline-block',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PipelineOverview;
