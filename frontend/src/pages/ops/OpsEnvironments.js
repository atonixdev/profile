import React from 'react';

// GS-WSF — Operational Control: Environment Health
const ENVIRONMENTS = [
  { name: 'production',   type: 'Production',  region: 'US-East-1',   services: 12, version: 'v4.2.1',  status: 'Healthy',    color: '#22C55E', lastDeploy: '2026-03-09T06:00:00Z' },
  { name: 'staging',      type: 'Staging',     region: 'US-East-1',   services: 12, version: 'v4.3.0-rc',status: 'Healthy',    color: '#22C55E', lastDeploy: '2026-03-09T07:30:00Z' },
  { name: 'dev',          type: 'Development', region: 'US-East-1',   services: 10, version: 'v4.3.1-dev',status: 'Healthy',   color: '#22C55E', lastDeploy: '2026-03-09T07:58:00Z' },
  { name: 'iot-prod',     type: 'IoT Agent',   region: 'On-Prem',     services: 4,  version: 'v1.5.0',   status: 'Healthy',   color: '#22C55E', lastDeploy: '2026-03-08T22:00:00Z' },
  { name: 'ml-inference', type: 'ML Serving',  region: 'US-East-1',   services: 3,  version: 'v2.0.1',   status: 'Healthy',   color: '#22C55E', lastDeploy: '2026-03-09T05:00:00Z' },
];

const TYPE_STYLES = {
  Production:  { bg: '#FEF2F2', color: '#DC2626' },
  Staging:     { bg: '#FFFBEB', color: '#D97706' },
  Development: { bg: '#EFF6FF', color: '#2563EB' },
  'IoT Agent': { bg: '#F0FDF4', color: '#16A34A' },
  'ML Serving':{ bg: '#F5F3FF', color: '#7C3AED' },
};

const OpsEnvironments = () => (
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
        Environment Health
      </h1>
      <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.7, maxWidth: 560 }}>
        Governance and health status for every deployment environment across the platform.
      </p>
    </div>

    {/* Summary */}
    <div
      style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        border: '1px solid #E5E7EB', borderRight: 'none',
        marginBottom: 36,
      }}
      className="ops-stats-grid"
    >
      {[
        { label: 'Total Environments', value: ENVIRONMENTS.length,                                          color: '#111827' },
        { label: 'Healthy',            value: ENVIRONMENTS.filter((e) => e.status === 'Healthy').length,  color: '#16A34A' },
        { label: 'Degraded',           value: ENVIRONMENTS.filter((e) => e.status === 'Degraded').length, color: '#D97706' },
        { label: 'Total Services',     value: ENVIRONMENTS.reduce((a, e) => a + e.services, 0),           color: '#2563EB' },
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

    {/* Environment cards */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="ops-two-col">
      {ENVIRONMENTS.map((env) => {
        const tc = TYPE_STYLES[env.type] || { bg: '#F9FAFB', color: '#4B5563' };
        return (
          <div key={env.name} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
            {/* Card top bar */}
            <div
              style={{
                padding: '14px 20px', borderBottom: '1px solid #E5E7EB',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#111827', fontFamily: 'var(--font-mono)' }}>
                  {env.name}
                </span>
                <span
                  style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                    padding: '2px 8px', background: tc.bg, color: tc.color,
                    textTransform: 'uppercase',
                  }}
                >
                  {env.type}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    display: 'inline-block', width: 7, height: 7,
                    borderRadius: '50%', background: env.color,
                  }}
                />
                <span
                  style={{
                    fontSize: 10, fontWeight: 700, color: env.color,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {env.status}
                </span>
              </div>
            </div>

            {/* Card body */}
            <div style={{ padding: '16px 20px' }}>
              <div
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  gap: '12px 24px',
                }}
              >
                {[
                  { label: 'Region',      value: env.region },
                  { label: 'Version',     value: env.version },
                  { label: 'Services',    value: `${env.services} active` },
                  { label: 'Last Deploy', value: env.lastDeploy.replace('T', ' ').replace('Z', '') },
                ].map((r) => (
                  <div key={r.label}>
                    <div
                      style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                        textTransform: 'uppercase', color: '#4B5563',
                        fontFamily: 'var(--font-mono)', marginBottom: 3,
                      }}
                    >
                      {r.label}
                    </div>
                    <div style={{ fontSize: 12, color: '#1F2937', fontFamily: 'var(--font-mono)' }}>{r.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default OpsEnvironments;
