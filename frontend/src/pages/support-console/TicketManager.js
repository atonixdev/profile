import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

const A    = '#22C55E';   // support green accent
const BD   = '1px solid #E5E7EB';
const CARD = { background: '#F9FAFB', border: BD, padding: '20px 24px' };

const STATUS_COLOR = {
  open:          '#22C55E',
  pending:       '#F59E0B',
  awaiting_user: '#60A5FA',
  escalated:     '#EF4444',
  resolved:      '#A78BFA',
  closed:        '#4B5563',
};
const PRIORITY_COLOR = {
  low:      '#22C55E',
  medium:   '#F59E0B',
  high:     '#F97316',
  critical: '#EF4444',
};
const CATEGORY_LABEL = {
  billing:         'Billing',
  technical:       'Technical',
  account_access:  'Account Access',
  deployment:      'Deployment',
  general:         'General',
  compliance:      'Compliance',
  developer_tools: 'Dev Tools',
  api:             'API',
};

const FILTER_TABS = [
  { key: '',             label: 'All' },
  { key: 'open',         label: 'Open' },
  { key: 'pending',      label: 'Pending' },
  { key: 'awaiting_user',label: 'Awaiting User' },
  { key: 'escalated',    label: 'Escalated' },
  { key: 'resolved',     label: 'Resolved' },
  { key: 'closed',       label: 'Closed' },
];

const TH = { padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1F2937', borderBottom: BD, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' };
const TD = { padding: '11px 16px', fontSize: 12, color: '#1F2937', borderBottom: BD, verticalAlign: 'middle' };

function Badge({ value, colorMap }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: colorMap[value] || '#4B5563' }}>
      {value}
    </span>
  );
}

