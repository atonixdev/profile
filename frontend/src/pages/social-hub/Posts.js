import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

const A    = '#D4AF37';
const CR   = '#A81D37';
const BD   = '1px solid #E5E7EB';
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

const STATUS_FILTERS = ['all', 'draft', 'scheduled', 'published', 'failed'];

export default function SocialHubPosts() {
  const [posts, setPosts]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('all');
  const [deleting, setDeleting]     = useState('');
  const [publishing, setPublishing] = useState('');
  const [error, setError]           = useState('');
  const [notice, setNotice]         = useState('');

  const loadPosts = useCallback(async (statusFilter) => {
    setLoading(true);
    setError('');
    try {
      const qs = statusFilter && statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const r = await fetch(`/api/social/posts/${qs}`, { credentials: 'include' });
      if (!r.ok) throw new Error('Failed to load posts');
      const data = await r.json();
      setPosts(Array.isArray(data) ? data : (data.results || []));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPosts(filter); }, [filter, loadPosts]);

  async function handleDelete(postId, title) {
    if (!window.confirm(`Delete post "${title || 'Untitled'}"? This cannot be undone.`)) return;
    setDeleting(postId);
    try {
      const r = await fetch(`/api/social/posts/${postId}/`, { method: 'DELETE', credentials: 'include' });
      if (!r.ok) throw new Error('Delete failed');
      setPosts(prev => prev.filter(p => p.id !== postId));
      setNotice('Post deleted.');
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting('');
    }
  }

  async function handlePublishNow(postId, title) {
    if (!window.confirm(`Publish "${title || 'Untitled'}" immediately to all target platforms?`)) return;
    setPublishing(postId);
    setError('');
    try {
      const r = await fetch(`/api/social/posts/${postId}/publish`, { method: 'POST', credentials: 'include' });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Publish failed');
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: 'published' } : p));
      setNotice('Post submitted for publishing.');
    } catch (e) {
      setError(e.message);
    } finally {
      setPublishing('');
    }
  }

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px) clamp(16px, 4vw, 36px)', color: '#1F2937', minHeight: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 9, ...MONO, letterSpacing: '0.14em', color: A, textTransform: 'uppercase', marginBottom: 6 }}>
            Social Hub / Posts
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111827' }}>Posts</h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '6px 0 0' }}>Manage drafts, scheduled, and published content.</p>
        </div>
        <Link
          to="/social-hub/posts/new"
          style={{
            padding: '9px 22px', background: A, border: 'none', color: '#06080D',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            textDecoration: 'none', fontFamily: 'inherit',
          }}
        >
          + New Post
        </Link>
      </div>

      {notice && (
        <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#166534' }}>
          {notice}
          <button onClick={() => setNotice('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#166534' }}>×</button>
        </div>
      )}
      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#991B1B' }}>
          {error}
          <button onClick={() => setError('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#991B1B' }}>×</button>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '6px 14px', border: BD, background: filter === s ? '#111827' : '#FFFFFF',
              color: filter === s ? '#FFFFFF' : '#374151', fontSize: 10, fontWeight: 700,
              cursor: 'pointer', ...MONO, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ ...MONO, color: '#6B7280', fontSize: 12 }}>Loading posts…</div>
      ) : posts.length === 0 ? (
        <div style={{ ...CARD, color: '#6B7280', fontSize: 13 }}>
          No {filter !== 'all' ? filter + ' ' : ''}posts found.{' '}
          <Link to="/social-hub/posts/new" style={{ color: A, textDecoration: 'none', fontWeight: 600 }}>
            Create one →
          </Link>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#FFFFFF', border: BD, fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: BD, background: '#F9FAFB' }}>
                {['Title / Body', 'Status', 'Platforms', 'Scheduled / Published', 'Actions'].map(h => (
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
              {posts.map((post, idx) => (
                <tr key={post.id} style={{ borderBottom: BD, background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                  <td style={{ padding: '12px 14px', maxWidth: 280 }}>
                    <div style={{ fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {post.title || <em style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Untitled</em>}
                    </div>
                    <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {post.body?.slice(0, 80)}{post.body?.length > 80 ? '…' : ''}
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      fontSize: 9, fontWeight: 700, ...MONO, letterSpacing: '0.08em', textTransform: 'uppercase',
                      padding: '3px 8px',
                      color: STATUS_COLOR[post.status] || '#6B7280',
                      background: `${STATUS_COLOR[post.status] || '#6B7280'}18`,
                    }}>
                      {post.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {post.targets?.map(t => (
                        <span key={t.id} style={{ fontSize: 9, ...MONO, padding: '2px 6px', background: '#F3F4F6', color: '#374151' }}>
                          {PLATFORM_LABELS[t.platform]?.slice(0, 3).toUpperCase() || t.platform}
                        </span>
                      ))}
                      {(!post.targets || post.targets.length === 0) && <span style={{ fontSize: 10, color: '#9CA3AF' }}>—</span>}
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 11, color: '#374151', ...MONO, whiteSpace: 'nowrap' }}>
                    {post.scheduled_at
                      ? new Date(post.scheduled_at).toLocaleString()
                      : post.published_at
                        ? new Date(post.published_at).toLocaleString()
                        : <span style={{ color: '#9CA3AF' }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {(post.status === 'draft' || post.status === 'scheduled') && (
                        <button
                          onClick={() => handlePublishNow(post.id, post.title)}
                          disabled={publishing === post.id}
                          style={{ padding: '5px 10px', background: A, border: 'none', cursor: 'pointer', fontSize: 9, fontWeight: 700, color: '#06080D', ...MONO, letterSpacing: '0.06em', textTransform: 'uppercase' }}
                        >
                          {publishing === post.id ? '…' : 'Publish'}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        disabled={deleting === post.id}
                        style={{ padding: '5px 10px', background: 'none', border: `1px solid ${CR}`, cursor: 'pointer', fontSize: 9, fontWeight: 700, color: CR, ...MONO, letterSpacing: '0.06em', textTransform: 'uppercase' }}
                      >
                        {deleting === post.id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
