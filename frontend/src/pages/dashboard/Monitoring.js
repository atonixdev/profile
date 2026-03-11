import React, { useState } from 'react';

// GS-WSF — Dashboard Module: Monitoring
const METRICS = [
  { label: 'CPU Usage',    unit: '%',  value: '--' },
  { label: 'Memory',       unit: 'MB', value: '--' },
  { label: 'Request Rate', unit: '/s', value: '--' },
  { label: 'Error Rate',   unit: '%',  value: '--' },
];

const LOG_TABS = ['Logs', 'Alerts', 'Traces'];

const Monitoring = () => {
  const [activeTab, setActiveTab] = useState('Logs');

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A81D37', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
          Developer Console
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 6, lineHeight: 1.2 }}>Monitoring</h1>
        <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.65 }}>
          Real-time metrics, log aggregation, trace analysis, and alert management for deployed projects.
        </p>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 16, marginBottom: 32 }}>
        {METRICS.map((m) => (
          <div key={m.label} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '22px 20px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4B5563', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
              {m.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: '#4B5563', lineHeight: 1 }}>{m.value}</span>
              <span style={{ fontSize: 12, color: '#4B5563', fontFamily: 'var(--font-mono)' }}>{m.unit}</span>
            </div>
            <div style={{ fontSize: 11, color: '#D1D5DB', marginTop: 6 }}>No active deployments</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #E5E7EB', display: 'flex', gap: 0, marginBottom: 0 }}>
        {LOG_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 24px', border: 'none', background: 'none',
              fontSize: 12, fontWeight: activeTab === tab ? 700 : 500,
              color: activeTab === tab ? '#111827' : '#4B5563',
              borderBottom: activeTab === tab ? '2px solid #A81D37' : '2px solid transparent',
              marginBottom: -1, cursor: 'pointer', fontFamily: 'inherit',
              letterSpacing: '0.04em',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderTop: 'none', padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ width: 32, height: 2, background: '#E5E7EB', margin: '0 auto 20px' }} />
        <p style={{ fontSize: 14, fontWeight: 700, color: '#1F2937', marginBottom: 8 }}>
          {activeTab === 'Logs' && 'No log streams active'}
          {activeTab === 'Alerts' && 'No alerts configured'}
          {activeTab === 'Traces' && 'No trace data collected'}
        </p>
        <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.65, maxWidth: 440, margin: '0 auto' }}>
          {activeTab === 'Logs' && 'Deploy a project to start collecting application and infrastructure logs.'}
          {activeTab === 'Alerts' && 'Deploy a project and configure alert thresholds to receive notifications on anomalies.'}
          {activeTab === 'Traces' && 'Instrument your application to capture distributed traces and performance insights.'}
        </p>
      </div>
    </div>
  );
};

export default Monitoring;
