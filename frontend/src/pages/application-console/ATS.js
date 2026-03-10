import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ApplicantTrackingSystem() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetch('/api/employment/applications/', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setApplications(Array.isArray(data) ? data : data.results || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filterStatus
    ? applications.filter(a => a.status === filterStatus)
    : applications;

  return (
    <div>
      <h1>Applicant Tracking System (ATS)</h1>

      <div style={{ marginTop: 20, marginBottom: 24, display: 'flex', gap: 12 }}>
        <button
          onClick={() => setFilterStatus('')}
          style={{
            padding: '8px 16px',
            background: filterStatus === '' ? '#1F4788' : '#E8EEF4',
            color: filterStatus === '' ? '#FFFFFF' : '#1F4788',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          All ({applications.length})
        </button>
        {['submitted', 'screening', 'interview', 'offer'].map(status => {
          const count = applications.filter(a => a.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: '8px 16px',
                background: filterStatus === status ? '#1F4788' : '#E8EEF4',
                color: filterStatus === status ? '#FFFFFF' : '#1F4788',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
            </button>
          );
        })}
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
                <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 700 }}>Name</th>
                <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 700 }}>Email</th>
                <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 700 }}>Position</th>
                <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 700 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(app => (
                <tr key={app.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer' }}
                  onMouseOver={e => e.currentTarget.style.background = '#F9F9F9'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: 16 }}>
                    <Link to={`/application-console/applications/${app.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {app.full_name}
                    </Link>
                  </td>
                  <td style={{ padding: 16, fontSize: 12, color: '#666' }}>{app.email}</td>
                  <td style={{ padding: 16 }}>{app.job_title}</td>
                  <td style={{ padding: 16 }}>
                    <span style={{
                      padding: '4px 12px',
                      background: '#E8EEF4',
                      color: '#1F4788',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                    }}>
                      {app.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
