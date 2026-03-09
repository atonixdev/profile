import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogService } from '../services';

// GS-WSF §5 — Blog page
const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const params = {};
        if (selectedCategory !== 'all') params.category = selectedCategory;
        if (searchTerm) params.search = searchTerm;
        const res = await blogService.getAll(params);
        setPosts(res.data.results || res.data);
      } catch { setPosts([]); }
      finally { setLoading(false); }
    };
    fetch();
  }, [selectedCategory, searchTerm]);

  const categories = [
    { value: 'all', label: 'All Posts' },
    { value: 'cloud', label: 'Cloud' },
    { value: 'ai', label: 'AI & ML' },
    { value: 'devops', label: 'DevOps' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'security', label: 'Security' },
    { value: 'tutorial', label: 'Tutorial' },
  ];

  return (
    <div style={{ background: '#FFFFFF' }}>

      {/* ── Page Hero ──────────────────────────────────────── */}
      <section style={{ position: 'relative', background: '#FFFFFF', overflow: 'hidden', padding: '120px 0 96px' }}>
        <div className="hero-grid-bg" />
        <div className="hero-accent-bar" />
        <div className="gsw-container" style={{ position: 'relative', zIndex: 1 }}>
          <span className="gsw-eyebrow">Insights & Research</span>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, color: '#111827', lineHeight: 1.1, maxWidth: 700, marginBottom: 24 }}>
            Blog
          </h1>
          <p style={{ fontSize: 18, color: '#6B7280', lineHeight: 1.7, maxWidth: 600 }}>
            Insights on cloud infrastructure, AI/ML, DevOps, and technology trends for African digital sovereignty.
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
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  style={{
                    padding: '8px 20px',
                    background: selectedCategory === cat.value ? '#DC2626' : 'transparent',
                    border: `1px solid ${selectedCategory === cat.value ? '#DC2626' : '#D1D5DB'}`,
                    color: selectedCategory === cat.value ? '#111827' : '#6B7280',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                    textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="gsw-input"
              style={{ maxWidth: 280 }}
            />
          </div>
        </div>
      </section>

      {/* ── Posts ──────────────────────────────────────────── */}
      <section className="gsw-section" style={{ background: '#FFFFFF' }}>
        <div className="gsw-container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '64px 0', color: '#6B7280', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Loading posts&hellip;
            </div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 0', color: '#6B7280' }}>
              No posts found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="gsw-card"
                  style={{ padding: 0, display: 'grid', gridTemplateColumns: '1fr', transition: 'border-color 0.2s ease' }}
                >
                  <div style={{ padding: '32px' }}>
                    <div style={{ marginBottom: 12 }}>
                      <span className="gsw-tag-accent" style={{ fontSize: 10 }}>
                        {post.category?.toUpperCase() || 'ARTICLE'}
                      </span>
                    </div>
                    <h2 style={{ marginTop: 12, marginBottom: 12 }}>
                      <Link
                        to={`/blog/${post.slug}`}
                        style={{ fontSize: 22, fontWeight: 700, color: '#111827', lineHeight: 1.3, textDecoration: 'none', transition: 'color 0.15s ease' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#DC2626'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#111827'; }}
                      >
                        {post.title}
                      </Link>
                    </h2>
                    <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.8, marginBottom: 20 }}>
                      {post.excerpt}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 12, color: '#6B7280', marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #F3F4F6' }}>
                      {post.author && <span>By {post.author}</span>}
                      {post.created_at && <span>{new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
                      {post.read_time && <span>{post.read_time} min read</span>}
                    </div>
                    {post.tags_list?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                        {post.tags_list.map((tag) => (
                          <span key={tag} className="gsw-tag" style={{ fontSize: 10 }}>#{tag}</span>
                        ))}
                      </div>
                    )}
                    <Link to={`/blog/${post.slug}`} className="gsw-btn gsw-btn-ghost" style={{ padding: '8px 24px' }}>
                      Read Article
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Bar ────────────────────────────────────────── */}
      <section className="gsw-cta-bar">
        <div className="gsw-container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: '#111827', marginBottom: 12, marginTop: 0 }}>
            Have an Idea for a Blog Post?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Share your thoughts on cloud infrastructure, AI/ML, DevOps, and technology innovation.
          </p>
          <Link
            to="/contact"
            style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '14px 36px', background: '#FFFFFF', color: '#DC2626',
              fontWeight: 800, fontSize: 12, letterSpacing: '0.1em',
              textTransform: 'uppercase', textDecoration: 'none',
            }}
          >
            Get in Touch
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Blog;

