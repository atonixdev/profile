import React, { useState, useEffect, useCallback } from 'react';

const A    = '#A81D37';
const BD   = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px', borderRadius: 4 };
const MONO = { fontFamily: 'var(--font-mono)' };

const api = (url, opts = {}) => fetch(url, {
  credentials: 'include',
  headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...opts.headers },
  ...opts,
}).then(r => { if (r.status === 204) return null; if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); });

const typeColors = { compute: '#2563EB', storage: '#7C3AED', database: '#D97706', container: '#16A34A', domain: '#EC4899' };
const statusBg   = { active: '#DCFCE7', degraded: '#FEF9C3', offline: '#FEE2E2' };
const statusFg   = { active: '#16A34A', degraded: '#CA8A04', offline: '#DC2626' };
const deployColors = { success: '#16A34A', failed: '#DC2626', pending: '#D97706', building: '#2563EB', deploying: '#7C3AED', rolled_back: '#9CA3AF' };

const DeveloperDashboard = () => {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [tab, setTab]           = useState('overview'); // overview | deployments | alerts
  const [alerts, setAlerts]     = useState([]);
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  const fetchDashboard = useCallback(() => {
    fetch('/api/portal/dashboard/developer/', { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const fetchAlerts = useCallback(() => {
    setAlertLoading(true);
    api('/api/portal/alerts/')
      .then(d => { setAlerts(Array.isArray(d) ? d : (d.results || [])); setAlertLoading(false); })
      .catch(() => setAlertLoading(false));
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  useEffect(() => {
    if (tab === 'alerts') fetchAlerts();
  }, [tab, fetchAlerts]);

  const alertAction = (id, action) => {
    api(`/api/portal/alerts/${id}/action/`, { method: 'PUT', body: JSON.stringify({ action }) })
      .then(() => { setAlertMsg(`Alert ${action}d`); fetchAlerts(); fetchDashboard(); setTimeout(() => setAlertMsg(''), 3000); })
      .catch(err => setAlertMsg(`Failed: ${err.message}`));
  };

  if (loading) return <div style={{ padding: '40px 32px', color: '#6B7280', ...MONO, fontSize: 12 }}>Loading…</div>;
  if (error) return <div style={{ padding: '40px 32px', color: '#DC2626', ...MONO, fontSize: 12 }}>Error: {error}</div>;
  if (!data) return null;

  const resources      = data.resources || [];
  const byType         = data.resource_summary?.by_type || {};
  const byRegion       = data.resource_summary?.by_region || {};
  const deployments    = data.deployments || [];
  const deployStats    = data.deployment_stats || {};
  const alertData      = data.alerts || {};

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 28px) clamp(16px, 4vw, 32px)', maxWidth: 1440 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: A, ...MONO }}>DEV</span>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Developer Dashboard</h1>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Infrastructure resources, deployments, and system health</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: BD }}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'deployments', label: `Deployments (${deployStats.total || 0})` },
          { key: 'alerts', label: `Alerts (${alertData.active || 0})` },
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
            {Object.entries(typeColors).map(([type, color]) => (
              <div key={type} style={{ ...CARD, borderTop: `3px solid ${color}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>{type}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{byType[type] || 0}</div>
              </div>
            ))}
            <div style={{ ...CARD, borderTop: `3px solid ${A}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Active</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#16A34A' }}>{data.resource_summary?.total_active || 0}</div>
            </div>
          </div>

          {Object.keys(byRegion).length > 0 && (
            <div style={{ ...CARD, marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 14 }}>Region Distribution</div>
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

          <div style={CARD}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>Resource Inventory ({resources.length})</div>
            {resources.length === 0 ? (
              <div style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', padding: '20px 0' }}>No resources allocated yet</div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {resources.slice(0, 8).map(r => (
                  <div key={r.id} style={{ padding: '12px 16px', border: BD, borderRadius: 4, display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 16, alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.08em', padding: '2px 6px', borderRadius: 2, background: `${typeColors[r.resource_type] || '#6B7280'}18`, color: typeColors[r.resource_type] || '#6B7280', ...MONO }}>{r.resource_type?.toUpperCase()}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{r.hostname || 'unnamed'}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: '#6B7280', ...MONO }}>{r.region || '—'}</span>
                    <span style={{ fontSize: 11, color: '#6B7280', ...MONO }}>{r.storage_quota ? `${r.storage_quota} GB` : '—'}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', padding: '3px 8px', borderRadius: 2, background: statusBg[r.status] || '#F3F4F6', color: statusFg[r.status] || '#6B7280', ...MONO }}>{r.status?.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* DEPLOYMENTS TAB */}
      {tab === 'deployments' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 14, marginBottom: 28 }}>
            <div style={{ ...CARD, borderTop: `3px solid ${deployColors.success}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Successful</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#16A34A' }}>{deployStats.success || 0}</div>
            </div>
            <div style={{ ...CARD, borderTop: `3px solid ${deployColors.failed}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Failed</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#DC2626' }}>{deployStats.failed || 0}</div>
            </div>
            <div style={{ ...CARD, borderTop: `3px solid ${deployColors.pending}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>In Progress</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#D97706' }}>{deployStats.in_progress || 0}</div>
            </div>
            <div style={{ ...CARD, borderTop: `3px solid ${A}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Total</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{deployStats.total || 0}</div>
            </div>
          </div>

          <div style={CARD}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>Recent Deployments</div>
            {deployments.length === 0 ? (
              <div style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', padding: '20px 0' }}>No deployments recorded yet</div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {deployments.slice(0, 10).map(d => (
                  <div key={d.id} style={{ padding: '12px 14px', border: BD, borderRadius: 4, display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: deployColors[d.status], ...MONO }}>{d.status?.replace('_', ' ')}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{d.service} v{d.version}</div>
                      <div style={{ fontSize: 10, color: '#6B7280', ...MONO }}>{d.branch} · {d.environment}</div>
                    </div>
                    <span style={{ fontSize: 10, color: '#9CA3AF', ...MONO }}>{d.duration_secs ? `${d.duration_secs}s` : '—'}</span>
                    <span style={{ fontSize: 9, color: '#9CA3AF', ...MONO }}>{d.created_at ? new Date(d.created_at).toLocaleDateString() : ''}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ALERTS TAB */}
      {tab === 'alerts' && (
        <div style={CARD}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO }}>Active Monitoring Alerts</div>
            {alertMsg && <span style={{ fontSize: 11, color: '#16A34A', ...MONO }}>{alertMsg}</span>}
          </div>
          {alertLoading ? (
            <div style={{ fontSize: 12, color: '#9CA3AF', ...MONO, textAlign: 'center', padding: '40px 0' }}>Loading alerts…</div>
          ) : alerts.length === 0 ? (
            <div style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', padding: '40px 0' }}>All systems nominal — no active alerts</div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {alerts.map(a => {
                const sevColor = a.severity === 'critical' ? '#DC2626' : a.severity === 'warning' ? '#D97706' : '#2563EB';
                const statusBgAlert = a.status === 'active' ? '#FEF2F2' : a.status === 'acknowledged' ? '#FEF9C3' : '#F0FDF4';
                return (
                  <div key={a.id} style={{ padding: '14px 16px', border: BD, borderRadius: 4, background: statusBgAlert }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', padding: '2px 7px', borderRadius: 2, background: `${sevColor}18`, color: sevColor, ...MONO }}>{a.severity?.toUpperCase()}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{a.title}</span>
                        </div>
                        <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 4 }}>
                          Service: <strong style={{ color: '#374151' }}>{a.service || '—'}</strong>
                          {a.metric_name && <span> · {a.metric_name}: <strong style={{ color: '#111827' }}>{a.metric_value}</strong> (threshold: {a.threshold})</span>}
                        </div>
                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', padding: '2px 6px', borderRadius: 2, border: `1px solid ${sevColor}`, color: sevColor, ...MONO }}>{a.status?.toUpperCase()}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        {a.status === 'active' && (
                          <button onClick={() => alertAction(a.id, 'acknowledge')} style={{ fontSize: 10, fontWeight: 700, padding: '5px 10px', border: `1px solid #D97706`, borderRadius: 3, background: '#FEF9C3', color: '#92400E', cursor: 'pointer', ...MONO }}>Acknowledge</button>
                        )}
                        {a.status !== 'resolved' && (
                          <button onClick={() => alertAction(a.id, 'resolve')} style={{ fontSize: 10, fontWeight: 700, padding: '5px 10px', border: `1px solid #16A34A`, borderRadius: 3, background: '#DCFCE7', color: '#166534', cursor: 'pointer', ...MONO }}>Resolve</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeveloperDashboard;
