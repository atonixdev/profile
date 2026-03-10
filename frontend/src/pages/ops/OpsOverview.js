import React from 'react';
import { Link } from 'react-router-dom';

// GS-WSF — Operational Control: System Overview
const HEALTH_STATS = [
  { label: 'Services Online',   value: '—',  status: 'nominal',  sub: 'Awaiting data'    },
  { label: 'Active Incidents',  value: '0',  status: 'nominal',  sub: 'No open incidents' },
  { label: 'Alerts Firing',     value: '0',  status: 'nominal',  sub: 'All clear'         },
  { label: 'Audit Events / 24h',value: '—',  status: 'nominal',  sub: 'Awaiting data'     },
];

const SUBSYSTEM_STATUS = [
  { name: 'API Gateway',          status: 'Operational', color: '#22C55E' },
  { name: 'Authentication',       status: 'Operational', color: '#22C55E' },
  { name: 'Pipeline Engine',      status: 'Operational', color: '#22C55E' },
  { name: 'Container Runtime',    status: 'Operational', color: '#22C55E' },
  { name: 'Model Flow Engine',    status: 'Operational', color: '#22C55E' },
  { name: 'Metrics Collector',    status: 'Operational', color: '#22C55E' },
  { name: 'Log Aggregator',       status: 'Operational', color: '#22C55E' },
  { name: 'Audit Service',        status: 'Operational', color: '#22C55E' },
  { name: 'Security Monitor',     status: 'Operational', color: '#22C55E' },
  { name: 'Notification Router',  status: 'Operational', color: '#22C55E' },
];

const QUICK_LINKS = [
  { label: 'View Service Health',    to: '/ops/services',     desc: 'Live status for every registered platform service.' },
  { label: 'Open Incident Center',   to: '/ops/incidents',    desc: 'Review, assign, and resolve operational incidents.' },
  { label: 'Inspect Security Events',to: '/ops/security',     desc: 'Monitor failed logins, policy violations, and access anomalies.' },
  { label: 'Browse Audit Logs',      to: '/ops/audit',        desc: 'Immutable record of every action on the platform.' },
];

const OpsOverview = () => (
  <div>
    {/* Header */}
    <div style={{ marginBottom: 36 }}>
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
        System Overview
      </h1>
      <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.7, maxWidth: 580 }}>
        Real-time visibility across every layer of the AtonixDev platform. Monitor health, incidents,
        security events, and operational metrics from a unified control plane.
      </p>
    </div>

    {/* Health stats */}
    <div
      style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        border: '1px solid #E5E7EB', borderRight: 'none', borderBottom: 'none',
        marginBottom: 36,
      }}
      className="ops-stats-grid"
    >
      {HEALTH_STATS.map((s) => (
        <div
          key={s.label}
          style={{
            background: '#FFFFFF', padding: '24px 20px',
            borderRight: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB',
          }}
        >
          <div
            style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: '#4B5563',
              fontFamily: 'var(--font-mono)', marginBottom: 8,
            }}
          >
            {s.label}
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#111827', lineHeight: 1, marginBottom: 6 }}>
            {s.value}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                display: 'inline-block', width: 6, height: 6,
                borderRadius: '50%', background: '#22C55E', flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 11, color: '#4B5563' }}>{s.sub}</span>
          </div>
        </div>
      ))}
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 36 }} className="ops-two-col">

      {/* Subsystem status */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
        <div
          style={{
            padding: '16px 20px', borderBottom: '1px solid #E5E7EB',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: '#111827', letterSpacing: '0.02em' }}>
            Subsystem Status
          </div>
          <div
            style={{
              fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700,
              letterSpacing: '0.1em', color: '#22C55E', textTransform: 'uppercase',
            }}
          >
            All Nominal
          </div>
        </div>
        <div>
          {SUBSYSTEM_STATUS.map((s, i) => (
            <div
              key={s.name}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '11px 20px',
                borderBottom: i < SUBSYSTEM_STATUS.length - 1 ? '1px solid #F3F4F6' : 'none',
              }}
            >
              <span style={{ fontSize: 13, color: '#1F2937' }}>{s.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    display: 'inline-block', width: 6, height: 6,
                    borderRadius: '50%', background: s.color, flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700,
                    letterSpacing: '0.08em', color: s.color, textTransform: 'uppercase',
                  }}
                >
                  {s.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {QUICK_LINKS.map((q) => (
          <Link
            key={q.to}
            to={q.to}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                background: '#FFFFFF', border: '1px solid #E5E7EB',
                padding: '18px 20px',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#A81D37'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; }}
            >
              <div
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{q.label}</span>
                <span style={{ fontSize: 14, color: '#A81D37' }}>→</span>
              </div>
              <p style={{ fontSize: 12, color: '#4B5563', margin: 0, lineHeight: 1.5 }}>{q.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>

    {/* Directive notice */}
    <div
      style={{
        background: '#0F172A', padding: '20px 24px',
        borderLeft: '3px solid #A81D37',
      }}
    >
      <div
        style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: '#A81D37',
          fontFamily: 'var(--font-mono)', marginBottom: 6,
        }}
      >
        Operational Control Directive
      </div>
      <p style={{ fontSize: 12, color: '#4B5563', margin: 0, lineHeight: 1.7 }}>
        Every service is monitored. Every action is logged. Every failure is detected.
        Every environment is governed. Every pipeline is traceable. Every model flow is accountable.
        This is the institutional operating system of AtonixDev.
      </p>
    </div>
  </div>
);

export default OpsOverview;
