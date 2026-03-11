import React, { useState, useEffect } from 'react';

const A    = '#A81D37';
const BD   = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px', borderRadius: 4 };
const MONO = { fontFamily: 'var(--font-mono)' };

const MarketingDashboard = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    fetch('/api/portal/dashboard/marketing/', { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: '40px 32px', color: '#6B7280', ...MONO, fontSize: 12 }}>Loading…</div>;
  if (error) return <div style={{ padding: '40px 32px', color: '#DC2626', ...MONO, fontSize: 12 }}>Error: {error}</div>;
  if (!data) return null;

  const social  = data.social_hub || {};
  const summary = data.content_summary || {};

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 28px) clamp(16px, 4vw, 32px)', maxWidth: 1440 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: A, ...MONO }}>MKT</span>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Marketing Dashboard</h1>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Social media analytics, content pipeline, and campaign performance</p>
      </div>

      {/* Social Hub KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14, marginBottom: 28 }}>
        <div style={{ ...CARD, borderTop: '3px solid #2563EB' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Connected Accounts</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{social.connected_accounts || 0}</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>Active social integrations</div>
        </div>
        <div style={{ ...CARD, borderTop: '3px solid #16A34A' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Published Posts</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{social.published_posts || 0}</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>Total published content</div>
        </div>
        <div style={{ ...CARD, borderTop: '3px solid #D97706' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Scheduled Posts</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{social.scheduled_posts || 0}</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>Pending in queue</div>
        </div>
        <div style={{ ...CARD, borderTop: `3px solid ${A}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Draft Posts</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{social.draft_posts || 0}</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>Work in progress</div>
        </div>
      </div>

      {/* Content Summary & Channel Health */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 16 }}>
        {/* Content Pipeline */}
        <div style={CARD}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>
            Content Pipeline
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {[
              { label: 'Blog Posts', value: summary.blog_posts, color: '#7C3AED' },
              { label: 'Case Studies', value: summary.case_studies, color: '#2563EB' },
              { label: 'Testimonials', value: summary.testimonials, color: '#16A34A' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: BD, paddingBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                  <span style={{ fontSize: 12, color: '#374151' }}>{item.label}</span>
                </div>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#111827', ...MONO }}>{item.value || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Social Hub Status */}
        <div style={CARD}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>
            Social Hub Status
          </div>
          {social.connected_accounts === 0 && social.published_posts === 0 ? (
            <div style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', padding: '20px 0' }}>
              Social Hub not yet configured
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: BD, paddingBottom: 10 }}>
                <span style={{ fontSize: 12, color: '#6B7280' }}>Platform Integration</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#16A34A', ...MONO }}>
                  {social.connected_accounts > 0 ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: BD, paddingBottom: 10 }}>
                <span style={{ fontSize: 12, color: '#6B7280' }}>Publishing Queue</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: social.scheduled_posts > 0 ? '#D97706' : '#16A34A', ...MONO }}>
                  {social.scheduled_posts > 0 ? `${social.scheduled_posts} PENDING` : 'CLEAR'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 4 }}>
                <span style={{ fontSize: 12, color: '#6B7280' }}>Analytics Tracking</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#16A34A', ...MONO }}>ENABLED</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Marketing Channels */}
      <div style={{ ...CARD, marginTop: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 14 }}>
          Distribution Channels
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['LINKEDIN', 'TWITTER/X', 'GITHUB', 'DEV.TO', 'BLOG', 'NEWSLETTER', 'PRODUCT HUNT'].map(ch => (
            <span key={ch} style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', padding: '5px 12px',
              border: BD, borderRadius: 2, color: '#6B7280', ...MONO,
            }}>{ch}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketingDashboard;
