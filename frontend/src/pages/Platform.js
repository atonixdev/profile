import React from 'react';
import { Link } from 'react-router-dom';

const Platform = () => {
  const capabilities = [
    {
      label: 'Software',
      path: '/software',
      eyebrow: 'Engineering',
      title: 'Software',
      desc: 'Custom enterprise applications, full-stack platforms, APIs, and intelligent automations built for scale and longevity.',
      tags: ['Python', 'Django', 'React', 'Node.js'],
    },
    {
      label: 'Infrastructure',
      path: '/infrastructure',
      eyebrow: 'Cloud & Systems',
      title: 'Infrastructure',
      desc: 'Private cloud, Kubernetes, hybrid architecture, and enterprise infrastructure delivery for governments and corporations.',
      tags: ['OpenStack', 'Kubernetes', 'Terraform', 'Ansible'],
    },
    {
      label: 'Solutions',
      path: '/solutions',
      eyebrow: 'Enterprise',
      title: 'Solutions',
      desc: 'End-to-end digital transformation, AI-driven automation, cloud modernisation, and security platforms.',
      tags: ['Transformation', 'AI', 'Cloud', 'Security'],
    },
    {
      label: 'Industries',
      path: '/industries',
      eyebrow: 'Verticals',
      title: 'Industries',
      desc: 'Specialised delivery for government agencies, financial institutions, healthcare organisations, and high-growth technology companies.',
      tags: ['Government', 'Finance', 'Healthcare', 'Energy'],
    },
    {
      label: 'Networking',
      path: '/platform/networking',
      eyebrow: 'Platform',
      title: 'Networking',
      desc: 'Isolated virtual networks, secure ingress/egress, service mesh, and hybrid connectivity for enterprise workloads.',
      tags: ['VPC', 'Service Mesh', 'mTLS', 'WAF'],
    },
    {
      label: 'Security',
      path: '/platform/security',
      eyebrow: 'Platform',
      title: 'Security',
      desc: 'Identity, encryption, application security, runtime protection, and compliance built into every layer of the stack.',
      tags: ['IAM', 'Zero Trust', 'WAF', 'SIEM'],
    },
    {
      label: 'Community',
      path: '/community',
      eyebrow: 'Developers',
      title: 'Community',
      desc: 'Tutorials, discussions, announcements, and a collaborative space for the AtonixDev developer network.',
      tags: ['Tutorials', 'Discussions', 'Forum', 'Open Source'],
    },
    {
      label: 'Blog',
      path: '/blog',
      eyebrow: 'Insights',
      title: 'Blog',
      desc: 'Technical deep-dives, engineering posts, product updates, and industry perspectives from the AtonixDev team.',
      tags: ['Engineering', 'Architecture', 'AI', 'DevOps'],
    },
  ];

  const stack = [
    { layer: 'Application Layer', items: ['React', 'Next.js', 'Django REST', 'Node.js', 'GraphQL'] },
    { layer: 'Compute & Orchestration', items: ['Kubernetes', 'Docker', 'OpenStack Nova', 'GPU Scheduling'] },
    { layer: 'Networking', items: ['OVN / OVS', 'Istio Service Mesh', 'HAProxy', 'NGINX', 'API Gateway'] },
    { layer: 'Storage & Data', items: ['Ceph', 'PostgreSQL', 'Redis', 'Kafka', 'Elasticsearch'] },
    { layer: 'Security', items: ['Vault', 'OPA', 'Falco', 'Cert-Manager', 'LDAP / OIDC'] },
    { layer: 'Observability', items: ['Prometheus', 'Grafana', 'Loki', 'Jaeger', 'PagerDuty'] },
  ];

  return (
    <div style={{ background: '#FFFFFF' }}>

      {/* ── Capability Grid ── */}
      <section className="gsw-section" style={{ background: '#F8F9FA' }}>
        <div className="gsw-container">
          <div className="gsw-section-header">
          <span className="gsw-eyebrow">Explore the Platform</span>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, color: '#111827', lineHeight: 1.12, maxWidth: 600, margin: '0 auto 16px' }}>
            Platform Capabilities
          </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB' }}>
            {capabilities.map((cap) => (
              <Link
                key={cap.label}
                to={cap.path}
                style={{ background: '#FFFFFF', padding: '36px 32px', textDecoration: 'none', display: 'block', transition: 'background 0.15s', borderTop: '2px solid transparent' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFAFA'; e.currentTarget.style.borderTopColor = '#A81D37'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderTopColor = 'transparent'; }}
              >
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A81D37', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>{cap.eyebrow}</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 12, lineHeight: 1.25 }}>{cap.title}</h3>
                <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.8, marginBottom: 20, margin: '0 0 20px' }}>{cap.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {cap.tags.map((t) => (
                    <span key={t} style={{ padding: '3px 10px', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4B5563', border: '1px solid #E5E7EB', fontFamily: 'var(--font-mono)' }}>{t}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <hr className="gsw-divider" />

      {/* ── Tech Stack ── */}
      <section className="gsw-section" style={{ background: '#FFFFFF' }}>
        <div className="gsw-container">
          <div className="gsw-section-header">
          <span className="gsw-eyebrow">Technology</span>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, color: '#111827', lineHeight: 1.12, maxWidth: 560, margin: '0 auto 16px' }}>
            Platform Technology Stack
          </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB' }}>
            {stack.map((s) => (
              <div key={s.layer} style={{ background: '#FFFFFF', padding: '28px 28px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4B5563', fontFamily: 'var(--font-mono)', marginBottom: 14 }}>{s.layer}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {s.items.map((item) => (
                    <span key={item} style={{ padding: '4px 10px', background: '#F1F3F5', border: '1px solid #E5E7EB', fontSize: 11, fontWeight: 600, color: '#1F2937', fontFamily: 'var(--font-mono)' }}>{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="gsw-section-sm" style={{ background: '#A81D37' }}>
        <div className="gsw-container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px 48px' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 800, color: '#FFFFFF', marginBottom: 10 }}>Start building on AtonixDev</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.7 }}>Explore our docs, join the developer community, or contact our solutions team.</p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/community" style={{ display: 'inline-flex', alignItems: 'center', padding: '12px 28px', background: '#A81D37', color: '#FFFFFF', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Join Community
            </Link>
            <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', padding: '11px 28px', border: '1px solid rgba(255,255,255,0.25)', color: '#D1D5DB', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Platform;
