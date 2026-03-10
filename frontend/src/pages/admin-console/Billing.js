import React from 'react';

const A = '#D4AF37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#F9FAFB', border: BD, padding: '20px 24px' };

const PLANS = [
  { id: 'SUB-001', user: 'clara.m@atonix.io',    plan: 'Pro',        status: 'Active',  mrr: '$49',  next: '2026-04-01' },
  { id: 'SUB-002', user: 'tobias@atonix.io',      plan: 'Pro',        status: 'Active',  mrr: '$49',  next: '2026-04-01' },
  { id: 'SUB-003', user: 'dev@atonix.io',         plan: 'Enterprise', status: 'Active',  mrr: '$249', next: '2026-04-01' },
  { id: 'SUB-004', user: 'mihail@external.io',    plan: 'Starter',    status: 'Active',  mrr: '$12',  next: '2026-04-05' },
  { id: 'SUB-005', user: 'zara.a@atonix.io',      plan: 'Pro',        status: 'Past Due', mrr: '$49', next: '2026-03-01' },
  { id: 'SUB-006', user: 'priya@atonix.io',       plan: 'Starter',    status: 'Active',  mrr: '$12',  next: '2026-04-09' },
];

const PLAN_COLOR = { Pro: '#A78BFA', Enterprise: A, Starter: '#38BDF8' };
const STATUS_COLOR = { Active: '#22C55E', 'Past Due': '#EF4444', Cancelled: '#4B5563' };

export default function Billing() {
  return (
    <div style={{ padding: '32px 36px', color: '#1F2937', minHeight: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', color: A, textTransform: 'uppercase', marginBottom: 6 }}>
            BIL — Billing & Subscription Management
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111827' }}>Financial Operations</h1>
          <p style={{ fontSize: 13, color: '#4B5563', margin: '6px 0 0' }}>
            Manage subscription plans, invoices, payment methods, and revenue metrics.
          </p>
        </div>
        <button
          style={{
            padding: '9px 20px', background: A, border: 'none', color: '#06080D',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          View Invoices
        </button>
      </div>

      {/* MRR + stats */}
      <div className="console-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Monthly Recurring',  value: '$2,418',  delta: '↑ 14% MoM',   color: A      },
          { label: 'Active Subscriptions', value: '312',   delta: '98.1% healthy', color: '#22C55E' },
          { label: 'Pending Invoices',    value: '7',      delta: '$343 pending', color: '#F59E0B' },
          { label: 'Past Due',            value: '2',      delta: '$98 overdue',  color: '#EF4444' },
        ].map((s) => (
          <div key={s.label} style={CARD}>
            <div style={{ fontSize: 11, color: '#4B5563', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#4B5563', marginTop: 4 }}>{s.delta}</div>
          </div>
        ))}
      </div>

      {/* Plan breakdown */}
      <div className="console-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { plan: 'Starter',    price: '$12/mo',  seats: 187,  color: '#38BDF8' },
          { plan: 'Pro',        price: '$49/mo',  seats: 109,  color: '#A78BFA' },
          { plan: 'Enterprise', price: '$249/mo', seats: 16,   color: A         },
        ].map((p) => (
          <div key={p.plan} style={{ ...CARD, borderColor: `${p.color}33` }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{p.plan}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: p.color, marginBottom: 6 }}>{p.price}</div>
            <div style={{ fontSize: 11, color: '#4B5563' }}>{p.seats} active seats</div>
          </div>
        ))}
      </div>

      {/* Subscriptions table */}
      <div style={{ background: '#FFFFFF', border: BD }}>
        <div style={{ padding: '14px 20px', borderBottom: BD }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>Active Subscriptions (top 6)</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Sub ID', 'User', 'Plan', 'Status', 'MRR', 'Next Billing', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1F2937', borderBottom: BD, fontFamily: 'var(--font-mono)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PLANS.map((s) => (
              <tr
                key={s.id}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#F0F9FF')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '11px 20px', fontSize: 11, color: '#1F2937', fontFamily: 'var(--font-mono)' }}>{s.id}</td>
                <td style={{ padding: '11px 20px', fontSize: 12, color: '#4B5563' }}>{s.user}</td>
                <td style={{ padding: '11px 20px' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: PLAN_COLOR[s.plan] || '#4B5563' }}>{s.plan}</span>
                </td>
                <td style={{ padding: '11px 20px' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: STATUS_COLOR[s.status] || '#4B5563', fontFamily: 'var(--font-mono)' }}>{s.status}</span>
                </td>
                <td style={{ padding: '11px 20px', fontSize: 12, color: '#111827', fontWeight: 700 }}>{s.mrr}</td>
                <td style={{ padding: '11px 20px', fontSize: 11, color: '#4B5563' }}>{s.next}</td>
                <td style={{ padding: '11px 20px' }}>
                  <button style={{ fontSize: 10, padding: '4px 10px', cursor: 'pointer', background: 'transparent', border: BD, color: A, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.06em' }}>
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
