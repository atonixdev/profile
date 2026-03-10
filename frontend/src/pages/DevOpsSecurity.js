import React from 'react';
import { Link } from 'react-router-dom';

const services = [
  {
    icon: '◈',
    title: 'CI/CD Pipeline Engineering',
    body: 'Design and build automated delivery pipelines that take code from merge to production with zero manual steps. We standardise on GitOps workflows, self-service deployment, and trunk-based development practices that shrink lead times from days to minutes.',
    points: ['GitLab CI / GitHub Actions / Jenkins X', 'Trunk-based development & feature flags', 'Parallel test execution & build caching', 'Multi-environment promotion gates'],
  },
  {
    icon: '⬡',
    title: 'Infrastructure as Code & GitOps',
    body: 'Replace manual infrastructure operations with declarative, version-controlled IaC and GitOps-driven configuration management. Every environment is reproducible, audited, and drift-free.',
    points: ['Terraform & Pulumi module standardisation', 'ArgoCD / Flux GitOps deployment', 'Atlantis pull-request automation', 'Drift detection & reconciliation'],
  },
  {
    icon: '▣',
    title: 'Application Security (AppSec)',
    body: 'Integrate security scanning into the software delivery lifecycle so vulnerabilities are caught at commit time, not after production release. We implement SAST, DAST, SCA, and container scanning as native CI pipeline stages.',
    points: ['SAST with Semgrep / Bandit / CodeQL', 'DAST with OWASP ZAP', 'SCA / dependency scanning (Trivy, Dependabot)', 'Secrets detection with Gitleaks / Trufflehog'],
  },
  {
    icon: '◉',
    title: 'Container & Kubernetes Security',
    body: 'Harden containerised workloads from base image selection through runtime admission control. We enforce least-privilege pod security, signed image verification, and network policy enforcement across the full container supply chain.',
    points: ['CIS Kubernetes benchmark hardening', 'Cosign image signing & Sigstore policy', 'Falco runtime threat detection', 'Network policy with Cilium / Calico'],
  },
  {
    icon: '◐',
    title: 'Observability & Incident Response',
    body: 'Build the observability stack that reduces mean time to detect (MTTD) and mean time to resolve (MTTR). Structured logging, distributed tracing, RED-method dashboards, and on-call runbooks are all engineered together.',
    points: ['Prometheus + Alertmanager + Grafana', 'OpenTelemetry distributed tracing', 'Loki log aggregation & alerting', 'Incident runbooks & postmortem templates'],
  },
  {
    icon: '◑',
    title: 'Compliance Automation',
    body: 'Automate evidence collection, policy enforcement, and control validation so compliance audits become a continuous background process rather than a quarterly scramble. We encode controls as policy-as-code.',
    points: ['OPA / Kyverno policy enforcement', 'CIS benchmark scanning (kube-bench, Packer)', 'Automated audit evidence generation', 'NIST / ISO 27001 control mapping'],
  },
];

const maturity = [
  {
    level: 'L1 — Foundation',
    desc: 'Basic CI pipeline, manual deployments, ad hoc security scanning.',
    deliverable: 'Standardised CI pipeline, automated unit tests, SAST integrated at PR gate.',
  },
  {
    level: 'L2 — Accelerate',
    desc: 'CD pipeline exists but deployment is semi-manual. Environments diverge. No runtime monitoring.',
    deliverable: 'GitOps CD across all environments, drift reconciliation, centralised logging.',
  },
  {
    level: 'L3 — Scale',
    desc: 'CD is automated but pipelines are per-team. No platform team. Observability is reactive.',
    deliverable: 'Internal Developer Platform (IDP), golden-path templates, SLO/SLA dashboards.',
  },
  {
    level: 'L4 — Optimise',
    desc: 'Full delivery automation in place. Compliance is manual. Security posture not measured.',
    deliverable: 'Compliance automation, continuous SBOM, Zero Trust network policy, DORA metrics.',
  },
];

