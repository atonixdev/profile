import React, { useEffect, useState, useCallback } from 'react';

const A    = '#D4AF37';
const BD   = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px' };
const MONO = { fontFamily: 'var(--font-mono)' };

const PLATFORM_LABELS = {
  linkedin: 'LinkedIn', facebook: 'Facebook', instagram: 'Instagram',
  twitter: 'X (Twitter)', tiktok: 'TikTok', youtube: 'YouTube',
};

const PERIODS = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
  { label: 'All time', days: 0 },
];

function StatCard({ label, value, sub }) {
  return (
    <div style={{ ...CARD }}>
      <div style={{ fontSize: 10, ...MONO, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B7280', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#6B7280' }}>{sub}</div>}
    </div>
  );
}

function Bar({ value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ flex: 1, height: 6, background: '#F3F4F6', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color || A, transition: 'width 0.3s' }} />
    </div>
  );
}

export default function SocialHubAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [posts, setPosts]         = useState([]);
  const [period, setPeriod]       = useState(30);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const loadData = useCallback(async (days) => {
    setLoading(true);
    setError('');
    try {
      const qs = days > 0 ? `?days=${days}` : '';
      const [anlRes, postsRes] = await Promise.all([
        fetch(`/api/social/analytics/overview${qs}`, { credentials: 'include' }),
        fetch('/api/social/posts/?status=published', { credentials: 'include' }),
      ]);
      if (!anlRes.ok) throw new Error('Failed to load analytics');
      setAnalytics(await anlRes.json());
      if (postsRes.ok) {
        const data = await postsRes.json();
        setPosts(Array.isArray(data) ? data : (data.results || []));
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(period); }, [period, loadData]);

  const totals = analytics?.totals || {};
  const byPlatform = analytics?.by_platform || [];

  const maxImpressions = Math.max(...byPlatform.map(r => r.impressions || 0), 1);
  const maxEngagement  = Math.max(...byPlatform.map(r => (r.likes || 0) + (r.comments || 0) + (r.shares || 0)), 1);

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px) clamp(16px, 4vw, 36px)', color: '#1F2937', minHeight: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 9, ...MONO, letterSpacing: '0.14em', color: A, textTransform: 'uppercase', marginBottom: 6 }}>
            Social Hub / Analytics
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111827' }}>Analytics</h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '6px 0 0' }}>
            Performance metrics across all platforms.
          </p>
        </div>
        {/* Period picker */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {PERIODS.map(p => (
            <button
              key={p.days}
              onClick={() => setPeriod(p.days)}
              style={{
                padding: '7px 14px', border: BD,
                background: period === p.days ? '#111827' : '#FFFFFF',
                color: period === p.days ? '#FFFFFF' : '#374151',
                fontSize: 10, fontWeight: 700, cursor: 'pointer', ...MONO,
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#991B1B' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ color: '#6B7280', ...MONO, fontSize: 12 }}>Loading analytics…</div>
      ) : (
        <>
          {/* KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: 14, marginBottom: 28 }}>
            <StatCard label="Impressions"   value={(totals.total_impressions || 0).toLocaleString()} />
            <StatCard label="Reach"         value={(totals.total_reach || 0).toLocaleString()} />
            <StatCard label="Clicks"        value={(totals.total_clicks || 0).toLocaleString()} />
            <StatCard label="Likes"         value={(totals.total_likes || 0).toLocaleString()} />
            <StatCard label="Comments"      value={(totals.total_comments || 0).toLocaleString()} />
            <StatCard label="Shares"        value={(totals.total_shares || 0).toLocaleString()} />
            <StatCard label="Video Views"   value={(totals.total_video_views || 0).toLocaleString()} />
            <StatCard label="Saves"         value={(totals.total_saves || 0).toLocaleString()} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 24, marginBottom: 28 }}>

            {/* Platform breakdown */}
            <div style={{ ...CARD }}>
              <div style={{ fontSize: 11, fontWeight: 700, ...MONO, letterSpacing: '0.1em', textTransform: 'uppercase', color: A, marginBottom: 18 }}>
                By Platform — Impressions
              </div>
              {byPlatform.length === 0 ? (
                <div style={{ color: '#9CA3AF', fontSize: 12 }}>No platform data available yet.</div>
              ) : byPlatform.map(row => (
                <div key={row.platform} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>
                      {PLATFORM_LABELS[row.platform] || row.platform}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#111827', ...MONO }}>
                      {(row.impressions || 0).toLocaleString()}
                    </span>
                  </div>
                  <Bar value={row.impressions || 0} max={maxImpressions} />
                </div>
              ))}
            </div>

            {/* Platform breakdown — Engagement */}
            <div style={{ ...CARD }}>
              <div style={{ fontSize: 11, fontWeight: 700, ...MONO, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#374151', marginBottom: 18 }}>
                By Platform — Engagement
              </div>
              {byPlatform.length === 0 ? (
                <div style={{ color: '#9CA3AF', fontSize: 12 }}>No engagement data available yet.</div>
              ) : byPlatform.map(row => {
                const eng = (row.likes || 0) + (row.comments || 0) + (row.shares || 0);
                return (
                  <div key={row.platform} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>
                        {PLATFORM_LABELS[row.platform] || row.platform}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#111827', ...MONO }}>
                        {eng.toLocaleString()}
                      </span>
                    </div>
                    <Bar value={eng} max={maxEngagement} color="#3B82F6" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Per-post table */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, ...MONO, letterSpacing: '0.1em', textTransform: 'uppercase', color: A, marginBottom: 14 }}>
              Top Published Posts
            </div>
            {posts.length === 0 ? (
              <div style={{ ...CARD, color: '#9CA3AF', fontSize: 13 }}>No published posts yet.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#FFFFFF', border: BD, fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: BD, background: '#F9FAFB' }}>
                      {['Post', 'Platforms', 'Published', 'Analytics'].map(h => (
                        <th key={h} style={{
                          padding: '10px 14px', textAlign: 'left', fontSize: 9, fontWeight: 700,
                          letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B7280', ...MONO,
                          whiteSpace: 'nowrap',
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {posts.slice(0, 25).map((post, idx) => (
                      <tr key={post.id} style={{ borderBottom: BD, background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                        <td style={{ padding: '12px 14px', maxWidth: 240 }}>
                          <div style={{ fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {post.title || post.body?.slice(0, 50) || 'Untitled'}
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                            {post.targets?.map(t => (
                              <span key={t.id} style={{ fontSize: 8, ...MONO, padding: '2px 5px', background: '#F3F4F6', color: '#374151' }}>
                                {(PLATFORM_LABELS[t.platform] || t.platform).slice(0, 3).toUpperCase()}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: 11, color: '#6B7280', ...MONO, whiteSpace: 'nowrap' }}>
                          {post.published_at ? new Date(post.published_at).toLocaleDateString() : '—'}
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: 10, color: '#9CA3AF', ...MONO }}>
                          {post.targets?.some(t => t.analytics_count > 0)
                            ? <span style={{ color: '#22C55E', fontWeight: 700 }}>Available</span>
                            : <span>Pending</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Empty state note */}
          {Object.values(totals).every(v => !v) && (
            <div style={{ marginTop: 20, padding: '16px 20px', background: '#FFFBEB', border: '1px solid #FDE68A', fontSize: 12, color: '#92400E' }}>
              <strong>No analytics data yet.</strong> Analytics are populated after posts are published and data is synced from each platform.
            </div>
          )}
        </>
      )}
    </div>
  );
}
