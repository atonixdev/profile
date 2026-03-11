import React, { useState, useEffect } from 'react';

const A    = '#A81D37';
const BD   = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px', borderRadius: 4 };
const MONO = { fontFamily: 'var(--font-mono)' };

const BrandingSystems = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [tab, setTab]         = useState('overview'); // overview | standards | integration

  useEffect(() => {
    fetch('/api/portal/dashboard/branding/', { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: '40px 32px', color: '#6B7280', ...MONO, fontSize: 12 }}>Loading…</div>;
  if (error) return <div style={{ padding: '40px 32px', color: '#DC2626', ...MONO, fontSize: 12 }}>Error: {error}</div>;
  if (!data) return null;

  const standards   = data.design_standards || [];
  const byCategory  = standards.reduce((acc, s) => {
    const cat = s.category || 'Uncategorised';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});
  const figmaConfig = data.figma_integration || {};
  const isColor = v => /^#([0-9A-Fa-f]{3,8})$/.test(v);

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 28px) clamp(16px, 4vw, 32px)', maxWidth: 1440 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: A, ...MONO }}>BRD</span>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Branding Systems</h1>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Design standards, visual identity, and Figma integration</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: BD }}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'standards', label: `Standards (${standards.length})` },
          { key: 'integration', label: 'Figma Integration' },
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
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Standards</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{standards.length}</div>
            </div>
            <div style={{ ...CARD, borderTop: '3px solid #7C3AED' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Active</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#16A34A' }}>{standards.filter(s => s.is_active).length}</div>
            </div>
            <div style={{ ...CARD, borderTop: '3px solid #2563EB' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Categories</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{Object.keys(byCategory).length}</div>
            </div>
            <div style={{ ...CARD, borderTop: `3px solid #EC4899` }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Figma Sync</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: figmaConfig?.status === 'active' ? '#16A34A' : '#9CA3AF', ...MONO }}>{figmaConfig?.status === 'active' ? 'READY' : 'PENDING'}</div>
            </div>
          </div>

          <div style={CARD}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>Design Standards by Category</div>
            {Object.keys(byCategory).length === 0 ? (
              <div style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', padding: '24px 0' }}>No standards defined yet</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 12 }}>
                {Object.entries(byCategory).map(([cat, items]) => (
                  <div key={cat} style={{ border: BD, borderRadius: 4, padding: '14px 16px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{cat}</div>
                    <div style={{ display: 'grid', gap: 6 }}>
                      {items.slice(0, 4).map((s, i) => (
                        <div key={i} style={{ fontSize: 11, color: '#6B7280', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{s.title}</span>
                          <span style={{ fontSize: 8, fontWeight: 700, color: s.is_active ? '#16A34A' : '#9CA3AF', ...MONO }}>{s.is_active ? 'LIVE' : 'DRAFT'}</span>
                        </div>
                      ))}
                      {items.length > 4 && <div style={{ fontSize: 10, color: '#9CA3AF', fontStyle: 'italic' }}>+{items.length - 4} more…</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* STANDARDS TAB */}
      {tab === 'standards' && (
        <div style={CARD}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>All Design Standards</div>
          {standards.length === 0 ? (
            <div style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', padding: '40px 0' }}>No design standards created yet</div>
          ) : (
            <div style={{ display: 'grid', gap: 14 }}>
              {standards.map(s => (
                <div key={s.id} style={{ paddingBottom: 14, borderBottom: BD }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{s.title}</div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {s.category && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 2, background: '#E5E9F2', color: '#1E40AF', ...MONO }}>{s.category}</span>}
                        <span style={{ fontSize: 9, color: '#9CA3AF', ...MONO }}>v{s.version || '1.0'}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: s.is_active ? '#16A34A' : '#9CA3AF', ...MONO }}>{s.is_active ? 'ACTIVE' : 'INACTIVE'}</span>
                      </div>
                    </div>
                  </div>
                  {s.markdown && (
                    <div style={{ marginTop: 10, padding: '10px 12px', background: '#F9FAFB', borderRadius: 3, fontSize: 11, color: '#374151', fontFamily: 'var(--font-mono)', lineHeight: 1.5, maxHeight: 120, overflow: 'hidden' }}>
                      {s.markdown.split('\n').slice(0, 6).join('\n')}
                      {s.markdown.split('\n').length > 6 && '\n[… more content …]'}
                    </div>
                  )}
                  {s.figma_url && (
                    <div style={{ marginTop: 8 }}>
                      <a href={s.figma_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}>
                        📎 View in Figma →
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* INTEGRATION TAB */}
      {tab === 'integration' && (
        <div style={CARD}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 20 }}>Figma Integration Configuration</div>
          {figmaConfig && Object.keys(figmaConfig).length > 0 ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 14, marginBottom: 24 }}>
                <div style={{ padding: '14px 16px', border: BD, borderRadius: 4, background: '#F9FAFB' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Status</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: figmaConfig.status === 'active' ? '#16A34A' : '#9CA3AF' }}>
                    {figmaConfig.status === 'active' ? '✓ Connected' : '— Disconnected'}
                  </div>
                </div>
                {figmaConfig.endpoint && (
                  <div style={{ padding: '14px 16px', border: BD, borderRadius: 4, background: '#F9FAFB' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Endpoint</div>
                    <div style={{ fontSize: 11, color: '#374151', wordBreak: 'break-all', ...MONO }}>{figmaConfig.endpoint}</div>
                  </div>
                )}
                {figmaConfig.last_synced && (
                  <div style={{ padding: '14px 16px', border: BD, borderRadius: 4, background: '#F9FAFB' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Last Sync</div>
                    <div style={{ fontSize: 11, color: '#374151' }}>{new Date(figmaConfig.last_synced).toLocaleString()}</div>
                  </div>
                )}
              </div>
              <div style={{ padding: '16px 20px', background: '#DCFCE7', borderRadius: 4, border: '1px solid #BBFBBA' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#166534', marginBottom: 8 }}>✓ Figma integration is active</div>
                <div style={{ fontSize: 10, color: '#166534', lineHeight: 1.4 }}>
                  Design standards and assets can be synced from your Figma workspace. New updates will appear in the 'Standards' tab automatically.
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', background: '#FEE2E2', borderRadius: 4, border: '1px solid #FECACA' }}>
              <div style={{ fontSize: 12, color: '#991B1B', fontWeight: 600, marginBottom: 6 }}>Figma integration not configured</div>
              <div style={{ fontSize: 11, color: '#991B1B', marginBottom: 12 }}>Set up your Figma workspace connection in admin settings to enable design token sync.</div>
              <a href="/admin/founder_portal/integrationconfig/" style={{ fontSize: 11, color: '#DC2626', fontWeight: 600, textDecoration: 'none' }}>Configure in Admin →</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BrandingSystems;
