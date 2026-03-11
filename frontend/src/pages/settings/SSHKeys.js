import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

// ── helpers ──────────────────────────────────────────────────────
const fmt = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const SHORT_FP = (fp) => {
  if (!fp) return '—';
  const idx = fp.indexOf(':');
  if (idx !== -1) {
    const b64 = fp.slice(idx + 1);
    return `${fp.slice(0, idx + 1)}${b64.slice(0, 8)}…${b64.slice(-4)}`;
  }
  return fp.length > 20 ? `${fp.slice(0, 10)}…${fp.slice(-6)}` : fp;
};

const STATUS_STYLE = {
  active:  { color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0' },
  expired: { color: '#92400E', background: '#FFFBEB', border: '1px solid #FDE68A' },
  revoked: { color: '#4B5563', background: '#F3F4F6', border: '1px solid #E5E7EB' },
};

const Badge = ({ status }) => (
  <span
    style={{
      display: 'inline-block',
      padding: '2px 8px',
      fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase', fontFamily: 'var(--font-mono)',
      ...(STATUS_STYLE[status] || STATUS_STYLE.active),
    }}
  >
    {status}
  </span>
);

const TABLE_COLS = ['Title', 'Fingerprint', 'Algorithm', 'Created', 'Expires', 'Status', 'Actions'];
const COL_WIDTHS = '2fr 2.5fr 1.2fr 1fr 1fr 0.9fr 1.4fr';

// ── inputs ────────────────────────────────────────────────────────
const Field = ({ label, children, hint }) => (
  <div style={{ marginBottom: 20 }}>
    <label
      style={{
        display: 'block', fontSize: 11, fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        color: '#1F2937', marginBottom: 6,
      }}
    >
      {label}
    </label>
    {children}
    {hint && (
      <div style={{ fontSize: 11, color: '#4B5563', marginTop: 5, lineHeight: 1.55 }}>
        {hint}
      </div>
    )}
  </div>
);

const inputBase = {
  width: '100%', padding: '10px 14px',
  border: '1px solid #D1D5DB', fontSize: 13,
  fontFamily: 'inherit', outline: 'none',
  color: '#111827', background: '#FFFFFF',
  boxSizing: 'border-box',
};

const ErrorBox = ({ message }) =>
  message ? (
    <div
      style={{
        padding: '10px 14px', background: '#FEF2F2',
        border: '1px solid #FECACA', borderLeft: '3px solid #DC2626',
        fontSize: 13, color: '#DC2626', marginBottom: 20, lineHeight: 1.55,
      }}
    >
      {message}
    </div>
  ) : null;

// ── inline confirm ────────────────────────────────────────────────
const ConfirmRow = ({ label, onConfirm, onCancel, danger }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
    <span style={{ fontSize: 11, color: '#4B5563' }}>{label}</span>
    <button
      onClick={onConfirm}
      style={{
        padding: '3px 10px', background: danger ? '#DC2626' : '#A81D37',
        color: '#FFF', border: 'none', fontSize: 10, fontWeight: 700,
        letterSpacing: '0.08em', cursor: 'pointer', fontFamily: 'inherit',
      }}
    >
      Confirm
    </button>
    <button
      onClick={onCancel}
      style={{
        padding: '3px 10px', background: 'none', color: '#4B5563',
        border: '1px solid #E5E7EB', fontSize: 10, fontWeight: 700,
        letterSpacing: '0.08em', cursor: 'pointer', fontFamily: 'inherit',
      }}
    >
      Cancel
    </button>
  </span>
);

// ── main component ────────────────────────────────────────────────
const SSHKeys = () => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', public_key: '', expires_at: '' });
  const [confirming, setConfirming] = useState(null); // { id, action: 'revoke'|'delete' }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/settings/ssh-keys/');
      setKeys(res.data);
    } catch {
      // silently fail — user sees empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.title.trim()) { setFormError('Title is required.'); return; }
    if (!form.public_key.trim()) { setFormError('Public key is required.'); return; }

    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        public_key: form.public_key.trim(),
        ...(form.expires_at ? { expires_at: new Date(form.expires_at).toISOString() } : {}),
      };
      await api.post('/api/v1/settings/ssh-keys/', payload);
      setForm({ title: '', public_key: '', expires_at: '' });
      await load();
    } catch (err) {
      const data = err?.response?.data;
      if (data?.public_key) setFormError(Array.isArray(data.public_key) ? data.public_key[0] : data.public_key);
      else if (data?.non_field_errors) setFormError(data.non_field_errors[0]);
      else if (data?.detail) setFormError(data.detail);
      else if (typeof data === 'string') setFormError(data);
      else setFormError('Failed to add SSH key. Please check the key format and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (id) => {
    try {
      await api.post(`/api/v1/settings/ssh-keys/${id}/revoke/`);
      setConfirming(null);
      await load();
    } catch (err) {
      setFormError(err?.response?.data?.detail || 'Failed to revoke key.');
      setConfirming(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/v1/settings/ssh-keys/${id}/`);
      setConfirming(null);
      await load();
    } catch (err) {
      setFormError(err?.response?.data?.detail || 'Failed to delete key.');
      setConfirming(null);
    }
  };

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: '#A81D37',
            fontFamily: 'var(--font-mono)', marginBottom: 8,
          }}
        >
          Developer Settings
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 6 }}>
          SSH Keys
        </h1>
        <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.65, maxWidth: 620 }}>
          Manage SSH public keys used to authenticate with AtonixDev repositories and services.
          Only public keys are stored — never paste your private key here.
        </p>
      </div>

      {/* Add form */}
      <div
        style={{
          background: '#FFFFFF', border: '1px solid #E5E7EB',
          padding: '28px 28px', marginBottom: 32,
        }}
      >
        <h2
          style={{
            fontSize: 13, fontWeight: 700, color: '#111827',
            letterSpacing: '0.04em', marginBottom: 24,
            paddingBottom: 12, borderBottom: '1px solid #F3F4F6',
          }}
        >
          Add an SSH Key
        </h2>

        <ErrorBox message={formError} />

        <form onSubmit={handleSubmit}>
          <Field label="Title">
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. MacBook Pro, Workstation – NYC"
              style={inputBase}
              autoComplete="off"
            />
          </Field>

          <Field
            label="Key"
            hint="Paste your public key (.pub file). Supported formats: ssh-rsa, ssh-ed25519, ecdsa-sha2-nistp256/384/521."
          >
            <div
              style={{
                padding: '8px 12px 4px',
                background: '#FFFBEB', border: '1px solid #FDE68A',
                fontSize: 11, color: '#92400E',
                marginBottom: 8, lineHeight: 1.5,
              }}
            >
              Only paste your public key. Never paste your private key here.
            </div>
            <textarea
              name="public_key"
              value={form.public_key}
              onChange={handleChange}
              placeholder="ssh-ed25519 AAAA... your-comment"
              rows={5}
              style={{ ...inputBase, resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: 12 }}
            />
          </Field>

          <Field label="Expiration Date (optional)">
            <input
              type="date"
              name="expires_at"
              value={form.expires_at}
              onChange={handleChange}
              style={{ ...inputBase, maxWidth: 220 }}
            />
          </Field>

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '10px 28px',
              background: submitting ? '#4B5563' : '#A81D37',
              color: '#FFFFFF', border: 'none',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', cursor: submitting ? 'default' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {submitting ? 'Adding…' : 'Add SSH Key'}
          </button>
        </form>
      </div>

      {/* Key list */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}
        >
          <h2 style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
            Your SSH Keys
            {keys.length > 0 && (
              <span
                style={{
                  marginLeft: 8, fontSize: 10, fontWeight: 700,
                  color: '#4B5563', fontFamily: 'var(--font-mono)',
                }}
              >
                ({keys.length})
              </span>
            )}
          </h2>
        </div>

        {/* Table header */}
        <div className="keys-table-scroll">
        <div
          style={{
            display: 'grid', gridTemplateColumns: COL_WIDTHS,
            padding: '10px 20px', background: '#F8F9FA',
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          {TABLE_COLS.map((col) => (
            <div
              key={col}
              style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: '#4B5563',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {col}
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: '#4B5563', fontSize: 13 }}>
            Loading…
          </div>
        ) : keys.length === 0 ? (
          <div style={{ padding: '56px 24px', textAlign: 'center' }}>
            <div style={{ width: 32, height: 2, background: '#E5E7EB', margin: '0 auto 20px' }} />
            <p style={{ fontSize: 14, fontWeight: 700, color: '#1F2937', marginBottom: 8 }}>
              You have no SSH keys yet
            </p>
            <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.65, maxWidth: 380, margin: '0 auto' }}>
              Add your first SSH key to authenticate with AtonixDev repositories and services.
            </p>
          </div>
        ) : (
          keys.map((key, i) => (
            <div
              key={key.id}
              style={{
                display: 'grid', gridTemplateColumns: COL_WIDTHS,
                padding: '13px 20px', alignItems: 'center',
                borderBottom: i < keys.length - 1 ? '1px solid #F3F4F6' : 'none',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{key.title}</div>
              <div
                style={{
                  fontSize: 11, color: '#4B5563',
                  fontFamily: 'var(--font-mono)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}
                title={key.fingerprint}
              >
                {SHORT_FP(key.fingerprint)}
              </div>
              <div style={{ fontSize: 11, color: '#4B5563', fontFamily: 'var(--font-mono)' }}>
                {key.algorithm}
              </div>
              <div style={{ fontSize: 12, color: '#4B5563' }}>{fmt(key.created_at)}</div>
              <div style={{ fontSize: 12, color: '#4B5563' }}>{fmt(key.expires_at)}</div>
              <div><Badge status={key.status} /></div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {confirming?.id === key.id ? (
                  <ConfirmRow
                    label={confirming.action === 'revoke' ? 'Revoke this key?' : 'Delete this key?'}
                    danger={confirming.action === 'delete'}
                    onConfirm={() =>
                      confirming.action === 'revoke'
                        ? handleRevoke(key.id)
                        : handleDelete(key.id)
                    }
                    onCancel={() => setConfirming(null)}
                  />
                ) : (
                  <>
                    {key.status === 'active' && (
                      <button
                        onClick={() => setConfirming({ id: key.id, action: 'revoke' })}
                        style={{
                          padding: '4px 12px', background: 'none',
                          border: '1px solid #E5E7EB', color: '#4B5563',
                          fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                          cursor: 'pointer', fontFamily: 'inherit',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#A81D37'; e.currentTarget.style.color = '#A81D37'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#4B5563'; }}
                      >
                        Revoke
                      </button>
                    )}
                    <button
                      onClick={() => setConfirming({ id: key.id, action: 'delete' })}
                      style={{
                        padding: '4px 12px', background: 'none',
                        border: '1px solid #E5E7EB', color: '#4B5563',
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#DC2626'; e.currentTarget.style.color = '#DC2626'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#4B5563'; }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
        </div>{/* end keys-table-scroll */}
      </div>
    </div>
  );
};

export default SSHKeys;
