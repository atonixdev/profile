import React, { useState } from 'react';

// GS-WSF — Operational Control: Security Events
const EVENT_TYPES = ['All', 'Failed Login', 'Unauthorized Access', 'Policy Violation', 'Suspicious Activity', 'Permission Change'];

const EVENTS = [
  { ts: '2026-03-09T08:00:12Z', type: 'Failed Login',        severity: 'LOW',    actor: 'unknown',            resource: 'Auth Service',    detail: '3 consecutive failed login attempts from IP 203.0.113.44' },
  { ts: '2026-03-09T07:55:31Z', type: 'Permission Change',   severity: 'MEDIUM', actor: 'admin@atonixdev.io', resource: 'User: dev_user_7', detail: 'Role elevated from Developer to Admin' },
  { ts: '2026-03-09T07:48:02Z', type: 'Policy Violation',    severity: 'HIGH',   actor: 'pipeline-runner-03', resource: 'Pipeline Engine', detail: 'Pipeline attempted to access restricted environment variable' },
  { ts: '2026-03-09T07:32:19Z', type: 'Unauthorized Access', severity: 'HIGH',   actor: 'unknown',            resource: 'API Gateway',     detail: 'Request to /admin/ops without valid session token' },
  { ts: '2026-03-09T07:14:55Z', type: 'Suspicious Activity', severity: 'MEDIUM', actor: 'api-key-9f3c',      resource: 'Model Registry',  detail: 'Unusual burst of 1,240 API calls in 60 seconds' },
  { ts: '2026-03-09T06:58:40Z', type: 'Failed Login',        severity: 'LOW',    actor: 'unknown',            resource: 'Auth Service',    detail: '1 failed login attempt — Admin portal' },
  { ts: '2026-03-09T06:40:11Z', type: 'Permission Change',   severity: 'LOW',    actor: 'admin@atonixdev.io', resource: 'User: ops_user_2',detail: 'SSH key added to account' },
];

const SEV_STYLES = {
  LOW:    { bg: '#EFF6FF', color: '#2563EB' },
  MEDIUM: { bg: '#FFFBEB', color: '#D97706' },
  HIGH:   { bg: '#FEF2F2', color: '#DC2626' },
  CRITICAL:{ bg: '#7F1D1D', color: '#FCA5A5' },
};

const OpsSecurity = () => {
  const [filter, setFilter] = useState('All');

  const visible = filter === 'All' ? EVENTS : EVENTS.filter((e) => e.type === filter);

  const highCount = EVENTS.filter((e) => e.severity === 'HIGH' || e.severity === 'CRITICAL').length;

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
          Security Events
        </h1>
        <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.7, maxWidth: 560 }}>
          Real-time monitoring of failed logins, unauthorized access attempts, policy violations,
          and security anomalies across the platform.
        </p>
      </div>

      {/* Stats bar */}
      <div
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          border: '1px solid #E5E7EB', borderRight: 'none',
          marginBottom: 28,
        }}
      >
        {[
          { label: 'Total Events (24h)', value: EVENTS.length, color: '#111827' },
          { label: 'High / Critical',    value: highCount,     color: '#DC2626' },
          { label: 'Policy Violations',  value: EVENTS.filter((e) => e.type === 'Policy Violation').length, color: '#D97706' },
          { label: 'Failed Logins',      value: EVENTS.filter((e) => e.type === 'Failed Login').length, color: '#2563EB' },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: '#FFFFFF', padding: '18px 20px',
              borderRight: '1px solid #E5E7EB',
            }}
          >
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
        {EVENT_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            style={{
              padding: '6px 14px', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              background: filter === t ? '#A81D37' : '#F9FAFB',
              color: filter === t ? '#FFFFFF' : '#4B5563',
              border: filter === t ? '1px solid #A81D37' : '1px solid #E5E7EB',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Events list */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
        {/* Table header */}
        <div
          style={{
            display: 'grid', gridTemplateColumns: '160px 1.5fr 60px 1.5fr 1fr',
            padding: '10px 20px',
            background: '#F9FAFB', borderBottom: '1px solid #E5E7EB',
          }}
        >
          {['Timestamp', 'Event Type', 'Sev.', 'Actor / Resource', 'Detail'].map((h) => (
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

        {visible.map((e, i) => {
          const sc = SEV_STYLES[e.severity] || { bg: '#F9FAFB', color: '#4B5563' };
          return (
            <div
              key={i}
              style={{
                display: 'grid', gridTemplateColumns: '160px 1.5fr 60px 1.5fr 1fr',
                padding: '12px 20px',
                borderBottom: i < visible.length - 1 ? '1px solid #F3F4F6' : 'none',
                alignItems: 'start',
              }}
            >
              <span style={{ fontSize: 11, color: '#4B5563', fontFamily: 'var(--font-mono)', paddingTop: 2 }}>
                {e.ts.replace('T', ' ').replace('Z', '')}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{e.type}</span>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
                  padding: '2px 6px', background: sc.bg, color: sc.color,
                  textAlign: 'center', alignSelf: 'start', whiteSpace: 'nowrap',
                }}
              >
                {e.severity}
              </span>
              <div>
                <div style={{ fontSize: 11, color: '#1F2937', fontFamily: 'var(--font-mono)' }}>{e.actor}</div>
                <div style={{ fontSize: 11, color: '#4B5563' }}>{e.resource}</div>
              </div>
              <span style={{ fontSize: 12, color: '#4B5563', lineHeight: 1.5 }}>{e.detail}</span>
            </div>
          );
        })}

        {visible.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#4B5563', fontSize: 13 }}>
            No security events match the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};

export default OpsSecurity;
