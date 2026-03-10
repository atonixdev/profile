import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// GS-WSF §5 — Infrastructure page
const Infrastructure = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const projects = [
    { id: 1, title: 'OpenStack Private Cloud', description: 'Designed and deployed a comprehensive OpenStack cloud infrastructure supporting AI research workloads.', category: 'cloud', technologies: ['OpenStack', 'OVN', 'Kubernetes', 'Ceph'], is_featured: true },
    { id: 2, title: 'Neuron Data Center — AI Research Hub', description: 'Built a high-performance computing environment optimized for AI/ML workloads with GPU acceleration.', category: 'ai', technologies: ['AWS Neuron', 'GPU', 'Docker', 'TensorFlow'], is_featured: true },
    { id: 3, title: 'DevOps Pipeline Automation — FinTech SA', description: 'Implemented comprehensive CI/CD pipelines with automated testing and zero-downtime deployments.', category: 'devops', technologies: ['Jenkins', 'GitLab CI', 'Docker', 'Kubernetes'], is_featured: false },
    { id: 4, title: 'Enterprise Email Infrastructure', description: 'Developed secure, scalable communication systems with custom SMTP servers and encryption.', category: 'infrastructure', technologies: ['Postfix', 'DKIM', 'SPF', 'Redis'], is_featured: false },
    { id: 5, title: 'AI Marketing Automation Platform', description: 'Created automated marketing workflows with segmentation engines and behavioral triggers.', category: 'ai', technologies: ['Python', 'TensorFlow', 'React', 'PostgreSQL'], is_featured: true },
    { id: 6, title: 'Scientific Computing Platform', description: 'Architected high-performance computing systems for scientific research with optimizations.', category: 'systems', technologies: ['C++', 'Python', 'CUDA', 'Hadoop'], is_featured: false },
  ];

  const categories = ['all', 'cloud', 'ai', 'devops', 'infrastructure', 'systems'];
  const catLabels = { all: 'All', cloud: 'Cloud', ai: 'AI & ML', devops: 'DevOps', infrastructure: 'Infrastructure', systems: 'Systems' };

  const filtered = projects.filter((p) => {
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchSearch = !searchTerm || p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ background: '#FFFFFF' }}>

      {/* ── Page Hero ──────────────────────────────────────── */}
      <section style={{ position: 'relative', background: '#FFFFFF', overflow: 'hidden', padding: '120px 0 96px' }}>
        <div className="hero-grid-bg" />
        <div className="hero-accent-bar" />
        <div className="gsw-container" style={{ position: 'relative', zIndex: 1 }}>
          <span className="gsw-eyebrow">Our Work</span>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, color: '#111827', lineHeight: 1.1, maxWidth: 700, marginBottom: 24 }}>
            Infrastructure
          </h1>
          <p style={{ fontSize: 18, color: '#6B7280', lineHeight: 1.7, maxWidth: 600 }}>
            Sovereign infrastructure projects powering African innovation and global digital independence.
          </p>
        </div>
      </section>

      <hr className="gsw-divider" />

      {/* ── Filters ────────────────────────────────────────── */}
      <section style={{ background: '#F8F9FA', padding: '32px 0', borderBottom: '1px solid #F3F4F6' }}>
        <div className="gsw-container">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '8px 20px',
                    background: selectedCategory === cat ? '#A81D37' : 'transparent',
                    border: `1px solid ${selectedCategory === cat ? '#A81D37' : '#D1D5DB'}`,
                    color: selectedCategory === cat ? '#111827' : '#6B7280',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                    textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {catLabels[cat]}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="gsw-input"
              style={{ maxWidth: 280 }}
            />
          </div>
        </div>
      </section>

      {/* ── Projects Grid ──────────────────────────────────── */}
      <section className="gsw-section" style={{ background: '#FFFFFF' }}>
        <div className="gsw-container">
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 0', color: '#6B7280' }}>
              No projects match your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((project) => (
                <div
                  key={project.id}
                  className="gsw-card"
                  style={{
                    padding: 0,
                    borderTop: project.is_featured ? '2px solid #A81D37' : '1px solid #E5E7EB',
                    display: 'flex', flexDirection: 'column',
                  }}
                >
                  {project.is_featured && (
                    <div style={{
                      padding: '6px 28px',
                      fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                      color: '#A81D37', borderBottom: '1px solid #F3F4F6',
                    }}>
                      Featured
                    </div>
                  )}
                  <div style={{ padding: '28px 28px 20px', flexGrow: 1 }}>
                    <div style={{ marginBottom: 8 }}>
                      <span className="gsw-tag-accent" style={{ fontSize: 10 }}>{catLabels[project.category] || project.category}</span>
                    </div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 10, marginTop: 12, lineHeight: 1.4 }}>
                      {project.title}
                    </h3>
                    <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7, marginBottom: 20 }}>
                      {project.description}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {project.technologies.map((tech) => (
                        <span key={tech} className="gsw-tag">{tech}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding: '16px 28px', borderTop: '1px solid #F3F4F6' }}>
                    <Link
                      to={`/infrastructure/${project.id}`}
                      className="gsw-btn gsw-btn-ghost"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Bar ────────────────────────────────────────── */}
      <section className="gsw-cta-bar">
        <div className="gsw-container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: '#111827', marginBottom: 12, marginTop: 0 }}>
            Ready for Your Infrastructure Project?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Let's build sovereign, scalable solutions together.
          </p>
          <Link
            to="/contact"
            style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '14px 36px', background: '#FFFFFF', color: '#A81D37',
              fontWeight: 800, fontSize: 12, letterSpacing: '0.1em',
              textTransform: 'uppercase', textDecoration: 'none',
            }}
          >
            Discuss Your Project
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Infrastructure;
