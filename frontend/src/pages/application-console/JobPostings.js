import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function JobPostings() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/employment/jobs/', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setJobs(Array.isArray(data) ? data : data.results || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1>Job Postings</h1>
        <button style={{
          padding: '10px 20px',
          background: '#1F4788',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontWeight: 600,
        }}>
          + New Job Posting
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{
          background: '#FFFFFF',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 8,
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 700 }}>Title</th>
                <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 700 }}>Department</th>
                <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 700 }}>Status</th>
                <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 700 }}>Applications</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer' }}
                  onMouseOver={e => e.currentTarget.style.background = '#F9F9F9'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: 16 }}>
                    <Link to={`/application-console/jobs/${job.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {job.title}
                    </Link>
                  </td>
                  <td style={{ padding: 16 }}>{job.department}</td>
                  <td style={{ padding: 16 }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      background: job.status === 'open' ? '#D1FAE5' : '#FEE2E2',
                      color: job.status === 'open' ? '#065F46' : '#7F1D1D',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                    }}>
                      {job.status}
                    </span>
                  </td>
                  <td style={{ padding: 16 }}>{job.applications_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
