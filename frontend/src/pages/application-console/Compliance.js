/**
 * Compliance & Audit Dashboard
 * 
 * Displays:
 * - Pipeline metrics (§4.5) — conversion rates, stage breakdown
 * - Audit log with CSV export (§4.4C)
 * - Data retention policy summary (§4.4D)
 * - GDPR/CCPA/POPIA compliance status
 */

import React, { useState, useEffect, useRef } from 'react';

const RETENTION_POLICY = {
  applications: '2 years (or until anonymized)',
  interviews: '1 year (notes redacted)',
  employees: '7 years (never deleted)',
  audit_logs: '1 year',
};

export default function Compliance() {
  const [metrics, setMetrics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalLogs, setTotalLogs] = useState(0);

  // Fetch metrics
  useEffect(() => {
    fetch('/api/employment/metrics/')
      .then(r => r.json())
      .then(data => {
        setMetrics(data);
        setMetricsLoading(false);
      })
      .catch(() => setMetricsLoading(false));
  }, []);

  // Fetch audit logs
  useEffect(() => {
    fetch(`/api/employment/audit/?page=${page}&page_size=${pageSize}`)
      .then(r => r.json())
      .then(data => {
        setLogs(data.results || []);
        setTotalLogs(data.count || 0);
        setLogsLoading(false);
      })
      .catch(() => setLogsLoading(false));
  }, [page, pageSize]);

  const handleCSVExport = () => {
    window.location.href = '/api/employment/audit/export/';
  };

  const totalPages = Math.ceil(totalLogs / pageSize);

  return (
    <div style={{ maxWidth: 1200 }}>
      <h1>Audit & Compliance</h1>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* Compliance Framework */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <Section title="Compliance Framework">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {[
            { label: 'GDPR', desc: 'Data export & anonymization on request' },
            { label: 'CCPA', desc: 'Candidate privacy & opt-out rights' },
            { label: 'POPIA', desc: 'South African data protection' },
            { label: 'Audit Trail', desc: 'All decisions logged & traceable' },
          ].map(({ label, desc }) => (
            <div key={label} style={{
              background: '#F0F9FF',
              border: '1px solid #0EA5E9',
              borderRadius: 6,
              padding: 16,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0369A1' }}>✓ {label}</div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{desc}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* Data Retention Policy */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <Section title="Data Retention Policy">
        <div style={{
          background: '#FFFFFF',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 8,
          padding: 24,
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <tbody>
              {Object.entries(RETENTION_POLICY).map(([key, value]) => (
                <tr key={key} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <td style={{ padding: 12, fontWeight: 600, width: '20%' }}>
                    {key.replace(/_/g, ' ').toUpperCase()}
                  </td>
                  <td style={{ padding: 12, color: '#475569' }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 12, marginBottom: 0 }}>
            Run <code>./manage.py employment_retention --execute</code> to enforce retention rules and anonymize PII.
          </p>
        </div>
      </Section>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* Pipeline Metrics (§4.5) */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <Section title="Pipeline Metrics">
        {metricsLoading ? (
          <p>Loading metrics...</p>
        ) : !metrics ? (
          <p>Error loading metrics</p>
        ) : (
          <>
            {/* Conversion funnel */}
            <div style={{ marginBottom: 32 }}>
              <h4 style={{ marginBottom: 12, fontSize: 14 }}>Conversion Rates</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {Object.entries(metrics.conversion_rates).map(([key, rate]) => (
                  <div key={key} style={{
                    background: '#FFFFFF',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: 8,
                    padding: 16,
                  }}>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                      {key.replace(/_/g, ' ')}
                    </div>
                    <div style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: rate > 50 ? '#10B981' : rate > 20 ? '#F59E0B' : '#EF4444',
                    }}>
                      {rate.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage breakdown */}
            <div style={{ marginBottom: 32 }}>
              <h4 style={{ marginBottom: 12, fontSize: 14 }}>Pipeline Breakdown</h4>
              <div style={{
                background: '#FFFFFF',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 8,
                padding: 24,
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <tbody>
                    {Object.entries(metrics.pipeline_stages).map(([status, count]) => {
                      const total = metrics.totals.applications || 1;
                      const pct = ((count / total) * 100).toFixed(0);
                      return (
                        <tr key={status} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                          <td style={{ padding: 12, fontWeight: 600, width: '25%' }}>
                            {status}
                          </td>
                          <td style={{ padding: 12 }}>
                            <div style={{
                              background: '#E5E7EB',
                              borderRadius: 4,
                              height: 24,
                              display: 'flex',
                              alignItems: 'center',
                              overflow: 'hidden',
                            }}>
                              <div style={{
                                background: '#0EA5E9',
                                height: '100%',
                                width: `${Math.max(5, parseInt(pct))}%`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontSize: 11,
                                fontWeight: 600,
                              }}>
                                {pct}%
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: 12, textAlign: 'right', fontWeight: 600 }}>
                            {count}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </Section>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* Audit Log with CSV Export */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <Section title="Audit Log (§4.4C)">
        <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={handleCSVExport}
            style={{
              padding: '8px 16px',
              fontSize: 12,
              fontWeight: 600,
              background: '#10B981',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            📥 Export to CSV
          </button>
          <span style={{ fontSize: 12, color: '#666' }}>
            {totalLogs} total events
          </span>
        </div>

        {logsLoading ? (
          <p>Loading audit log...</p>
        ) : (
          <div style={{
            background: '#FFFFFF',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 8,
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                  <th style={{ padding: 12, textAlign: 'left', fontWeight: 700 }}>Timestamp</th>
                  <th style={{ padding: 12, textAlign: 'left', fontWeight: 700 }}>Actor</th>
                  <th style={{ padding: 12, textAlign: 'left', fontWeight: 700 }}>Action</th>
                  <th style={{ padding: 12, textAlign: 'left', fontWeight: 700 }}>Resource</th>
                  <th style={{ padding: 12, textAlign: 'left', fontWeight: 700 }}>IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: 32, textAlign: 'center', color: '#999' }}>
                      No audit events
                    </td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      <td style={{ padding: 12 }}>
                        {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: 12, fontSize: 11 }}>
                        <span style={{ background: '#EEE', padding: '2px 6px', borderRadius: 3 }}>
                          {log.actor}
                        </span>
                      </td>
                      <td style={{ padding: 12, fontWeight: 600 }}>{log.action}</td>
                      <td style={{ padding: 12, fontSize: 11 }}>
                        {log.resource_type}:{log.resource_id}
                      </td>
                      <td style={{ padding: 12, fontSize: 11, color: '#999' }}>
                        {log.ip_address}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                background: '#F8FAFC',
                padding: 16,
                display: 'flex',
                justifyContent: 'center',
                gap: 8,
                borderTop: '1px solid rgba(0,0,0,0.08)',
              }}>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    style={{
                      padding: '6px 12px',
                      fontSize: 12,
                      background: page === i + 1 ? '#0EA5E9' : '#E5E7EB',
                      color: page === i + 1 ? '#fff' : '#333',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontWeight: page === i + 1 ? 600 : 400,
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 32 }}>
      <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 700 }}>{title}</h3>
      {children}
    </div>
  );
}
