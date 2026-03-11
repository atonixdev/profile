import React from 'react';

// ComplianceSection — standards & compliance / governance text section
const ComplianceSection = ({ eyebrow, title, description, items }) => (
  <section className="gsw-section" style={{ background: '#F8F9FA' }}>
    <div className="gsw-container">
      {/* Section header */}
      <div className="gsw-section-header">
        <span className="gsw-eyebrow">{eyebrow}</span>
        <h2
          style={{
            fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 800,
            color: '#111827', lineHeight: 1.15, maxWidth: 600, margin: '0 auto 20px',
          }}
        >
          {title}
        </h2>
        <p style={{ fontSize: 15, color: '#4B5563', lineHeight: 1.75, maxWidth: 680 }}>
          {description}
        </p>
      </div>

      {/* Compliance item grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: 1,
          background: '#E5E7EB',
          border: '1px solid #E5E7EB',
        }}
      >
        {items.map((item) => (
          <div
            key={item.title}
            style={{ background: '#FFFFFF', padding: '32px 28px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 3, height: 20, background: '#A81D37', flexShrink: 0 }} />
              <h3
                style={{
                  fontSize: 15, fontWeight: 800, color: '#111827',
                  lineHeight: 1.3, margin: 0,
                }}
              >
                {item.title}
              </h3>
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {item.points.map((pt) => (
                <li
                  key={pt}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#1F2937', lineHeight: 1.7 }}
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
        ))}
      </div>
    </div>
  </section>
);

export default ComplianceSection;
