import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

const A  = '#D4AF37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px' };
const MONO = { fontFamily: 'var(--font-mono)' };

const PLATFORM_LABELS = {
  linkedin: 'LinkedIn', facebook: 'Facebook', instagram: 'Instagram',
  twitter: 'X (Twitter)', tiktok: 'TikTok', youtube: 'YouTube',
};

const STATUS_COLOR = {
  draft: '#6B7280', scheduled: '#3B82F6', publishing: '#F59E0B',
  published: '#22C55E', failed: '#EF4444', partial_published: '#F59E0B',
};

const ACCOUNT_STATUS_COLOR = { active: '#22C55E', revoked: '#EF4444', error: '#F59E0B' };

function StatCard({ label, value, sub }) {
  return (
    <div style={{ ...CARD }}>
      <div style={{ fontSize: 10, ...MONO, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B7280', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#6B7280' }}>{sub}</div>}
    </div>
  );
}

export default function SocialHubOverview() {
  const [accounts, setAccounts]     = useState([]);
  const [posts, setPosts]           = useState([]);
  const [analytics, setAnalytics]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [accsRes, postsRes, anlRes] = await Promise.all([
        fetch('/api/social/accounts/', { credentials: 'include' }),
        fetch('/api/social/posts/?status=published&status=scheduled&status=draft', { credentials: 'include' }),
        fetch('/api/social/analytics/overview', { credentials: 'include' }),
      ]);
      if (!accsRes.ok || !postsRes.ok) throw new Error('Failed to load Social Hub data');
      setAccounts(await accsRes.json());
      setPosts(await postsRes.json());
      if (anlRes.ok) setAnalytics(await anlRes.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const thisMonth = (() => {
    const now = new Date();
    return posts.filter(p => {
      const d = new Date(p.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  })();

  const recentPosts = posts.slice(0, 8);

  if (loading) return <div style={{ padding: '40px 32px', ...MONO, color: '#6B7280', fontSize: 12 }}>Loading Social Hub…</div>;
  if (error)   return <div style={{ padding: '40px 32px', color: '#EF4444', fontSize: 13 }}>{error}</div>;

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px) clamp(16px, 4vw, 36px)', color: '#1F2937', minHeight: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 9, ...MONO, letterSpacing: '0.14em', color: A, textTransform: 'uppercase', marginBottom: 6 }}>
            AtonixDev Social Hub
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111827' }}>Hub Overview</h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '6px 0 0' }}>
            Unified social media management · {accounts.length} connected account{accounts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          to="/social-hub/posts/new"
          style={{
            padding: '9px 22px', background: A, border: 'none', color: '#06080D',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            textDecoration: 'none', fontFamily: 'inherit',
          }}
        >
          + Create Post
        </Link>
      </div>

      {/* KPI cards */}
      <div className="console-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard label="Posts This Month"   value={thisMonth} sub="across all platforms" />
        <StatCard label="Total Posts"        value={posts.length} sub={`${posts.filter(p => p.status === 'published').length} published`} />
        <StatCard label="Total Impressions"  value={analytics?.totals?.total_impressions?.toLocaleString() ?? '—'} sub="Approximate" />
        <StatCard label="Total Engagements"  value={
          analytics
            ? ((analytics.totals.total_likes || 0) + (analytics.totals.total_comments || 0) + (analytics.totals.total_shares || 0)).toLocaleString()
            : '—'
        } sub="likes + comments + shares" />
      </div>

      {/* Main two-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: 20 }}>

        {/* Recent posts */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, ...MONO, letterSpacing: '0.1em', textTransform: 'uppercase', color: A, marginBottom: 14 }}>
            Recent Posts
          </div>
          {recentPosts.length === 0 ? (
            <div style={{ ...CARD, color: '#6B7280', fontSize: 13 }}>
              No posts yet.{' '}
              <Link to="/social-hub/posts/new" style={{ color: A, textDecoration: 'none', fontWeight: 600 }}>
                Create your first post →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentPosts.map(post => (
                <div key={post.id} style={{ ...CARD, padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {post.title || post.body.slice(0, 60) + (post.body.length > 60 ? '…' : '')}
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{
                          fontSize: 9, fontWeight: 700, ...MONO, letterSpacing: '0.08em', textTransform: 'uppercase',
                          padding: '2px 7px',
                          color: STATUS_COLOR[post.status] || '#6B7280',
                          background: `${STATUS_COLOR[post.status] || '#6B7280'}18`,
                        }}>
                          {post.status}
                        </span>
                        {post.targets?.slice(0, 4).map(t => (
                          <span key={t.id} style={{ fontSize: 9, ...MONO, color: '#6B7280', padding: '2px 6px', background: '#F3F4F6' }}>
                            {PLATFORM_LABELS[t.platform] || t.platform}
                          </span>
                        ))}
                        {post.targets?.length > 4 && (
                          <span style={{ fontSize: 10, color: '#9CA3AF' }}>+{post.targets.length - 4}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: '#9CA3AF', ...MONO, whiteSpace: 'nowrap' }}>
                      {post.scheduled_at
                        ? new Date(post.scheduled_at).toLocaleDateString()
                        : post.published_at
                          ? new Date(post.published_at).toLocaleDateString()
                          : new Date(post.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <Link to={`/social-hub/posts`} style={{ fontSize: 10, color: A, ...MONO, textDecoration: 'none', fontWeight: 700 }}>View</Link>
                    <Link to={`/social-hub/posts`} style={{ fontSize: 10, color: '#6B7280', ...MONO, textDecoration: 'none' }}>Edit</Link>
                  </div>
                </div>
              ))}
              {posts.length > 8 && (
                <Link to="/social-hub/posts" style={{ fontSize: 11, color: A, textDecoration: 'none', fontWeight: 600, padding: '8px 0', textAlign: 'center', ...MONO }}>
                  View all {posts.length} posts →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Connected accounts panel */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, ...MONO, letterSpacing: '0.1em', textTransform: 'uppercase', color: A, marginBottom: 14 }}>
            Connected Accounts
          </div>
          {accounts.length === 0 ? (
            <div style={{ ...CARD, color: '#6B7280', fontSize: 13 }}>
              No accounts connected yet.{' '}
              <Link to="/social-hub/accounts" style={{ color: A, textDecoration: 'none', fontWeight: 600 }}>
                Connect accounts →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {accounts.map(acc => (
                <div key={acc.id} style={{ ...CARD, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: acc.avatar_url ? 'transparent' : '#F3F4F6',
                    border: BD, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    {acc.avatar_url
                      ? <img src={acc.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', ...MONO }}>
                          {(PLATFORM_LABELS[acc.platform] || acc.platform).slice(0, 2).toUpperCase()}
                        </span>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {acc.account_name}
                    </div>
                    <div style={{ fontSize: 10, color: '#6B7280', ...MONO }}>
                      {PLATFORM_LABELS[acc.platform] || acc.platform}
                      {acc.account_handle ? ` · @${acc.account_handle}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{
                      fontSize: 9, fontWeight: 700, ...MONO, letterSpacing: '0.08em', textTransform: 'uppercase',
                      padding: '2px 7px',
                      color: ACCOUNT_STATUS_COLOR[acc.status] || '#6B7280',
                      background: `${ACCOUNT_STATUS_COLOR[acc.status] || '#6B7280'}18`,
                    }}>
                      {acc.status}
                    </span>
                    {!acc.token_healthy && (
                      <span style={{ fontSize: 9, color: '#EF4444', ...MONO }}>Re-auth needed</span>
                    )}
                  </div>
                </div>
              ))}
              <Link to="/social-hub/accounts" style={{ fontSize: 11, color: A, textDecoration: 'none', fontWeight: 600, padding: '8px 0', textAlign: 'center', ...MONO }}>
                Manage accounts →
              </Link>
            </div>
          )}

          {/* Platform breakdown */}
          {analytics?.by_platform?.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, ...MONO, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#374151', marginBottom: 12 }}>
                Performance by Platform
              </div>
              {analytics.by_platform.map(row => (
                <div key={row.platform} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 10, ...MONO, color: '#374151', minWidth: 80 }}>
                    {PLATFORM_LABELS[row.platform] || row.platform}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#111827', minWidth: 60 }}>
                    {(row.impressions || 0).toLocaleString()}
                  </span>
                  <span style={{ fontSize: 10, color: '#9CA3AF' }}>impressions</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
