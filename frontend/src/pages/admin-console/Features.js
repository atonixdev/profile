import React, { useState } from 'react';

const A = '#D4AF37';
const BD = '1px solid rgba(212,175,55,0.12)';
const CARD = { background: 'rgba(255,255,255,0.02)', border: BD, padding: '20px 24px' };

const INITIAL_FLAGS = [
  { id: 'ff-01', key: 'ai_chatbot',           name: 'AI Chatbot',             env: 'production',  enabled: true,  rollout: 100, desc: 'Enables the AI assistant widget across all user-facing views.' },
  { id: 'ff-02', key: 'new_pipeline_ui',       name: 'New Pipeline UI',        env: 'production',  enabled: true,  rollout: 100, desc: 'Migrated pipeline visualization with graph rendering.' },
  { id: 'ff-03', key: 'beta_ops_console',      name: 'Beta Ops Console',       env: 'staging',     enabled: true,  rollout: 100, desc: 'Operational control panel for staff users.' },
  { id: 'ff-04', key: 'admin_console_v2',      name: 'Admin Console v2',       env: 'production',  enabled: true,  rollout: 100, desc: 'Enterprise governance admin console with 11 modules.' },
  { id: 'ff-05', key: 'dark_mode',             name: 'Dark Mode',              env: 'staging',     enabled: false, rollout: 0,   desc: 'Global dark mode toggle for user dashboards.' },
  { id: 'ff-06', key: 'realtime_logs',         name: 'Realtime Logs',          env: 'staging',     enabled: true,  rollout: 20,  desc: 'Live-streaming log tailing in the pipeline and ops consoles.' },
  { id: 'ff-07', key: 'billing_portal',        name: 'Billing Self-Service',   env: 'development', enabled: false, rollout: 0,   desc: 'User-facing billing portal with plan upgrade and invoice download.' },
  { id: 'ff-08', key: 'two_factor_required',   name: 'Force 2FA on Admin',     env: 'production',  enabled: false, rollout: 0,   desc: 'Redirect admin users to MFA setup on first login.' },
];

const ENV_COLOR = { production: '#22C55E', staging: '#F59E0B', development: '#38BDF8' };

export default function Features() {
  const [flags, setFlags] = useState(INITIAL_FLAGS);
  const [filter, setFilter] = useState('All');

  const toggle = (id) =>
    setFlags((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    );

  const visible = filter === 'All' ? flags : flags.filter((f) => f.env === filter);

  return (
    <div style={{ padding: '32px 36px', color: '#F9FAFB', minHeight: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', color: A, textTransform: 'uppercase', marginBottom: 6 }}>
            FLG — Feature Flags & Internal Tools
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#FFFFFF' }}>Feature Flags</h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '6px 0 0' }}>
            Control feature availability per environment. Toggle flags, adjust rollout percentage, and stage releases.
          </p>
        </div>
        <button
          style={{
            padding: '9px 20px', background: A, border: 'none', color: '#06080D',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          + New Flag
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Flags',   value: flags.length },
          { label: 'Active',        value: flags.filter((f) => f.enabled).length },
          { label: 'In Staging',    value: flags.filter((f) => f.env === 'staging').length },
          { label: 'Partial Rollout', value: flags.filter((f) => f.rollout > 0 && f.rollout < 100).length },
        ].map((s) => (
          <div key={s.label} style={CARD}>
            <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#FFFFFF' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['All', 'production', 'staging', 'development'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '5px 14px', fontSize: 10, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase',
              background: filter === f ? A : 'transparent',
              border: filter === f ? `1px solid ${A}` : BD,
              color: filter === f ? '#06080D' : '#6B7280',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Flag list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {visible.map((flag) => (
          <div
            key={flag.id}
            style={{
              ...CARD,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderColor: flag.enabled ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.06)',
              padding: '16px 24px',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>{flag.name}</span>
                <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: ENV_COLOR[flag.env] || '#6B7280', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {flag.env}
                </span>
                {flag.rollout > 0 && flag.rollout < 100 && (
                  <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#F59E0B' }}>
                    {flag.rollout}% rollout
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: '#4B5563', marginBottom: 2 }}>{flag.desc}</div>
              <div style={{ fontSize: 10, color: '#374151', fontFamily: 'var(--font-mono)' }}>{flag.key}</div>
            </div>
            <button
              onClick={() => toggle(flag.id)}
              style={{
                width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
                background: flag.enabled ? A : 'rgba(255,255,255,0.1)',
                position: 'relative', transition: 'background 0.2s', flexShrink: 0, marginLeft: 24,
              }}
            >
              <span
                style={{
                  position: 'absolute', top: 3, width: 20, height: 20, borderRadius: '50%',
                  background: '#FFFFFF', transition: 'left 0.2s',
                  left: flag.enabled ? 25 : 3,
                }}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
