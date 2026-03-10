import React, { useState } from 'react';

// GS-WSF — Operational Control: Operational Logs
const LOG_LEVELS = ['All', 'INFO', 'WARN', 'ERROR', 'DEBUG'];
const LOG_SOURCES = ['All', 'API Gateway', 'Auth', 'Pipeline', 'Container', 'Model Flow', 'Deployment', 'System'];

const SAMPLE_LOGS = [
  { ts: '2026-03-09T08:01:12Z', level: 'INFO',  source: 'API Gateway',   message: 'Request routed to auth service — 200 OK — 42ms' },
  { ts: '2026-03-09T08:01:10Z', level: 'INFO',  source: 'Auth',          message: 'Token refresh successful for user session' },
  { ts: '2026-03-09T08:01:05Z', level: 'INFO',  source: 'Pipeline',      message: 'Pipeline build queued — awaiting runner allocation' },
  { ts: '2026-03-09T08:00:58Z', level: 'WARN',  source: 'Container',     message: 'Container memory usage at 78% — threshold approaching' },
  { ts: '2026-03-09T08:00:44Z', level: 'INFO',  source: 'Model Flow',    message: 'Model inference request processed — 156ms' },
  { ts: '2026-03-09T08:00:31Z', level: 'INFO',  source: 'Deployment',    message: 'Environment variables validated — deployment cleared' },
  { ts: '2026-03-09T08:00:19Z', level: 'DEBUG', source: 'System',        message: 'Health check passed — all subsystems responding' },
  { ts: '2026-03-09T08:00:02Z', level: 'INFO',  source: 'API Gateway',   message: 'Rate limiter reset cycle completed' },
  { ts: '2026-03-09T07:59:48Z', level: 'ERROR', source: 'Pipeline',      message: 'Build step failed — exit code 1 — runner timeout' },
  { ts: '2026-03-09T07:59:33Z', level: 'INFO',  source: 'Auth',          message: 'New admin session initiated' },
  { ts: '2026-03-09T07:59:12Z', level: 'INFO',  source: 'Model Flow',    message: 'Model version v2.1.0 registered in registry' },
  { ts: '2026-03-09T07:58:55Z', level: 'WARN',  source: 'API Gateway',   message: 'Upstream service latency spike detected — 1240ms' },
];

const LEVEL_COLORS = {
  INFO:  { bg: '#EFF6FF', color: '#2563EB' },
  WARN:  { bg: '#FFFBEB', color: '#D97706' },
  ERROR: { bg: '#FEF2F2', color: '#DC2626' },
  DEBUG: { bg: '#F0FDF4', color: '#16A34A' },
};

const OpsLogs = () => {
  const [level, setLevel]   = useState('All');
  const [source, setSource] = useState('All');
  const [search, setSearch] = useState('');

  const visible = SAMPLE_LOGS.filter((l) => {
    if (level !== 'All' && l.level !== level) return false;
    if (source !== 'All' && l.source !== source) return false;
    if (search && !l.message.toLowerCase().includes(search.toLowerCase()) && !l.source.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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
          Operational Logs
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7, maxWidth: 560 }}>
          Structured, timestamped, and queryable application, system, security, and pipeline logs.
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '8px 14px', fontSize: 13, border: '1px solid #E5E7EB',
            fontFamily: 'var(--font-mono)', background: '#FFFFFF', color: '#111827',
            outline: 'none', minWidth: 220,
          }}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {LOG_LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              style={{
                padding: '6px 12px', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                background: level === l ? '#A81D37' : '#F9FAFB',
                color: level === l ? '#FFFFFF' : '#6B7280',
                border: level === l ? '1px solid #A81D37' : '1px solid #E5E7EB',
                cursor: 'pointer', fontFamily: 'var(--font-mono)',
              }}
            >
              {l}
            </button>
          ))}
        </div>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          style={{
            padding: '8px 12px', fontSize: 12, border: '1px solid #E5E7EB',
            fontFamily: 'inherit', background: '#FFFFFF', color: '#374151', outline: 'none',
          }}
        >
          {LOG_SOURCES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Log count */}
      <div
        style={{
          fontSize: 11, color: '#9CA3AF', fontFamily: 'var(--font-mono)',
          marginBottom: 12, letterSpacing: '0.06em',
        }}
      >
        SHOWING {visible.length} OF {SAMPLE_LOGS.length} ENTRIES
      </div>

      {/* Log feed */}
      <div style={{ background: '#0F172A', border: '1px solid #1E293B', padding: '4px 0' }}>
        {visible.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: '#4B5563', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
            No log entries match the current filters.
          </div>
        ) : visible.map((l, i) => {
          const lc = LEVEL_COLORS[l.level] || { bg: '#F9FAFB', color: '#6B7280' };
          return (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '9px 16px',
                borderBottom: i < visible.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <span style={{ fontSize: 10, color: '#4B5563', whiteSpace: 'nowrap', minWidth: 170, paddingTop: 1 }}>
                {l.ts.replace('T', ' ').replace('Z', '')}
              </span>
              <span
                style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                  padding: '2px 6px', background: lc.bg, color: lc.color,
                  flexShrink: 0, minWidth: 44, textAlign: 'center',
                }}
              >
                {l.level}
              </span>
              <span
                style={{
                  fontSize: 10, color: '#6B7280', whiteSpace: 'nowrap',
                  flexShrink: 0, minWidth: 100, paddingTop: 1,
                }}
              >
                {l.source}
              </span>
              <span style={{ fontSize: 12, color: '#D1D5DB', lineHeight: 1.5 }}>{l.message}</span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 12, fontSize: 11, color: '#9CA3AF',
          fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
        }}
      >
        LIVE LOG STREAM — CONNECT BACKEND LOG API FOR REAL-TIME DATA
      </div>
    </div>
  );
};

export default OpsLogs;
