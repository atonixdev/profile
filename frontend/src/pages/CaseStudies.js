import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const caseStudies = [
  {
    id: 1,
    industry: 'Government',
    title: 'National Registry Modernisation',
    challenge: 'Legacy COBOL system responsible for managing citizen records across 47 state agencies. No audit trail, manual processes, weeks-long batch runs.',
    results: [
      { metric: '94.2%', title: 'Data migration accuracy (7M+ records)', tag: 'First pass' },
      { metric: '8.3×', title: 'Faster query response times', tag: 'vs legacy system' },
      { metric: '100%', title: 'Audit trail coverage', tag: 'New golden record' },
      { metric: '$23M', title: 'Infrastructure cost savings (5yr)', tag: 'Post-migration' },
    ],
    approach: 'Strangler fig migration over 14 months. Built domain-driven Phoenix application with event sourcing. Parallel ran legacy + new system for 6 months with automated reconciliation. Cut over in single weekend with zero data loss.',
    technologies: ['Django 4.2', 'PostgreSQL', 'Python ETL pipelines', 'Kubernetes', 'Event Sourcing', 'DDD'],
    outcome: 'Reduced cost per transaction from $47 to $11. Enabled new data-driven policy workflows. Full audit compliance with 30-day cold storage on WORM archives.',
  },
  {
    id: 2,
    industry: 'Finance',
    title: 'Real-time Fraud Detection Platform',
    challenge: 'Manual fraud review taking 3–5 days, $8.2M annual loss from detection delays. Rule-based system had 28% false-positive rate causing customer friction.',
    results: [
      { metric: '99.3%', title: 'Detection rate achieved', tag: 'vs 67% baseline' },
      { metric: '41%', title: 'False-positive reduction', tag: 'Lower friction' },
      { metric: '<17ms', title: 'Avg inference latency', tag: 'Real-time SLA' },
      { metric: '$6.8M', title: 'First-year fraud loss recovery', tag: 'ROI positive' },
    ],
    approach: 'Gradient boosting ensemble (XGBoost + LightGBM) trained on 2.1M anonymised transactions. Real-time serving via Triton on GPU instances with 100µs fallback to CPU. Kafka streaming pipeline for online learning on new data.',
    technologies: ['XGBoost', 'LightGBM', 'Triton Inference Server', 'Kafka', 'Python', 'NVIDIA GPUs', 'FastAPI'],
    outcome: 'Deployed to all 12 line-of-business divisions. 94 DORA metric: 3M/day deployments. Reduced manual review queue from 80k to <2k daily items.',
  },
  {
    id: 3,
    industry: 'Healthcare',
    title: 'E2E Patient Data Interoperability Platform',
    challenge: 'FHIR data interop across 600+ healthcare provider orgs, 94M patient records. Fragmented identity model, no unified consent ledger, compliance gaps.',
    results: [
      { metric: '600+', title: 'Provider orgs integrated', tag: 'Live endpoints' },
      { metric: '94M', title: 'Patient records federated', tag: 'Real-time sync' },
      { metric: '<1.2s', title: '95th percentile query latency', tag: 'FHIR compliance' },
      { metric: '100%', title: 'HIPAA audit compliance', tag: 'Zero findings' },
    ],
    approach: 'HL7 FHIR R4 canonical API. Decentralised identity using OAuth 2.0 MTLS + SAML federated sign-on. Consent ledger on blockchain for immutable audit. GraphQL query engine for efficient multi-provider joins.',
    technologies: ['FHIR R4', 'GraphQL', 'OAuth 2.0', 'SAML 2.0', 'Blockchain (Hyperledger)', 'PostgreSQL', 'Elasticsearch'],
    outcome: 'Enabled 30% faster patient onboarding, 40% reduction in prescription delays. Certified for HIPAA + HITRUST CSF Level 2.',
  },
  {
    id: 4,
    industry: 'Retail',
    title: 'Demand Forecasting & Inventory Optimisation',
    challenge: '220-store retail chain, $2.1B inventory. Spreadsheet-based demand planning, 26% overstock, 18% stockouts causing lost sales.',
    results: [
      { metric: '23%', title: 'Overstock reduction', tag: '$480M inventory freed' },
      { metric: '31%', title: 'Stockout reduction', tag: '+$140M sales capture' },
      { metric: '4.2×', title: 'Forecast accuracy improvement', tag: 'MAPE: 31% → 7%' },
      { metric: '$612M', title: 'Net economic benefit (12mo)', tag: 'Post-implementation' },
    ],
    approach: 'LightGBM ensemble with 600+ features (store size, traffic, competitor, weather, events, seasonality). Live feature engineering on Databricks. Multi-level reconciliation (item→dept→store→chain). Deployed to store planning dashboards + automated PO flow.',
    technologies: ['LightGBM', 'Databricks', 'PySpark', 'Feature Store', 'Airflow', 'Tableau', 'REST API'],
    outcome: 'Stores plan inventory from ML-generated recommendations vs spreadsheets. Cycle time from 4 days to <4 hours. Store managers accept 87% of system suggestions automatically.',
  },
  {
    id: 5,
    industry: 'Logistics',
    title: 'Last-mile Delivery Route Optimisation',
    challenge: '8,000+ daily deliveries across 6 regions. Manual routing, $340/day × 250 drivers = inefficient delivery sequencing. Avg driver util 64%, 14 min avg stops.',
    results: [
      { metric: '22%', title: 'Driver efficiency increase', tag: '14→17 stops/day' },
      { metric: '18%', title: 'Fuel cost reduction', tag: '$1.2M annual savings' },
      { metric: '<30s', title: 'Route compute time (1000 stops)', tag: 'Real-time quality' },
      { metric: '$1.8M', title: 'First-year net benefit (6mo payback)', tag: 'Capex + OpEx' },
    ],
    approach: 'Google OR-Tools vehicle routing engine + custom ML model for stop sequencing. Real-time geofencing with Kafka location streams. Driver app integration with mobile OSM tiles. High-water mark daily plan optimization at 02:00 UTC.',
    technologies: ['Google OR-Tools', 'Python', 'Kafka', 'PostGIS', 'Leaflet', 'React Native', 'PostgreSQL'],
    outcome: 'Drivers use mobile app with AI-optimised routes. Exception handling (failed delivery, wait time overrun) triggers Kafka alerts for dispatcher intervention. Utilisation dashboard for daily reporting.',
  },
  {
    id: 6,
    industry: 'Manufacturing',
    title: 'Predictive Equipment Maintenance',
    challenge: 'Assembly line, 120 CNC machines. Reactive maintenance (machine breakdown → 6hr+ downtime). Maintenance budget at $8.2M/yr, 15% of it emergency repairs.',
    results: [
      { metric: '44%', title: 'Downtime reduction', tag: 'From emergency failures' },
      { metric: '$3.1M', title: 'Maintenance budget optimisation', tag: 'Proactive vs reactive' },
      { metric: '87%', title: 'Predictive accuracy (time-to-fail)', tag: 'Avg 96h lead time' },
      { metric: '23%', title: 'Equipment lifespan extension', tag: 'Optimal preventive cycles' },
    ],
    approach: 'Time-series anomaly detection (Isolation Forest + LSTM autoencoder) on vibration, temperature, current sensors. Daily inference on 120 machines × 24 features. Alert sent to maintenance team when anomaly score > threshold. Runbooks auto-generated based on machine type + failure mode signature.',
    technologies: ['Isolation Forest', 'LSTM', 'TensorFlow', 'scikit-learn', 'Grafana', 'Kafka', 'MQTT sensors'],
    outcome: 'Proactive maintenance schedule generated weekly. Technicians prioritise parts inventory 7–14 days in advance. Reduced emergency callouts from 2/week to 1/3 weeks.',
  },
];

