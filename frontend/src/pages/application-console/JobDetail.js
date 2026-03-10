/**
 * JobDetail — Full job posting view with embedded applicant list
 * Route: /application-console/jobs/:jobId
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ApplicationConsoleLayout from '../../components/Layout/ApplicationConsoleLayout';

const ACCENT = '#1F4788';

const STATUS_COLORS = {
  draft: '#6b7280',
  open: '#10b981',
  paused: '#f59e0b',
  closed: '#ef4444',
};

const STATUS_BADGE_COLORS = {
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

function StatusBadge({ status, variant = "small" }) {
  return (
    <span
      style={{
        background: STATUS_BADGE_COLORS[status] || STATUS_COLORS[status] || '#64748b',
        color: '#fff',
        borderRadius: variant === "small" ? 12 : 20,
        padding: variant === "small" ? '2px 8px' : '4px 12px',
        fontSize: variant === "small" ? 11 : 12,
        fontWeight: 600,
        textTransform: 'capitalize',
        whiteSpace: 'nowrap',
      }}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

function ApplicationRow({ app }) {
  const statusMap = {
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

  return (
    <Link
      to={`/application-console/applications/${app.id}`}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1.2fr 0.8fr 1fr',
        gap: 12,
        alignItems: 'center',
        padding: '12px 14px',
        background: '#0a1628',
        border: '1px solid #1e3a5f',
        borderRadius: 8,
        textDecoration: 'none',
        color: 'inherit',
        transition: 'border-color 0.2s, background-color 0.2s',
        cursor: 'pointer',
      }}
      onMouseOver={e => {
        e.currentTarget.style.borderColor = ACCENT;
        e.currentTarget.style.background = '#112240';
      }}
      onMouseOut={e => {
        e.currentTarget.style.borderColor = '#1e3a5f';
        e.currentTarget.style.background = '#0a1628';
      }}
    >
      <div>
        <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 13 }}>
          {app.first_name} {app.last_name}
        </div>
        <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>{app.email}</div>
      </div>
      <div style={{ color: '#cbd5e1', fontSize: 12 }}>{app.phone || '—'}</div>
      <StatusBadge status={app.status} />
      <div style={{ color: '#64748b', fontSize: 11 }}>
        {new Date(app.submitted_at).toLocaleDateString()}
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={{ color: ACCENT, fontSize: 12, fontWeight: 600 }}>View →</span>
      </div>
    </Link>
  );
}

export default function JobDetail() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (!jobId) return;

    Promise.all([
      fetch(`/api/employment/jobs/${jobId}/`, { credentials: 'include' }).then(r => r.json()),
      fetch(`/api/employment/applications/?job=${jobId}`, { credentials: 'include' }).then(r => r.json()),
    ])
      .then(([jobData, appsData]) => {
        setJob(jobData);
        setFormData(jobData);
        setApplications(appsData.results || appsData || []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleStatusChange = async (newStatus) => {
    const res = await fetch(`/api/employment/jobs/${jobId}/close/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      const updated = await res.json();
      setJob(updated);
      setFormData(updated);
    }
  };

  if (loading) {
    return (
      <ApplicationConsoleLayout>
        <div style={{ color: '#94a3b8', padding: 40, fontSize: 14 }}>Loading…</div>
      </ApplicationConsoleLayout>
    );
  }

  if (error || !job) {
    return (
      <ApplicationConsoleLayout>
        <div style={{ color: '#f87171', padding: 40 }}>
          {error ? `Error: ${error}` : 'Job not found'}
        </div>
      </ApplicationConsoleLayout>
    );
  }

  const applicationsByStatus = {};
  applications.forEach(app => {
    if (!applicationsByStatus[app.status]) {
      applicationsByStatus[app.status] = [];
    }
    applicationsByStatus[app.status].push(app);
  });

  const statusOrder = ['submitted', 'screening', 'shortlisted', 'interview', 'evaluation', 'offer', 'hired', 'rejected'];

  return (
    <ApplicationConsoleLayout>
      <div style={{ padding: '20px 40px', background: '#060e1a', minHeight: '100vh', color: '#e2e8f0' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Link to="/application-console/jobs" style={{ color: '#64748b', textDecoration: 'none', fontSize: 14, marginBottom: 12, display: 'inline-block' }}>
            ← Back to Job Postings
          </Link>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginTop: 12, justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{job.title}</h1>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
                <div style={{ color: '#64748b', fontSize: 13 }}>
                  {job.department.charAt(0).toUpperCase() + job.department.slice(1)} • {job.job_type.replace('_', ' ')}
                </div>
                <span style={{ color: '#64748b' }}>•</span>
                <StatusBadge status={job.status} />
              </div>

              <div style={{ display: 'flex', gap: 24, color: '#cbd5e1', fontSize: 13 }}>
                <div>
                  <span style={{ color: '#64748b' }}>Experience: </span>{job.experience_level.replace('_', ' ').toUpperCase()}
                </div>
                {job.salary_min && (
                  <div>
                    <span style={{ color: '#64748b' }}>Salary: </span>
                    ${job.salary_min.toLocaleString()} - ${job.salary_max?.toLocaleString()} {job.salary_currency}
                  </div>
                )}
                {job.is_remote && (
                  <div>🌍 Remote</div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => handleStatusChange(job.status === 'open' ? 'closed' : 'open')}
                style={{
                  background: job.status === 'open' ? '#ef4444' : ACCENT,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 20px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                {job.status === 'open' ? '🔒 Close Posting' : '🔓 Open Posting'}
              </button>
              <button
                onClick={() => setEditMode(!editMode)}
                style={{
                  background: '#1e3a5f',
                  color: '#e2e8f0',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 20px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                ✏️ {editMode ? 'Done' : 'Edit'}
              </button>
            </div>
          </div>
        </div>

        {/* Key Info */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: '#93c5fd' }}>Position Overview</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            background: '#112240',
            border: '1px solid #1e3a5f',
            borderRadius: 8,
            padding: 20,
          }}>
            <div>
              <div style={{ color: '#64748b', fontSize: 11, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Total Applications
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#93c5fd' }}>
                {applications.length}
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: 11, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                In Interviews
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#06b6d4' }}>
                {applicationsByStatus['interview']?.length || 0}
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: 11, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Offers Sent
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>
                {applicationsByStatus['offer']?.length || 0}
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: 11, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Hired
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#14b8a6' }}>
                {applicationsByStatus['hired']?.length || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: '#93c5fd' }}>📋 Description</h2>
          <div style={{
            background: '#112240',
            border: '1px solid #1e3a5f',
            borderRadius: 8,
            padding: 16,
            color: '#cbd5e1',
            lineHeight: '1.7',
            fontSize: 14,
            whiteSpace: 'pre-wrap',
          }}>
            {job.description}
          </div>
        </div>

        {/* Requirements */}
        {job.requirements && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: '#93c5fd' }}>⚙️ Requirements</h2>
            <div style={{
              background: '#112240',
              border: '1px solid #1e3a5f',
              borderRadius: 8,
              padding: 16,
              color: '#cbd5e1',
              lineHeight: '1.7',
              fontSize: 14,
              whiteSpace: 'pre-wrap',
            }}>
              {job.requirements}
            </div>
          </div>
        )}

        {/* Screening Questions */}
        {job.screening_questions && job.screening_questions.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: '#93c5fd' }}>❓ Screening Questions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {job.screening_questions.map((q, i) => (
                <div key={i} style={{
                  background: '#112240',
                  border: '1px solid #1e3a5f',
                  borderRadius: 8,
                  padding: 12,
                  display: 'flex',
                  gap: 10,
                }}>
                  <span style={{ color: '#64748b', fontWeight: 700 }}>Q{i + 1}.</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 500 }}>{q.question}</div>
                    <div style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>
                      {q.required ? '✓ Required' : '○ Optional'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Applications by Stage */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: '#93c5fd' }}>👥 Applications</h2>

          {statusOrder.map(status => (
            applicationsByStatus[status] && applicationsByStatus[status].length > 0 && (
              <div key={status} style={{ marginBottom: 24 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 12,
                  paddingBottom: 10,
                  borderBottom: `2px solid ${STATUS_BADGE_COLORS[status]}`,
                }}>
                  <div style={{
                    background: STATUS_BADGE_COLORS[status],
                    color: '#fff',
                    borderRadius: 20,
                    padding: '4px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                  }}>
                    {status.replace('_', ' ')}
                  </div>
                  <span style={{ color: '#64748b', fontSize: 13 }}>
                    {applicationsByStatus[status].length} {applicationsByStatus[status].length === 1 ? 'candidate' : 'candidates'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {applicationsByStatus[status].map(app => (
                    <ApplicationRow key={app.id} app={app} />
                  ))}
                </div>
              </div>
            )
          ))}

          {applications.length === 0 && (
            <div style={{
              background: '#112240',
              border: '1px solid #1e3a5f',
              borderRadius: 8,
              padding: 40,
              textAlign: 'center',
              color: '#64748b',
            }}>
              No applications yet. Share the job posting to attract candidates.
            </div>
          )}
        </div>
      </div>
    </ApplicationConsoleLayout>
  );
}
