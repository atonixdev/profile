import React from 'react';
import { Link } from 'react-router-dom';

const capabilities = [
  {
    icon: '⬡',
    title: 'Custom Application Development',
    body: 'End-to-end development of high-performance, scalable enterprise applications. From requirements architecture through production deployment, we build systems that align with your operational cadence and long-term growth trajectory.',
    points: ['Microservices & monorepo architecture', 'REST & GraphQL API platforms', 'Domain-driven design (DDD)', 'Event-driven systems with message queues'],
  },
  {
    icon: '◈',
    title: 'Legacy Modernisation',
    body: 'Systematic migration of aging systems to modern, maintainable architectures. We de-risk legacy transformation through strangler-fig patterns, incremental refactoring, and parallel-run validation before full cutover.',
    points: ['Mainframe & COBOL migration', 'Monolith-to-microservices decomposition', 'Database migration & schema evolution', 'Automated regression test generation'],
  },
  {
    icon: '▣',
    title: 'API Platform Engineering',
    body: 'Design and build enterprise-grade API gateways, developer portals, and integration layers. We architect internal and external API surfaces that are secure, versioned, and documented for partner ecosystems.',
    points: ['API gateway design & governance', 'OpenAPI / AsyncAPI specification', 'OAuth 2.0 & OIDC integration', 'Developer portal with Backstage or custom'],
  },
  {
    icon: '◉',
    title: 'SaaS Platform Engineering',
    body: 'Architecture and delivery of multi-tenant SaaS platforms at scale. We design tenant isolation models, metered billing integrations, self-serve onboarding flows, and the operational tooling required to run a hosted product.',
    points: ['Multi-tenant data isolation strategies', 'Stripe / Paddle billing integration', 'Self-serve onboarding automation', 'Usage metering & feature flagging'],
  },
  {
    icon: '◐',
    title: 'Internal Tooling & Developer Portals',
    body: 'Build the scaffolding that makes your engineering teams faster. From internal CLI tools and service catalogs to golden-path templates and audit dashboards, we create the internal developer platform (IDP) your teams actually use.',
    points: ['Service catalog & dependency graph', 'Golden-path scaffolding (cookiecutter / CDK)', 'Internal audit & observability dashboards', 'Backstage plugin development'],
  },
  {
    icon: '◑',
    title: 'Quality Engineering & Test Automation',
    body: 'Systematic quality engineering baked into the software lifecycle from day one. We design CI-integrated test suites, shift-left security scans, and contract testing frameworks that catch regressions before they reach production.',
    points: ['Playwright / Cypress E2E automation', 'Contract testing with Pact', 'Load & chaos engineering (k6, Gremlin)', 'SAST / DAST pipeline integration'],
  },
];

const process = [
  { step: '01', title: 'Discovery & Architecture', body: 'We map current systems, business requirements, and technical constraints to produce a delivery architecture and phased roadmap.' },
  { step: '02', title: 'Design & Prototyping', body: 'API contracts, data models, and key user journeys are designed and prototyped before any production code is written.' },
  { step: '03', title: 'Iterative Delivery', body: 'Two-week sprints with demo-driven checkpoints ensure continuous alignment. CI/CD pipelines are established on day one.' },
  { step: '04', title: 'Integration & Testing', body: 'Automated regression, performance, and security tests are run against every branch — integrated into your existing toolchain.' },
  { step: '05', title: 'Deployment & Hardening', body: 'Blue-green deployment, runbook documentation, and 30-day hyper-care support ensure confident production releases.' },
  { step: '06', title: 'Knowledge Transfer', body: 'Your team receives full documentation, architecture decision records (ADRs), and pair-programming sessions for seamless handover.' },
];

const techStack = [
  { category: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'TailwindCSS', 'Storybook', 'Vite'] },
  { category: 'Backend', items: ['Django / DRF', 'FastAPI', 'Node.js', 'Go', 'Java Spring Boot', 'gRPC'] },
  { category: 'Databases', items: ['PostgreSQL', 'TimescaleDB', 'Redis', 'Elasticsearch', 'MongoDB', 'ClickHouse'] },
  { category: 'APIs & Integration', items: ['GraphQL', 'REST / OpenAPI', 'Apache Kafka', 'RabbitMQ', 'Webhooks', 'gRPC'] },
];

