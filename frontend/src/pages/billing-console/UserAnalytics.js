import React, { useState, useEffect } from 'react';

const A  = '#A81D37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px', borderRadius: 4 };
const MONO = { fontFamily: 'var(--font-mono)' };

const fmt$ = v => {
  const n = parseFloat(v);
  if (isNaN(n)) return '$0.00';
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const fmtNum = v => {
  const n = parseFloat(v);
  if (isNaN(n) || !isFinite(n)) return '0';
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
};

const UserAnalytics = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetail, setUserDetail]     = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchQ, setSearchQ]   = useState('');

  // Fetch list of users from system or create mock from first call
  useEffect(() => {
    setLoading(true);
    // First, fetch a usage summary to discover which users have activity
    fetch('/api/billing/events/?limit=1000', { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(events => {
        const seenUsers = new Map();
        (Array.isArray(events) ? events : (events.results || [])).forEach(ev => {
          if (ev.user && !seenUsers.has(ev.user)) {
            seenUsers.set(ev.user, ev);
          }
        });
        // Mock users from activity (in production, fetch from /admin/api/users/)
        const discovered = Array.from(seenUsers.values()).map(ev => ({
          id: ev.user,
          username: ev.user,
        }));
        setUsers(discovered);
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const loadUserDetail = (userId) => {
    setSelectedUser(userId);
    setDetailLoading(true);
    Promise.all([
      fetch(`/api/billing/users/${userId}/usage/`, { credentials: 'include', headers: { Accept: 'application/json' } }),
      fetch(`/api/billing/users/${userId}/billing/`, { credentials: 'include', headers: { Accept: 'application/json' } }),
    ])
      .then(rs => Promise.all(rs.map(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })))
      .then(([usage, billing]) => {
        setUserDetail({ usage, billing });
        setDetailLoading(false);
      })
      .catch(e => { setError(e.message); setDetailLoading(false); });
  };

  const filtered = users.filter(u =>
    (u.username || String(u.id)).toLowerCase().includes(searchQ.toLowerCase())
  );

  if (loading) return <div style={{ padding: '40px 32px', color: '#6B7280', ...MONO, fontSize: 12 }}>Loading…</div>;
  if (error)   return <div style={{ padding: '40px 32px', color: '#DC2626', ...MONO, fontSize: 12 }}>Error: {error}</div>;

  return (
    <div style={{ padding: 'clamp(14px, 3.5vw, 28px) clamp(14px, 3.5vw, 32px)', maxWidth: 1280 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: A, ...MONO }}>USR</span>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>User Analytics</h1>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Usage and billing activity per individual user.</p>
      </div>

      <div className="form-grid-sidebar form-grid-user-analytics">
        {/* Left: User list */}
        <div>
          <div style={{ ...CARD, marginBottom: 16 }}>
            <input
              placeholder="Search users…"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', fontSize: 12, border: BD, borderRadius: 4,
                fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ ...CARD, maxHeight: 500, overflowY: 'auto' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 12 }}>
              Users ({filtered.length})
            </div>
            {filtered.length === 0 && (
              <div style={{ color: '#9CA3AF', fontSize: 12 }}>No users found.</div>
            )}
            {filtered.map(u => (
              <button
                key={u.id}
                onClick={() => loadUserDetail(u.id)}
                style={{
                  width: '100%', textAlign: 'left', padding: '10px 12px', fontSize: 12,
                  border: selectedUser === u.id ? `2px solid ${A}` : '1px solid #E5E7EB',
                  background: selectedUser === u.id ? `${A}12` : '#FFF', cursor: 'pointer',
                  borderRadius: 3, marginBottom: 8, fontWeight: selectedUser === u.id ? 600 : 400,
                  color: selectedUser === u.id ? A : '#111827',
                }}
              >
                <div style={{ ...MONO, fontSize: 10, color: '#9CA3AF' }}>{u.id}</div>
                <div style={{ fontWeight: 600 }}>{u.username}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: User detail */}
        <div>
          {!selectedUser && (
            <div style={{ ...CARD, color: '#6B7280', fontSize: 12, padding: '40px 24px', textAlign: 'center' }}>
              Select a user to view details
            </div>
          )}

          {selectedUser && detailLoading && (
            <div style={{ ...CARD, color: '#6B7280', fontSize: 12, ...MONO }}>Loading…</div>
          )}

          {selectedUser && !detailLoading && userDetail && (
            <>
              {/* User header */}
              <div style={{ ...CARD, marginBottom: 16 }}>
                <div style={{ ...MONO, fontSize: 10, color: '#9CA3AF', marginBottom: 4 }}>{userDetail.usage.user?.email || 'N/A'}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
                  {userDetail.usage.user?.full_name || userDetail.usage.user?.username || 'User'}
                </div>
              </div>

              {/* KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 12, marginBottom: 16 }}>
                <div style={{ ...CARD, borderTop: `3px solid ${A}` }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', ...MONO }}>Current Month</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginTop: 4 }}>{fmt$(userDetail.usage.mtd_cost)}</div>
                </div>
                <div style={{ ...CARD, borderTop: '3px solid #16A34A' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', ...MONO }}>Lifetime</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginTop: 4 }}>{fmt$(userDetail.billing.total_lifetime_cost)}</div>
                </div>
              </div>

              {/* Usage by service */}
              <div style={{ ...CARD, marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 12 }}>
                  Usage by Service
                </div>
                {userDetail.usage.by_service?.length === 0 && (
                  <div style={{ color: '#9CA3AF', fontSize: 12 }}>No usage data</div>
                )}
                {userDetail.usage.by_service && userDetail.usage.by_service.length > 0 && (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                      <thead>
                        <tr style={{ borderBottom: `2px solid #E5E7EB` }}>
                          {['Service', 'Unit Type', 'Units', 'Cost'].map(h => (
                            <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: '#9CA3AF', ...MONO }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {userDetail.usage.by_service.map((s, i) => (
                          <tr key={s.service} style={{ borderBottom: BD, background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                            <td style={{ padding: '8px', fontWeight: 500, color: '#111827', textTransform: 'capitalize' }}>{s.service}</td>
                            <td style={{ padding: '8px', color: '#6B7280', fontSize: 10 }}>{s.unit_type}</td>
                            <td style={{ padding: '8px', color: '#6B7280', textAlign: 'right', ...MONO, fontSize: 10 }}>{fmtNum(s.total_units)}</td>
                            <td style={{ padding: '8px', fontWeight: 600, color: '#111827', textAlign: 'right' }}>{fmt$(s.total_cost)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Organizations used by this user */}
              <div style={{ ...CARD }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 12 }}>
                  Organizations
                </div>
                {userDetail.billing.organizations?.length === 0 && (
                  <div style={{ color: '#9CA3AF', fontSize: 12 }}>No organizations</div>
                )}
                {userDetail.billing.organizations && userDetail.billing.organizations.length > 0 && (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                      <thead>
                        <tr style={{ borderBottom: `2px solid #E5E7EB` }}>
                          {['Organization', 'Events', 'Cost'].map(h => (
                            <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: '#9CA3AF', ...MONO }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {userDetail.billing.organizations.map((o, i) => (
                          <tr key={o.organization_id} style={{ borderBottom: BD, background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                            <td style={{ padding: '8px', fontWeight: 500, color: '#111827' }}>{o.organization_name}</td>
                            <td style={{ padding: '8px', color: '#6B7280', fontSize: 10 }}>{o.event_count}</td>
                            <td style={{ padding: '8px', fontWeight: 600, color: '#111827', textAlign: 'right' }}>{fmt$(o.total_cost)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAnalytics;
