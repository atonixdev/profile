import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

const A    = '#D4AF37';
const BD   = '1px solid #E5E7EB';
const MONO = { fontFamily: 'var(--font-mono)' };

const PLATFORM_LABELS = {
  linkedin: 'LinkedIn', facebook: 'Facebook', instagram: 'Instagram',
  twitter: 'X (Twitter)', tiktok: 'TikTok', youtube: 'YouTube',
};

const STATUS_COLOR = {
  draft: '#6B7280', scheduled: '#3B82F6', publishing: '#F59E0B',
  published: '#22C55E', failed: '#EF4444', partial_published: '#F59E0B',
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function getDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function postDateStr(post) {
  const raw = post.scheduled_at || post.published_at || post.created_at;
  return raw ? raw.slice(0, 10) : null;
}

export default function SocialHubCalendar() {
  const today = new Date();
  const [year, setYear]       = useState(today.getFullYear());
  const [month, setMonth]     = useState(today.getMonth());
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);  // { day, posts }
  const [error, setError]     = useState('');

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/social/posts/', { credentials: 'include' });
      if (!r.ok) throw new Error('Failed to load posts');
      const data = await r.json();
      setPosts(Array.isArray(data) ? data : (data.results || []));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelected(null);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelected(null);
  }

  const cells      = buildCalendarGrid(year, month);
  const todayStr   = getDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  // Map dateStr → posts
  const postsByDate = {};
  posts.forEach(p => {
    const d = postDateStr(p);
    if (d) {
      if (!postsByDate[d]) postsByDate[d] = [];
      postsByDate[d].push(p);
    }
  });

  const selectedPosts = selected
    ? (postsByDate[getDateStr(year, month, selected)] || [])
    : [];

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px) clamp(16px, 4vw, 36px)', color: '#1F2937', minHeight: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 9, ...MONO, letterSpacing: '0.14em', color: A, textTransform: 'uppercase', marginBottom: 6 }}>
            Social Hub / Calendar
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111827' }}>Content Calendar</h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '6px 0 0' }}>Scheduled and published posts across all platforms.</p>
        </div>
        <Link
          to="/social-hub/posts/new"
          style={{
            padding: '9px 22px', background: A, border: 'none', color: '#06080D',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            textDecoration: 'none', fontFamily: 'inherit',
          }}
        >
          + Schedule Post
        </Link>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#991B1B' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selected ? 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))' : '1fr', gap: 24 }}>

        {/* Calendar */}
        <div style={{ background: '#FFFFFF', border: BD }}>

          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: BD }}>
            <button
              onClick={prevMonth}
              style={{ background: 'none', border: BD, padding: '6px 12px', cursor: 'pointer', fontSize: 12, color: '#374151' }}
            >
              ‹ Prev
            </button>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', ...MONO }}>
              {MONTHS[month]} {year}
            </div>
            <button
              onClick={nextMonth}
              style={{ background: 'none', border: BD, padding: '6px 12px', cursor: 'pointer', fontSize: 12, color: '#374151' }}
            >
              Next ›
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: BD }}>
            {DAYS.map(d => (
              <div key={d} style={{ padding: '8px 4px', textAlign: 'center', fontSize: 9, fontWeight: 700, ...MONO, color: '#6B7280', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280', ...MONO, fontSize: 12 }}>Loading…</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {cells.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} style={{ borderRight: BD, borderBottom: BD, minHeight: 72, background: '#FAFAFA' }} />;
                }
                const dateStr    = getDateStr(year, month, day);
                const dayPosts   = postsByDate[dateStr] || [];
                const isToday    = dateStr === todayStr;
                const isSelected = selected === day;

                return (
                  <div
                    key={day}
                    onClick={() => setSelected(isSelected ? null : day)}
                    style={{
                      borderRight: BD, borderBottom: BD, minHeight: 72, padding: '6px 8px',
                      cursor: 'pointer', background: isSelected ? `${A}14` : '#FFFFFF',
                      position: 'relative',
                      transition: 'background 0.1s',
                    }}
                  >
                    <div style={{
                      fontSize: 11, fontWeight: isToday ? 800 : 500,
                      color: isToday ? A : '#374151',
                      marginBottom: 4,
                      width: isToday ? 22 : 'auto', height: isToday ? 22 : 'auto',
                      borderRadius: isToday ? '50%' : 0,
                      background: isToday ? `${A}20` : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {day}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {dayPosts.slice(0, 3).map(p => (
                        <div
                          key={p.id}
                          title={p.title || p.body?.slice(0, 60)}
                          style={{
                            fontSize: 8, ...MONO, padding: '1px 4px',
                            background: `${STATUS_COLOR[p.status] || '#6B7280'}20`,
                            color: STATUS_COLOR[p.status] || '#6B7280',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}
                        >
                          {p.title || p.body?.slice(0, 20)}
                        </div>
                      ))}
                      {dayPosts.length > 3 && (
                        <div style={{ fontSize: 8, color: '#9CA3AF', ...MONO }}>+{dayPosts.length - 3} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Side panel — selected day */}
        {selected && (
          <div style={{ background: '#FFFFFF', border: BD, padding: '20px 22px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, ...MONO, letterSpacing: '0.1em', textTransform: 'uppercase', color: A, marginBottom: 16 }}>
              {MONTHS[month]} {selected}, {year}
            </div>

            {selectedPosts.length === 0 ? (
              <div style={{ fontSize: 13, color: '#6B7280' }}>
                No posts on this day.{' '}
                <Link to="/social-hub/posts/new" style={{ color: A, textDecoration: 'none', fontWeight: 600 }}>
                  Create one →
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {selectedPosts.map(post => (
                  <div key={post.id} style={{ borderBottom: BD, paddingBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                      <span style={{
                        fontSize: 9, fontWeight: 700, ...MONO, letterSpacing: '0.08em', textTransform: 'uppercase',
                        padding: '2px 7px', flexShrink: 0,
                        color: STATUS_COLOR[post.status] || '#6B7280',
                        background: `${STATUS_COLOR[post.status] || '#6B7280'}18`,
                      }}>
                        {post.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4 }}>
                      {post.title || <em style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Untitled</em>}
                    </div>
                    <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5, marginBottom: 8 }}>
                      {post.body?.slice(0, 120)}{post.body?.length > 120 ? '…' : ''}
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                      {post.targets?.map(t => (
                        <span key={t.id} style={{ fontSize: 9, ...MONO, padding: '2px 6px', background: '#F3F4F6', color: '#374151' }}>
                          {PLATFORM_LABELS[t.platform] || t.platform}
                        </span>
                      ))}
                    </div>
                    {(post.scheduled_at || post.published_at) && (
                      <div style={{ fontSize: 10, color: '#9CA3AF', ...MONO }}>
                        {post.scheduled_at
                          ? `Scheduled: ${new Date(post.scheduled_at).toLocaleTimeString()}`
                          : `Published: ${new Date(post.published_at).toLocaleTimeString()}`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ marginTop: 20, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {Object.entries(STATUS_COLOR).map(([status, color]) => (
          <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, background: color, borderRadius: 2 }} />
            <span style={{ fontSize: 9, ...MONO, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
