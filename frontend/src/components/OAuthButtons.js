import React, { useState } from 'react';
import api from '../services/api';

// Enterprise SVG icons for each provider
const ICONS = {
  github: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#181717" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.29 9.42 7.86 10.94.57.1.78-.25.78-.56v-2c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.33.95.1-.74.4-1.24.72-1.53-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.44-2.28 1.17-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.14 1.18a10.9 10.9 0 0 1 2.86-.39c.97 0 1.94.13 2.86.39 2.17-1.49 3.13-1.18 3.13-1.18.63 1.58.24 2.75.12 3.04.73.8 1.17 1.83 1.17 3.08 0 4.41-2.69 5.38-5.25 5.66.41.36.78 1.06.78 2.14v3.17c0 .31.2.67.79.56C20.22 21.42 23.5 17.1 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  ),
  gitlab: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#FC6D26" aria-hidden="true">
      <path d="M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 0 0-.867 0L16.418 9.45H7.582L4.918 1.263a.455.455 0 0 0-.867 0L1.386 9.45.044 13.587a.924.924 0 0 0 .331 1.023L12 23.054l11.625-8.443a.924.924 0 0 0 .33-1.024z" />
    </svg>
  ),
  linkedin: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true">
      <path d="M20.447 20.452H17.2v-5.569c0-1.328-.024-3.037-1.851-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.967V9h3.102v1.561h.043c.431-.817 1.484-1.679 3.054-1.679 3.268 0 3.871 2.15 3.871 4.945l-.001 6.625h-.589zM5.337 7.433a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6zm1.556 13.019H3.779V9h3.114v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  google: (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.615 24 12.255 24z" />
      <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09z" />
      <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.64 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
    </svg>
  ),
};

const PROVIDERS = [
  { key: 'github',   label: 'GitHub',   hoverBg: '#f0f0f0', border: '#D1D5DB' },
  { key: 'gitlab',   label: 'GitLab',   hoverBg: '#fff3ec', border: '#D1D5DB' },
  { key: 'linkedin', label: 'LinkedIn', hoverBg: '#e8f0fb', border: '#D1D5DB' },
  { key: 'google',   label: 'Google',   hoverBg: '#fef9ec', border: '#D1D5DB' },
];

/**
 * OAuthButtons
 *
 * Props:
 *   mode   — 'signin' | 'signup'  (affects button label prefix)
 *   layout — 'icon' (default, 2×2 grid) | 'stacked' (full-width buttons)
 */
export default function OAuthButtons({ mode = 'signin', layout = 'icon' }) {
  const [loading, setLoading] = useState(null); // provider key while redirecting
  const [error, setError]     = useState('');
  const verb = mode === 'signup' ? 'Sign up with' : 'Continue with';

  const handleOAuth = async (provider) => {
    setError('');
    setLoading(provider);
    try {
      const { data } = await api.get(`/accounts/oauth/${provider}/init/`);
      // Store provider in sessionStorage — read by /oauth/callback page
      sessionStorage.setItem('oauth_provider', provider);
      sessionStorage.setItem('oauth_state',    data.state);
      // Redirect user to provider authorization page
      window.location.href = data.auth_url;
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        `${provider.charAt(0).toUpperCase() + provider.slice(1)} login is not available right now.`;
      setError(msg);
      setLoading(null);
    }
  };

  return (
    <div>
      {/* Divider */}
      <div
        style={{
          display:       'flex',
          alignItems:    'center',
          gap:           '10px',
          marginBottom:  '16px',
          marginTop:     '4px',
        }}
      >
        <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
        <span style={{ fontSize: '11px', color: '#4B5563', fontWeight: 600, letterSpacing: '0.06em' }}>
          OR
        </span>
        <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
      </div>

      {error && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#991B1B',
            padding: '8px 12px',
            marginBottom: '12px',
            fontSize: '12px',
            borderRadius: '4px',
          }}
        >
          {error}
        </div>
      )}

      {layout === 'stacked' ? (
        /* ── Full-width stacked buttons (Docker-style) ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '4px' }}>
          {PROVIDERS.map((p) => (
            <button
              key={p.key}
              onClick={() => handleOAuth(p.key)}
              disabled={!!loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                width: '100%', padding: '11px 14px',
                background: 'transparent',
                border: '1px solid #D1D5DB',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading && loading !== p.key ? 0.4 : 1,
                fontFamily: 'inherit', fontSize: '13px', fontWeight: 600,
                color: '#1F2937', letterSpacing: '0.01em',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = p.hoverBg; e.currentTarget.style.borderColor = '#4B5563'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
              aria-label={`${verb} ${p.label}`}
            >
              {loading === p.key ? (
                <span style={{ width: 20, height: 20, border: '2px solid #D1D5DB', borderTopColor: '#4B5563', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
              ) : ICONS[p.key]}
              <span>{verb} {p.label}</span>
            </button>
          ))}
        </div>
      ) : (
        /* ── Icon grid (original) ── */
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
          {PROVIDERS.map((p) => (
            <button
              key={p.key}
              onClick={() => handleOAuth(p.key)}
              disabled={!!loading}
              title={`${verb} ${p.label}`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent', border: `1px solid ${p.border}`,
                borderRadius: '8px', padding: '10px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading && loading !== p.key ? 0.4 : 1,
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = p.hoverBg; e.currentTarget.style.borderColor = '#4B5563'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = p.border; }}
              aria-label={`${verb} ${p.label}`}
            >
              {loading === p.key ? (
                <span style={{ width: 20, height: 20, border: '2px solid #D1D5DB', borderTopColor: '#4B5563', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
              ) : ICONS[p.key]}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
