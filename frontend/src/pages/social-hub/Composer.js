import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const A    = '#D4AF37';
const BD   = '1px solid #E5E7EB';
const MONO = { fontFamily: 'var(--font-mono)' };

const PLATFORM_LABELS = {
  linkedin: 'LinkedIn', facebook: 'Facebook', instagram: 'Instagram',
  twitter: 'X (Twitter)', tiktok: 'TikTok', youtube: 'YouTube',
};

const CHAR_LIMITS = {
  linkedin: 3000, facebook: 63206, instagram: 2200,
  twitter: 280, tiktok: 300, youtube: 5000,
};

function Label({ children, required }) {
  return (
    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, ...MONO, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#374151', marginBottom: 6 }}>
      {children}{required && <span style={{ color: '#EF4444', marginLeft: 3 }}>*</span>}
    </label>
  );
}

function InputStyle(extra = {}) {
  return {
    width: '100%', boxSizing: 'border-box', padding: '10px 12px',
    border: BD, background: '#FFFFFF', fontSize: 13, color: '#111827',
    fontFamily: 'inherit', outline: 'none', ...extra,
  };
}

export default function SocialHubComposer() {
  const navigate = useNavigate();
  const [accounts, setAccounts]         = useState([]);
  const [bundles, setBundles]           = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [title, setTitle]               = useState('');
  const [body, setBody]                 = useState('');
  const [bundleId, setBundleId]         = useState('');
  const [scheduledAt, setScheduledAt]   = useState('');
  const [previewPlatform, setPreviewPlatform] = useState('');
  const [saving, setSaving]             = useState('');   // 'draft' | 'schedule' | 'publish'
  const [error, setError]               = useState('');

  const loadData = useCallback(async () => {
    try {
      const [accsRes, bundlesRes] = await Promise.all([
        fetch('/api/social/accounts/', { credentials: 'include' }),
        fetch('/api/social/media/bundles/', { credentials: 'include' }).catch(() => null),
      ]);
      if (accsRes.ok) setAccounts(await accsRes.json());
      if (bundlesRes?.ok) setBundles(await bundlesRes.json());
    } catch (_) {}
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const activeAccounts = accounts.filter(a => a.status === 'active' && a.token_healthy);

  function toggleAccount(accId) {
    setSelectedAccounts(prev =>
      prev.includes(accId) ? prev.filter(id => id !== accId) : [...prev, accId]
    );
  }

  async function handleSubmit(mode) {
    if (!body.trim()) { setError('Post body is required.'); return; }
    if (selectedAccounts.length === 0) { setError('Select at least one account to post to.'); return; }
    if (mode === 'schedule' && !scheduledAt) { setError('Scheduled time is required to schedule a post.'); return; }
    setSaving(mode);
    setError('');
    try {
      const payload = {
        title: title.trim() || null,
        body: body.trim(),
        target_account_ids: selectedAccounts,
        ...(bundleId ? { media_bundle_id: bundleId } : {}),
        ...(mode === 'schedule' ? { scheduled_at: scheduledAt } : {}),
      };
      const r = await fetch('/api/social/posts/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || JSON.stringify(data));

      if (mode === 'publish') {
        // Immediately publish
        const pr = await fetch(`/api/social/posts/${data.id}/publish`, {
          method: 'POST', credentials: 'include',
        });
        if (!pr.ok) throw new Error('Post created but publish request failed.');
      }

      navigate('/social-hub/posts');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving('');
    }
  }

  const previewBody = (platform) => {
    const limit = CHAR_LIMITS[platform];
    if (!body) return <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Post body will appear here…</span>;
    const truncated = limit && body.length > limit ? body.slice(0, limit) + '…' : body;
    return truncated;
  };

  const bodyLength = body.length;
  const minLimit   = selectedAccounts.reduce((min, id) => {
    const acc = accounts.find(a => a.id === id);
    const lim = acc ? CHAR_LIMITS[acc.platform] : Infinity;
    return Math.min(min, lim);
  }, Infinity);
  const overLimit  = isFinite(minLimit) && bodyLength > minLimit;

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px) clamp(16px, 4vw, 36px)', color: '#1F2937', minHeight: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 9, ...MONO, letterSpacing: '0.14em', color: A, textTransform: 'uppercase', marginBottom: 6 }}>
          Social Hub / Posts / New
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111827' }}>Create Post</h1>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '6px 0 0' }}>Compose and schedule content across all connected platforms.</p>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#991B1B' }}>
          {error}
          <button onClick={() => setError('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#991B1B' }}>×</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 24 }}>

        {/* LEFT: Composer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Title */}
          <div style={{ background: '#FFFFFF', border: BD, padding: '20px 22px' }}>
            <Label>Title (optional)</Label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Optional title for internal reference…"
              style={InputStyle()}
            />
          </div>

          {/* Body */}
          <div style={{ background: '#FFFFFF', border: BD, padding: '20px 22px' }}>
            <Label required>Post Body</Label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write your post here…"
              rows={8}
              style={{ ...InputStyle({ resize: 'vertical', lineHeight: '1.6' }), color: overLimit ? '#EF4444' : '#111827' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, ...MONO }}>
              <span style={{ color: overLimit ? '#EF4444' : '#9CA3AF' }}>
                {bodyLength.toLocaleString()} characters
                {isFinite(minLimit) && ` / ${minLimit.toLocaleString()} limit`}
              </span>
              {overLimit && (
                <span style={{ color: '#EF4444', fontWeight: 700 }}>Exceeds platform limit — will be truncated</span>
              )}
            </div>
          </div>

          {/* Media bundle */}
          <div style={{ background: '#FFFFFF', border: BD, padding: '20px 22px' }}>
            <Label>Media Bundle (optional)</Label>
            <select
              value={bundleId}
              onChange={e => setBundleId(e.target.value)}
              style={InputStyle({ cursor: 'pointer' })}
            >
              <option value="">— No media —</option>
              {bundles.map(b => (
                <option key={b.id} value={b.id}>{b.name || `Bundle ${b.id.slice(0, 8)}`}</option>
              ))}
            </select>
            <p style={{ fontSize: 10, color: '#9CA3AF', margin: '8px 0 0' }}>
              Upload media in the Media Library then create a bundle to attach here.
            </p>
          </div>

          {/* Schedule */}
          <div style={{ background: '#FFFFFF', border: BD, padding: '20px 22px' }}>
            <Label>Schedule for later (optional)</Label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={e => setScheduledAt(e.target.value)}
              min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
              style={InputStyle()}
            />
            <p style={{ fontSize: 10, color: '#9CA3AF', margin: '8px 0 0' }}>
              Leave blank to save as a draft. Use "Schedule" button to confirm scheduling.
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => handleSubmit('draft')}
              disabled={!!saving}
              style={{
                padding: '10px 20px', background: '#FFFFFF', border: BD,
                fontSize: 11, fontWeight: 700, cursor: 'pointer', color: '#374151', ...MONO,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving === 'draft' ? 'Saving…' : 'Save Draft'}
            </button>
            <button
              onClick={() => handleSubmit('schedule')}
              disabled={!!saving}
              style={{
                padding: '10px 20px', background: '#1D4ED8', border: 'none',
                fontSize: 11, fontWeight: 700, cursor: 'pointer', color: '#FFFFFF', ...MONO,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving === 'schedule' ? 'Scheduling…' : 'Schedule'}
            </button>
            <button
              onClick={() => handleSubmit('publish')}
              disabled={!!saving}
              style={{
                padding: '10px 20px', background: A, border: 'none',
                fontSize: 11, fontWeight: 700, cursor: 'pointer', color: '#06080D', ...MONO,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving === 'publish' ? 'Publishing…' : 'Publish Now'}
            </button>
          </div>
        </div>

        {/* RIGHT: Platforms + Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Account selector */}
          <div style={{ background: '#FFFFFF', border: BD, padding: '20px 22px' }}>
            <Label required>Target Accounts</Label>
            {activeAccounts.length === 0 ? (
              <div style={{ fontSize: 12, color: '#EF4444' }}>
                No active accounts. Connect accounts first in the Accounts section.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeAccounts.map(acc => {
                  const checked = selectedAccounts.includes(acc.id);
                  const limit = CHAR_LIMITS[acc.platform];
                  return (
                    <label
                      key={acc.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                        padding: '8px 10px', border: checked ? `1px solid ${A}` : BD,
                        background: checked ? `${A}10` : '#FAFAFA',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAccount(acc.id)}
                        style={{ width: 14, height: 14, accentColor: A }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>
                          {acc.account_name}
                        </div>
                        <div style={{ fontSize: 10, color: '#6B7280', ...MONO }}>
                          {PLATFORM_LABELS[acc.platform]} · {limit ? `${limit.toLocaleString()} char limit` : 'No limit'}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Platform preview */}
          {selectedAccounts.length > 0 && (
            <div style={{ background: '#FFFFFF', border: BD, padding: '20px 22px' }}>
              <Label>Per-Platform Preview</Label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                {selectedAccounts.map(id => {
                  const acc = accounts.find(a => a.id === id);
                  if (!acc) return null;
                  return (
                    <button
                      key={id}
                      onClick={() => setPreviewPlatform(prev => prev === acc.platform ? '' : acc.platform)}
                      style={{
                        padding: '4px 10px', border: BD,
                        background: previewPlatform === acc.platform ? '#111827' : '#F3F4F6',
                        color: previewPlatform === acc.platform ? '#FFFFFF' : '#374151',
                        fontSize: 9, fontWeight: 700, cursor: 'pointer', ...MONO, textTransform: 'uppercase',
                      }}
                    >
                      {PLATFORM_LABELS[acc.platform]}
                    </button>
                  );
                })}
              </div>
              {previewPlatform ? (
                <div style={{ background: '#F9FAFB', border: BD, padding: '14px 16px' }}>
                  <div style={{ fontSize: 9, ...MONO, color: '#6B7280', letterSpacing: '0.08em', marginBottom: 8, textTransform: 'uppercase' }}>
                    {PLATFORM_LABELS[previewPlatform]} preview
                  </div>
                  <div style={{ fontSize: 13, color: '#111827', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {previewBody(previewPlatform)}
                  </div>
                  {CHAR_LIMITS[previewPlatform] && (
                    <div style={{ fontSize: 9, ...MONO, color: '#9CA3AF', marginTop: 8 }}>
                      {Math.min(bodyLength, CHAR_LIMITS[previewPlatform])} / {CHAR_LIMITS[previewPlatform]} characters
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>Click a platform button to preview.</div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
