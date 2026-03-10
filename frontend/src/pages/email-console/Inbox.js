import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../services/api';

const A = '#D4AF37';
const BD = '1px solid #E5E7EB';
const PAGE_SIZE = 20;

const STATUS_TABS = [
  { value: 'unread',   label: 'Unread' },
  { value: '',         label: 'All' },
  { value: 'archived', label: 'Archived' },
  { value: 'spam',     label: 'Spam' },
];

const STATUS_BADGE = {
  unread:   { bg: '#EFF6FF', color: '#1D4ED8', label: 'Unread'    },
  read:     { bg: '#F3F4F6', color: '#6B7280', label: 'Read'      },
  archived: { bg: '#F3F4F6', color: '#9CA3AF', label: 'Archived'  },
  spam:     { bg: '#FEF2F2', color: '#DC2626', label: 'Spam'      },
};

function relTime(ts) {
  if (!ts) return '—';
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(ts).toLocaleDateString();
}

function fmtFull(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString();
}

function Avatar({ name, email }) {
  const initials = (name || email || '?').slice(0, 2).toUpperCase();
  const hue = [...(email || '')].reduce((n, c) => n + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: 38, height: 38, borderRadius: '50%', flexShrink: 0, display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700,
      background: `hsl(${hue},55%,42%)`, color: '#fff', fontFamily: 'var(--font-mono,monospace)',
    }}>
      {initials}
    </div>
  );
}

