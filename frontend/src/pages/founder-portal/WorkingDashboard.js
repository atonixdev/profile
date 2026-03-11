import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const A = '#A81D37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px', borderRadius: 4 };
const MONO = { fontFamily: 'var(--font-mono)' };

const api = async (url, method = 'GET', body = null) => {
  const options = {
    method,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    credentials: 'include',
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
};

const WorkingDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [grantModal, setGrantModal] = useState(false);
  const [grantForm, setGrantForm] = useState({ dashboard_id: '', user_id: '', access_level: 'view', notes: '' });
  const [grantLoading, setGrantLoading] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const res = await api('/api/portal/working-dashboard/');
      setData(res);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGrant = async () => {
    if (!grantForm.dashboard_id || !grantForm.user_id) {
      alert('Please select dashboard and user');
      return;
    }
    setGrantLoading(true);
    try {
      await api('/api/portal/dashboard-permissions/', 'POST', grantForm);
      setGrantModal(false);
      setGrantForm({ dashboard_id: '', user_id: '', access_level: 'view', notes: '' });
      await fetchData();
    } catch (e) {
      alert(`Error: ${e.message}`);
    } finally {
      setGrantLoading(false);
    }
  };

  const handleRevoke = async (permId) => {
    if (!window.confirm('Revoke this access?')) return;
    try {
      await api(`/api/portal/dashboard-permissions/${permId}/`, 'DELETE');
      await fetchData();
    } catch (e) {
      alert(`Error: ${e.message}`);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (error) return <div style={{ padding: 40, textAlign: 'center', color: '#DC2626' }}>Error: {error}</div>;
  if (!data) return <div style={{ padding: 40, textAlign: 'center' }}>No data</div>;

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh', padding: '40px 40px' }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span style={{
            background: A,
            color: '#FFF',
            padding: '4px 10px',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 600,
            ...MONO,
          }}>WRK</span>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0 }}>Working Dashboard</h1>
        </div>
        <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>
          Centralized hub listing all platform dashboards. Founders manage access via RBAC.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 32, borderBottom: BD }}>
        {['all', 'permissions', 'audit'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: tab === t ? `3px solid ${A}` : 'none',
              fontSize: 14,
              fontWeight: tab === t ? 600 : 500,
              color: tab === t ? '#111827' : '#6B7280',
              cursor: 'pointer',
              transition: 'all 200ms',
            }}
          >
            {t === 'all' ? '📊 All Dashboards' : t === 'permissions' ? '🔐 Permissions' : '📋 Audit Log'}
          </button>
        ))}
      </div>

      {/* All Dashboards Tab */}
      {tab === 'all' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {data.dashboards.map(d => (
              <div key={d.id} style={{
                ...CARD,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                transition: 'all 200ms',
                cursor: 'pointer',
                ':hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
              }}>
                {/* Badge + Access Indicator */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{
                    background: d.accent_color || A,
                    color: '#FFF',
                    padding: '4px 10px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    ...MONO,
                  }}>
                    {d.code}
                  </span>
                  {!data.is_founder && d.permissions.length === 0 && d.default_access === 'founder' && (
                    <span style={{ fontSize: 18 }}>🔒</span>
                  )}
                </div>

                {/* Title */}
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>{d.name}</h3>

                {/* Description */}
                {d.description && (
                  <p style={{ fontSize: 13, color: '#6B7280', margin: 0, lineHeight: 1.4 }}>{d.description}</p>
                )}

                {/* Category */}
                <span style={{
                  fontSize: 12,
                  color: '#6B7280',
                  background: '#F3F4F6',
                  padding: '4px 8px',
                  borderRadius: 3,
                  width: 'fit-content',
                  textTransform: 'capitalize',
                }}>
                  {d.category.replace('_', ' ')}
                </span>

                {/* Permission Count */}
                {data.is_founder && (
                  <span style={{ fontSize: 12, color: '#0891B2', fontWeight: 500 }}>
                    👥 {d.permissions.length} {d.permissions.length === 1 ? 'user' : 'users'}
                  </span>
                )}

                {/* Open Button */}
                <button
                  onClick={() => navigate(d.url_path)}
                  disabled={!data.is_founder && d.permissions.length === 0 && d.default_access === 'founder'}
                  style={{
                    marginTop: 'auto',
                    padding: '10px 16px',
                    background: (!data.is_founder && d.permissions.length === 0 && d.default_access === 'founder') ? '#E5E7EB' : A,
                    color: '#FFF',
                    border: 'none',
                    borderRadius: 4,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: (!data.is_founder && d.permissions.length === 0 && d.default_access === 'founder') ? 'not-allowed' : 'pointer',
                    opacity: (!data.is_founder && d.permissions.length === 0 && d.default_access === 'founder') ? 0.6 : 1,
                  }}
                >
                  Open → {d.code}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permissions Tab (Founder Only) */}
      {tab === 'permissions' && (
        <div>
          {!data.is_founder ? (
            <div style={{ ...CARD, textAlign: 'center', color: '#6B7280' }}>
              Only founders can manage permissions.
            </div>
          ) : (
            <div>
              {/* Grant Button */}
              <button
                onClick={() => setGrantModal(true)}
                style={{
                  marginBottom: 24,
                  padding: '12px 16px',
                  background: A,
                  color: '#FFF',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ➕ Grant Access
              </button>

              {/* Permissions Table */}
              {data.all_dashboards_for_founder && data.all_dashboards_for_founder.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: 13,
                  }}>
                    <thead>
                      <tr style={{ background: '#F3F4F6', borderBottom: BD }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#111827' }}>Dashboard</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#111827' }}>User</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#111827' }}>Access</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#111827' }}>Granted By</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#111827' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.all_dashboards_for_founder.flatMap(d =>
                        d.permissions.map(p => (
                          <tr key={p.id} style={{ borderBottom: BD }}>
                            <td style={{ padding: '12px', color: '#111827' }}>
                              <span style={{
                                background: d.accent_color || A,
                                color: '#FFF',
                                padding: '2px 6px',
                                borderRadius: 3,
                                fontSize: 11,
                                fontWeight: 600,
                                marginRight: 6,
                                ...MONO,
                              }}>
                                {d.code}
                              </span>
                              {d.name}
                            </td>
                            <td style={{ padding: '12px', color: '#111827' }}>{p.full_name}</td>
                            <td style={{ padding: '12px', color: '#6B7280' }}>
                              <span style={{
                                background: p.access_level === 'admin' ? '#FEE2E2' : p.access_level === 'edit' ? '#FEF3C7' : '#DBEAFE',
                                color: p.access_level === 'admin' ? '#DC2626' : p.access_level === 'edit' ? '#D97706' : '#0891B2',
                                padding: '4px 8px',
                                borderRadius: 3,
                                fontSize: 11,
                                fontWeight: 600,
                                textTransform: 'uppercase',
                              }}>
                                {p.access_level}
                              </span>
                            </td>
                            <td style={{ padding: '12px', color: '#6B7280' }}>{p.granted_by || 'system'}</td>
                            <td style={{ padding: '12px' }}>
                              <button
                                onClick={() => handleRevoke(p.id)}
                                style={{
                                  padding: '4px 8px',
                                  background: '#FEE2E2',
                                  color: '#DC2626',
                                  border: 'none',
                                  borderRadius: 3,
                                  fontSize: 11,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Revoke
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ ...CARD, textAlign: 'center', color: '#6B7280' }}>
                  No permissions granted yet.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Audit Log Tab */}
      {tab === 'audit' && (
        <div>
          {data.audit_log.length > 0 ? (
            <div style={{ display: 'grid', gap: 12 }}>
              {data.audit_log.map((entry, idx) => (
                <div key={idx} style={{
                  ...CARD,
                  borderLeft: `4px solid ${entry.severity === 'warning' ? '#F59E0B' : entry.severity === 'error' ? '#DC2626' : '#10B981'}`,
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, marginBottom: 8 }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 4px 0' }}>
                        {entry.description}
                      </p>
                      <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>
                        By: <strong>{entry.actor}</strong>
                      </p>
                    </div>
                    <span style={{
                      fontSize: 11,
                      color: '#6B7280',
                      whiteSpace: 'nowrap',
                      ...MONO,
                    }}>
                      {new Date(entry.created_at).toLocaleString()}
                    </span>
                  </div>
                  <span style={{
                    display: 'inline-block',
                    fontSize: 10,
                    padding: '2px 6px',
                    borderRadius: 3,
                    background: entry.severity === 'warning' ? '#FEF3C7' : entry.severity === 'error' ? '#FEE2E2' : '#DCFCE7',
                    color: entry.severity === 'warning' ? '#D97706' : entry.severity === 'error' ? '#DC2626' : '#16A34A',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}>
                    {entry.event}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ ...CARD, textAlign: 'center', color: '#6B7280' }}>
              No audit events yet.
            </div>
          )}
        </div>
      )}

      {/* Grant Access Modal */}
      {grantModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            ...CARD,
            maxWidth: 400,
            width: '90%',
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 16, margin: '0 0 16px 0' }}>
              Grant Dashboard Access
            </h2>

            {/* Dashboard Select */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#111827', display: 'block', marginBottom: 6 }}>
                Dashboard
              </label>
              <select
                value={grantForm.dashboard_id}
                onChange={(e) => setGrantForm({ ...grantForm, dashboard_id: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: BD,
                  borderRadius: 4,
                  fontSize: 13,
                  ...MONO,
                }}
              >
                <option value="">Select dashboard...</option>
                {data.all_dashboards_for_founder?.map(d => (
                  <option key={d.id} value={d.id}>{d.code} — {d.name}</option>
                )) || data.dashboards.map(d => (
                  <option key={d.id} value={d.id}>{d.code} — {d.name}</option>
                ))}
              </select>
            </div>

            {/* User Select */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#111827', display: 'block', marginBottom: 6 }}>
                User
              </label>
              <select
                value={grantForm.user_id}
                onChange={(e) => setGrantForm({ ...grantForm, user_id: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: BD,
                  borderRadius: 4,
                  fontSize: 13,
                  ...MONO,
                }}
              >
                <option value="">Select user...</option>
                {data.staff_users.map(u => (
                  <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.username})</option>
                ))}
              </select>
            </div>

            {/* Access Level */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#111827', display: 'block', marginBottom: 6 }}>
                Access Level
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {['view', 'edit', 'admin'].map(level => (
                  <button
                    key={level}
                    onClick={() => setGrantForm({ ...grantForm, access_level: level })}
                    style={{
                      padding: '8px 12px',
                      background: grantForm.access_level === level ? A : '#F3F4F6',
                      color: grantForm.access_level === level ? '#FFF' : '#111827',
                      border: 'none',
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#111827', display: 'block', marginBottom: 6 }}>
                Notes (optional)
              </label>
              <textarea
                value={grantForm.notes}
                onChange={(e) => setGrantForm({ ...grantForm, notes: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: BD,
                  borderRadius: 4,
                  fontSize: 13,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  minHeight: 60,
                }}
                placeholder="e.g., For Q1 2024 planning..."
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button
                onClick={() => setGrantModal(false)}
                style={{
                  padding: '10px 16px',
                  background: '#E5E7EB',
                  color: '#111827',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleGrant}
                disabled={grantLoading}
                style={{
                  padding: '10px 16px',
                  background: A,
                  color: '#FFF',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: grantLoading ? 'not-allowed' : 'pointer',
                  opacity: grantLoading ? 0.7 : 1,
                }}
              >
                {grantLoading ? 'Granting...' : 'Grant Access'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 60, padding: '20px 24px', background: '#F3F4F6', borderRadius: 4, border: BD, textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>
          ATONIXDEV — WORKING DASHBOARD · Central Access Hub
        </p>
      </div>
    </div>
  );
};

export default WorkingDashboard;
