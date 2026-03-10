import React from 'react';

// GS-WSF — Dashboard Module: Registries
const PUSH_COMMANDS = [
  'docker tag my-image:latest registry.atonixcorp.com/PROJECT_ID/my-image:latest',
  'docker push registry.atonixcorp.com/PROJECT_ID/my-image:latest',
];

const Registries = () => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A81D37', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
          Developer Console
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 6, lineHeight: 1.2 }}>Registries</h1>
        <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.65 }}>
          Store, manage, and distribute container images for your projects and pipelines.
        </p>
      </div>
      <button
        style={{
          padding: '10px 24px', background: '#A81D37', color: '#FFFFFF',
          border: 'none', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, marginTop: 4,
        }}
      >
        + New Registry
      </button>
    </div>

    {/* Push instructions */}
    <div
      style={{
        background: '#111827', borderLeft: '3px solid #A81D37',
        padding: '20px 24px', marginBottom: 24,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A81D37', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
        Quick Start — Push an Image
      </div>
      {PUSH_COMMANDS.map((cmd, i) => (
        <div
          key={i}
          style={{
            fontFamily: 'var(--font-mono)', fontSize: 12, color: '#D1D5DB',
            padding: '6px 0', borderBottom: i < PUSH_COMMANDS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
          }}
        >
          <span style={{ color: '#4B5563', marginRight: 8 }}>$</span>{cmd}
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
        {['Image', 'Tag', 'Size', 'Pushed', 'Actions'].map((col) => (
          <div key={col} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4B5563', fontFamily: 'var(--font-mono)' }}>
            {col}
          </div>
        ))}
      </div>
      <div style={{ padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ width: 32, height: 2, background: '#E5E7EB', margin: '0 auto 20px' }} />
        <p style={{ fontSize: 14, fontWeight: 700, color: '#1F2937', marginBottom: 8 }}>No images pushed yet</p>
        <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.65, maxWidth: 420, margin: '0 auto' }}>
          Follow the quick start commands above to push your first container image to the
          AtonixDev registry.
        </p>
      </div>
    </div>
  </div>
);

export default Registries;
