import React, { useState, useEffect } from 'react';

const A    = '#A81D37';
const BD   = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px', borderRadius: 4 };
const MONO = { fontFamily: 'var(--font-mono)' };

const fmt$ = v => '$' + (parseFloat(v) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const DOC_TYPE_LABELS = {
  pitch_deck: 'Pitch Deck',
  compliance: 'Compliance',
  financial_report: 'Financial Report',
  legal: 'Legal',
  update: 'Investor Update',
  other: 'Other',
};

const ROLE_COLORS = {
  investor: '#2563EB',
  advisor: '#7C3AED',
  board_member: '#D97706',
  partner: '#16A34A',
};

const InvestorHub = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/portal/dashboard/investor/', { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: '40px 32px', color: '#6B7280', ...MONO, fontSize: 12 }}>Loading…</div>;
  if (error) return <div style={{ padding: '40px 32px', color: '#DC2626', ...MONO, fontSize: 12 }}>Error: {error}</div>;
  if (!data) return null;

  const ss = data.stakeholder_summary || {};
  const ds = data.document_summary || {};
  const stakeholders = data.stakeholders || [];
  const documents = data.documents || [];

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 28px) clamp(16px, 4vw, 32px)', maxWidth: 1440 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: A, ...MONO }}>INV</span>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Investor & Stakeholder Hub</h1>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Secure document repository and stakeholder management with encrypted communications</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14, marginBottom: 28 }}>
        <div style={{ ...CARD, borderTop: `3px solid #2563EB` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Stakeholders</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{ss.total || 0}</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>Active registry</div>
        </div>
        <div style={{ ...CARD, borderTop: `3px solid #16A34A` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Total Investment</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{fmt$(ss.total_investment)}</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>Cumulative</div>
        </div>
        <div style={{ ...CARD, borderTop: `3px solid #D97706` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Documents</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{ds.total || 0}</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>Secure repository</div>
        </div>
      </div>

      {/* Stakeholder + Documents Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 20 }}>
        {/* Stakeholder Registry */}
        <div style={CARD}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>
            Stakeholder Registry
          </div>
          {stakeholders.length === 0 ? (
            <div style={{ fontSize: 12, color: '#9CA3AF', padding: '16px 0', textAlign: 'center' }}>No stakeholders registered yet</div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {stakeholders.map(s => (
                <div key={s.id} style={{ padding: '12px', border: BD, borderRadius: 4, background: '#F9FAFB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{s.name}</span>
                    <span style={{
                      fontSize: 8, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                      padding: '2px 6px', borderRadius: 2,
                      background: `${ROLE_COLORS[s.role] || '#6B7280'}18`,
                      color: ROLE_COLORS[s.role] || '#6B7280', ...MONO,
                    }}>{s.role?.replace('_', ' ')}</span>
                  </div>
                  {s.company && <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 4 }}>{s.company}</div>}
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#16A34A' }}>{fmt$(s.investment)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Document Repository */}
        <div style={CARD}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>
            Document Repository
          </div>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {d.confidential && (
                      <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.10em', color: '#DC2626', ...MONO, padding: '2px 5px', background: '#FEF2F2', borderRadius: 2, border: '1px solid #FECACA' }}>
                        CONFIDENTIAL
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Role Distribution */}
      {ss.by_role && Object.keys(ss.by_role).length > 0 && (
        <div style={{ ...CARD, marginTop: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 14 }}>
            Stakeholder Distribution by Role
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {Object.entries(ss.by_role).map(([role, count]) => (
              <div key={role} style={{ padding: '10px 16px', border: BD, borderRadius: 4, background: '#F9FAFB', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: ROLE_COLORS[role] || '#374151' }}>{count}</div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginTop: 4 }}>{role.replace('_', ' ')}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorHub;
