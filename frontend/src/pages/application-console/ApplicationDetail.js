/**
 * ApplicationDetail — Full application view with status pipeline + interview history
 * Route: /application-console/applications/:applicationId
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ApplicationConsoleLayout from '../../components/Layout/ApplicationConsoleLayout';

const ACCENT = '#1F4788';

const STATUS_COLORS = {
  submitted: '#8b5cf6',
  screening: '#f59e0b',
  shortlisted: '#3b82f6',
  interview: '#06b6d4',
  evaluation: '#ec4899',
  offer: '#10b981',
  hired: '#14b8a6',
  rejected: '#ef4444',
  withdrawn: '#6b7280',
};

const STATUS_SEQUENCE = [
  'submitted', 'screening', 'shortlisted', 'interview', 'evaluation', 'offer', 'hired'
];

function StatusBadge({ status }) {
  return (
    <span
      style={{
        background: STATUS_COLORS[status] || '#64748b',
        color: '#fff',
        borderRadius: 20,
        padding: '4px 12px',
        fontSize: 12,
        fontWeight: 600,
        textTransform: 'capitalize',
      }}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

function DocumentCard({ doc }) {
  const icons = { cv: '📄', portfolio: '🖼', cover: '✉️', certificate: '🏅', other: '📎' };
  const icon = icons[doc.doc_type] || '📎';

  return (
    <a
      href={doc.file}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'block',
        background: '#112240',
        border: '1px solid #1e3a5f',
        borderRadius: 8,
        padding: 12,
        textDecoration: 'none',
        color: 'inherit',
        transition: 'border-color 0.2s',
        cursor: 'pointer',
      }}
      onMouseOver={e => e.target.style.borderColor = ACCENT}
      onMouseOut={e => e.target.style.borderColor = '#1e3a5f'}
    >
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 13 }}>{doc.original_name}</div>
      <div style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>
        {doc.doc_type.replace('_', ' ').toUpperCase()} • {doc.file_size ? `${Math.round(doc.file_size / 1024)} KB` : 'N/A'}
      </div>
    </a>
  );
}

function InterviewCard({ interview }) {
  const formatMap = {
    video: '📹',
    phone: '☎️',
    chat: '💬',
    coding: '⌨️',
    in_person: '🤝',
    document: '📄',
  };
  const icon = formatMap[interview.format] || '📅';

  return (
    <div style={{
      background: '#112240',
      border: '1px solid #1e3a5f',
      borderRadius: 8,
      padding: 12,
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
    }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 13 }}>
          Round {interview.round} — {interview.format.replace('_', ' ').toUpperCase()}
        </div>
        {interview.scheduled_at && (
          <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>
            📅 {new Date(interview.scheduled_at).toLocaleDateString()} at {new Date(interview.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} <br />
            ⏱ {interview.duration_minutes} minutes
          </div>
        )}
        {interview.meeting_link && (
          <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>
            <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer" style={{ color: ACCENT, textDecoration: 'none' }}>
              → Join meeting
            </a>
          </div>
        )}
      </div>
      <StatusBadge status={interview.status} />
    </div>
  );
}

function EvaluationCard({ evaluation }) {
  const scores = [
    { label: 'Technical', val: evaluation.technical_score },
    { label: 'Communication', val: evaluation.communication_score },
    { label: 'Culture Fit', val: evaluation.culture_score },
    { label: 'Problem Solving', val: evaluation.problem_solving_score },
    { label: 'Experience', val: evaluation.experience_score },
  ];

  const scoreBg = (score) => {
    if (!score) return '#1e3a5f';
    if (score >= 8) return '#10b981';
    if (score >= 6) return '#3b82f6';
    if (score >= 4) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{
      background: '#112240',
      border: '1px solid #1e3a5f',
      borderRadius: 8,
      padding: 14,
    }}>
      <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 13, marginBottom: 12 }}>
        Evaluation by {evaluation.evaluator_name || 'Unknown'}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 8,
        marginBottom: 12,
      }}>
        {scores.map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>{s.label}</div>
            <div style={{
              background: scoreBg(s.val),
              color: '#fff',
              borderRadius: 6,
              padding: '2px 8px',
              fontWeight: 700,
              fontSize: 18,
            }}>
              {s.val || '—'}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottom: '1px solid #1e3a5f',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
            Recommendation
          </div>
          <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 13 }}>
            {evaluation.recommendation.replace('_', ' ').toUpperCase()}
          </div>
        </div>
        {evaluation.admin_decision !== 'pending' && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
              Admin Decision
            </div>
            <StatusBadge status={evaluation.admin_decision} />
          </div>
        )}
      </div>

      {evaluation.strengths && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ color: '#10b981', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>✓ Strengths</div>
          <div style={{ color: '#cbd5e1', fontSize: 12, lineHeight: '1.5' }}>{evaluation.strengths}</div>
        </div>
      )}

      {evaluation.weaknesses && (
        <div>
          <div style={{ color: '#ef4444', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>✗ Weaknesses</div>
          <div style={{ color: '#cbd5e1', fontSize: 12, lineHeight: '1.5' }}>{evaluation.weaknesses}</div>
        </div>
      )}
    </div>
  );
}

export default function ApplicationDetail() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showMoveStageModal, setShowMoveStageModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!applicationId) return;

    Promise.all([
      fetch(`/api/employment/applications/${applicationId}/`, { credentials: 'include' }).then(r => r.json()),
    ])
      .then(([appData]) => {
        setApp(appData);
        setInterviews(appData.interviews || []);
        setEvaluations(appData.evaluations || []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [applicationId]);

  const moveToStage = async () => {
    if (!selectedStatus) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/employment/applications/${applicationId}/move_to_stage/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: selectedStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setApp(updated);
        setShowMoveStageModal(false);
        setSelectedStatus('');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ApplicationConsoleLayout>
        <div style={{ color: '#94a3b8', padding: 40, fontSize: 14 }}>Loading…</div>
      </ApplicationConsoleLayout>
    );
  }

  if (error || !app) {
    return (
      <ApplicationConsoleLayout>
        <div style={{ color: '#f87171', padding: 40 }}>
          {error ? `Error: ${error}` : 'Application not found'}
        </div>
      </ApplicationConsoleLayout>
    );
  }

  const currentStatusIdx = STATUS_SEQUENCE.indexOf(app.status);

  return (
    <ApplicationConsoleLayout>
      <div style={{ padding: '20px 40px', background: '#060e1a', minHeight: '100vh', color: '#e2e8f0' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Link to="/application-console/ats" style={{ color: '#64748b', textDecoration: 'none', fontSize: 14, marginBottom: 12, display: 'inline-block' }}>
            ← Back to ATS
          </Link>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginTop: 12 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
                {app.first_name} {app.last_name}
              </h1>
              <div style={{ color: '#64748b', fontSize: 14, marginBottom: 8 }}>
                {app.email} • {app.phone}
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <StatusBadge status={app.status} />
                <span style={{ color: '#64748b', fontSize: 12 }}>
                  Applied {new Date(app.submitted_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => setShowMoveStageModal(true)}
                style={{
                  background: ACCENT,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 20px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                📍 Move to Stage
              </button>
              {interviews.length > 0 && interviews[0].id && (
                <Link
                  to={`/application-console/interviews/${interviews[0].id}/room`}
                  style={{
                    background: '#1e3a5f',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 20px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 13,
                    textDecoration: 'none',
                    textAlign: 'center',
                  }}
                >
                  📹 Enter Interview Room
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Modal */}
        {showMoveStageModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
          }}>
            <div style={{
              background: '#112240',
              borderRadius: 12,
              padding: 24,
              width: '100%',
              maxWidth: 400,
              border: `1px solid #1e3a5f`,
            }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Move to Stage</h2>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0a1628',
                  border: '1px solid #1e3a5f',
                  color: '#e2e8f0',
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: 13,
                  marginBottom: 16,
                }}
              >
                <option value="">Select next stage…</option>
                {STATUS_SEQUENCE.map(s => (
                  <option key={s} value={s} disabled={STATUS_SEQUENCE.indexOf(s) <= currentStatusIdx}>
                    {s.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setShowMoveStageModal(false)}
                  style={{
                    flex: 1,
                    background: '#1e3a5f',
                    color: '#e2e8f0',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 14px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={moveToStage}
                  disabled={!selectedStatus || submitting}
                  style={{
                    flex: 1,
                    background: selectedStatus && !submitting ? ACCENT : '#1e3a5f',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 14px',
                    cursor: selectedStatus && !submitting ? 'pointer' : 'not-allowed',
                    fontWeight: 600,
                  }}
                >
                  {submitting ? 'Moving…' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Candidate Info Section */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: '#93c5fd' }}>Candidate Information</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            background: '#112240',
            border: '1px solid #1e3a5f',
            borderRadius: 8,
            padding: 16,
          }}>
            <div>
              <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Position
              </div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{app.job_title || 'Job Title'}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Location
              </div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{app.location || 'Not specified'}</div>
            </div>
            {app.linkedin_url && (
              <div>
                <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  LinkedIn
                </div>
                <a href={app.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: ACCENT, textDecoration: 'none', fontSize: 14 }}>
                  → View Profile
                </a>
              </div>
            )}
            {app.github_url && (
              <div>
                <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  GitHub
                </div>
                <a href={app.github_url} target="_blank" rel="noopener noreferrer" style={{ color: ACCENT, textDecoration: 'none', fontSize: 14 }}>
                  → View Profile
                </a>
              </div>
            )}
            {app.portfolio_url && (
              <div>
                <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Portfolio
                </div>
                <a href={app.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ color: ACCENT, textDecoration: 'none', fontSize: 14 }}>
                  → View Portfolio
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Documents */}
        {app.documents && app.documents.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: '#93c5fd' }}>📄 Documents</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              {app.documents.map(doc => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </div>
          </div>
        )}

        {/* Status Pipeline */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: '#93c5fd' }}>Status Pipeline</h2>
          <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 8 }}>
            {STATUS_SEQUENCE.map((s, idx) => (
              <React.Fragment key={s}>
                <div
                  style={{
                    background: STATUS_COLORS[s],
                    color: '#fff',
                    borderRadius: 20,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    opacity: idx <= currentStatusIdx ? 1 : 0.4,
                  }}
                >
                  {s.replace('_', ' ')}
                </div>
                {idx < STATUS_SEQUENCE.length - 1 && (
                  <div style={{ color: idx < currentStatusIdx ? ACCENT : '#1e3a5f', fontSize: 20, margin: '0 2px' }}>→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Screening Answers */}
        {app.screening_answers && Object.keys(app.screening_answers).length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: '#93c5fd' }}>Screening Answers</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Object.entries(app.screening_answers).map(([q, a], i) => (
                <div key={i} style={{ background: '#112240', border: '1px solid #1e3a5f', borderRadius: 8, padding: 14 }}>
                  <div style={{ color: '#93c5fd', fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Q: {q}</div>
                  <div style={{ color: '#cbd5e1', fontSize: 14, lineHeight: '1.6' }}>A: {a}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interviews */}
        {interviews.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: '#93c5fd' }}>📹 Interview History</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {interviews.map(iv => (
                <InterviewCard key={iv.id} interview={iv} />
              ))}
            </div>
          </div>
        )}

        {/* Evaluations */}
        {evaluations.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: '#93c5fd' }}>🎯 Evaluations</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {evaluations.map(ev => (
                <EvaluationCard key={ev.id} evaluation={ev} />
              ))}
            </div>
          </div>
        )}
      </div>
    </ApplicationConsoleLayout>
  );
}
