import React from 'react';

// GS-WSF — Dashboard Module: Environments
const ENV_TYPES = [
  { name: 'Production',   desc: 'Live environment serving end users. Maximum stability required.' },
  { name: 'Staging',      desc: 'Pre-production validation environment mirroring production.' },
  { name: 'Development',  desc: 'Active development and feature integration environment.' },
];

const Environments = () => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A81D37', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
          Developer Console
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 6, lineHeight: 1.2 }}>Environments</h1>
        <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.65 }}>
          Create isolated deployment environments, manage configuration variables, and control secrets per environment.
        </p>
      </div>
      <button
        style={{
          padding: '10px 24px', background: '#A81D37', color: '#FFFFFF',
          border: 'none', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, marginTop: 4,
        }}
      >
        + New Environment
      </button>
    </div>

    {/* Environment type guide */}
    <div
      style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        border: '1px solid #E5E7EB', borderRight: 'none', borderBottom: 'none',
        marginBottom: 24,
      }}
    >
      {ENV_TYPES.map((env) => (
        <div
          key={env.name}
          style={{
            padding: '20px 20px',
            borderRight: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB',
            background: '#F8F9FA',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{env.name}</div>
          <div style={{ fontSize: 12, color: '#4B5563', lineHeight: 1.6 }}>{env.desc}</div>
        </div>
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
        {['Environment', 'Type', 'Variables', 'Status', 'Actions'].map((col) => (
          <div key={col} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4B5563', fontFamily: 'var(--font-mono)' }}>
            {col}
          </div>
        ))}
      </div>
      <div style={{ padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ width: 32, height: 2, background: '#E5E7EB', margin: '0 auto 20px' }} />
        <p style={{ fontSize: 14, fontWeight: 700, color: '#1F2937', marginBottom: 8 }}>No environments configured</p>
        <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.65, maxWidth: 420, margin: '0 auto 24px' }}>
          Create an environment to manage deployment targets, environment variables, and secrets
          in a structured, isolated configuration.
        </p>
        <button
          style={{
            padding: '10px 28px', background: '#A81D37', color: '#FFFFFF',
            border: 'none', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Create Environment
        </button>
      </div>
    </div>
  </div>
);

export default Environments;
