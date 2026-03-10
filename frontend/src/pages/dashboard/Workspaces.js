import React from 'react';

// GS-WSF — Dashboard Module: Workspaces
const Workspaces = () => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A81D37', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
          Developer Console
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 6, lineHeight: 1.2 }}>Workspaces</h1>
        <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65 }}>
          Launch cloud-based development environments, manage terminal sessions, and view resource usage.
        </p>
      </div>
      <button
        style={{
          padding: '10px 24px', background: '#A81D37', color: '#FFFFFF',
          border: 'none', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, marginTop: 4,
        }}
      >
        + Launch Workspace
      </button>
    </div>

    {/* Info bar */}
    <div
      style={{
        background: '#F8F9FA', border: '1px solid #E5E7EB',
        borderLeft: '3px solid #A81D37',
        padding: '14px 20px', marginBottom: 24,
        display: 'flex', gap: 12, alignItems: 'flex-start',
      }}
    >
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 4 }}>Cloud Workspaces</div>
        <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.65, margin: 0 }}>
          Each workspace is an isolated development environment with access to your project files,
          terminal, package manager, and pre-configured toolchains.
        </p>
      </div>
    </div>

    {/* Table */}
    <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
      <div
        style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
          borderBottom: '1px solid #E5E7EB', padding: '10px 20px', background: '#F8F9FA',
        }}
      >
        {['Workspace Name', 'Project', 'Status', 'Resources', 'Actions'].map((col) => (
          <div key={col} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', fontFamily: 'var(--font-mono)' }}>
            {col}
          </div>
        ))}
      </div>
      <div style={{ padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ width: 32, height: 2, background: '#E5E7EB', margin: '0 auto 20px' }} />
        <p style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 8 }}>No workspaces running</p>
        <p style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.65, maxWidth: 400, margin: '0 auto 24px' }}>
          Launch a workspace to access a cloud-based IDE with your project codebase, dependencies, and terminal.
        </p>
        <button
          style={{
            padding: '10px 28px', background: '#A81D37', color: '#FFFFFF',
            border: 'none', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Launch Workspace
        </button>
      </div>
    </div>
  </div>
);

export default Workspaces;
