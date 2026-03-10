import React from 'react';

// ScenarioBlock — use-case scenarios in a 2-column grid of bordered blocks
const ScenarioBlock = ({ eyebrow, title, description, scenarios }) => (
  <section className="gsw-section" style={{ background: '#FFFFFF' }}>
    <div className="gsw-container">
      {/* Section header */}
      <div style={{ marginBottom: 56 }}>
        <span className="gsw-eyebrow">{eyebrow}</span>
        <h2
          style={{
            fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 800,
            color: '#111827', lineHeight: 1.15, maxWidth: 600, marginBottom: 20,
          }}
        >
          {title}
        </h2>
        <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.75, maxWidth: 620 }}>
          {description}
        </p>
      </div>

      {/* Scenario grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: 1,
          background: '#E5E7EB',
          border: '1px solid #E5E7EB',
        }}
      >
        {scenarios.map((sc) => (
          <div
            key={sc.title}
            style={{
              background: '#FFFFFF',
              padding: '36px 32px',
              borderLeft: '3px solid #A81D37',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFAFA'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
          >
            <h3
              style={{
                fontSize: 17, fontWeight: 800, color: '#111827',
                lineHeight: 1.3, marginBottom: 14,
              }}
            >
              {sc.title}
            </h3>
            <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.8, marginBottom: 20 }}>
              {sc.desc}
            </p>
            {sc.tags && sc.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {sc.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: '3px 10px',
                      fontSize: 10, fontWeight: 700,
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                      color: '#6B7280', border: '1px solid #E5E7EB',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ScenarioBlock;
