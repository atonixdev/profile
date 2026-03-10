import React from 'react';

// GS-WSF — Dashboard Module: Projects
const TABLE_COLS = ['Project Name', 'Status', 'Environment', 'Last Updated', 'Actions'];

const Projects = () => (
  <div>
    {/* Header */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A81D37', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
          Developer Console
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 6, lineHeight: 1.2 }}>Projects</h1>
        <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65 }}>
          Create and manage engineering projects, repositories, pipelines, and deployment configurations.
        </p>
      </div>
      <button
        style={{
          padding: '10px 24px', background: '#A81D37', color: '#FFFFFF',
          border: 'none', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit',
          flexShrink: 0, marginTop: 4,
        }}
      >
        + New Project
      </button>
    </div>

    {/* Filters */}
    <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
      {['All', 'Active', 'Archived'].map((f, i) => (
        <button
          key={f}
          style={{
            padding: '7px 18px',
            background: i === 0 ? '#111827' : 'transparent',
            border: `1px solid ${i === 0 ? '#111827' : '#D1D5DB'}`,
            color: i === 0 ? '#FFFFFF' : '#6B7280',
            fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          {f}
        </button>
      ))}
    </div>

    {/* Table */}
    <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
      {/* Table header */}
      <div
        style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
          borderBottom: '1px solid #E5E7EB',
          padding: '10px 20px',
          background: '#F8F9FA',
        }}
      >
        {TABLE_COLS.map((col) => (
          <div
            key={col}
            style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: '#9CA3AF',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {col}
          </div>
        ))}
      </div>
      {/* Empty state */}
      <div style={{ padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ width: 32, height: 2, background: '#E5E7EB', margin: '0 auto 20px' }} />
        <p style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 8 }}>No projects yet</p>
        <p style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.65, maxWidth: 400, margin: '0 auto 24px' }}>
          Create your first project to start managing your codebase, pipelines, and deployments from one place.
        </p>
        <button
          style={{
            padding: '10px 28px', background: '#A81D37', color: '#FFFFFF',
            border: 'none', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Create Project
        </button>
      </div>
    </div>
  </div>
);

export default Projects;
