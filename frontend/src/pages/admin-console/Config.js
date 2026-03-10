import React, { useState } from 'react';

const A = '#D4AF37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#F9FAFB', border: BD, padding: '20px 24px' };

const SECTIONS = [
  {
    id: 'branding',
    label: 'Branding',
    fields: [
      { key: 'platform_name',   label: 'Platform Name',    value: 'AtonixDev', type: 'text' },
      { key: 'primary_color',   label: 'Primary Accent',   value: '#A81D37',   type: 'text' },
      { key: 'logo_url',        label: 'Logo URL',          value: '/logo.svg', type: 'text' },
      { key: 'favicon_url',     label: 'Favicon URL',       value: '/favicon.ico', type: 'text' },
    ],
  },
  {
    id: 'auth',
    label: 'Authentication',
    fields: [
      { key: 'allow_registration',  label: 'Open Registration',    value: 'Enabled',  type: 'toggle' },
      { key: 'mfa_required',        label: 'Require MFA',          value: 'Optional', type: 'select' },
      { key: 'session_duration',    label: 'Session Duration (hrs)', value: '24',      type: 'text' },
      { key: 'jwt_secret_rotation', label: 'JWT Secret Rotation',  value: 'Monthly',  type: 'select' },
    ],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    fields: [
      { key: 'github_app_id',   label: 'GitHub App ID',     value: 'gh-app-0041',   type: 'text' },
      { key: 'slack_webhook',   label: 'Slack Webhook',     value: 'https://hooks.slack.com/…', type: 'text' },
      { key: 'sentry_dsn',      label: 'Sentry DSN',        value: 'https://sentry.io/…',       type: 'text' },
      { key: 'openai_model',    label: 'Default AI Model',  value: 'gpt-4o',        type: 'text' },
    ],
  },
  {
    id: 'limits',
    label: 'Resource Limits',
    fields: [
      { key: 'max_projects',    label: 'Max Projects / User',  value: '20',   type: 'text' },
      { key: 'max_pipelines',   label: 'Max Pipelines / Proj', value: '10',   type: 'text' },
      { key: 'storage_limit',   label: 'Storage Per User (GB)', value: '50',  type: 'text' },
      { key: 'api_rate_limit',  label: 'API Rate Limit (rpm)', value: '1000', type: 'text' },
    ],
  },
];

export default function Config() {
  const [active, setActive] = useState('branding');
  const [saved, setSaved] = useState(false);

  const section = SECTIONS.find((s) => s.id === active);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ padding: '32px 36px', color: '#1F2937', minHeight: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', color: A, textTransform: 'uppercase', marginBottom: 6 }}>
            CFG — Platform Configuration
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111827' }}>Global Platform Settings</h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '6px 0 0' }}>
            Manage branding, authentication, integrations, and resource constraints.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {saved && (
            <span style={{ fontSize: 11, color: '#22C55E', fontFamily: 'var(--font-mono)' }}>✓ Saved</span>
          )}
          <button
            onClick={handleSave}
            style={{
              padding: '9px 20px', background: A, border: 'none', color: '#06080D',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="console-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Config Keys',      value: '36'  },
          { label: 'Active Integrations', value: '4' },
          { label: 'Environments',     value: '3'   },
          { label: 'Last Modified',    value: 'Today' },
        ].map((s) => (
          <div key={s.label} style={CARD}>
            <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Section tabs + form */}
      <div className="console-sidebar-grid" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              style={{
                padding: '10px 16px', textAlign: 'left', cursor: 'pointer',
                fontSize: 12, fontWeight: active === s.id ? 700 : 400,
                background: active === s.id ? 'rgba(212,175,55,0.08)' : 'transparent',
                border: 'none', borderLeft: active === s.id ? `2px solid ${A}` : '2px solid transparent',
                color: active === s.id ? '#FFFFFF' : '#4B5563', fontFamily: 'inherit',
                transition: 'color 0.15s, background 0.15s',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div style={{ background: '#FFFFFF', border: BD, padding: '28px 32px' }}>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', color: A, textTransform: 'uppercase', marginBottom: 20 }}>
            {section.label} Configuration
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {section.fields.map((f) => (
              <div key={f.key}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>
                  {f.label}
                </label>
                <input
                  defaultValue={f.value}
                  style={{
                    width: '100%', padding: '9px 12px',
                    background: '#FFFFFF',
                    border: BD, color: '#111827', fontSize: 13,
                    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                  }}
                />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24, fontSize: 11, color: '#374151', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
            Config version: v2.4.1 · Last updated: 2026-03-07 09:41 UTC
          </div>
        </div>
      </div>
    </div>
  );
}