const EnterpriseSoftware = () => (
  <div style={{ background: '#FFFFFF' }}>

    {/* ── Hero ── */}
    <section style={{ position: 'relative', background: '#FFFFFF', overflow: 'hidden', padding: '120px 0 80px' }}>
      <div className="hero-grid-bg" />
      <div className="hero-accent-bar" />
      <div className="gsw-container" style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '48px 80px', alignItems: 'center' }}>
        <div>
          <span className="gsw-eyebrow">Corporate Solutions</span>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, color: '#111827', lineHeight: 1.1, marginBottom: 20 }}>Enterprise Software Engineering</h1>
          <p style={{ fontSize: 17, color: '#6B7280', lineHeight: 1.75, marginBottom: 32 }}>
            Custom software built to exacting standards — from API platforms and SaaS architectures through legacy modernisation and internal developer tooling, delivered by engineers who treat quality as non-negotiable.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', padding: '13px 28px', background: '#A81D37', color: '#FFFFFF', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>Start a Project</Link>
            <Link to="/case-studies" style={{ display: 'inline-flex', alignItems: 'center', padding: '13px 28px', border: '1px solid #111827', color: '#111827', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>View Case Studies</Link>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB' }}>
          {[['100+', 'Applications delivered'], ['8yr+', 'Avg team experience'], ['99.9%', 'Prod uptime SLA'], ['<2wk', 'First delivery sprint']].map(([val, label]) => (
            <div key={label} style={{ background: '#FFFFFF', padding: '28px 24px' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#A81D37', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>{val}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <hr className="gsw-divider" />

    {/* ── Capabilities ── */}
    <section className="gsw-section" style={{ background: '#FFFFFF' }}>
      <div className="gsw-container">
        <div style={{ marginBottom: 56 }}>
          <span className="gsw-eyebrow">Capabilities</span>
          <h2 className="gsw-section-title">Engineering capabilities</h2>
          <p style={{ fontSize: 16, color: '#6B7280', maxWidth: 520, lineHeight: 1.75 }}>Six core practice areas cover the full software engineering lifecycle — from greenfield platform builds to precision modernisation programmes.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB' }}>
          {capabilities.map((cap, i) => (
            <div key={i} style={{ background: '#FFFFFF', padding: '32px 36px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px 56px', alignItems: 'start' }}>
              <div>
                <div style={{ fontSize: 22, color: '#A81D37', marginBottom: 12, fontFamily: 'var(--font-mono)' }}>{cap.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 10 }}>{cap.title}</h3>
                <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.8 }}>{cap.body}</p>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {cap.points.map((pt) => (
                  <li key={pt} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#374151', lineHeight: 1.7, paddingBottom: 8 }}>
                    <span style={{ color: '#A81D37', fontWeight: 900, flexShrink: 0, marginTop: 2 }}>—</span>{pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>

    <hr className="gsw-divider" />

    {/* ── Tech Stack ── */}
    <section className="gsw-section" style={{ background: '#F8F9FA' }}>
      <div className="gsw-container">
        <div style={{ marginBottom: 48 }}>
          <span className="gsw-eyebrow">Technology</span>
          <h2 className="gsw-section-title">Core technology stack</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB' }}>
          {techStack.map((t) => (
            <div key={t.category} style={{ background: '#FFFFFF', padding: '28px 28px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9CA3AF', fontFamily: 'var(--font-mono)', marginBottom: 16 }}>{t.category}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {t.items.map((item) => (
                  <span key={item} style={{ padding: '4px 10px', background: '#F8F9FA', border: '1px solid #E5E7EB', fontSize: 11, fontWeight: 600, color: '#374151', fontFamily: 'var(--font-mono)' }}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <hr className="gsw-divider" />

    {/* ── Delivery Process ── */}
    <section className="gsw-section" style={{ background: '#FFFFFF' }}>
      <div className="gsw-container">
        <div style={{ marginBottom: 48 }}>
          <span className="gsw-eyebrow">Delivery</span>
          <h2 className="gsw-section-title">How we deliver</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB' }}>
          {process.map((p) => (
            <div key={p.step} style={{ background: '#FFFFFF', padding: '32px 28px' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#E5E7EB', lineHeight: 1, marginBottom: 16, fontFamily: 'var(--font-mono)' }}>{p.step}</div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111827', marginBottom: 8 }}>{p.title}</h3>
              <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.75, margin: 0 }}>{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── CTA ── */}
    <section className="gsw-section-sm" style={{ background: '#111827' }}>
      <div className="gsw-container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px 48px' }}>
        <div>
          <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 800, color: '#FFFFFF', marginBottom: 10 }}>Ready to build something exceptional?</h2>
          <p style={{ fontSize: 14, color: '#9CA3AF', margin: 0, lineHeight: 1.7 }}>Let's discuss your project requirements and put together an architecture proposal at no obligation.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', padding: '12px 28px', background: '#A81D37', color: '#FFFFFF', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>Get in Touch</Link>
          <Link to="/case-studies" style={{ display: 'inline-flex', alignItems: 'center', padding: '12px 28px', border: '1px solid #374151', color: '#D1D5DB', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>Case Studies</Link>
        </div>
      </div>
    </section>

  </div>
);

export default EnterpriseSoftware;
