import React from 'react';

// Minimal architecture diagram — a layered node-and-connector visualization
const ArchDiagram = ({ label }) => (
  <div
    style={{
      background: '#F8F9FA',
      border: '1px solid #E5E7EB',
      minHeight: 260,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 32px',
      gap: 0,
    }}
  >
    {/* Node layers */}
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, width: '100%', maxWidth: 280 }}>

      {/* Layer 1 — External */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', width: '100%' }}>
        <div
          style={{
            width: 100, height: 32, background: '#1F2937',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            External
          </span>
        </div>
      </div>

      {/* Connector */}
      <div style={{ width: 1, height: 16, background: '#D1D5DB' }} />

      {/* Layer 2 — Gateway */}
      <div
        style={{
          width: '100%', height: 32, background: '#A81D37',
          display: 'flex', alignItems: 'center', paddingLeft: 14,
        }}
      >
        <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
          Gateway Layer
        </span>
      </div>

      {/* Connector */}
      <div style={{ width: 1, height: 16, background: '#D1D5DB' }} />

      {/* Layer 3 — Services */}
      <div style={{ display: 'flex', gap: 6, width: '100%' }}>
        {['SVC-A', 'SVC-B', 'SVC-C'].map((svc) => (
          <div
            key={svc}
            style={{
              flex: 1, height: 32, background: '#E5E7EB',
              border: '1px solid #D1D5DB',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 7, fontWeight: 700, color: '#4B5563', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>
              {svc}
            </span>
          </div>
        ))}
      </div>

      {/* Connector */}
      <div style={{ width: 1, height: 16, background: '#D1D5DB' }} />

      {/* Layer 4 — Data */}
      <div
        style={{
          width: '75%', height: 32, background: '#F1F3F5',
          border: '1px solid #D1D5DB', borderLeft: '3px solid #A81D37',
          display: 'flex', alignItems: 'center', paddingLeft: 12,
        }}
      >
        <span style={{ fontSize: 8, fontWeight: 700, color: '#4B5563', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
          Data Layer
        </span>
      </div>
    </div>

    {/* Label */}
    <div style={{ borderTop: '1px solid #E5E7EB', width: '100%', marginTop: 24, paddingTop: 14, textAlign: 'center' }}>
      <span
        style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: '#4B5563', fontFamily: 'var(--font-mono)',
        }}
      >
        {label}
      </span>
    </div>
  </div>
);

// ArchitectureSection — renders each subsection as a two-column row (text + diagram)
const ArchitectureSection = ({ eyebrow, title, description, subsections }) => (
  <section className="gsw-section" style={{ background: '#FFFFFF' }}>
    <div className="gsw-container">
      {/* Section header */}
      <div className="gsw-section-header">
        <span className="gsw-eyebrow">{eyebrow}</span>
        <h2
          style={{
            fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800,
            color: '#111827', lineHeight: 1.12, maxWidth: 640, margin: '0 auto 20px',
          }}
        >
          {title}
        </h2>
        <p style={{ fontSize: 16, color: '#4B5563', lineHeight: 1.75, maxWidth: 680 }}>
          {description}
        </p>
      </div>

      {/* Subsections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB' }}>
        {subsections.map((sub, idx) => (
          <div
            key={sub.id}
            style={{
              background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
              padding: 'clamp(24px, 4vw, 48px) clamp(20px, 4vw, 44px)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
              gap: '40px 64px',
              alignItems: 'start',
            }}
          >
            {/* Left: text */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <span
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 28, height: 28, background: '#111827',
                    fontSize: 11, fontWeight: 800, color: '#FFFFFF',
                    fontFamily: 'var(--font-mono)', flexShrink: 0,
                  }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <h3
                  style={{
                    fontSize: 20, fontWeight: 800, color: '#111827',
                    lineHeight: 1.25, margin: 0,
                  }}
                >
                  {sub.title}
                </h3>
              </div>
              <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.8, marginBottom: 24 }}>
                {sub.body}
              </p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sub.points.map((pt) => (
                  <li
                    key={pt}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#1F2937', lineHeight: 1.6 }}
                  >
                    <span
                      style={{
                        width: 4, height: 4, borderRadius: '50%',
                        background: '#A81D37', flexShrink: 0, marginTop: 7,
                      }}
                    />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: diagram */}
            <div style={{ alignSelf: 'stretch', minHeight: 260 }}>
              <ArchDiagram label={sub.diagramLabel} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ArchitectureSection;
