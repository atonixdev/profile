import React, { useState, useEffect } from 'react';

const A    = '#A81D37';
const BD   = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px', borderRadius: 4 };
const MONO = { fontFamily: 'var(--font-mono)' };

const typeColors = { compute: '#2563EB', storage: '#7C3AED', database: '#D97706', container: '#16A34A', domain: '#EC4899' };
const statusBg   = { active: '#DCFCE7', degraded: '#FEF9C3', offline: '#FEE2E2' };
const statusFg   = { active: '#16A34A', degraded: '#CA8A04', offline: '#DC2626' };

const DeveloperDashboard = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    fetch('/api/portal/dashboard/developer/', { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: '40px 32px', color: '#6B7280', ...MONO, fontSize: 12 }}>Loading…</div>;
  if (error) return <div style={{ padding: '40px 32px', color: '#DC2626', ...MONO, fontSize: 12 }}>Error: {error}</div>;
  if (!data) return null;

  const resources   = data.resources || [];
  const byType      = data.by_type || {};
  const byRegion    = data.by_region || {};
  const totalActive = resources.filter(r => r.status === 'active').length;

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 28px) clamp(16px, 4vw, 32px)', maxWidth: 1440 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: A, ...MONO }}>DEV</span>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Developer Dashboard</h1>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Infrastructure resources, deployments, and system health</p>
      </div>

      {/* Resource Type KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: 14, marginBottom: 28 }}>
        {Object.entries(typeColors).map(([type, color]) => (
          <div key={type} style={{ ...CARD, borderTop: `3px solid ${color}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>
              {type}
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{byType[type] || 0}</div>
          </div>
        ))}
        <div style={{ ...CARD, borderTop: `3px solid ${A}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Active</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#16A34A' }}>{totalActive}</div>
        </div>
      </div>

      {/* Region Distribution */}
      {Object.keys(byRegion).length > 0 && (
        <div style={{ ...CARD, marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 14 }}>
            Region Distribution
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {Object.entries(byRegion).map(([region, count]) => (
              <div key={region} style={{ padding: '8px 14px', border: BD, borderRadius: 4, background: '#F9FAFB', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#374151', ...MONO }}>{region}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resource List */}
      <div style={CARD}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>
          Resource Inventory ({resources.length})
        </div>
        {resources.length === 0 ? (
          <div style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', padding: '20px 0' }}>No resources allocated yet</div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {resources.map(r => (
              <div key={r.id} style={{
                padding: '12px 16px', border: BD, borderRadius: 4,
                display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 16, alignItems: 'center',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontSize: 8, fontWeight: 700, letterSpacing: '0.08em', padding: '2px 6px',
                      borderRadius: 2, background: `${typeColors[r.resource_type] || '#6B7280'}18`,
                      color: typeColors[r.resource_type] || '#6B7280', ...MONO,
                    }}>{r.resource_type?.toUpperCase()}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{r.hostname || 'unnamed'}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#6B7280' }}>
                    Assigned to: <span style={{ fontWeight: 600, color: '#374151' }}>{r.assigned_to_name || 'Unassigned'}</span>
                  </div>
                </div>
                <span style={{ fontSize: 11, color: '#6B7280', ...MONO }}>{r.region || '—'}</span>
                <span style={{ fontSize: 11, color: '#6B7280', ...MONO }}>
                  {r.storage_quota ? `${r.storage_quota} GB` : '—'}
                </span>
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', padding: '3px 8px',
                  borderRadius: 2, background: statusBg[r.status] || '#F3F4F6',
                  color: statusFg[r.status] || '#6B7280', ...MONO,
                }}>{r.status?.toUpperCase()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeveloperDashboard;
