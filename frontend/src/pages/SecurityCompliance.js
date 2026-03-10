import React from 'react';
import { Link } from 'react-router-dom';

const SecurityCompliance = () => {
  const framework = [
    {
      name: 'Identity & Access Control',
      controls: ['SSO via OIDC / SAML 2.0', 'OAuth 2.0 with scoped token issuance', 'Role-based access control at all API surfaces', 'Multi-factor authentication enforcement', 'Privileged access management and time-limited sessions'],
    },
    {
      name: 'Data Encryption & Protection',
      controls: ['AES-256 encryption at rest for all stored data', 'TLS 1.3 enforced for all data in transit', 'Per-tenant encryption key isolation in KMS', 'Automatic key rotation with zero downtime', 'Hardware security module (HSM) root of trust'],
    },
    {
      name: 'Application Security',
      controls: ['WAF with OWASP Top 10 and custom ruleset', 'API rate limiting and request throttling', 'Input validation and output encoding at all endpoints', 'SAST and DAST in CI/CD pipelines', 'Secrets managed via Vault — no credentials in source code'],
    },
    {
      name: 'Network Security',
      controls: ['Zero-trust network architecture — no implicit trust', 'mTLS for all internal east-west traffic', 'VPC isolation with no cross-tenant routing', 'WAF and DDoS protection at the ingress layer', 'Full network flow logging and SIEM integration'],
    },
    {
      name: 'Runtime & Infrastructure Security',
      controls: ['Container image scanning before every deployment', 'Image signing with verified digest enforcement', 'Runtime policies: no privilege escalation, read-only root FS', 'Node-level OS hardening and CIS benchmark compliance', 'Automated vulnerability patching pipelines'],
    },
    {
      name: 'Audit & Monitoring',
      controls: ['All privileged actions and access events logged', 'Tamper-evident, write-only audit log storage', '12-month minimum log retention', 'Real-time SIEM alerting and anomaly detection', 'Security event runbooks and incident classification'],
    },
  ];

  const certifications = [
    { name: 'ISO/IEC 27001', status: 'Aligned', desc: 'Information Security Management System controls implemented across all platform operations.' },
    { name: 'SOC 2 Type II', status: 'In Progress', desc: 'Security, availability, and confidentiality controls in active preparation for third-party audit.' },
    { name: 'NIST CSF', status: 'Aligned', desc: 'Cybersecurity Framework controls mapped across identify, protect, detect, respond, and recover functions.' },
    { name: 'OWASP SAMM', status: 'Implemented', desc: 'Software Assurance Maturity Model practices embedded in our SDLC across all development teams.' },
    { name: 'GDPR', status: 'Compliant', desc: 'Data processing agreements, privacy controls, and subject rights procedures in place for EU data.' },
    { name: 'Zero-Trust Architecture', status: 'Implemented', desc: 'Full zero-trust network and identity model with continuous verification across all access paths.' },
  ];

  const incident = [
    { title: 'Detection', desc: 'Automated SIEM rules, anomaly detection, and 24/7 monitoring provide real-time threat detection across all infrastructure and application layers.' },
    { title: 'Classification', desc: 'Incidents are classified by severity (P1–P4) with defined SLAs. P1 critical incidents trigger immediate on-call escalation.' },
    { title: 'Containment', desc: 'Automated containment playbooks isolate affected resources. Manual runbooks guide responders through systematic incident management.' },
    { title: 'Recovery', desc: 'Point-in-time recovery, cross-region failover, and documented RTO/RPO targets ensure minimal business impact.' },
    { title: 'Post-Incident Review', desc: 'All P1/P2 incidents result in a written post-mortem with root cause analysis, timeline, and corrective actions.' },
  ];

  return (
    <div style={{ background: '#FFFFFF' }}>

      {/* ── Security Framework ── */}
      <section className="gsw-section" style={{ background: '#F8F9FA' }}>
        <div className="gsw-container">
          <div className="gsw-section-header">
          <span className="gsw-eyebrow">Security Controls</span>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, color: '#111827', lineHeight: 1.12, maxWidth: 600, margin: '0 auto 16px' }}>
            Security Control Framework
          </h2>
          <p style={{ fontSize: 15, color: '#4B5563', lineHeight: 1.75, maxWidth: 660, margin: '0 auto 56px' }}>
            Security controls are implemented and maintained across every layer of the AtonixDev platform stack.
          </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB' }}>
            {framework.map((f) => (
              <div key={f.name} style={{ background: '#FFFFFF', padding: '32px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 3, height: 20, background: '#A81D37' }} />
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: '#111827', margin: 0 }}>{f.name}</h3>
                </div>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {f.controls.map((c) => (
                    <li key={c} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#1F2937', lineHeight: 1.65 }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#A81D37', flexShrink: 0, marginTop: 6 }} />{c}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="gsw-divider" />

      {/* ── Certifications ── */}
      <section className="gsw-section" style={{ background: '#FFFFFF' }}>
        <div className="gsw-container">
          <div className="gsw-section-header">
          <span className="gsw-eyebrow">Certifications & Standards</span>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, color: '#111827', lineHeight: 1.12, maxWidth: 600, margin: '0 auto 16px' }}>
            Compliance Certifications
          </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB' }}>
            {certifications.map((cert) => (
              <div key={cert.name} style={{ background: '#FFFFFF', padding: '24px 32px', display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 160 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#111827', marginBottom: 4 }}>{cert.name}</div>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 10px', fontSize: 10, fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    fontFamily: 'var(--font-mono)',
                    ...(cert.status === 'Compliant' || cert.status === 'Implemented' || cert.status === 'Aligned'
                      ? { color: '#059669', border: '1px solid #A7F3D0', background: '#ECFDF5' }
                      : { color: '#B45309', border: '1px solid #FDE68A', background: '#FFFBEB' })
                  }}>
                    {cert.status}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.75, margin: 0, flex: 1 }}>{cert.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="gsw-divider" />

      {/* ── Incident Response ── */}
      <section className="gsw-section" style={{ background: '#F8F9FA' }}>
        <div className="gsw-container">
          <div className="gsw-section-header">
          <span className="gsw-eyebrow">Incident Response</span>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 36px)', fontWeight: 800, color: '#111827', lineHeight: 1.12, maxWidth: 560, margin: '0 auto 56px' }}>
            Incident Response Process
          </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB', maxWidth: 840 }}>
            {incident.map((step, idx) => (
              <div key={step.title} style={{ background: '#FFFFFF', padding: '24px 32px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: '#A81D37', fontSize: 10, fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{String(idx + 1).padStart(2, '0')}</span>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111827', marginBottom: 6 }}>{step.title}</h3>
                  <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.75, margin: 0 }}>{step.desc}</p>
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
            <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 800, color: '#FFFFFF', marginBottom: 10 }}>Security questions or audit requests?</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.7 }}>Our security team is available for enterprise procurement security reviews, penetration test coordination, and DPA negotiations.</p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', padding: '12px 28px', background: '#A81D37', color: '#FFFFFF', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Contact Security
            </Link>
            <Link to="/data-protection" style={{ display: 'inline-flex', alignItems: 'center', padding: '11px 28px', border: '1px solid rgba(255,255,255,0.25)', color: '#D1D5DB', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Data Protection
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default SecurityCompliance;
