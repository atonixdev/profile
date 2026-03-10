import React, { useState } from 'react';

const A = '#D4AF37';
const BD = '1px solid #E5E7EB';
const CARD = { background: '#F9FAFB', border: BD, padding: '20px 24px' };

const SETTINGS = [
  {
    section: 'Platform',
    items: [
      { key: 'maintenance_mode',  label: 'Maintenance Mode',       type: 'toggle', value: false },
      { key: 'debug_mode',        label: 'Debug Mode',              type: 'toggle', value: false },
      { key: 'registration_open', label: 'Allow Registration',      type: 'toggle', value: true  },
      { key: 'max_upload_size',   label: 'Max Upload Size (MB)',    type: 'input',  value: '100' },
    ],
  },
  {
    section: 'Caching',
    items: [
      { key: 'cache_backend',   label: 'Cache Backend',   type: 'input', value: 'Redis' },
      { key: 'cache_ttl',       label: 'Default TTL (s)', type: 'input', value: '3600'  },
      { key: 'cache_max_mem',   label: 'Max Memory',       type: 'input', value: '512MB' },
    ],
  },
  {
    section: 'Storage',
    items: [
      { key: 'storage_backend',  label: 'Storage Backend',    type: 'input',  value: 'Local' },
      { key: 'media_root',       label: 'Media Root',          type: 'input',  value: '/backend/media/' },
      { key: 'static_root',      label: 'Static Root',         type: 'input',  value: '/backend/staticfiles/' },
    ],
  },
  {
    section: 'Jobs',
    items: [
      { key: 'cron_enabled',     label: 'Scheduled Jobs',     type: 'toggle', value: true     },
      { key: 'backup_schedule',  label: 'Backup Schedule',    type: 'input',  value: '0 2 * * *' },
      { key: 'log_retention',    label: 'Log Retention (days)', type: 'input', value: '90'     },
    ],
  },
];

export default function Settings() {
  const [toggles, setToggles] = useState({
    maintenance_mode: false,
    debug_mode: false,
    registration_open: true,
    cron_enabled: true,
  });
  const [saved, setSaved] = useState(false);

  const flip = (key) => setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div style={{ padding: '32px 36px', color: '#1F2937', minHeight: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', color: A, textTransform: 'uppercase', marginBottom: 6 }}>
            SYS — System Settings
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111827' }}>System Configuration</h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '6px 0 0' }}>
            Low-level platform controls: caching, storage, jobs, maintenance, and debug flags.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {saved && <span style={{ fontSize: 11, color: '#22C55E', fontFamily: 'var(--font-mono)' }}>✓ Saved</span>}
          <button
            onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}
            style={{
              padding: '9px 20px', background: A, border: 'none', color: '#06080D',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Save All
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Active Modules',  value: '11'   },
          { label: 'Scheduled Jobs',  value: '4'    },
          { label: 'Cache Status',    value: 'Warm' },
          { label: 'Storage Used',    value: '2.1GB' },
        ].map((s) => (
          <div key={s.label} style={CARD}>
            <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Setting sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {SETTINGS.map((sec) => (
          <div key={sec.section} style={{ background: '#FFFFFF', border: BD }}>
            <div style={{ padding: '12px 20px', borderBottom: BD }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: A, fontFamily: 'var(--font-mono)' }}>
                {sec.section}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {sec.items.map((item, idx) => (
                <div
                  key={item.key}
                  style={{
                    padding: '16px 20px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    borderBottom: idx < sec.items.length - 2 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                    borderRight: idx % 2 === 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}
                >
                  <label style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'inherit' }}>{item.label}</label>
                  {item.type === 'toggle' ? (
                    <button
                      onClick={() => flip(item.key)}
                      style={{
                        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                        background: toggles[item.key] ? A : 'rgba(255,255,255,0.1)',
                        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%',
                          background: '#FFFFFF', transition: 'left 0.2s',
                          left: toggles[item.key] ? 23 : 3,
                        }}
                      />
                    </button>
                  ) : (
                    <input
                      defaultValue={item.value}
                      style={{
                        background: '#FFFFFF', border: BD, color: '#111827',
                        fontSize: 12, padding: '5px 10px', outline: 'none',
                        fontFamily: 'var(--font-mono)', width: 160, textAlign: 'right',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
