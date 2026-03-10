import React from 'react';

// GS-WSF — Dashboard Module: Pipelines
const Pipelines = () => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A81D37', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
          Developer Console
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 6, lineHeight: 1.2 }}>Pipelines</h1>
        <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65 }}>
          Create and manage CI/CD pipelines, automated build processes, test suites, and deployment workflows.
        </p>
      </div>
      <button
        style={{
          padding: '10px 24px', background: '#A81D37', color: '#FFFFFF',
          border: 'none', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, marginTop: 4,
        }}
      >
        + New Pipeline
      </button>
    </div>

    {/* Tabs */}
    <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #E5E7EB', marginBottom: 24 }}>
      {['All Pipelines', 'Running', 'Failed', 'Scheduled'].map((tab, i) => (
        <button
          key={tab}
          style={{
            padding: '10px 20px',
            background: 'none', border: 'none',
            borderBottom: i === 0 ? '2px solid #A81D37' : '2px solid transparent',
            fontSize: 13, fontWeight: i === 0 ? 700 : 400,
            color: i === 0 ? '#111827' : '#6B7280',
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          {tab}
        </button>
      ))}
    </div>

    {/* Table */}
    <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
      <div
        style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
          borderBottom: '1px solid #E5E7EB', padding: '10px 20px', background: '#F8F9FA',
        }}
      >
        {['Pipeline Name', 'Project', 'Status', 'Last Run', 'Actions'].map((col) => (
          <div key={col} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', fontFamily: 'var(--font-mono)' }}>
            {col}
          </div>
        ))}
      </div>
      <div style={{ padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ width: 32, height: 2, background: '#E5E7EB', margin: '0 auto 20px' }} />
        <p style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 8 }}>No pipelines configured</p>
        <p style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.65, maxWidth: 420, margin: '0 auto 24px' }}>
          Configure a CI/CD pipeline to automate your build, test, and deployment process.
          Pipelines support Docker, Kubernetes, and custom build scripts.
        </p>
        <button
          style={{
            padding: '10px 28px', background: '#A81D37', color: '#FFFFFF',
            border: 'none', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Create Pipeline
        </button>
      </div>
    </div>
  </div>
);

export default Pipelines;
