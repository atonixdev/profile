import React, { useState, useEffect, useCallback } from 'react';

const A      = '#A81D37';
const BD     = '1px solid #E5E7EB';
const INPUT  = { padding: '8px 12px', fontSize: 13, border: BD, borderRadius: 3, fontFamily: 'var(--font-mono)' };
const CARD   = { background: '#FFFFFF', border: BD, padding: '20px 24px', borderRadius: 4 };
const BTN    = { padding: '8px 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', border: 'none', borderRadius: 3, cursor: 'pointer', fontFamily: 'var(--font-mono)' };
const MONO   = { fontFamily: 'var(--font-mono)' };

const channelColors = { LinkedIn: '#0A66C2', Twitter: '#1DA1F2', GitHub: '#333333', Email: '#6B7280', Facebook: '#1877F2', TikTok: '#000000' };
const statusBg = { active: '#DCFCE7', paused: '#FEF9C3', draft: '#E5E9F2' };
const statusFg = { active: '#16A34A', paused: '#CA8A04', draft: '#1E40AF' };

const api = (url, opts = {}) => fetch(url, {
  credentials: 'include',
  headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...opts.headers },
  ...opts,
}).then(r => { if (r.status === 204) return null; if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); });

const MarketingDashboard = () => {
  const [data, setData]              = useState(null);
  const [loading, setLoading]        = useState(true);
  const [error, setError]            = useState(null);
  const [tab, setTab]                = useState('overview');
  const [composerForm, setComposerForm] = useState({ title: '', content: '', channels: [], schedule: '' });
  const [composerModal, setComposerModal] = useState(false);

  const fetchData = useCallback(() => {
    fetch('/api/portal/dashboard/marketing/', { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const submitPost = (e) => {
    e.preventDefault();
    if (!composerForm.title.trim() || !composerForm.content.trim() || composerForm.channels.length === 0) {
      alert('Please fill in all required fields (title, content, at least one channel)');
      return;
    }
    api('/api/portal/campaigns/', { method: 'POST', body: JSON.stringify({
      name: composerForm.title,
      channel: composerForm.channels.join(','),
      status: composerForm.schedule ? 'draft' : 'active',
      start_date: composerForm.schedule || new Date().toISOString().split('T')[0],
      budget: 0,
    })}).then(() => {
      setComposerForm({ title: '', content: '', channels: [], schedule: '' });
      setComposerModal(false);
      fetchData();
    }).catch(err => alert('Error posting: ' + err.message));
  };

  if (loading) return <div style={{ padding: '40px 32px', color: '#6B7280', ...MONO, fontSize: 12 }}>Loading…</div>;
  if (error) return <div style={{ padding: '40px 32px', color: '#DC2626', ...MONO, fontSize: 12 }}>Error: {error}</div>;
  if (!data) return null;

  const campaigns    = data.campaigns || [];
  const totalSpend   = campaigns.reduce((sum, c) => sum + (c.spend || 0), 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + (c.revenue || 0), 0);
  const avgRoi       = totalSpend > 0 ? (((totalRevenue - totalSpend) / totalSpend) * 100).toFixed(1) : 0;
  const activeCount  = campaigns.filter(c => c.status === 'active').length;
  const OVERLAY      = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 };
  const MODAL        = { background: '#FFFFFF', borderRadius: 6, padding: '28px 32px', width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto' };

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 28px) clamp(16px, 4vw, 32px)', maxWidth: 1440 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: A, ...MONO }}>MKT</span>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Marketing Dashboard</h1>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Campaigns, content, and engagement metrics</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: BD }}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'composer', label: 'New Post' },
          { key: 'calendar', label: 'Calendar' },
          { key: 'analytics', label: `Analytics (${campaigns.length})` },
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: 14, marginBottom: 28 }}>
            <div style={{ ...CARD, borderTop: `3px solid ${A}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Active</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#16A34A' }}>{activeCount}</div>
            </div>
            <div style={{ ...CARD, borderTop: '3px solid #D97706' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Total Campaigns</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{campaigns.length}</div>
            </div>
            <div style={{ ...CARD, borderTop: '3px solid #7C3AED' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Spend</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>${totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            </div>
            <div style={{ ...CARD, borderTop: '3px solid #16A34A' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Revenue</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#16A34A' }}>${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            </div>
            <div style={{ ...CARD, borderTop: '3px solid #0891B2' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>ROI</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: avgRoi >= 0 ? '#16A34A' : '#DC2626' }}>{avgRoi}%</div>
            </div>
          </div>

          <div style={CARD}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>Campaign Summary</div>
            {campaigns.length === 0 ? (
              <div style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', padding: '32px 0' }}>No campaigns yet</div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {campaigns.slice(0, 8).map(c => (
                  <div key={c.id} style={{ padding: '12px 14px', border: BD, borderRadius: 4, display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', gap: 14, alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', padding: '2px 6px', borderRadius: 2, background: `${channelColors[c.channel] || '#6B7280'}18`, color: channelColors[c.channel] || '#6B7280', ...MONO }}>{c.channel?.toUpperCase()}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{c.name}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 9, color: '#9CA3AF', ...MONO }}>${c.spend || 0}</span>
                    <span style={{ fontSize: 9, color: '#9CA3AF', ...MONO }}>${c.revenue || 0}</span>
                    <span style={{ fontSize: 9, color: '#9CA3AF', ...MONO }}>{c.roi ? `${c.roi.toFixed(0)}%` : '—'}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', padding: '3px 8px', borderRadius: 2, background: statusBg[c.status] || '#F3F4F6', color: statusFg[c.status] || '#6B7280', ...MONO }}>{c.status?.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* COMPOSER TAB */}
      {tab === 'composer' && (
        <div style={CARD}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>Compose New Post</div>
          <form onSubmit={submitPost} style={{ display: 'grid', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#1F2937', display: 'block', marginBottom: 6, ...MONO }}>Post Title *</label>
              <input type="text" value={composerForm.title} onChange={e => setComposerForm({ ...composerForm, title: e.target.value })} style={{ ...INPUT, width: '100%' }} placeholder="e.g. Excited to announce new features!" />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#1F2937', display: 'block', marginBottom: 6, ...MONO }}>Content *</label>
              <textarea value={composerForm.content} onChange={e => setComposerForm({ ...composerForm, content: e.target.value })} style={{ ...INPUT, width: '100%', minHeight: 120, fontFamily: 'var(--font-mono)', resize: 'vertical' }} placeholder="Write your post content here…" />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#1F2937', display: 'block', marginBottom: 6, ...MONO }}>Channels *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: 10 }}>
                {['LinkedIn', 'Twitter', 'GitHub', 'Facebook', 'TikTok', 'Email'].map(ch => (
                  <label key={ch} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={composerForm.channels.includes(ch)} onChange={e => {
                      if (e.target.checked) setComposerForm({ ...composerForm, channels: [...composerForm.channels, ch] });
                      else setComposerForm({ ...composerForm, channels: composerForm.channels.filter(x => x !== ch) });
                    }} style={{ cursor: 'pointer' }} />
                    <span style={{ fontSize: 12, color: channelColors[ch] || '#6B7280', fontWeight: 600 }}>{ch}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#1F2937', display: 'block', marginBottom: 6, ...MONO }}>Schedule (Optional)</label>
              <input type="date" value={composerForm.schedule} onChange={e => setComposerForm({ ...composerForm, schedule: e.target.value })} style={{ ...INPUT, width: '100%' }} />
              <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4, ...MONO }}>Leave empty to post immediately</div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button type="submit" style={{ ...BTN, background: A, color: '#FFFFFF', flex: 1 }}>Post Now</button>
              <button type="button" onClick={() => setTab('overview')} style={{ ...BTN, background: '#E5E7EB', color: '#374151', flex: 1 }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* CALENDAR TAB */}
      {tab === 'calendar' && (
        <div style={CARD}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>Campaign Timeline</div>
          {campaigns.length === 0 ? (
            <div style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', padding: '40px 0' }}>No scheduled campaigns</div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {campaigns.filter(c => c.start_date).sort((a, b) => new Date(a.start_date) - new Date(b.start_date)).map(c => (
                <div key={c.id} style={{ padding: '12px 16px', border: BD, borderRadius: 4, display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 16, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: channelColors[c.channel] || '#6B7280', ...MONO }}>{new Date(c.start_date).toLocaleDateString()}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{c.name}</div>
                    <span style={{ fontSize: 9, color: '#6B7280', ...MONO }}>{c.channel}</span>
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', padding: '3px 8px', borderRadius: 2, background: statusBg[c.status], color: statusFg[c.status], ...MONO }}>{c.status?.toUpperCase()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ANALYTICS TAB */}
      {tab === 'analytics' && (
        <div style={CARD}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>Campaign Performance</div>
          {campaigns.length === 0 ? (
            <div style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', padding: '40px 0' }}>No campaigns yet</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', ...MONO }}>
                <thead>
                  <tr style={{ borderBottom: BD }}>
                    <th style={{ textAlign: 'left', padding: '10px 0', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#6B7280', textTransform: 'uppercase' }}>Campaign</th>
                    <th style={{ textAlign: 'left', padding: '10px 0', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#6B7280', textTransform: 'uppercase' }}>Channel</th>
                    <th style={{ textAlign: 'right', padding: '10px 0', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#6B7280', textTransform: 'uppercase' }}>Spend</th>
                    <th style={{ textAlign: 'right', padding: '10px 0', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#6B7280', textTransform: 'uppercase' }}>Revenue</th>
                    <th style={{ textAlign: 'right', padding: '10px 0', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#6B7280', textTransform: 'uppercase' }}>ROI</th>
                    <th style={{ textAlign: 'right', padding: '10px 0', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#6B7280', textTransform: 'uppercase' }}>CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map(c => (
                    <tr key={c.id} style={{ borderBottom: BD }}>
                      <td style={{ padding: '12px 0', fontSize: 12, fontWeight: 600, color: '#111827' }}>{c.name}</td>
                      <td style={{ padding: '12px 0', fontSize: 11, color: channelColors[c.channel], fontWeight: 600 }}>{c.channel}</td>
                      <td style={{ padding: '12px 0', fontSize: 11, textAlign: 'right', color: '#6B7280' }}>${c.spend || 0}</td>
                      <td style={{ padding: '12px 0', fontSize: 11, textAlign: 'right', color: '#6B7280' }}>${c.revenue || 0}</td>
                      <td style={{ padding: '12px 0', fontSize: 11, textAlign: 'right', color: c.roi >= 0 ? '#16A34A' : '#DC2626', fontWeight: 600 }}>{c.roi ? `${c.roi.toFixed(0)}%` : '—'}</td>
                      <td style={{ padding: '12px 0', fontSize: 11, textAlign: 'right', color: '#6B7280' }}>{c.ctr ? `${c.ctr.toFixed(2)}%` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MarketingDashboard;
