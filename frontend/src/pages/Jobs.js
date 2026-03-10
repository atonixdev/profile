/**
 * Jobs — Public Job Board
 * Route: /jobs (NO AUTH REQUIRED)
 *
 * Lists all open job postings.
 * Each job links to the candidate application portal at /apply/:jobId.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const ACCENT = '#1F4788';

const DEPT_LABELS = {
  engineering: 'Engineering',
  design: 'Design',
  product: 'Product',
  operations: 'Operations',
  support: 'Customer Support',
  marketing: 'Marketing',
  sales: 'Sales',
  finance: 'Finance',
  hr: 'HR',
  legal: 'Legal',
};

const TYPE_LABELS = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
  volunteer: 'Volunteer',
};

const EXP_LABELS = {
  entry: 'Entry Level',
  mid: 'Mid Level',
  senior: 'Senior',
  lead: 'Lead / Principal',
  executive: 'Executive',
};

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  useEffect(() => {
    fetch('/api/employment/jobs/?status=open', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setJobs(Array.isArray(data) ? data : data.results || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load job listings.');
        setLoading(false);
      });
  }, []);

  const filteredJobs = jobs.filter(j => {
    const matchSearch =
      !search ||
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      (j.description || '').toLowerCase().includes(search.toLowerCase());
    const matchDept = !selectedDept || j.department === selectedDept;
    return matchSearch && matchDept;
  });

  const depts = [...new Set(jobs.map(j => j.department))];

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e6edf3', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: ACCENT, padding: '40px 24px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 2, opacity: 0.8, marginBottom: 8 }}>
          AtonixDev
        </div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>Open Positions</h1>
        <p style={{ margin: '12px 0 0', fontSize: 16, opacity: 0.85 }}>
          Join the team building the future of developer tooling.
        </p>
      </div>

      {/* Filters */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search positions…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: '1 1 260px',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid #30363d',
              background: '#161b22',
              color: '#e6edf3',
              fontSize: 14,
              outline: 'none',
            }}
          />
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            style={{
              flex: '0 0 160px',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid #30363d',
              background: '#161b22',
              color: '#e6edf3',
              fontSize: 14,
            }}
          >
            <option value="">All Departments</option>
            {depts.map(d => (
              <option key={d} value={d}>{DEPT_LABELS[d] || d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Job List */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: 60, opacity: 0.6 }}>Loading positions…</div>
        )}
        {error && (
          <div style={{ background: '#3d1515', border: '1px solid #f85149', borderRadius: 8, padding: 16, color: '#f85149' }}>
            {error}
          </div>
        )}
        {!loading && !error && filteredJobs.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, opacity: 0.5 }}>
            No open positions match your search.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredJobs.map(job => (
            <div
              key={job.id}
              style={{
                background: '#161b22',
                border: '1px solid #30363d',
                borderRadius: 10,
                padding: '20px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>{job.title}</div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                  <Tag color="#1a3a6b">{DEPT_LABELS[job.department] || job.department}</Tag>
                  <Tag color="#1a3a1a">{TYPE_LABELS[job.type] || job.type}</Tag>
                  <Tag color="#3a2a1a">{EXP_LABELS[job.experience_level] || job.experience_level}</Tag>
                  {job.is_remote && <Tag color="#1a2a3a">Remote</Tag>}
                </div>

                {job.description && (
                  <p style={{ margin: 0, fontSize: 13, opacity: 0.7, lineHeight: 1.5 }}>
                    {job.description.length > 160
                      ? job.description.slice(0, 160) + '…'
                      : job.description}
                  </p>
                )}

                {job.salary_min && job.salary_max && (
                  <div style={{ marginTop: 8, fontSize: 13, color: '#58a6ff' }}>
                    ${Number(job.salary_min).toLocaleString()} – ${Number(job.salary_max).toLocaleString()}
                  </div>
                )}
              </div>

              <Link
                to={`/apply/${job.id}`}
                style={{
                  background: ACCENT,
                  color: '#fff',
                  padding: '10px 22px',
                  borderRadius: 7,
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: 14,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                Apply Now
              </Link>
            </div>
          ))}
        </div>

        {/* Track banner */}
        <div
          style={{
            marginTop: 40,
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: 10,
            padding: '20px 24px',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: '0 0 12px', opacity: 0.7, fontSize: 14 }}>
            Already applied? Track your application status.
          </p>
          <Link
            to="/track"
            style={{
              color: '#58a6ff',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Track My Application →
          </Link>
        </div>
      </div>
    </div>
  );
}

function Tag({ children, color }) {
  return (
    <span
      style={{
        background: color,
        color: '#e6edf3',
        padding: '2px 10px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 500,
      }}
    >
      {children}
    </span>
  );
}