const DevOpsSecurity = () => (
  <div style={{ background: '#FFFFFF' }}>

    {/* ── Hero ── */}
    <section style={{ position: 'relative', background: '#FFFFFF', overflow: 'hidden', padding: '80px 0 80px' }}>
      <div className="hero-grid-bg" />
      <div className="hero-accent-bar" />
      <div className="gsw-container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <span className="gsw-eyebrow">Corporate Solutions</span>
        <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, color: '#111827', lineHeight: 1.1, maxWidth: 700, margin: '0 auto 20px' }}>DevOps & Security</h1>
        <p style={{ fontSize: 17, color: '#6B7280', lineHeight: 1.75, maxWidth: 600, margin: '0 auto 32px' }}>
          CI/CD pipeline engineering, shift-left application security, infrastructure hardening, and compliance automation — baked into your software delivery lifecycle from day one, not bolted on after the fact.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 48 }}>
          <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', padding: '13px 28px', background: '#A81D37', color: '#FFFFFF', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>Assess My Pipeline</Link>
          <Link to="/security" style={{ display: 'inline-flex', alignItems: 'center', padding: '13px 28px', border: '1px solid #111827', color: '#111827', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>Security Compliance →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB', maxWidth: 800, margin: '0 auto' }}>
          {[['4min', 'Avg deploy lead time (post)', ['14day', 'Before engagement']], ['0', 'Critical vuln MTTR (SLA)', null], ['100%', 'Pipeline SAST coverage', null], ['3×', 'Deployment frequency increase', null]].map(([val, label], i) => (
            <div key={i} style={{ background: '#FFFFFF', padding: '28px 24px' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#A81D37', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>{val}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <hr className="gsw-divider" />

    {/* ── Services ── */}
    <section className="gsw-section" style={{ background: '#FFFFFF' }}>
      <div className="gsw-container">
        <div style={{ marginBottom: 56 }}>
          <span className="gsw-eyebrow">Services</span>
          <h2 className="gsw-section-title">DevSecOps service areas</h2>
          <p style={{ fontSize: 16, color: '#6B7280', maxWidth: 520, lineHeight: 1.75 }}>Six practice areas covering delivery automation, infrastructure code, application security scanning, container hardening, observability, and compliance-as-code.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB' }}>
          {services.map((svc, i) => (
            <div key={i} style={{ background: '#FFFFFF', padding: '32px 36px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px 56px', alignItems: 'start' }}>
              <div>
                <div style={{ fontSize: 22, color: '#A81D37', marginBottom: 12, fontFamily: 'var(--font-mono)' }}>{svc.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 10 }}>{svc.title}</h3>
                <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.8 }}>{svc.body}</p>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {svc.points.map((pt) => (
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

    {/* ── Maturity Path ── */}
    <section className="gsw-section" style={{ background: '#F8F9FA' }}>
      <div className="gsw-container">
        <div style={{ marginBottom: 48 }}>
          <span className="gsw-eyebrow">Maturity</span>
          <h2 className="gsw-section-title">DevSecOps maturity roadmap</h2>
          <p style={{ fontSize: 16, color: '#6B7280', maxWidth: 520, lineHeight: 1.75 }}>We use a maturity model to quickly assess where your team is today and define the highest-ROI improvements to prioritise.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB' }}>
          {maturity.map((m, i) => (
            <div key={i} style={{ background: '#FFFFFF', padding: '28px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px 48px', alignItems: 'start' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#A81D37', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>{m.level}</div>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7, margin: 0 }}><strong style={{ color: '#111827' }}>Current state: </strong>{m.desc}</p>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#6B7280', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>Deliverable</div>
                <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.7, margin: 0 }}>{m.deliverable}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <hr className="gsw-divider" />

    {/* ── DORA Metrics ── */}
    <section className="gsw-section" style={{ background: '#FFFFFF' }}>
      <div className="gsw-container">
        <div style={{ marginBottom: 48 }}>
          <span className="gsw-eyebrow">Outcomes</span>
          <h2 className="gsw-section-title">We measure delivery performance against DORA metrics</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB' }}>
          {[
            { metric: 'Deployment Frequency', elite: 'On-demand (multiple/day)', target: 'From ≤1/month to ≥1/day' },
            { metric: 'Lead Time for Changes', elite: '<1 hour', target: 'From weeks to minutes' },
            { metric: 'Change Failure Rate', elite: '<5%', target: 'From 15–46% to <5%' },
            { metric: 'Failed Deployment Recovery', elite: '<1 hour', target: 'From days to <1 hour' },
          ].map((d) => (
            <div key={d.metric} style={{ background: '#FFFFFF', padding: '28px 24px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>{d.metric}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 6 }}>{d.elite}</div>
              <div style={{ fontSize: 12, color: '#A81D37', fontWeight: 600 }}>{d.target}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── CTA ── */}
    <section className="gsw-section-sm" style={{ background: '#A81D37' }}>
      <div className="gsw-container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px 48px' }}>
        <div>
          <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 800, color: '#FFFFFF', marginBottom: 10 }}>Ship faster. Break less. Stay compliant.</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.7 }}>We'll run a free DevSecOps maturity assessment and deliver a prioritised roadmap within two weeks.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', padding: '12px 28px', background: '#A81D37', color: '#FFFFFF', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>Request Assessment</Link>
          <Link to="/case-studies" style={{ display: 'inline-flex', alignItems: 'center', padding: '12px 28px', border: '1px solid rgba(255,255,255,0.4)', color: '#FFFFFF', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>Case Studies</Link>
        </div>
      </div>
    </section>

  </div>
);

export default DevOpsSecurity;
