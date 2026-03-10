import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const services = [
  {
    icon: '◈',
    title: 'Machine Learning & Predictive Analytics',
    body: 'Design and deploy supervised and unsupervised ML models that convert raw operational data into actionable forecasts — from demand prediction and anomaly detection through churn modelling and price optimisation.',
    points: ['Feature engineering & data pipeline construction', 'scikit-learn, XGBoost, LightGBM, PyTorch', 'MLflow experiment tracking & model registry', 'Batch & real-time inference deployment'],
  },
  {
    icon: '⬡',
    title: 'Large Language Model Integration',
    body: 'Integrate GPT-4o, Claude, Mistral, or fine-tuned open-source LLMs into your enterprise workflows. We design the retrieval architecture, prompt engineering framework, and guardrail system needed for production-grade AI.',
    points: ['RAG pipelines with vector databases (Qdrant, pgvector)', 'LangChain / LlamaIndex orchestration', 'Fine-tuning on proprietary domain data', 'Evaluation, bias testing, and output validation'],
  },
  {
    icon: '▣',
    title: 'Intelligent Process Automation',
    body: 'Automate high-volume, rule-bound business processes without fragile RPA scripts. We build AI-assisted automation that adapts to variation — combining classification models, document intelligence, and workflow orchestration.',
    points: ['Document extraction & classification (Textract, Unstructured)', 'Approval workflow automation with AI routing', 'Anomaly-driven exception handling', 'Process mining & optimsation (Celonis integration)'],
  },
  {
    icon: '◉',
    title: 'Computer Vision',
    body: 'Deploy vision models that inspect, detect, and track at scale. From quality control on production lines through physical security analytics and satellite imagery analysis, we build and operationalise vision pipelines end-to-end.',
    points: ['Object detection & segmentation (YOLO, Detectron2)', 'OCR & document digitisation', 'Video analytics & anomaly detection', 'Edge deployment on NVIDIA Jetson / Raspberry Pi'],
  },
  {
    icon: '◐',
    title: 'Natural Language Processing',
    body: 'Extract meaning from unstructured text at enterprise scale. We build pipelines that classify, summarise, translate, and analyse sentiment across customer communications, regulatory filings, and internal knowledge bases.',
    points: ['Named entity recognition & relation extraction', 'Semantic search & similarity ranking', 'Multi-language translation pipelines', 'Topic modelling & trend detection'],
  },
  {
    icon: '◑',
    title: 'AI Platform & MLOps',
    body: 'Build the engineering infrastructure that makes AI scale in production. We design full MLOps platforms covering data versioning, model training pipelines, experiment tracking, serving, monitoring, and drift detection.',
    points: ['Kubeflow / Vertex AI pipeline orchestration', 'DVC data & model versioning', 'Model serving with Triton, BentoML, or FastAPI', 'Drift detection & automated retraining triggers'],
  },
];

const useCases = [
  { sector: 'Government', scenario: 'Automated benefits eligibility screening reduced case worker processing time by 68% and eliminated manual data entry errors across 40,000 monthly applications.' },
  { sector: 'Finance', scenario: 'Real-time transaction anomaly detection model reduced false-positive fraud alerts by 41% while maintaining 99.3% detection rate across 12M daily transactions.' },
  { sector: 'Healthcare', scenario: 'NLP pipeline extracting structured clinical data from unstructured discharge summaries — processing 8,000 records per hour with 94.2% field-level accuracy.' },
  { sector: 'Logistics', scenario: 'Demand forecasting model reduced warehouse overstock by 23% and stockout events by 31% across a 6-region distribution network.' },
];