export default function EmailInbox() {
  const [emails, setEmails]         = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [page, setPage]             = useState(1);
  const [total, setTotal]           = useState(0);
  const [statusFilter, setStatus]   = useState('unread');
  const [q, setQ]                   = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [selected, setSelected]     = useState(null);
  const [detailLoading, setDL]      = useState(false);
  const debounceRef                 = useRef(null);
  const iframeRef                   = useRef(null);

  // Debounce search query
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQ(q), 350);
    return () => clearTimeout(debounceRef.current);
  }, [q]);

  const fetchList = useCallback(async (p = 1, status = 'unread', search = '') => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ page: p, page_size: PAGE_SIZE });
      if (status) params.set('status', status);
      if (search) params.set('q', search);
      const res = await api.get(`/admin/inbound/?${params}`);
      const data = res.data;
      setEmails(data.results || data);
      setTotal(data.count || (Array.isArray(data) ? data.length : 0));
    } catch (err) { setError(err.response?.data?.detail || err.message); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchList(1, statusFilter, debouncedQ); setPage(1); }, [statusFilter, debouncedQ, fetchList]);

  const openEmail = async (item) => {
    if (selected?.id === item.id) return;
    setDL(true); setSelected(item);
    try {
      const res = await api.get(`/admin/inbound/${item.id}/`);
      const data = res.data;
      setSelected(data);
      // Refresh list so unread badge updates
      setEmails(prev => prev.map(e => e.id === data.id ? { ...e, status: data.status } : e));
    } catch (_) {}
    setDL(false);
  };

  const patchStatus = async (id, newStatus) => {
    try {
      const res = await api.patch(`/admin/inbound/${id}/`, { status: newStatus });
      const data = res.data;
      setEmails(prev => prev.map(e => e.id === id ? { ...e, status: data.status } : e));
      if (selected?.id === id) setSelected(data);
    } catch (_) {}
  };

  const deleteEmail = async (id) => {
    if (!window.confirm('Delete this email permanently?')) return;
    try {
      await api.delete(`/admin/inbound/${id}/`);
      setEmails(prev => prev.filter(e => e.id !== id));
      if (selected?.id === id) setSelected(null);
      setTotal(t => t - 1);
    } catch (_) {}
  };

  const handlePage = (dir) => {
    const next = page + dir;
    const max = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (next < 1 || next > max) return;
    setPage(next); fetchList(next, statusFilter, debouncedQ);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const unreadCount = emails.filter(e => e.status === 'unread').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', color: '#1F2937' }}>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={{ padding: '28px 36px 0', borderBottom: BD, background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ fontFamily: 'var(--font-mono,monospace)', fontSize: 10, fontWeight: 700, letterSpacing: 2, color: A, background: '#FAF7EF', border: `1px solid ${A}`, padding: '2px 7px', borderRadius: 3 }}>INB</div>
          <h1 style={{ margin: 0, fontWeight: 700, fontSize: 20 }}>Inbox</h1>
          {unreadCount > 0 && (
            <span style={{ background: '#1D4ED8', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 12 }}>{unreadCount} unread</span>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search from, subject…"
              style={{ padding: '7px 12px', border: BD, borderRadius: 6, fontSize: 13, width: 220, outline: 'none' }}
            />
            <button onClick={() => fetchList(page, statusFilter, debouncedQ)}
              style={{ padding: '7px 14px', background: A, border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
              Refresh
            </button>
          </div>
        </div>

        {/* Status tabs */}
        <div style={{ display: 'flex', gap: 0 }}>
          {STATUS_TABS.map(t => (
            <button key={t.value} onClick={() => setStatus(t.value)}
              style={{
                padding: '9px 20px', border: 'none', background: 'transparent', cursor: 'pointer',
                fontWeight: statusFilter === t.value ? 700 : 400, fontSize: 13,
                color: statusFilter === t.value ? A : '#6B7280',
                borderBottom: statusFilter === t.value ? `2px solid ${A}` : '2px solid transparent',
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── BODY: TWO PANELS ──────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* LEFT: email list */}
        <div style={{ width: 360, flexShrink: 0, borderRight: BD, display: 'flex', flexDirection: 'column', background: '#fff', overflow: 'hidden' }}>

          {error && (
            <div style={{ margin: 12, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, color: '#DC2626', fontSize: 13 }}>
              {error}
            </div>
          )}

          {loading && emails.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>Loading…</div>
          )}

          {!loading && emails.length === 0 && !error && (
            <div style={{ padding: 32, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>No emails found.</div>
          )}

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {emails.map(email => (
              <div key={email.id}
                onClick={() => openEmail(email)}
                style={{
                  padding: '14px 16px', borderBottom: BD, cursor: 'pointer', display: 'flex', gap: 12,
                  background: selected?.id === email.id ? '#FAF7EF' : email.status === 'unread' ? '#FAFBFF' : '#fff',
                  borderLeft: selected?.id === email.id ? `3px solid ${A}` : email.status === 'unread' ? '3px solid #1D4ED8' : '3px solid transparent',
                  transition: 'background 0.12s',
                }}>
                <Avatar name={email.from_name} email={email.from_email} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: email.status === 'unread' ? 700 : 500, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 170 }}>
                      {email.from_name || email.from_email}
                    </span>
                    <span style={{ fontSize: 11, color: '#9CA3AF', whiteSpace: 'nowrap', flexShrink: 0 }}>{relTime(email.received_at || email.created_at)}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: email.status === 'unread' ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#374151', marginTop: 2 }}>
                    {email.subject || '(no subject)'}
                  </div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                    {email.preview_text || email.text_body?.slice(0, 80) || ''}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 5, alignItems: 'center' }}>
                    {email.has_attachments && (
                      <span style={{ fontSize: 10, color: '#6B7280' }}>📎</span>
                    )}
                    {STATUS_BADGE[email.status] && (
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 10, background: STATUS_BADGE[email.status].bg, color: STATUS_BADGE[email.status].color }}>
                        {STATUS_BADGE[email.status].label}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding: '10px 16px', borderTop: BD, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#6B7280' }}>
              <span>{total} total</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => handlePage(-1)} disabled={page <= 1}
                  style={{ padding: '4px 10px', border: BD, borderRadius: 4, background: 'transparent', cursor: page > 1 ? 'pointer' : 'not-allowed', opacity: page <= 1 ? 0.4 : 1 }}>‹</button>
                <span>{page} / {totalPages}</span>
                <button onClick={() => handlePage(1)} disabled={page >= totalPages}
                  style={{ padding: '4px 10px', border: BD, borderRadius: 4, background: 'transparent', cursor: page < totalPages ? 'pointer' : 'not-allowed', opacity: page >= totalPages ? 0.4 : 1 }}>›</button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: detail panel */}
        {selected ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>

            {detailLoading && (
              <div style={{ padding: 32, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>Loading…</div>
            )}

            {!detailLoading && (
              <>
                {/* Detail header */}
                <div style={{ padding: '20px 28px', borderBottom: BD, background: '#FAFAFA' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <h2 style={{ margin: 0, fontWeight: 700, fontSize: 18, lineHeight: 1.3 }}>
                      {selected.subject || '(no subject)'}
                    </h2>
                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      {selected.status === 'unread' ? (
                        <button onClick={() => patchStatus(selected.id, 'read')}
                          style={btnStyle('#3B82F6', '#fff')}>Mark Read</button>
                      ) : (
                        <button onClick={() => patchStatus(selected.id, 'unread')}
                          style={btnStyle('#E5E7EB', '#374151')}>Mark Unread</button>
                      )}
                      {selected.status !== 'archived' ? (
                        <button onClick={() => patchStatus(selected.id, 'archived')}
                          style={btnStyle('#E5E7EB', '#374151')}>Archive</button>
                      ) : (
                        <button onClick={() => patchStatus(selected.id, 'read')}
                          style={btnStyle('#E5E7EB', '#374151')}>Unarchive</button>
                      )}
                      {selected.status !== 'spam' ? (
                        <button onClick={() => patchStatus(selected.id, 'spam')}
                          style={btnStyle('#FEE2E2', '#DC2626')}>Spam</button>
                      ) : null}
                      <button onClick={() => deleteEmail(selected.id)}
                        style={btnStyle('#FEE2E2', '#DC2626')}>Delete</button>
                    </div>
                  </div>

                  {/* Metadata row */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 20px', marginTop: 12, fontSize: 13 }}>
                    <span><span style={{ color: '#9CA3AF' }}>From: </span>
                      <strong>{selected.from_name ? `${selected.from_name} ` : ''}</strong>
                      <span style={{ color: '#6B7280' }}>&lt;{selected.from_email}&gt;</span>
                    </span>
                    {selected.to_email && (
                      <span><span style={{ color: '#9CA3AF' }}>To: </span><span style={{ color: '#6B7280' }}>{selected.to_email}</span></span>
                    )}
                    {selected.cc && (
                      <span><span style={{ color: '#9CA3AF' }}>CC: </span><span style={{ color: '#6B7280' }}>{selected.cc}</span></span>
                    )}
                    <span><span style={{ color: '#9CA3AF' }}>Received: </span><span style={{ color: '#6B7280' }}>{fmtFull(selected.received_at || selected.created_at)}</span></span>
                    {selected.spam_score != null && (
                      <span><span style={{ color: '#9CA3AF' }}>Spam score: </span>
                        <span style={{ color: selected.spam_score > 5 ? '#DC2626' : '#22C55E', fontWeight: 600 }}>{selected.spam_score.toFixed(1)}</span>
                      </span>
                    )}
                    {selected.has_attachments && (
                      <span style={{ color: '#6B7280' }}>📎 Has attachments</span>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  {selected.html_body ? (
                    <iframe
                      ref={iframeRef}
                      title="Email body"
                      srcDoc={selected.html_body}
                      sandbox="allow-same-origin"
                      style={{ flex: 1, border: 'none', width: '100%' }}
                    />
                  ) : (
                    <pre style={{ flex: 1, margin: 0, padding: '24px 28px', overflowY: 'auto', fontFamily: 'var(--font-mono,monospace)', fontSize: 13, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#374151' }}>
                      {selected.text_body || '(empty body)'}
                    </pre>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          /* Empty state */
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 14 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✉️</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Select an email to read</div>
              <div style={{ fontSize: 13 }}>Choose a message from the list on the left.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function btnStyle(bg, color) {
  return {
    padding: '6px 12px', background: bg, color, border: 'none',
    borderRadius: 5, cursor: 'pointer', fontWeight: 600, fontSize: 12,
  };
}
