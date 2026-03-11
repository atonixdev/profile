import React, { useState, useEffect } from 'react';

const A    = '#A81D37';
const BD   = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px', borderRadius: 4 };
const MONO = { fontFamily: 'var(--font-mono)' };

const TeamManagement = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/portal/dashboard/team/', { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: '40px 32px', color: '#6B7280', ...MONO, fontSize: 12 }}>Loading…</div>;
  if (error) return <div style={{ padding: '40px 32px', color: '#DC2626', ...MONO, fontSize: 12 }}>Error: {error}</div>;
  if (!data) return null;

  const wf = data.workforce || {};
  const departments = data.departments || [];

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 28px) clamp(16px, 4vw, 32px)', maxWidth: 1440 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: A, ...MONO }}>TEM</span>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Team & Resource Management</h1>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Staff allocation, departments, performance tracking, and organizational structure</p>
      </div>

      {/* Workforce KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14, marginBottom: 28 }}>
        <div style={{ ...CARD, borderTop: '3px solid #16A34A' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Total Active Users</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{wf.total_active_users || 0}</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>Active accounts</div>
        </div>
        <div style={{ ...CARD, borderTop: '3px solid #2563EB' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Staff Members</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{wf.staff_members || 0}</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>is_staff = true</div>
        </div>
        <div style={{ ...CARD, borderTop: `3px solid ${A}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Superusers</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{wf.superusers || 0}</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>Full admin access</div>
        </div>
        <div style={{ ...CARD, borderTop: '3px solid #7C3AED' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Departments</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{departments.length}</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>Active units</div>
        </div>
      </div>

      {/* Department Registry */}
      <div style={CARD}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>
          Department Registry
        </div>
        {departments.length === 0 ? (
          <div style={{ fontSize: 12, color: '#9CA3AF', padding: '20px 0', textAlign: 'center' }}>No departments configured yet</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 12 }}>
            {departments.map(d => (
              <div key={d.id} style={{ padding: '14px 16px', border: BD, borderRadius: 4, background: '#F9FAFB' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{
                    fontSize: 8, fontWeight: 700, letterSpacing: '0.08em',
                    padding: '2px 6px', borderRadius: 2, background: 'rgba(37,99,235,0.10)',
                    color: '#2563EB', ...MONO,
                  }}>{d.code}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{d.name}</span>
                </div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>
                  Head: <span style={{ fontWeight: 600, color: '#374151' }}>{d.head || 'Unassigned'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Access Control Summary */}
      <div style={{ ...CARD, marginTop: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 14 }}>
          Access Control Summary
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: BD, paddingBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#6B7280' }}>Role-Based Access Control</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#16A34A', ...MONO }}>ENFORCED</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: BD, paddingBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#6B7280' }}>Department-Level Isolation</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#16A34A', ...MONO }}>ACTIVE</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 4 }}>
            <span style={{ fontSize: 12, color: '#6B7280' }}>Audit Trail Logging</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#16A34A', ...MONO }}>ENABLED</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;
