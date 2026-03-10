import React from 'react';

// CardGrid — practice cards in a responsive grid
const CardGrid = ({ eyebrow, title, description, cards }) => (
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
        <p style={{ fontSize: 15, color: '#4B5563', lineHeight: 1.75, maxWidth: 620 }}>
          {description}
        </p>
      </div>

      {/* Card grid — 3 columns, wraps to 2 then 1 on smaller viewports */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 1,
          background: '#E5E7EB',
          border: '1px solid #E5E7EB',
        }}
      >
        {cards.map((card) => (
          <div
            key={card.title}
            className="gsw-card"
            style={{ background: '#FFFFFF', padding: '32px 28px' }}
          >
            <div style={{ width: 32, height: 2, background: '#A81D37', marginBottom: 20 }} />
            <h3
              style={{
                fontSize: 16, fontWeight: 800, color: '#111827',
                lineHeight: 1.3, marginBottom: 12,
              }}
            >
              {card.title}
            </h3>
            <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.8, margin: 0 }}>
              {card.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default CardGrid;