function TicketDetail({ ticket, onClose, onRefresh }) {
  const [reply, setReply]             = useState('');
  const [isInternal, setIsInternal]   = useState(false);
  const [sending, setSending]         = useState(false);
  const [statusVal, setStatusVal]     = useState(ticket.status);
  const [err, setErr]                 = useState('');

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    setErr('');
    try {
      await api.post(`/support/tickets/${ticket.id}/reply/`, { message: reply, is_internal: isInternal });
      setReply('');
      setIsInternal(false);
      onRefresh();
    } catch (e) {
      setErr(e.response?.data?.detail || 'Failed to send reply.');
    } finally {
      setSending(false);
    }
  };

  const changeStatus = async (val) => {
    try {
      await api.patch(`/support/tickets/${ticket.id}/status/`, { status: val });
      setStatusVal(val);
      onRefresh();
    } catch {
      setErr('Failed to update status.');
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
      <div style={{ width: '100%', maxWidth: 660, height: '100vh', background: '#FFFFFF', display: 'flex', flexDirection: 'column', overflowY: 'auto', boxShadow: '-4px 0 40px rgba(0,0,0,0.18)' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: BD, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#F9FAFB' }}>
          <div>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', color: A, textTransform: 'uppercase', marginBottom: 4 }}>
              {ticket.ticket_ref}
            </div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>{ticket.subject}</h3>
            <div style={{ marginTop: 6, fontSize: 12, color: '#4B5563' }}>
              {ticket.name} · {ticket.email} · {new Date(ticket.created_at).toLocaleDateString()}
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: 22, cursor: 'pointer', color: '#4B5563', lineHeight: 1, padding: '0 4px' }}>×</button>
        </div>

        <div style={{ padding: '24px', flex: 1 }}>
          {/* Meta chips */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            {[
              { label: 'Status', content: (
                <select value={statusVal} onChange={(e) => changeStatus(e.target.value)}
                  style={{ fontSize: 12, fontWeight: 700, color: STATUS_COLOR[statusVal], border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
                  {Object.keys(STATUS_COLOR).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                </select>
              )},
              { label: 'Priority', content: <span style={{ fontSize: 12, fontWeight: 700, color: PRIORITY_COLOR[ticket.priority] }}>{ticket.priority?.toUpperCase()}</span> },
              { label: 'Category', content: <span style={{ fontSize: 12, fontWeight: 700, color: '#1F2937' }}>{CATEGORY_LABEL[ticket.category] || ticket.category}</span> },
            ].map(({ label, content }) => (
              <div key={label} style={CARD}>
                <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4B5563', marginBottom: 4 }}>{label}</div>
                {content}
              </div>
            ))}
          </div>

          {/* Original message */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1F2937', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>Original Message</div>
            <div style={{ background: '#F9FAFB', border: BD, padding: '16px', fontSize: 13, color: '#1F2937', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{ticket.message}</div>
          </div>

          {/* Thread */}
          {ticket.replies?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1F2937', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
                Thread ({ticket.replies.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ticket.replies.map((r) => (
                  <div key={r.id} style={{
                    padding: '12px 16px',
                    background: r.is_internal ? '#FFFBEB' : (r.sender_type === 'support' ? '#F0FDF4' : '#F9FAFB'),
                    border: `1px solid ${r.is_internal ? '#FDE68A' : (r.sender_type === 'support' ? '#BBF7D0' : '#E5E7EB')}`,
                    borderLeft: `3px solid ${r.is_internal ? '#F59E0B' : (r.sender_type === 'support' ? '#22C55E' : '#4B5563')}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#1F2937' }}>
                        {r.sender_name || r.sender_username || 'User'}
                        {r.is_internal && <span style={{ marginLeft: 8, fontSize: 9, color: '#D97706', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>INTERNAL</span>}
                      </span>
                      <span style={{ fontSize: 11, color: '#4B5563' }}>{new Date(r.created_at).toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#1F2937', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{r.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reply */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1F2937', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>Reply</div>
            <textarea
              rows={5} value={reply} onChange={(e) => setReply(e.target.value)}
              placeholder="Type your reply here…"
              style={{ width: '100%', padding: '10px 14px', border: BD, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4B5563', cursor: 'pointer' }}>
                <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} />
                Internal note (not sent to user)
              </label>
              <button
                onClick={sendReply}
                disabled={sending || !reply.trim()}
                style={{ padding: '8px 24px', background: sending || !reply.trim() ? '#4B5563' : '#1B3A4B', border: 'none', color: '#FFFFFF', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: sending || !reply.trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
              >
                {sending ? 'Sending…' : 'Send Reply'}
              </button>
            </div>
            {err && <div style={{ marginTop: 8, fontSize: 12, color: '#EF4444' }}>{err}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * TicketManager — shared ticket inbox used across support-console pages.
 * @param {string} defaultFilter  — pre-selected status filter ('' = all)
 * @param {string} title          — heading text
 */
export default function TicketManager({ defaultFilter = '', title = 'Ticket Inbox' }) {
  const [tickets, setTickets]   = useState([]);
  const [stats, setStats]       = useState({});
  const [filter, setFilter]     = useState(defaultFilter);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter) params.status = filter;
      if (search) params.search = search;
      const [tRes, sRes] = await Promise.all([
        api.get('/support/tickets/', { params }),
        api.get('/support/tickets/stats/'),
      ]);
      setTickets(tRes.data.results || tRes.data);
      setStats(sRes.data);
    } catch {
      // surfaced via empty state
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  const fetchDetail = async (id) => {
    try {
      const res = await api.get(`/support/tickets/${id}/`);
      setSelected(res.data);
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  const refreshSelected = () => {
    if (selected) fetchDetail(selected.id);
    fetchData();
  };

  return (
    <div style={{ padding: '32px 36px', color: '#1F2937', minHeight: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', color: '#1B3A4B', textTransform: 'uppercase', marginBottom: 6 }}>
            INB — Enterprise Support System
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111827' }}>{title}</h1>
          <p style={{ fontSize: 13, color: '#4B5563', margin: '6px 0 0' }}>
            Manage tickets, send replies, update status, and track escalations.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets…"
            style={{ padding: '8px 14px', border: BD, background: '#F9FAFB', fontSize: 13, width: 220, fontFamily: 'inherit', outline: 'none' }}
          />
          <button onClick={fetchData} style={{ padding: '8px 16px', background: '#FFFFFF', border: BD, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', color: '#1F2937' }}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="console-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Open',      key: 'open',      color: '#22C55E' },
          { label: 'Pending',   key: 'pending',   color: '#F59E0B' },
          { label: 'Escalated', key: 'escalated', color: '#EF4444' },
          { label: 'Resolved',  key: 'resolved',  color: '#A78BFA' },
          { label: 'Total',     key: 'total',     color: '#1B3A4B' },
        ].map((s) => (
          <div key={s.key} style={CARD}>
            <div style={{ fontSize: 11, color: '#4B5563', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{stats[s.key] ?? '—'}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, marginBottom: 0, borderBottom: BD }}>
        {FILTER_TABS.map((t) => (
          <button key={t.key} onClick={() => setFilter(t.key)} style={{ padding: '9px 16px', border: 'none', borderBottom: filter === t.key ? '2px solid #1B3A4B' : '2px solid transparent', background: 'transparent', fontSize: 12, fontWeight: filter === t.key ? 700 : 400, color: filter === t.key ? '#1B3A4B' : '#4B5563', cursor: 'pointer', fontFamily: 'inherit', marginBottom: -1 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tickets table */}
      <div style={{ background: '#FFFFFF', border: BD, borderTop: 'none' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#4B5563', fontSize: 13 }}>Loading tickets…</div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#4B5563', fontSize: 13 }}>
            {filter ? `No ${filter} tickets.` : 'No tickets found.'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Ref', 'Category', 'Subject', 'From', 'Priority', 'Status', 'Date', ''].map((h) => (
                  <th key={h} style={TH}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FAFB')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ ...TD, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#1F2937' }}>{t.ticket_ref}</td>
                  <td style={TD}><span style={{ fontSize: 11, color: '#4B5563' }}>{CATEGORY_LABEL[t.category] || t.category}</span></td>
                  <td style={{ ...TD, maxWidth: 220 }}>
                    <span style={{ fontSize: 12, color: '#111827', fontWeight: 600, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</span>
                  </td>
                  <td style={TD}>
                    <div style={{ fontSize: 12, color: '#1F2937' }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: '#4B5563' }}>{t.email}</div>
                  </td>
                  <td style={TD}><Badge value={t.priority} colorMap={PRIORITY_COLOR} /></td>
                  <td style={TD}><Badge value={t.status} colorMap={STATUS_COLOR} /></td>
                  <td style={{ ...TD, fontSize: 11, color: '#4B5563', whiteSpace: 'nowrap' }}>{new Date(t.created_at).toLocaleDateString()}</td>
                  <td style={TD}>
                    <button onClick={() => fetchDetail(t.id)} style={{ fontSize: 10, padding: '5px 14px', cursor: 'pointer', background: '#1B3A4B', border: 'none', color: '#FFFFFF', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                      Open →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <TicketDetail ticket={selected} onClose={() => setSelected(null)} onRefresh={refreshSelected} />
      )}
    </div>
  );
}
