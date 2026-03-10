import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Testimonials = () => {
  const [filterRating, setFilterRating] = useState(0);

  const testimonials = [
    {
      id: 1,
      client_name: 'Dr. Thabo Mthembu',
      client_title: 'Director of Research',
      client_company: 'Stellenbosch University AI Lab',
      content: 'Samuel\'s Neuron data center architecture transformed our AI research capabilities. The high-performance computing environment he designed supports our most demanding machine learning workloads.',
      rating: 5,
      project: 'AI Research Infrastructure',
      is_featured: true
    },
    {
      id: 2,
      client_name: 'Nomsa Khumalo',
      client_title: 'CTO',
      client_company: 'FinTech Innovations SA',
      content: 'Working with Samuel on our cloud migration was a game-changer. His OpenStack expertise and multi-region replication design ensured zero downtime during our transition.',
      rating: 5,
      project: 'Cloud Migration & Security',
      is_featured: true
    },
    {
      id: 3,
      client_name: 'James van der Merwe',
      client_title: 'DevOps Lead',
      client_company: 'Cape Town Tech Hub',
      content: 'Samuel\'s DevOps pipelines are production-ready from day one. The CI/CD workflows he built reduced our deployment time by 80% while maintaining enterprise-grade security.',
      rating: 5,
      project: 'DevOps Pipeline Implementation',
      is_featured: false
    },
    {
      id: 4,
      client_name: 'Dr. Zanele Nkosi',
      client_title: 'Head of Digital Transformation',
      client_company: 'Johannesburg Metropolitan University',
      content: 'The communication infrastructure Samuel built for our campus is remarkable. From custom SMTP servers to encrypted mail routing, everything works flawlessly.',
      rating: 5,
      project: 'Enterprise Communication System',
      is_featured: false
    },
    {
      id: 5,
      client_name: 'Marcus Johnson',
      client_title: 'CEO',
      client_company: 'African FinTech Alliance',
      content: 'Samuel\'s AI-driven marketing automation transformed our customer engagement. The segmentation engines he designed increased our conversion rates by 150%.',
      rating: 5,
      project: 'Marketing Automation Platform',
      is_featured: true
    },
    {
      id: 6,
      client_name: 'Prof. Fatima Hassan',
      client_title: 'Director',
      client_company: 'Pan-African Research Network',
      content: 'Samuel\'s systems programming expertise in C/C++ is exceptional. The backend optimizations he implemented improved our scientific computing performance by 300%.',
      rating: 5,
      project: 'Scientific Computing Platform',
      is_featured: false
    }
  ];

  const filteredTestimonials = filterRating === 0
    ? testimonials
    : testimonials.filter(t => t.rating >= filterRating);

  const averageRating = (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1);

  return (
    <div style={{ background: '#FFFFFF' }} className="min-h-screen">

      {/* Page Hero */}
      <section className="hero-grid-bg" style={{ padding: '96px 0 80px', borderBottom: '1px solid #E5E7EB' }}>
        <div className="gsw-container">
          <p className="gsw-eyebrow">Client Success</p>
          <h1 style={{ fontSize: '48px', fontWeight: 700, color: '#111827', lineHeight: 1.1, marginBottom: '24px', maxWidth: '720px' }}>
            Testimonials
          </h1>
          <p style={{ fontSize: '18px', color: '#aaa', maxWidth: '600px', lineHeight: 1.7 }}>
            Trusted by leading African institutions, research universities, and technology companies.
            Every engagement is measured by outcomes, not effort.
          </p>
        </div>
      </section>

      {/* Stats Row */}
      <section style={{ background: '#F8F9FA', borderBottom: '1px solid #E5E7EB' }}>
        <div className="gsw-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {[
              { value: averageRating, label: 'Average Rating' },
              { value: '84+', label: 'Satisfied Clients' },
              { value: '100%', label: 'Satisfaction Rate' },
              { value: '5★', label: 'Consistent Score' },
            ].map((stat, i) => (
              <div key={i} className="gsw-stat" style={{ borderRight: i < 3 ? '1px solid #E5E7EB' : 'none' }}>
                <div style={{ fontSize: '36px', fontWeight: 700, color: '#A81D37', marginBottom: '4px' }}>{stat.value}</div>
                <div style={{ fontSize: '13px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter */}
      <section style={{ padding: '48px 0 0', borderBottom: '1px solid #E5E7EB' }}>
        <div className="gsw-container">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingBottom: '32px' }}>
            <span style={{ fontSize: '12px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: '8px' }}>Filter:</span>
            {[0, 5, 4, 3].map((val) => (
              <button
                key={val}
                onClick={() => setFilterRating(val)}
                style={{
                  padding: '6px 16px',
                  background: filterRating === val ? '#A81D37' : 'transparent',
                  color: filterRating === val ? '#111827' : '#aaa',
                  border: `1px solid ${filterRating === val ? '#A81D37' : '#D1D5DB'}`,
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
              >
                {val === 0 ? 'All' : val === 5 ? '5 Stars' : val === 4 ? '4+ Stars' : '3+ Stars'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="gsw-section">
        <div className="gsw-container">
          {filteredTestimonials.length === 0 ? (
            <p style={{ color: '#6B7280', textAlign: 'center', padding: '64px 0' }}>No testimonials match your filter.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1px', background: '#E5E7EB' }}>
              {filteredTestimonials.map((t) => (
                <div
                  key={t.id}
                  className="gsw-testimonial"
                  style={{ background: '#F8F9FA', padding: '40px', position: 'relative' }}
                >
                  {t.is_featured && (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0,
                      height: '2px', background: '#A81D37'
                    }} />
                  )}
                  <div style={{ marginBottom: '24px' }}>
                    {t.is_featured && (
                      <span style={{
                        display: 'inline-block',
                        background: '#A81D37',
                        color: '#111827',
                        fontSize: '10px',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        padding: '3px 8px',
                        textTransform: 'uppercase',
                        marginBottom: '16px'
                      }}>
                        FEATURED
                      </span>
                    )}
                    <div style={{ display: 'flex', gap: '2px', marginBottom: '20px' }}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} style={{ color: i < t.rating ? '#A81D37' : '#D1D5DB', fontSize: '16px' }}>★</span>
                      ))}
                    </div>
                    <p style={{ color: '#374151', lineHeight: 1.75, fontSize: '15px', fontStyle: 'italic' }}>
                      "{t.content}"
                    </p>
                  </div>
                  <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '24px' }}>
                    <div style={{ fontWeight: 700, color: '#111827', fontSize: '15px' }}>{t.client_name}</div>
                    <div style={{ color: '#A81D37', fontSize: '13px', marginTop: '2px' }}>{t.client_title}</div>
                    <div style={{ color: '#6B7280', fontSize: '13px', marginTop: '2px' }}>{t.client_company}</div>
                    {t.project && (
                      <div style={{ marginTop: '12px' }}>
                        <span style={{
                          display: 'inline-block',
                          background: '#F1F3F5',
                          border: '1px solid #E5E7EB',
                          color: '#6B7280',
                          fontSize: '11px',
                          padding: '2px 8px',
                          letterSpacing: '0.05em',
                        }}>
                          {t.project}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Bar */}
      <section className="gsw-cta-bar">
        <div className="gsw-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Ready to become the next success story?</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}>Let's discuss your infrastructure challenges.</div>
          </div>
          <Link to="/contact" className="gsw-btn-dark" style={{ background: '#FFFFFF', color: '#111827', border: '1px solid rgba(255,255,255,0.3)' }}>
            Start Your Project
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Testimonials;
