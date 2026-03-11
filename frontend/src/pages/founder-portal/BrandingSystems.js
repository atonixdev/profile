import React, { useState, useEffect } from 'react';

const A    = '#A81D37';
const BD   = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px', borderRadius: 4 };
const MONO = { fontFamily: 'var(--font-mono)' };

const typeLabels = { color: 'Color Tokens', font: 'Typography', spacing: 'Spacing Scale', asset: 'Brand Assets' };
const typeIcons  = { color: '#7C3AED', font: '#2563EB', spacing: '#D97706', asset: '#16A34A' };

const BrandingSystems = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    fetch('/api/portal/dashboard/branding/', { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: '40px 32px', color: '#6B7280', ...MONO, fontSize: 12 }}>Loading…</div>;
  if (error) return <div style={{ padding: '40px 32px', color: '#DC2626', ...MONO, fontSize: 12 }}>Error: {error}</div>;
  if (!data) return null;

  const byType  = data.by_type || {};
  const summary = data.summary || {};

  const isColor = v => /^#([0-9A-Fa-f]{3,8})$/.test(v);

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 28px) clamp(16px, 4vw, 32px)', maxWidth: 1440 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: A, ...MONO }}>BRD</span>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Branding Systems</h1>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Design tokens, brand assets, typography, and visual identity management</p>
      </div>

      {/* Token Type KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 14, marginBottom: 28 }}>
        {Object.entries(typeLabels).map(([type, label]) => (
          <div key={type} style={{ ...CARD, borderTop: `3px solid ${typeIcons[type]}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>
              {label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{summary[type] || 0}</div>
          </div>
        ))}
      </div>

      {/* Token Sections */}
      {Object.entries(typeLabels).map(([type, label]) => {
        const tokens = byType[type] || [];
        if (tokens.length === 0) return null;

        return (
          <div key={type} style={{ ...CARD, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: typeIcons[type] }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO }}>
                {label} ({tokens.length})
              </span>
            </div>

            {type === 'color' ? (
              /* Color Swatches Grid */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 160px), 1fr))', gap: 12 }}>
                {tokens.map(t => (
                  <div key={t.id} style={{ border: BD, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: 56, background: isColor(t.value) ? t.value : '#E5E7EB',
                      borderBottom: BD,
                    }} />
                    <div style={{ padding: '8px 10px' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{t.name}</div>
                      <div style={{ fontSize: 10, color: '#6B7280', ...MONO }}>{t.value}</div>
                      {t.description && <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>{t.description}</div>}
                    </div>
                  </div>
                ))}
              </div>
            ) : type === 'font' ? (
              /* Typography Specimens */
              <div style={{ display: 'grid', gap: 12 }}>
                {tokens.map(t => (
                  <div key={t.id} style={{ padding: '12px 16px', border: BD, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{t.name}</div>
                      {t.description && <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>{t.description}</div>}
                    </div>
                    <span style={{ fontSize: 14, color: '#374151', fontFamily: t.value, ...MONO }}>{t.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              /* Spacing / Assets List */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))', gap: 10 }}>
                {tokens.map(t => (
                  <div key={t.id} style={{ padding: '10px 14px', border: BD, borderRadius: 4, background: '#F9FAFB' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{t.name}</span>
                      <span style={{ fontSize: 11, color: '#6B7280', ...MONO }}>{t.value}</span>
                    </div>
                    {t.description && <div style={{ fontSize: 10, color: '#9CA3AF' }}>{t.description}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* If no tokens at all */}
      {Object.values(byType).every(arr => !arr || arr.length === 0) && (
        <div style={{ ...CARD, textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 8 }}>No brand tokens defined yet</div>
          <div style={{ fontSize: 11, color: '#D1D5DB' }}>Add tokens via the Django admin panel to populate this dashboard</div>
        </div>
      )}

      {/* Brand Identity Footer */}
      <div style={{ ...CARD, marginTop: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 14 }}>
          Brand Identity Standards
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['BRAND-GUIDE', 'DESIGN-TOKENS', 'TYPOGRAPHY', 'COLOR-SYSTEM', 'ASSET-LIBRARY', 'STYLE-AUDIT'].map(tag => (
            <span key={tag} style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', padding: '4px 10px',
              border: `1px solid ${A}`, borderRadius: 2, color: A, ...MONO,
            }}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandingSystems;
