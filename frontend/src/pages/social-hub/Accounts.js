import React, { useEffect, useState, useCallback } from 'react';

const A    = '#D4AF37';
const CR   = '#A81D37';
const BD   = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px' };
const MONO = { fontFamily: 'var(--font-mono)' };

const PLATFORM_LABELS = {
  linkedin: 'LinkedIn', facebook: 'Facebook', instagram: 'Instagram',
  twitter: 'X (Twitter)', tiktok: 'TikTok', youtube: 'YouTube',
};
const ACC_STATUS_COLOR = { active: '#22C55E', revoked: '#EF4444', error: '#F59E0B' };

function ConnectButton({ platform, onConnect, connecting }) {
  return (
    <button
      onClick={() => onConnect(platform)}
      disabled={connecting === platform}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 18px', background: '#FFFFFF', border: BD,
        cursor: connecting === platform ? 'wait' : 'pointer',
        fontSize: 11, fontWeight: 700, color: '#374151', ...MONO,
        letterSpacing: '0.06em', textTransform: 'uppercase',
        opacity: connecting === platform ? 0.6 : 1,
      }}
    >
      {connecting === platform ? 'Redirecting…' : `+ Connect ${PLATFORM_LABELS[platform]}`}
    </button>
  );
}

export default function SocialHubAccounts() {
  const [accounts, setAccounts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [connecting, setConnecting] = useState('');
  const [deleting, setDeleting]     = useState('');
  const [error, setError]           = useState('');
  const [notice, setNotice]         = useState('');

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/social/accounts/', { credentials: 'include' });
      if (!r.ok) throw new Error('Failed to load accounts');
      setAccounts(await r.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check if this is an OAuth callback return
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    if (code && state) {
      handleOAuthCallback(code, state);
    } else {
      loadAccounts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleOAuthCallback(code, state) {
    setLoading(true);
    try {
      // Extract platform from state prefix (e.g., "linkedin:xyz")
      const platform = state.split(':')[0];
      const r = await fetch(`/api/social/oauth/${platform}/callback`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, state }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'OAuth callback failed');
      setNotice(`${PLATFORM_LABELS[platform] || platform} connected successfully.`);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } catch (e) {
      setError(e.message);
    } finally {
      await loadAccounts();
    }
  }

  async function handleConnect(platform) {
    setConnecting(platform);
    setError('');
    try {
      const r = await fetch(`/api/social/oauth/${platform}/initiate`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Could not initiate OAuth');
      window.location.href = data.oauth_url;
    } catch (e) {
      setError(e.message);
      setConnecting('');
    }
  }

  async function handleDisconnect(accountId, accountName) {
    if (!window.confirm(`Disconnect "${accountName}"? All associated post data will be preserved.`)) return;
    setDeleting(accountId);
    try {
      const r = await fetch(`/api/social/accounts/${accountId}/`, { method: 'DELETE', credentials: 'include' });
      if (!r.ok) throw new Error('Failed to disconnect account');
      setAccounts(prev => prev.filter(a => a.id !== accountId));
      setNotice(`${accountName} disconnected.`);
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting('');
    }
  }

  const connectedPlatforms = new Set(accounts.map(a => a.platform));

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px) clamp(16px, 4vw, 36px)', color: '#1F2937', minHeight: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 9, ...MONO, letterSpacing: '0.14em', color: A, textTransform: 'uppercase', marginBottom: 6 }}>
          Social Hub / Accounts
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111827' }}>Connected Accounts</h1>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '6px 0 0' }}>
          Manage your social media platform connections and OAuth tokens.
        </p>
      </div>

      {notice && (
        <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#166534' }}>
          {notice}
          <button onClick={() => setNotice('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#166534', fontSize: 14 }}>×</button>
        </div>
      )}

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#991B1B' }}>
          {error}
          <button onClick={() => setError('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#991B1B', fontSize: 14 }}>×</button>
        </div>
      )}

      {/* Connect new section */}
      <div style={{ ...CARD, marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 700, ...MONO, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#374151', marginBottom: 16 }}>
          Connect a Platform
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {Object.keys(PLATFORM_LABELS).map(platform => (
            <ConnectButton key={platform} platform={platform} onConnect={handleConnect} connecting={connecting} />
          ))}
        </div>
        <p style={{ fontSize: 11, color: '#9CA3AF', margin: '12px 0 0' }}>
          Connecting an account that is already linked will re-authorize and refresh the token.
        </p>
      </div>

      {/* Accounts list */}
      {loading ? (
        <div style={{ ...MONO, color: '#6B7280', fontSize: 12 }}>Loading accounts…</div>
      ) : accounts.length === 0 ? (
        <div style={{ ...CARD, color: '#6B7280', fontSize: 13 }}>
          No accounts connected yet. Use the buttons above to link your social media profiles.
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, ...MONO, letterSpacing: '0.1em', textTransform: 'uppercase', color: A, marginBottom: 14 }}>
            {accounts.length} Connected Account{accounts.length !== 1 ? 's' : ''}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {accounts.map(acc => (
              <div key={acc.id} style={{ ...CARD, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>

                {/* Avatar */}
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  background: '#F3F4F6', border: BD, overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {acc.avatar_url
                    ? <img src={acc.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 13, fontWeight: 700, color: '#374151', ...MONO }}>
                        {(PLATFORM_LABELS[acc.platform] || acc.platform).slice(0, 2).toUpperCase()}
                      </span>
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{acc.account_name}</div>
                  <div style={{ fontSize: 11, color: '#6B7280', ...MONO }}>
                    {PLATFORM_LABELS[acc.platform] || acc.platform}
                    {acc.account_handle ? ` · @${acc.account_handle}` : ''}
                    {acc.account_type ? ` · ${acc.account_type}` : ''}
                  </div>
                  {acc.account_external_id && (
                    <div style={{ fontSize: 10, color: '#9CA3AF', ...MONO }}>ID: {acc.account_external_id}</div>
                  )}
                </div>

                {/* Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', minWidth: 100 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, ...MONO, letterSpacing: '0.08em', textTransform: 'uppercase',
                    padding: '3px 8px',
                    color: ACC_STATUS_COLOR[acc.status] || '#6B7280',
                    background: `${ACC_STATUS_COLOR[acc.status] || '#6B7280'}18`,
                  }}>
                    {acc.status}
                  </span>
                  <span style={{
                    fontSize: 9, ...MONO,
                    color: acc.token_healthy ? '#22C55E' : '#EF4444',
                  }}>
                    Token: {acc.token_healthy ? 'valid' : 'expired/missing'}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleConnect(acc.platform)}
                    disabled={connecting === acc.platform}
                    style={{
                      padding: '7px 14px', background: 'none', border: BD,
                      cursor: 'pointer', fontSize: 10, fontWeight: 700, color: A, ...MONO,
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                    }}
                  >
                    Re-Auth
                  </button>
                  <button
                    onClick={() => handleDisconnect(acc.id, acc.account_name)}
                    disabled={deleting === acc.id}
                    style={{
                      padding: '7px 14px', background: 'none', border: `1px solid ${CR}`,
                      cursor: 'pointer', fontSize: 10, fontWeight: 700, color: CR, ...MONO,
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                    }}
                  >
                    {deleting === acc.id ? 'Removing…' : 'Disconnect'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Missing platforms */}
          {Object.keys(PLATFORM_LABELS).some(p => !connectedPlatforms.has(p)) && (
            <div style={{ marginTop: 16, padding: '12px 16px', background: '#FFFBEB', border: '1px solid #FDE68A', fontSize: 12, color: '#92400E' }}>
              <strong>Not connected:</strong>{' '}
              {Object.keys(PLATFORM_LABELS).filter(p => !connectedPlatforms.has(p)).map(p => PLATFORM_LABELS[p]).join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
