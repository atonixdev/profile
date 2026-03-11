import React, { useState, useEffect, useCallback } from 'react';

const A    = '#A81D37';
const BD   = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px', borderRadius: 4 };
const MONO = { fontFamily: 'var(--font-mono)' };

const fmt$ = v => '$' + (parseFloat(v) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const DOC_TYPE_LABELS = { pitch_deck: 'Pitch Deck', compliance: 'Compliance', financial_report: 'Financial Report', legal: 'Legal', update: 'Investor Update', other: 'Other' };
const ROLE_COLORS = { investor: '#2563EB', advisor: '#7C3AED', board_member: '#D97706', partner: '#16A34A' };
const INPUT = { width: '100%', padding: '8px 12px', border: BD, borderRadius: 4, fontSize: 13, boxSizing: 'border-box' };
const TEXTAREA = { ...INPUT, minHeight: 100, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 };
const BTN = (bg, fg) => ({ padding: '8px 18px', border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 700, background: bg, color: fg, cursor: 'pointer', ...MONO });
const OVERLAY = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 };
const MODAL = { background: '#FFFFFF', borderRadius: 6, padding: '28px 32px', width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto' };

const api = (url, opts = {}) => fetch(url, {
  credentials: 'include',
  headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...opts.headers },
  ...opts,
}).then(r => { if (r.status === 204) return null; if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); });