const AIAutomation = () => {
  const [activeCase, setActiveCase] = useState(0);

  return (
    <div style={{ background: '#FFFFFF' }}>

      {/* ── Services ── */}
      <section className="gsw-section" style={{ background: '#FFFFFF' }}>
        <div className="gsw-container">
          <div className="gsw-section-header">
            <span className="gsw-eyebrow">Services</span>
            <h2 className="gsw-section-title">AI & automation services</h2>
            <p style={{ fontSize: 16, color: '#4B5563', maxWidth: 520, lineHeight: 1.75 }}>Six specialised practice areas covering the full AI lifecycle — from data engineering and model training through deployment, monitoring, and continuous improvement.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB' }}>
            {services.map((svc, i) => (
              <div key={i} style={{ background: '#FFFFFF', padding: '32px 36px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px 56px', alignItems: 'start' }}>
                <div>
                  <div style={{ fontSize: 22, color: '#A81D37', marginBottom: 12, fontFamily: 'var(--font-mono)' }}>{svc.icon}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 10 }}>{svc.title}</h3>
                  <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.8 }}>{svc.body}</p>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {svc.points.map((pt) => (
                    <li key={pt} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#1F2937', lineHeight: 1.7, paddingBottom: 8 }}>
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

      {/* ── Use Cases ── */}
      <section className="gsw-section" style={{ background: '#F8F9FA' }}>
        <div className="gsw-container">
          <div className="gsw-section-header">
            <span className="gsw-eyebrow">Impact</span>
            <h2 className="gsw-section-title">Sector outcomes</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB', marginBottom: 1 }}>
            {useCases.map((uc, i) => (
              <button
                key={i}
                onClick={() => setActiveCase(i)}
                style={{ background: activeCase === i ? '#A81D37' : '#FFFFFF', padding: '20px 24px', textAlign: 'left', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: activeCase === i ? '#A81D37' : '#4B5563', fontFamily: 'var(--font-mono)' }}>{uc.sector}</div>
              </button>
            ))}
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '32px 36px' }}>
            <p style={{ fontSize: 16, color: '#1F2937', lineHeight: 1.8, margin: 0 }}>{useCases[activeCase].scenario}</p>
          </div>
        </div>
      </section>

      <hr className="gsw-divider" />

      {/* ── AI Principles ── */}
      <section className="gsw-section" style={{ background: '#FFFFFF' }}>
        <div className="gsw-container">
          <div className="gsw-section-header">
            <span className="gsw-eyebrow">Responsible AI</span>
            <h2 className="gsw-section-title">How we build trustworthy AI</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB' }}>
            {[
              { title: 'Explainability first', body: 'SHAP / LIME explanations are built into all decision-support models so end-users understand why the system made a recommendation.' },
              { title: 'Bias testing', body: 'Every model undergoes bias analysis across protected characteristics before deployment, with documented mitigation actions.' },
              { title: 'Human in the loop', body: 'High-stakes automation workflows retain human review checkpoints — the model assists, the human decides.' },
              { title: 'Data minimisation', body: 'We engineer pipelines that use the minimum data required for the task and anonymise personal data before model training.' },
              { title: 'Continuous monitoring', body: 'Deployed models are monitored for data drift, performance degradation, and unexpected output distributions with auto-alerting.' },
              { title: 'Auditability', body: 'Every inference can be traced back to its input feature values and model version — essential for regulated industries.' },
            ].map((p) => (
              <div key={p.title} style={{ background: '#FFFFFF', padding: '28px 24px' }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#111827', marginBottom: 8 }}>{p.title}</h3>
                <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.75, margin: 0 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="gsw-section-sm" style={{ background: '#A81D37' }}>
        <div className="gsw-container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px 48px' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 800, color: '#FFFFFF', marginBottom: 10 }}>Have an AI use case to explore?</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.7 }}>We'll help you scope the data requirements, architecture, and realistic ROI before committing to a project.</p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', padding: '12px 28px', background: '#A81D37', color: '#FFFFFF', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>Start the Conversation</Link>
            <Link to="/case-studies" style={{ display: 'inline-flex', alignItems: 'center', padding: '12px 28px', border: '1px solid rgba(255,255,255,0.4)', color: '#FFFFFF', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>View Case Studies</Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AIAutomation;
