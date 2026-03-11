/* ---- REWRITTEN: live API integration ---- */
import React, { useState, useEffect } from 'react';

const A  = '#A81D37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px', borderRadius: 4 };
const MONO = { fontFamily: 'var(--font-mono)' };

const SEVERITY_COLOR = { LOW: '#16A34A', MEDIUM: '#D97706', HIGH: '#DC2626', INFO: '#2563EB' };

// Static compliance controls — no backend
const COMPLIANCE_ITEMS = [
  { id: 1, framework: 'SOC 2 Type II',       status: 'compliant', lastAudit: '2024-01-15', nextAudit: '2025-01-15', controls: 47, passed: 47 },
  { id: 2, framework: 'PCI-DSS Level 2',      status: 'compliant', lastAudit: '2024-02-01', nextAudit: '2025-02-01', controls: 12, passed: 12 },
  { id: 3, framework: 'GDPR',                 status: 'compliant', lastAudit: '2024-03-10', nextAudit: '2025-03-10', controls: 8,  passed: 8  },
  { id: 4, framework: 'ISO 27001',            status: 'pending',   lastAudit: '2023-11-01', nextAudit: '2024-11-01', controls: 35, passed: 33 },
  { id: 5, framework: 'CCPA',                 status: 'compliant', lastAudit: '2024-01-20', nextAudit: '2025-01-20', controls: 6,  passed: 6  },
  { id: 6, framework: 'Invoice Retention',    status: 'compliant', lastAudit: '2024-04-01', nextAudit: '2024-10-01', controls: 3,  passed: 3  },
];

const fmtTs = iso => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
};

const shortId = id => String(id).slice(0, 8).toUpperCase();

const COMP_COLOR = { compliant: '#16A34A', pending: '#D97706', 'non-compliant': '#DC2626' };

