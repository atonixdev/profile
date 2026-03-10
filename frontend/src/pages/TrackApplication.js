/**
 * TrackApplication — Public Application Status Tracker
 * Route: /track (NO AUTH REQUIRED)
 *
 * Candidates can look up their application by email + job ID to see:
 * - Current status
 * - Job title
 * - Submission date
 * - Last updated
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ACCENT = '#1F4788';

const STATUS_META = {
  submitted:   { label: 'Submitted',        color: '#58a6ff', bg: '#1a2a4a' },
  screening:   { label: 'Under Review',      color: '#d29922', bg: '#3a2a0a' },
  shortlisted: { label: 'Shortlisted',       color: '#3fb950', bg: '#0d2a15' },
  interview:   { label: 'Interview Stage',   color: '#a371f7', bg: '#2a1a4a' },
  evaluation:  { label: 'Evaluation',        color: '#f0883e', bg: '#3a1e0a' },
  offer:       { label: 'Offer Extended 🎉', color: '#3fb950', bg: '#0d2a15' },
  hired:       { label: 'Hired 🎊',          color: '#3fb950', bg: '#0d2a15' },
  rejected:    { label: 'Not Selected',      color: '#f85149', bg: '#3d1515' },
  withdrawn:   { label: 'Withdrawn',         color: '#8b949e', bg: '#21262d' },
};

function StatusBadge({ statusKey }) {
  const meta = STATUS_META[statusKey] || { label: statusKey, color: '#8b949e', bg: '#21262d' };
  return (
    <span
      style={{
        display: 'inline-block',
        background: meta.bg,
        color: meta.color,
        border: `1px solid ${meta.color}40`,
        borderRadius: 20,
        padding: '6px 18px',
        fontSize: 15,
        fontWeight: 600,
      }}
    >
      {meta.label}
    </span>
  );
}

export default function TrackApplication() {
  const [email, setEmail] = useState('');
  const [jobId, setJobId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const params = new URLSearchParams({ email: email.trim(), job_id: jobId.trim() });
      const resp = await fetch(`/api/employment/applications/track/?${params}`);
      const data = await resp.json();

      if (resp.ok) {
        setResult(data);
      } else if (resp.status === 404) {
        setError('No application found with that email and job ID. Please double-check your details.');
      } else {
        setError(data.error || 'Failed to look up your application. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fmtDate = iso => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e6edf3', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: ACCENT, padding: '40px 24px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 2, opacity: 0.8, marginBottom: 8 }}>
          AtonixDev
        </div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>Track Your Application</h1>
        <p style={{ margin: '12px 0 0', fontSize: 16, opacity: 0.85 }}>
          Enter your email and Job ID to look up your application status.
        </p>
      </div>

      <div style={{ maxWidth: 560, margin: '48px auto', padding: '0 24px' }}>
        {/* Form */}
        <div
          style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: 12,
            padding: '32px',
          }}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#8b949e' }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 8,
                  border: '1px solid #30363d',
                  background: '#0d1117',
                  color: '#e6edf3',
                  fontSize: 15,
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#8b949e' }}>
                Job ID
              </label>
              <input
                type="text"
                required
                value={jobId}
                onChange={e => setJobId(e.target.value)}
                placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 8,
                  border: '1px solid #30363d',
                  background: '#0d1117',
                  color: '#e6edf3',
                  fontSize: 15,
                  boxSizing: 'border-box',
                  fontFamily: 'monospace',
                  outline: 'none',
                }}
              />
              <div style={{ marginTop: 5, fontSize: 12, opacity: 0.5 }}>
                Found in the confirmation email you received after applying.
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: loading ? '#2d333b' : ACCENT,
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                cursor: loading ? 'default' : 'pointer',
              }}
            >
              {loading ? 'Looking up…' : 'Check Status'}
            </button>
          </form>

          {error && (
            <div
              style={{
                marginTop: 20,
                background: '#3d1515',
                border: '1px solid #f85149',
                borderRadius: 8,
                padding: '14px 16px',
                color: '#f85149',
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Result */}
        {result && (
          <div
            style={{
              marginTop: 24,
              background: '#161b22',
              border: '1px solid #30363d',
              borderRadius: 12,
              padding: '28px',
            }}
          >
            <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 6 }}>Application for</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>{result.job_title}</div>

            <div style={{ marginBottom: 20, textAlign: 'center' }}>
              <StatusBadge statusKey={result.status} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Row label="Submitted" value={fmtDate(result.submitted_at)} />
              <Row label="Last Updated" value={fmtDate(result.updated_at)} />
            </div>

            <p style={{ marginTop: 20, fontSize: 13, opacity: 0.55, lineHeight: 1.6 }}>
              Our team reviews applications on a rolling basis. You'll be contacted via email
              at each stage of the process.
            </p>
          </div>
        )}

        <div style={{ marginTop: 32, textAlign: 'center', fontSize: 13, opacity: 0.5 }}>
          <Link to="/jobs" style={{ color: '#58a6ff', textDecoration: 'none' }}>
            ← View open positions
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 14,
        borderBottom: '1px solid #21262d',
        paddingBottom: 8,
      }}
    >
      <span style={{ opacity: 0.6 }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}
