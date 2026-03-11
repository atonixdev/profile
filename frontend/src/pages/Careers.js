import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Careers = () => {
  const [selectedDept, setSelectedDept] = useState('all');

  const values = [
    { title: 'Engineering Excellence', desc: 'We hold every engineer to the highest standards of craft, architecture, and code quality — no exceptions.' },
    { title: 'Remote-First Culture', desc: 'AtonixDev operates distributed-first with async communication, deep work blocks, and results over presence.' },
    { title: 'Ownership & Autonomy', desc: 'Engineers own their domains end-to-end. We move fast, trust our people, and avoid bureaucracy.' },
    { title: 'Security by Default', desc: 'Every role at AtonixDev carries a security responsibility. We build with threat models, not afterthoughts.' },
    { title: 'Global & Diverse', desc: 'Our team spans continents and disciplines. Diverse perspectives build better systems.' },
    { title: 'Continuous Learning', desc: 'Conference budgets, open access to certifications, internal tech talks, and a culture of teaching.' },
  ];

  const departments = ['all', 'engineering', 'infrastructure', 'security', 'product', 'operations'];
  const deptLabels = { all: 'All Departments', engineering: 'Engineering', infrastructure: 'Cloud & Infrastructure', security: 'Security', product: 'Product', operations: 'Operations' };

  const roles = [
    { title: 'Senior Backend Engineer — Python/Django', dept: 'engineering', location: 'Remote (Global)', type: 'Full-Time', desc: 'Build and own core platform APIs, authentication systems, and data pipelines for enterprise clients.' },
    { title: 'Cloud Infrastructure Engineer', dept: 'infrastructure', location: 'Remote (Global)', type: 'Full-Time', desc: 'Design, deploy, and operate OpenStack, Kubernetes, and hybrid cloud environments for government and enterprise.' },
    { title: 'Full-Stack Engineer — React/Node', dept: 'engineering', location: 'Remote (Global)', type: 'Full-Time', desc: 'Build user-facing platform features, developer dashboards, and enterprise web applications at scale.' },
    { title: 'Security Engineer — AppSec', dept: 'security', location: 'Remote (Global)', type: 'Full-Time', desc: 'Drive application security reviews, threat modelling, penetration testing, and secure SDLC adoption.' },
    { title: 'DevOps Engineer — CI/CD & Automation', dept: 'infrastructure', location: 'Remote (Global)', type: 'Full-Time', desc: 'Build and maintain deployment pipelines, IaC tooling, and platform reliability for production workloads.' },
    { title: 'AI/ML Engineer', dept: 'engineering', location: 'Remote (Global)', type: 'Full-Time', desc: 'Develop and deploy machine learning models and intelligent automation pipelines for enterprise clients.' },
    { title: 'Product Manager — Enterprise Platform', dept: 'product', location: 'Remote (Global)', type: 'Full-Time', desc: 'Define and drive the roadmap for AtonixDev enterprise platform capabilities in partnership with engineering.' },
    { title: 'Information Security Analyst', dept: 'security', location: 'Remote (Global)', type: 'Full-Time', desc: 'Support compliance programmes, security monitoring, incident response, and audit readiness.' },
    { title: 'Technical Operations Lead', dept: 'operations', location: 'Remote (Global)', type: 'Full-Time', desc: 'Coordinate cross-functional engineering delivery, vendor management, and enterprise client technical operations.' },
  ];

  const process = [
    { step: '01', title: 'Application Review', desc: 'We review every application personally. No automated rejections. Expect a response within 5 business days.' },
    { step: '02', title: 'Technical Screen', desc: 'A 45-minute technical conversation with an engineer from your target team. No whiteboard theatre.' },
    { step: '03', title: 'Take-Home Challenge', desc: 'A focused, paid take-home challenge relevant to your role. We respect your time — capped at 3 hours.' },
    { step: '04', title: 'Final Interview', desc: 'A two-part final: technical depth review + values and culture alignment conversation with founders.' },
    { step: '05', title: 'Offer', desc: 'Competitive, transparent compensation. We share the full package breakdown before you decide.' },
  ];

  const filtered = selectedDept === 'all' ? roles : roles.filter(r => r.dept === selectedDept);

  return (
    <div style={{ background: '#FFFFFF' }}>

      {/* ── Why AtonixDev ── */}
      <section className="gsw-section" style={{ background: '#F8F9FA' }}>
        <div className="gsw-container">
          <div className="gsw-section-header">
          <span className="gsw-eyebrow">Why AtonixDev</span>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, color: '#111827', lineHeight: 1.12, maxWidth: 600, margin: '0 auto 16px' }}>
            Our Culture & Values
          </h2>
          <p style={{ fontSize: 15, color: '#4B5563', lineHeight: 1.75, maxWidth: 660, margin: '0 auto 56px' }}>
            We build for the long term — in software, in careers, and in culture. These are the principles that guide how we work.
          </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB' }}>
            {values.map((v) => (
              <div key={v.title} className="gsw-card" style={{ background: '#FFFFFF', padding: '32px 28px' }}>
                <div style={{ width: 32, height: 2, background: '#A81D37', marginBottom: 20 }} />
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111827', marginBottom: 12, lineHeight: 1.3 }}>{v.title}</h3>
                <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.8, margin: 0 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="gsw-divider" />

      {/* ── Benefits Bar ── */}
      <section className="gsw-section-sm" style={{ background: '#A81D37' }}>
        <div className="gsw-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '32px 48px' }}>
            {[
              ['Competitive Pay', 'Market-rate and above, transparent packages'],
              ['Fully Remote', 'Work from anywhere in the world'],
              ['Equity Options', 'Ownership in what you build'],
              ['Health Benefits', 'Comprehensive coverage for you and family'],
              ['Learning Budget', '$2,000 / year for certifications and conferences'],
              ['Async-First', 'Deep work culture, no meeting overload'],
            ].map(([title, desc]) => (
              <div key={title}>
                <div style={{ width: 24, height: 2, background: '#A81D37', marginBottom: 14 }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>{title}</div>
                <div style={{ fontSize: 12, color: '#4B5563', lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="gsw-divider" />

      {/* ── Open Roles ── */}
      <section id="open-roles" className="gsw-section" style={{ background: '#FFFFFF' }}>
        <div className="gsw-container">
          <div className="gsw-section-header">
          <span className="gsw-eyebrow">Open Positions</span>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, color: '#111827', lineHeight: 1.12, maxWidth: 600, margin: '0 auto 16px' }}>
            Join the Team
          </h2>
          <p style={{ fontSize: 15, color: '#4B5563', lineHeight: 1.75, maxWidth: 620, margin: '0 auto 40px' }}>
            All roles are remote-first. We hire globally and welcome applications from all regions.
          </p>
          </div>
          {/* Dept filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 40 }}>
            {departments.map((d) => (
              <button key={d} onClick={() => setSelectedDept(d)} style={{ padding: '8px 20px', background: selectedDept === d ? '#A81D37' : 'transparent', border: `1px solid ${selectedDept === d ? '#A81D37' : '#D1D5DB'}`, color: selectedDept === d ? '#FFFFFF' : '#4B5563', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                {deptLabels[d]}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB' }}>
            {filtered.map((role) => (
              <div key={role.title} style={{ background: '#FFFFFF', padding: 'clamp(14px, 3.5vw, 28px) clamp(14px, 3.5vw, 32px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFAFA'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}>
                <div style={{ flex: 1, minWidth: 280 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                    <span style={{ padding: '3px 10px', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A81D37', border: '1px solid #FECACA', background: '#FFF5F5', fontFamily: 'var(--font-mono)' }}>{deptLabels[role.dept]}</span>
                    <span style={{ padding: '3px 10px', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4B5563', border: '1px solid #E5E7EB', fontFamily: 'var(--font-mono)' }}>{role.type}</span>
                    <span style={{ padding: '3px 10px', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4B5563', border: '1px solid #E5E7EB', fontFamily: 'var(--font-mono)' }}>{role.location}</span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 8, lineHeight: 1.3 }}>{role.title}</h3>
                  <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.7, margin: 0 }}>{role.desc}</p>
                </div>
                <Link to="/contact" style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', padding: '10px 24px', background: '#A81D37', color: '#FFFFFF', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                  Apply Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="gsw-divider" />

      {/* ── Hiring Process ── */}
      <section className="gsw-section" style={{ background: '#F8F9FA' }}>
        <div className="gsw-container">
          <div className="gsw-section-header">
          <span className="gsw-eyebrow">How We Hire</span>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 36px)', fontWeight: 800, color: '#111827', lineHeight: 1.12, maxWidth: 520, margin: '0 auto 56px' }}>
            Our Hiring Process
          </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB', maxWidth: 800 }}>
            {process.map((p) => (
              <div key={p.step} style={{ background: '#FFFFFF', padding: 'clamp(14px, 3.5vw, 28px) clamp(14px, 3.5vw, 32px)', display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, background: '#A81D37', fontSize: 11, fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{p.step}</span>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111827', marginBottom: 8, lineHeight: 1.3 }}>{p.title}</h3>
                  <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.75, margin: 0 }}>{p.desc}</p>
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
            <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 800, color: '#FFFFFF', marginBottom: 10 }}>Don't see the right role?</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.7 }}>Send us an open application. We always want to hear from talented engineers and problem-solvers.</p>
          </div>
          <Link to="/contact" style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', padding: '12px 28px', background: '#A81D37', color: '#FFFFFF', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
            Open Application
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Careers;
