import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const BD   = '1px solid #E5E7EB';
const CARD = { background: '#F9FAFB', border: BD, padding: '24px' };

const STATUS_COLOR = {
  open:          '#22C55E',
  pending:       '#F59E0B',
  awaiting_user: '#60A5FA',
  escalated:     '#EF4444',
  resolved:      '#A78BFA',
  closed:        '#4B5563',
};

export default function Overview() {
  const [stats, setStats]   = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/support/tickets/stats/')
      .then((r) => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = stats.total || 0;
  const statusBreakdown = [
    { key: 'open',          label: 'Open',         desc: 'Awaiting first response' },
    { key: 'pending',       label: 'Pending',      desc: 'Agent replied, waiting on user' },
    { key: 'awaiting_user', label: 'Awaiting User',desc: 'Needs user confirmation' },
    { key: 'escalated',     label: 'Escalated',    desc: 'Requires urgent attention' },
    { key: 'resolved',      label: 'Resolved',     desc: 'Issue confirmed fixed' },
    { key: 'closed',        label: 'Closed',       desc: 'Archived tickets' },
  ];

  const resolutionRate = total > 0
    ? Math.round(((stats.resolved || 0) + (stats.closed || 0)) / total * 100)
    : 0;

  return (
    <div style={{ padding: '32px 36px', color: '#1F2937', minHeight: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', color: '#1B3A4B', textTransform: 'uppercase', marginBottom: 6 }}>
          ANL — Support Analytics
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111827' }}>Overview</h1>
        <p style={{ fontSize: 13, color: '#4B5563', margin: '6px 0 0' }}>
          Real-time ticket volume, resolution rates, and status distribution.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#4B5563' }}>Loading analytics…</div>
      ) : (
        <>
          {/* Top stats */}
          <div className="console-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Total Tickets',      value: stats.total     ?? 0, color: '#1B3A4B' },
              { label: 'Open Right Now',     value: stats.open      ?? 0, color: '#22C55E' },
              { label: 'Escalated',          value: stats.escalated ?? 0, color: '#EF4444' },
              { label: 'Resolution Rate',    value: `${resolutionRate}%`,  color: '#A78BFA' },
            ].map((s) => (
              <div key={s.label} style={CARD}>
                <div style={{ fontSize: 11, color: '#4B5563', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>{s.label}</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Status breakdown */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1F2937', fontFamily: 'var(--font-mono)', marginBottom: 16 }}>
              Status Breakdown
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {statusBreakdown.map((s) => {
                const count = stats[s.key] || 0;
                const pct   = total > 0 ? Math.round(count / total * 100) : 0;
                return (
                  <div key={s.key} style={{ ...CARD, borderLeft: `3px solid ${STATUS_COLOR[s.key]}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{s.label}</div>
                        <div style={{ fontSize: 11, color: '#4B5563', marginTop: 2 }}>{s.desc}</div>
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: STATUS_COLOR[s.key] }}>{count}</div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ height: 4, background: '#E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: STATUS_COLOR[s.key], borderRadius: 2, transition: 'width 0.6s ease' }} />
                    </div>
                    <div style={{ fontSize: 10, color: '#4B5563', marginTop: 4, fontFamily: 'var(--font-mono)' }}>{pct}% of total</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ background: '#F9FAFB', border: BD, padding: '20px 24px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1F2937', fontFamily: 'var(--font-mono)', marginBottom: 14 }}>Quick Actions</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="/support-console" style={{ padding: '9px 20px', background: '#1B3A4B', color: '#FFFFFF', textDecoration: 'none', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em' }}>View All Tickets</a>
              <a href="/support-console/escalated" style={{ padding: '9px 20px', background: '#EF4444', color: '#FFFFFF', textDecoration: 'none', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em' }}>Escalated ({stats.escalated ?? 0})</a>
              <a href="/support" style={{ padding: '9px 20px', background: 'transparent', border: BD, color: '#1F2937', textDecoration: 'none', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em' }}>Public Support Form →</a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