const CaseStudies = () => {
  const [activeStudy, setActiveStudy] = useState(0);
  const study = caseStudies[activeStudy];

  return (
    <div style={{ background: '#FFFFFF' }}>

      {/* ── Case Study Selector ── */}
      <section className="gsw-section" style={{ background: '#FFFFFF' }}>
        <div className="gsw-container">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB', marginBottom: 0 }}>
            {caseStudies.map((cs, i) => (
              <button
                key={i}
                onClick={() => setActiveStudy(i)}
                style={{
                  flex: '1 1 150px',
                  background: activeStudy === i ? '#111827' : '#FFFFFF',
                  border: 'none',
                  padding: '20px 16px',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: activeStudy === i ? '#A81D37' : '#4B5563', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
                  {cs.industry}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: activeStudy === i ? '#FFFFFF' : '#111827' }}>
                  {cs.title.split(' ').slice(0, 3).join(' ')}...
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Case Study Detail ── */}
      <section className="gsw-section" style={{ background: '#F8F9FA' }}>
        <div className="gsw-container">
          {/* ── Header ── */}
          <div style={{ marginBottom: 56 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A81D37', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
              {study.industry} Sector
            </div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, color: '#111827', lineHeight: 1.2, marginBottom: 24 }}>
              {study.title}
            </h2>
            <p style={{ fontSize: 15, color: '#4B5563', lineHeight: 1.8, maxWidth: 680 }}>
              <strong style={{ color: '#111827' }}>Challenge: </strong>{study.challenge}
            </p>
          </div>

          {/* ── Results Grid ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB', marginBottom: 56 }}>
            {study.results.map((r, i) => (
              <div key={i} style={{ background: '#FFFFFF', padding: '24px 20px' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#A81D37', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>{r.metric}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', lineHeight: 1.5, marginBottom: 6 }}>{r.title}</div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4B5563' }}>{r.tag}</div>
              </div>
            ))}
          </div>

          {/* ── Approach & Tech ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px 56px', marginBottom: 56 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#111827', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Approach</h3>
              <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.8, margin: 0 }}>{study.approach}</p>
            </div>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#111827', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tech Stack</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {study.technologies.map((tech) => (
                  <span key={tech} style={{ padding: '4px 10px', background: '#FFFFFF', border: '1px solid #E5E7EB', fontSize: 11, fontWeight: 600, color: '#1F2937', fontFamily: 'var(--font-mono)' }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Outcome ── */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '28px 32px' }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#111827', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ongoing Impact</h3>
            <p style={{ fontSize: 14, color: '#1F2937', lineHeight: 1.8, margin: 0 }}>{study.outcome}</p>
          </div>
        </div>
      </section>

      {/* ── Summary Stats ── */}
      <section className="gsw-section" style={{ background: '#FFFFFF' }}>
        <div className="gsw-container">
          <div className="gsw-section-header">
            <span className="gsw-eyebrow">Portfolio Overview</span>
            <h2 className="gsw-section-title">Six years of measurable outcomes</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB' }}>
            {[
              { stat: '6', label: 'Case studies shown' },
              { stat: '20+', label: 'Total engagements in portfolio' },
              { stat: '$200M+', label: 'Aggregate economic benefit delivered' },
              { stat: '94%', label: 'Avg project success rate' },
              { stat: '14mo', label: 'Avg engagement duration' },
              { stat: '4', label: 'Sectors (Gov, Finance, HC, Retail, Logistics, Mfg)' },
            ].map((item) => (
              <div key={item.label} style={{ background: '#FFFFFF', padding: '28px 24px' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#A81D37', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>{item.stat}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#4B5563', lineHeight: 1.6 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="gsw-section-sm" style={{ background: '#A81D37' }}>
        <div className="gsw-container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px 48px' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 800, color: '#FFFFFF', marginBottom: 10 }}>Ready to write your next success story?</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.7 }}>Let's explore how AtonixDev can deliver measurable outcomes for your organisation.</p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', padding: '12px 28px', background: '#A81D37', color: '#FFFFFF', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>Start a Project</Link>
            <Link to="/platform" style={{ display: 'inline-flex', alignItems: 'center', padding: '12px 28px', border: '1px solid rgba(255,255,255,0.4)', color: '#FFFFFF', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>Explore Capabilities →</Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default CaseStudies;
