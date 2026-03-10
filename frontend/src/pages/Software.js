import React from 'react';
import { Link } from 'react-router-dom';

// GS-WSF §4 — Software Categories Page
const Software = () => {
  const categories = [
    {
      title: 'Artificial Intelligence',
      description:
        'Machine learning pipelines, intelligent automation, natural language processing, computer vision, and AI-driven decision systems built for production environments.',
    },
    {
      title: 'Data & Analytics',
      description:
        'Real-time data platforms, business intelligence dashboards, data warehousing, ETL pipelines, and analytics infrastructure for data-driven organisations.',
    },
    {
      title: 'DevOps',
      description:
        'CI/CD pipelines, infrastructure-as-code, containerisation, Kubernetes orchestration, automated testing frameworks, and release engineering.',
    },
    {
      title: 'Security',
      description:
        'Application security, identity and access management, zero-trust architecture, compliance automation, penetration testing, and secure SDLC practices.',
    },
    {
      title: 'Business Management',
      description:
        'ERP integrations, workflow automation, CRM platforms, financial management systems, reporting engines, and enterprise resource planning.',
    },
    {
      title: 'Integration',
      description:
        'API gateway design, microservices architecture, event-driven systems, third-party SaaS integrations, EDI, and middleware platforms.',
    },
    {
      title: 'Cloud',
      description:
        'Multi-cloud strategy, OpenStack deployments, cloud-native application design, cost optimisation, migration planning, and hybrid infrastructure.',
    },
    {
      title: 'Storage',
      description:
        'Distributed storage systems, object storage, database architecture (SQL & NoSQL), backup and disaster recovery, and high-availability data layers.',
    },
  ];

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh' }}>

      {/* Categories Grid */}
      <section style={{ maxWidth: 1440, margin: '0 auto', padding: '64px 24px 80px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 1,
            background: '#E5E7EB',
            border: '1px solid #E5E7EB',
          }}
        >
          {categories.map((cat) => (
            <div
              key={cat.title}
              style={{
                background: '#FFFFFF',
                padding: '40px 36px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Accent marker */}
              <div
                style={{
                  width: 32, height: 2,
                  background: '#A81D37',
                  marginBottom: 24,
                  flexShrink: 0,
                }}
              />
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: '#111827',
                  letterSpacing: '-0.01em',
                  marginBottom: 14,
                  lineHeight: 1.3,
                }}
              >
                {cat.title}
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: '#4B5563',
                  lineHeight: 1.75,
                  flexGrow: 1,
                  marginBottom: 28,
                }}
              >
                {cat.description}
              </p>
              <Link
                to="/contact"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#A81D37',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-mono)',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#111827'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#A81D37'; }}
              >
                Enquire →
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ marginTop: 64, textAlign: 'center' }}>
          <p
            style={{
              fontSize: 15, color: '#4B5563', marginBottom: 28,
              lineHeight: 1.6,
            }}
          >
            Need a custom solution that spans multiple categories?
          </p>
          <Link
            to="/contact"
            style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '14px 40px',
              background: '#A81D37',
              color: '#FFFFFF',
              fontWeight: 700, fontSize: 11,
              letterSpacing: '0.10em', textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#7A1528'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#A81D37'; }}
          >
            Start a Conversation
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Software;