const Compliance = () => {
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [sevF, setSevF]         = useState('ALL');
  const [tab, setTab]           = useState('audit');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: 200 });
    if (sevF !== 'ALL') params.set('severity', sevF.toLowerCase());
    fetch(`/api/billing/audit/?${params}`, { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setAuditLog(Array.isArray(d) ? d : (d.results || [])); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [sevF]);

  const highCount = auditLog.filter(e => (e.severity || '').toLowerCase() === 'high').length;
  const compliCount = COMPLIANCE_ITEMS.filter(c => c.status === 'compliant').length;

  return (
    <div style={{ padding: 'clamp(14px, 3.5vw, 28px) clamp(14px, 3.5vw, 32px)', maxWidth: 1280 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: A, ...MONO }}>AUD</span>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Audit & Compliance</h1>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Audit trail, governance controls, and compliance posture reporting.</p>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Audit Events',       value: loading ? '…' : auditLog.length, accent: '#2563EB' },
          { label: 'High Severity',      value: loading ? '…' : highCount,       accent: '#DC2626' },
          { label: 'Controls Compliant', value: `${compliCount} / ${COMPLIANCE_ITEMS.length}`, accent: '#16A34A' },
          { label: 'Audit Trail',        value: 'IMMUTABLE',                     accent: '#9CA3AF' },
        ].map(s => (
          <div key={s.label} style={{ ...CARD, borderTop: `3px solid ${s.accent}` }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', ...MONO }}>{s.label}</div>
            <div style={{ fontSize: s.label === 'Audit Trail' ? 13 : 22, fontWeight: 700, color: '#111827', marginTop: 4 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: BD, marginBottom: 20 }}>
        {[{ k: 'audit', label: 'Audit Log' }, { k: 'compliance', label: 'Compliance Controls' }].map(t => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            style={{ padding: '10px 20px', fontSize: 12, fontWeight: tab === t.k ? 700 : 400, color: tab === t.k ? A : '#6B7280', background: 'none', border: 'none', borderBottom: tab === t.k ? `2px solid ${A}` : '2px solid transparent', cursor: 'pointer', marginBottom: -1, letterSpacing: '0.01em' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Audit Log tab */}
      {tab === 'audit' && (
        <div style={CARD}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {['ALL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'].map(s => (
                <button
                  key={s}
                  onClick={() => setSevF(s)}
                  style={{ padding: '5px 10px', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', ...MONO, textTransform: 'uppercase', border: `1px solid ${sevF === s ? (SEVERITY_COLOR[s] || A) : '#E5E7EB'}`, background: sevF === s ? `${(SEVERITY_COLOR[s] || A)}12` : '#fff', color: sevF === s ? (SEVERITY_COLOR[s] || A) : '#6B7280', cursor: 'pointer', borderRadius: 3 }}
                >
                  {s}
                </button>
              ))}
            </div>
            <button style={{ padding: '6px 14px', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', ...MONO, textTransform: 'uppercase', border: BD, background: '#F9FAFB', color: '#374151', cursor: 'pointer', borderRadius: 3 }}>
              Export CSV
            </button>
          </div>

          {loading && <div style={{ color: '#6B7280', fontSize: 12, ...MONO, padding: '12px 0' }}>Loading…</div>}
          {error   && <div style={{ color: '#DC2626', fontSize: 12, ...MONO, padding: '12px 0' }}>Error: {error}</div>}

          {!loading && !error && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid #E5E7EB` }}>
                    {['ID', 'Timestamp', 'Actor', 'Action', 'Target', 'Severity', 'IP'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#9CA3AF', ...MONO, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {auditLog.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: '20px 12px', color: '#9CA3AF', fontSize: 12 }}>No audit events found.</td></tr>
                  )}
                  {auditLog.map((e, i) => {
                    const sev = (e.severity || 'info').toUpperCase();
                    return (
                      <tr key={e.id} style={{ borderBottom: BD, background: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                        <td style={{ padding: '10px 12px', ...MONO, fontSize: 10, color: '#9CA3AF' }}>{shortId(e.id)}</td>
                        <td style={{ padding: '10px 12px', ...MONO, fontSize: 10, color: '#6B7280', whiteSpace: 'nowrap' }}>{fmtTs(e.created_at)}</td>
                        <td style={{ padding: '10px 12px', fontSize: 11, color: '#374151' }}>{e.actor_label}</td>
                        <td style={{ padding: '10px 12px', ...MONO, fontSize: 10, fontWeight: 700, color: '#111827', letterSpacing: '0.04em' }}>{e.action}</td>
                        <td style={{ padding: '10px 12px', fontSize: 11, color: '#374151' }}>{e.target}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', background: `${SEVERITY_COLOR[sev] || '#9CA3AF'}18`, color: SEVERITY_COLOR[sev] || '#9CA3AF', borderRadius: 3, ...MONO, letterSpacing: '0.06em' }}>
                            {sev}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', ...MONO, fontSize: 10, color: '#9CA3AF' }}>{e.ip_address || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ marginTop: 12, fontSize: 11, color: '#9CA3AF', ...MONO }}>
            {auditLog.length} events · Immutable audit trail
          </div>
        </div>
      )}

      {/* Compliance Controls tab (static) */}
      {tab === 'compliance' && (
        <div style={CARD}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>
            Governance Controls
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid #E5E7EB` }}>
                  {['Framework', 'Status', 'Controls', 'Last Audit', 'Next Audit'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#9CA3AF', ...MONO, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPLIANCE_ITEMS.map((c, i) => {
                  const col = COMP_COLOR[c.status] || '#9CA3AF';
                  return (
                    <tr key={c.id} style={{ borderBottom: BD, background: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                      <td style={{ padding: '12px 12px', fontWeight: 600, color: '#111827' }}>{c.framework}</td>
                      <td style={{ padding: '12px 12px' }}>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', background: `${col}18`, color: col, borderRadius: 3, ...MONO, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 12px', color: '#374151', fontSize: 11 }}>
                        {c.passed} / {c.controls} passed
                      </td>
                      <td style={{ padding: '12px 12px', color: '#6B7280', fontSize: 11 }}>{c.lastAudit}</td>
                      <td style={{ padding: '12px 12px', color: '#6B7280', fontSize: 11 }}>{c.nextAudit}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compliance;