const InvestorHub = () => {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [tab, setTab]           = useState('overview'); // overview | messages | updates
  const [messages, setMessages] = useState([]);
  const [msgChannel, setMsgChannel] = useState('investor');
  const [msgForm, setMsgForm]   = useState({ subject: '', body: '' });
  const [updateModal, setUpdateModal] = useState(false);
  const [updateForm, setUpdateForm]   = useState({ subject: '', body: '', recipients: '' });

  const fetchData = useCallback(() => {
    api('/api/portal/dashboard/investor/')
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const fetchMessages = useCallback(() => {
    api(`/api/portal/messages/?channel=${msgChannel}`)
      .then(d => setMessages(d || []))
      .catch(() => {});
  }, [msgChannel]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if (tab === 'messages') fetchMessages(); }, [tab, fetchMessages]);

  const sendMessage = () => {
    api('/api/portal/messages/', { method: 'POST', body: JSON.stringify({ ...msgForm, channel: msgChannel }) })
      .then(() => { setMsgForm({ subject: '', body: '' }); fetchMessages(); });
  };

  const sendUpdate = () => {
    const recipients = updateForm.recipients.split(',').map(e => e.trim()).filter(Boolean);
    api('/api/portal/investor-updates/', { method: 'POST', body: JSON.stringify({ ...updateForm, recipients }) })
      .then(() => { setUpdateModal(false); setUpdateForm({ subject: '', body: '', recipients: '' }); fetchData(); });
  };

  const sendUpdateEmail = id => {
    api(`/api/portal/investor-updates/${id}/send/`, { method: 'POST' })
      .then(() => fetchData());
  };

  if (loading) return <div style={{ padding: '40px 32px', color: '#6B7280', ...MONO, fontSize: 12 }}>Loading…</div>;
  if (error) return <div style={{ padding: '40px 32px', color: '#DC2626', ...MONO, fontSize: 12 }}>Error: {error}</div>;
  if (!data) return null;

  const ss = data.stakeholder_summary || {};
  const ds = data.document_summary || {};
  const stakeholders = data.stakeholders || [];
  const documents = data.documents || [];
  const investorUpdates = data.investor_updates || [];
  const unreadMsgs = data.messaging?.unread_count || 0;

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 28px) clamp(16px, 4vw, 32px)', maxWidth: 1440 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: A, ...MONO }}>INV</span>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Investor & Stakeholder Hub</h1>
          </div>
          <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Secure document repository and stakeholder management with encrypted communications</p>
        </div>
        <button onClick={() => setUpdateModal(true)} style={BTN(A, '#FFF')}>+ Investor Update</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: BD }}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'messages', label: `Messages${unreadMsgs > 0 ? ` (${unreadMsgs})` : ''}` },
          { key: 'updates', label: 'Updates' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '10px 20px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
            border: 'none', borderBottom: tab === t.key ? `2px solid ${A}` : '2px solid transparent',
            background: 'none', color: tab === t.key ? A : '#6B7280', cursor: 'pointer', ...MONO,
          }}>{t.label}</button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === 'overview' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14, marginBottom: 28 }}>
            <div style={{ ...CARD, borderTop: '3px solid #2563EB' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Stakeholders</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{ss.total || 0}</div>
            </div>
            <div style={{ ...CARD, borderTop: '3px solid #16A34A' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Total Investment</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{fmt$(ss.total_investment)}</div>
            </div>
            <div style={{ ...CARD, borderTop: '3px solid #D97706' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Documents</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{ds.total || 0}</div>
            </div>
            <div style={{ ...CARD, borderTop: `3px solid ${A}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Unread Messages</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: unreadMsgs > 0 ? A : '#111827' }}>{unreadMsgs}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 20 }}>
            <div style={CARD}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>Stakeholder Registry</div>
              {stakeholders.length === 0 ? (
                <div style={{ fontSize: 12, color: '#9CA3AF', padding: '16px 0', textAlign: 'center' }}>No stakeholders registered yet</div>
              ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                  {stakeholders.map(s => (
                    <div key={s.id} style={{ padding: '12px', border: BD, borderRadius: 4, background: '#F9FAFB' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{s.name}</span>
                        <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '2px 6px', borderRadius: 2, background: `${ROLE_COLORS[s.role] || '#6B7280'}18`, color: ROLE_COLORS[s.role] || '#6B7280', ...MONO }}>{s.role?.replace('_', ' ')}</span>
                      </div>
                      {s.company && <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 4 }}>{s.company}</div>}
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#16A34A' }}>{fmt$(s.investment)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={CARD}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>Document Repository</div>
              {documents.length === 0 ? (
                <div style={{ fontSize: 12, color: '#9CA3AF', padding: '16px 0', textAlign: 'center' }}>No documents uploaded yet</div>
              ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                  {documents.map(d => (
                    <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', border: BD, borderRadius: 4, background: '#F9FAFB' }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{d.title}</div>
                        <div style={{ fontSize: 10, color: '#6B7280' }}>v{d.version} · {DOC_TYPE_LABELS[d.doc_type] || d.doc_type}</div>
                      </div>
                      {d.confidential && (
                        <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.10em', color: '#DC2626', ...MONO, padding: '2px 5px', background: '#FEF2F2', borderRadius: 2, border: '1px solid #FECACA' }}>CONFIDENTIAL</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* MESSAGES TAB */}
      {tab === 'messages' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={CARD}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO }}>Secure Messages</div>
              <select value={msgChannel} onChange={e => setMsgChannel(e.target.value)} style={{ ...INPUT, width: 'auto' }}>
                <option value="investor">Investor</option>
                <option value="board">Board</option>
                <option value="executive">Executive</option>
                <option value="general">General</option>
              </select>
            </div>
            {messages.length === 0 ? (
              <div style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', padding: '20px 0' }}>No messages in this channel</div>
            ) : (
              <div style={{ display: 'grid', gap: 8, maxHeight: 400, overflow: 'auto' }}>
                {messages.map(m => (
                  <div key={m.id} style={{ padding: '10px 12px', border: BD, borderRadius: 4, background: m.is_read ? '#F9FAFB' : '#FEF2F2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{m.subject}</span>
                      {!m.is_read && <span style={{ fontSize: 7, fontWeight: 700, color: A, ...MONO }}>NEW</span>}
                    </div>
                    <p style={{ fontSize: 11, color: '#6B7280', margin: '0 0 6px', lineHeight: 1.5 }}>{(m.body || '').slice(0, 150)}</p>
                    <div style={{ fontSize: 9, color: '#9CA3AF', ...MONO }}>{m.sender_name} · {m.created_at ? new Date(m.created_at).toLocaleString() : ''}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={CARD}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>Compose Message</div>
            <div style={{ display: 'grid', gap: 12 }}>
              <input style={INPUT} placeholder="Subject" value={msgForm.subject} onChange={e => setMsgForm({ ...msgForm, subject: e.target.value })} />
              <textarea style={TEXTAREA} placeholder="Message body…" value={msgForm.body} onChange={e => setMsgForm({ ...msgForm, body: e.target.value })} />
              <button onClick={sendMessage} disabled={!msgForm.subject || !msgForm.body} style={BTN(A, '#FFF')}>Send Message</button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATES TAB */}
      {tab === 'updates' && (
        <div style={CARD}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>Investor Updates</div>
          {investorUpdates.length === 0 ? (
            <div style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', padding: '20px 0' }}>No investor updates created yet</div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {investorUpdates.map(u => (
                <div key={u.id} style={{ padding: '14px 16px', border: BD, borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{u.subject}</div>
                    <div style={{ fontSize: 10, color: '#6B7280', ...MONO }}>
                      {u.author_name} · {u.created_at ? new Date(u.created_at).toLocaleDateString() : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: 8, fontWeight: 700, letterSpacing: '0.06em', padding: '2px 8px', borderRadius: 2,
                      background: u.status === 'sent' ? '#DCFCE7' : u.status === 'draft' ? '#F3F4F6' : '#FEF9C3',
                      color: u.status === 'sent' ? '#16A34A' : u.status === 'draft' ? '#6B7280' : '#CA8A04', ...MONO,
                    }}>{u.status?.toUpperCase()}</span>
                    {u.status === 'draft' && (
                      <button onClick={() => sendUpdateEmail(u.id)} style={BTN('#2563EB', '#FFF')}>Send</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Investor Update Modal */}
      {updateModal && (
        <div style={OVERLAY} onClick={() => setUpdateModal(false)}>
          <div style={MODAL} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 20px' }}>Compose Investor Update</h2>
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Subject</label>
                <input style={INPUT} value={updateForm.subject} onChange={e => setUpdateForm({ ...updateForm, subject: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Body (Markdown)</label>
                <textarea style={{ ...TEXTAREA, minHeight: 160 }} value={updateForm.body} onChange={e => setUpdateForm({ ...updateForm, body: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Recipients (comma-separated emails)</label>
                <input style={INPUT} value={updateForm.recipients} onChange={e => setUpdateForm({ ...updateForm, recipients: e.target.value })} placeholder="investor@example.com, board@example.com" />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button onClick={() => setUpdateModal(false)} style={BTN('#F3F4F6', '#374151')}>Cancel</button>
              <button onClick={sendUpdate} style={BTN(A, '#FFF')}>Create Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorHub;
