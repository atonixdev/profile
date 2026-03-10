import React, { useEffect, useRef, useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import AtonixDevLogo from '../components/AtonixDevLogo';

const PROVIDER_LABELS = {
  github:   'GitHub',
  gitlab:   'GitLab',
  linkedin: 'LinkedIn',
  google:   'Google',
};

export default function OAuthCallback() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const { setUser } = useContext(AuthContext);
  const handled     = useRef(false);

  const [phase, setPhase]   = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const params   = new URLSearchParams(location.search);
    const code     = params.get('code');
    const urlState = params.get('state');
    const error    = params.get('error');

    // Provider stored in sessionStorage by OAuthButtons
    const provider    = sessionStorage.getItem('oauth_provider') || '';
    const savedState  = sessionStorage.getItem('oauth_state')    || '';

    // Clean up sessionStorage
    sessionStorage.removeItem('oauth_provider');
    sessionStorage.removeItem('oauth_state');

    // Provider denied access
    if (error) {
      const denied = error === 'access_denied';
      setPhase('error');
      setMessage(denied ? 'Access was denied. You can close this and try again.' : `Provider error: ${error}`);
      return;
    }

    if (!provider) {
      setPhase('error');
      setMessage('OAuth session missing. Please try signing in again.');
      return;
    }

    if (!code) {
      setPhase('error');
      setMessage('No authorization code received. Please try again.');
      return;
    }

    // Validate state client-side (CSRF guard)
    if (!urlState || urlState !== savedState) {
      setPhase('error');
      setMessage('Security check failed (state mismatch). Please try again.');
      return;
    }

    (async () => {
      try {
        // Exchange code with backend (backend sets HttpOnly cookies)
        await api.post('/accounts/oauth/callback/', { provider, code, state: urlState });

        // Load user profile using the new cookie session
        const profileResp = await api.get('/accounts/profiles/me/');
        if (profileResp.data) setUser(profileResp.data);

        setPhase('success');
        setTimeout(() => navigate('/lab', { replace: true }), 800);
      } catch (err) {
        const detail =
          err?.response?.data?.detail ||
          'Authentication failed. Please try again.';
        setPhase('error');
        setMessage(detail);
      }
    })();
  }, [location.search, navigate, setUser]);

  const providerLabel = PROVIDER_LABELS[sessionStorage.getItem('oauth_provider')] || 'OAuth';

  return (
    <div
      style={{
        minHeight:      '100vh',
        background:     '#F9FAFB',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontFamily:     "'Inter', 'Segoe UI', sans-serif",
        padding:        '24px',
      }}
    >
      <div
        style={{
          background:   '#FFFFFF',
          border:       '1px solid #E5E7EB',
          borderRadius: '14px',
          padding:      '40px 32px',
          width:        '100%',
          maxWidth:     '360px',
          boxShadow:    '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)',
          textAlign:    'center',
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <AtonixDevLogo size={28} variant="dark" textColor="#111827" />
        </div>

        {phase === 'verifying' && (
          <>
            <div
              style={{
                width:        '36px',
                height:       '36px',
                border:       '3px solid #E5E7EB',
                borderTopColor: '#111827',
                borderRadius: '50%',
                animation:    'spin 0.75s linear infinite',
                margin:       '0 auto 20px',
              }}
            />
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: '0 0 6px' }}>
              Completing sign in
            </p>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
              Verifying your {providerLabel} account…
            </p>
          </>
        )}

        {phase === 'success' && (
          <>
            <div
              style={{
                width:        '40px',
                height:       '40px',
                background:   '#ECFDF5',
                border:       '1px solid #A7F3D0',
                borderRadius: '50%',
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'center',
                margin:       '0 auto 20px',
                fontSize:     '20px',
              }}
            >
              ✓
            </div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#065F46', margin: '0 0 6px' }}>
              Signed in successfully
            </p>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
              Redirecting to your dashboard…
            </p>
          </>
        )}

        {phase === 'error' && (
          <>
            <div
              style={{
                width:        '40px',
                height:       '40px',
                background:   '#FEF2F2',
                border:       '1px solid #FECACA',
                borderRadius: '50%',
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'center',
                margin:       '0 auto 20px',
                fontSize:     '20px',
              }}
            >
              ✕
            </div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#991B1B', margin: '0 0 8px' }}>
              Sign in failed
            </p>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 20px', lineHeight: 1.6 }}>
              {message}
            </p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              style={{
                background:   '#111827',
                border:       'none',
                color:        '#FFFFFF',
                padding:      '10px 24px',
                fontSize:     '12px',
                fontWeight:   700,
                cursor:       'pointer',
                fontFamily:   'inherit',
                letterSpacing: '0.06em',
              }}
            >
              Back to Sign In
            </button>
          </>
        )}

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}
