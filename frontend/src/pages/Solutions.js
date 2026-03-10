import React from 'react';
import { Link } from 'react-router-dom';

// Corporate Solutions Page — AtonixDev
const Solutions = () => {
  const solutions = [
    {
      title: 'Enterprise Digital Transformation',
      overview: 'End-to-end transformation of legacy systems into modern, cloud-native, AI-augmented digital platforms.',
      architecture: 'Microservices, API-first design, cloud-native containers, and event-driven architecture.',
      benefits: ['Reduced operational costs', 'Improved system reliability', 'Faster time-to-market', 'Scalable architecture'],
      industries: ['Government', 'Finance', 'Healthcare', 'Energy'],
    },
    {
      title: 'AI & Intelligent Automation',
      overview: 'Deploy machine learning pipelines, intelligent process automation, and AI-driven decision systems across your organisation.',
      architecture: 'ML pipelines, model serving infrastructure, real-time inference, and automated feedback loops.',
      benefits: ['Reduced manual workload', 'Data-driven decisions', 'Predictive capabilities', 'Operational efficiency'],
      industries: ['Finance', 'Logistics', 'Retail', 'Healthcare'],
    },
    {
      title: 'Cloud Modernisation',
      overview: 'Migrate, optimise, and operate enterprise workloads across public, private, and hybrid cloud environments.',
      architecture: 'OpenStack, Kubernetes, Terraform IaC, multi-cloud orchestration, and FinOps frameworks.',
      benefits: ['Infrastructure cost reduction', 'High availability', 'Geographic redundancy', 'Elastic scaling'],
      industries: ['Technology', 'Government', 'Finance', 'Education'],
    },
    {
      title: 'Security & Compliance Platforms',
      overview: 'Design and implement zero-trust security architecture, compliance automation, and secure development lifecycles.',
      architecture: 'Zero-trust network, IAM, SIEM integration, automated compliance scanning, and secure CI/CD.',
      benefits: ['Risk reduction', 'Regulatory compliance', 'Audit readiness', 'Security posture improvement'],
      industries: ['Finance', 'Government', 'Healthcare', 'Energy'],
    },
    {
      title: 'Enterprise Data Platforms',
      overview: 'Build unified data architectures that enable real-time analytics, reporting, and data-driven operations.',
      architecture: 'Data lakehouse, streaming pipelines, BI layer, data governance, and self-service analytics.',
      benefits: ['Unified data view', 'Real-time insights', 'Data governance', 'Operational intelligence'],
      industries: ['Finance', 'Retail', 'Logistics', 'Government'],
    },
    {
      title: 'Integration & Interoperability',
      overview: 'Connect systems, platforms, and data sources with enterprise-grade API management and integration platforms.',
      architecture: 'API gateways, event brokers, ESB patterns, webhook systems, and SaaS connector libraries.',
      benefits: ['System interoperability', 'Reduced data silos', 'Faster integration cycles', 'Vendor flexibility'],
      industries: ['Technology', 'Healthcare', 'Finance', 'Logistics'],
    },
    {
      title: 'Custom Enterprise Software',
      overview: 'Architect and deliver bespoke software platforms built to your organisation\'s exact operational requirements.',
      architecture: 'Domain-driven design, clean architecture, modular monolith or microservices, as appropriate.',
      benefits: ['Purpose-built functionality', 'No vendor lock-in', 'Full source ownership', 'Long-term maintainability'],
      industries: ['All Sectors'],
    },
  ];

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh' }}>

      {/* Page Header */}
      <section style={{ background: '#F8F9FA', borderBottom: '1px solid #E5E7EB', padding: '64px 24px 56px', textAlign: 'center' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#A81D37', fontFamily: 'var(--font-mono)', marginBottom: 20 }}>
            Enterprise Solutions
          </span>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, color: '#111827', letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: 20 }}>
            Solutions
          </h1>
          <p style={{ fontSize: 'clamp(15px, 1.5vw, 18px)', color: '#6B7280', lineHeight: 1.65, maxWidth: 580, margin: '0 auto' }}>
            Comprehensive technology solutions designed for enterprise and government organisations
            seeking scalable, secure, and future-proof digital capabilities.
          </p>
        </div>
      </section>

      {/* Solutions */}
      <section style={{ maxWidth: 1440, margin: '0 auto', padding: '64px 24px 80px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB' }}>
          {solutions.map((sol) => (
            <div key={sol.title} style={{ background: '#FFFFFF', padding: '48px 44px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px 56px' }}>
              <div>
                <div style={{ width: 32, height: 2, background: '#A81D37', marginBottom: 20 }} />
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.01em', marginBottom: 14, lineHeight: 1.25 }}>{sol.title}</h2>
                <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.75, marginBottom: 20 }}>{sol.overview}</p>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9CA3AF', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>Industries</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {sol.industries.map((ind) => (
                      <span key={ind} style={{ padding: '4px 10px', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B7280', border: '1px solid #E5E7EB', fontFamily: 'var(--font-mono)' }}>{ind}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9CA3AF', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>Architecture</div>
                  <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.7 }}>{sol.architecture}</p>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9CA3AF', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>Key Benefits</div>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {sol.benefits.map((b) => (
                      <li key={b} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#374151' }}>
                        <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#A81D37', flexShrink: 0 }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 56, textAlign: 'center' }}>
          <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 28, lineHeight: 1.6 }}>
            Ready to discuss your enterprise requirements?
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/contact"
              style={{
                display: 'inline-flex', alignItems: 'center', padding: '14px 40px',
                background: '#A81D37', color: '#FFFFFF',
                fontWeight: 700, fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase',
                textDecoration: 'none', transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#7A1528'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#A81D37'; }}
            >
              Request a Proposal
            </Link>
            <Link
              to="/industries"
              style={{
                display: 'inline-flex', alignItems: 'center', padding: '14px 40px',
                background: 'transparent', color: '#111827',
                fontWeight: 700, fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase',
                textDecoration: 'none', border: '1px solid #D1D5DB', transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#A81D37'; e.currentTarget.style.color = '#A81D37'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.color = '#111827'; }}
            >
              View Industries
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Solutions;
