import React, { useState, useEffect } from 'react';

const A = '#A81D37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px', borderRadius: 4 };
const MONO = { fontFamily: 'var(--font-mono)' };

const ComplianceAuditView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/finance/dashboard/compliance-audit/', { credentials: 'include' })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: '40px', color: '#6B7280', ...MONO }}>Loading…</div>;
  if (error) return <div style={{ padding: '40px', color: '#DC2626', ...MONO }}>Error: {error}</div>;
  if (!data) return null;

  const comp = data.compliance || {};
  const audit = data.audit || {};
  const checks = comp.checks || [];
  const logs = audit.recent_logs || [];

  const statusColor = comp.non_compliant > 0 ? '#DC2626' : '#16A34A';

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 28px) clamp(16px, 4vw, 32px)', maxWidth: 1440 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: A, ...MONO }}>CMP</span>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Compliance & Audit Dashboard</h1>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Regulatory compliance, audit trails, and risk assessment</p>
      </div>

      {/* Compliance Status KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 16, marginBottom: 28 }}>
        <div style={{ ...CARD, borderTop: `3px solid ${statusColor}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 8 }}>Compliant</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#16A34A' }}>{comp.compliant}</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>Passed checks</div>
        </div>

        <div style={{ ...CARD, borderTop: `3px solid #DC2626` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 8 }}>Non-Compliant</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#DC2626' }}>{comp.non_compliant}</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>Requires remediation</div>
        </div>

        <div style={{ ...CARD, borderTop: `3px solid #D97706` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 8 }}>In Review</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#D97706' }}>{comp.in_review}</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>Under assessment</div>
        </div>

        <div style={{ ...CARD, borderTop: `3px solid #DC2626` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 8 }}>High Severity Events</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#DC2626' }}>{audit.high_severity_count}</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>In audit log</div>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))', gap: 20 }}>
        {/* Compliance Checks */}
        <div style={CARD}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>
            Recent Compliance Checks
          </div>
          {checks.length === 0 ? (
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>No checks on record</div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {checks.slice(0, 5).map((c, i) => {
                const statusColor = c.status === 'compliant' ? '#16A34A' : c.status === 'non_compliant' ? '#DC2626' : '#D97706';
                return (
                  <div key={i} style={{ paddingBottom: 10, borderBottom: i < checks.slice(0, 5).length - 1 ? BD : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 4 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>{c.framework}</div>
                        <div style={{ fontSize: 10, color: '#6B7280', marginTop: 2 }}>{c.check_name}</div>
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', background: statusColor + '22', color: statusColor, borderRadius: 2, ...MONO, textTransform: 'uppercase' }}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </div>
                    {c.risk_level > 0 && (
                      <div style={{ fontSize: 9, color: '#6B7280', marginTop: 4 }}>Risk: {c.risk_level}/100</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Audit Events */}
        <div style={CARD}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>
            Recent Audit Events
          </div>
          {logs.length === 0 ? (
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>No audit events</div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {logs.slice(0, 5).map((log, i) => {
                const severityColor = log.severity === 'critical' ? '#DC2626' : log.severity === 'high' ? '#DC2626' : log.severity === 'medium' ? '#D97706' : '#6B7280';
                return (
                  <div key={i} style={{ paddingBottom: 10, borderBottom: i < logs.slice(0, 5).length - 1 ? BD : 'none' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'start' }}>
                      <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 4px', background: severityColor + '22', color: severityColor, borderRadius: 2, ...MONO, minWidth: 50, textAlign: 'center' }}>
                        {log.severity}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#374151' }}>{log.action}</div>
                        {log.target && <div style={{ fontSize: 9, color: '#6B7280', marginTop: 2 }}>{log.target}</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplianceAuditView;
