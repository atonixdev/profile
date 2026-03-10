import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/employment/interviews/', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setInterviews(Array.isArray(data) ? data : data.results || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1>Interview Schedule</h1>
        <button style={{
          padding: '10px 20px',
          background: '#1F4788',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontWeight: 600,
        }}>
          + Schedule Interview
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
                <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 700 }}>Candidate</th>
                <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 700 }}>Round</th>
                <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 700 }}>Format</th>
                <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 700 }}>Scheduled</th>
                <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 700 }}>Status</th>
                <th style={{ padding: 16, textAlign: 'center', fontSize: 12, fontWeight: 700 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {interviews.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: 32, textAlign: 'center', color: '#999' }}>
                    No interviews scheduled
                  </td>
                </tr>
              ) : (
                interviews.map(interview => (
                  <tr key={interview.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer' }}
                    onMouseOver={e => e.currentTarget.style.background = '#F9F9F9'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: 16 }}>{interview.application_name || 'Unknown'}</td>
                    <td style={{ padding: 16 }}>Round {interview.round}</td>
                    <td style={{ padding: 16 }}>{interview.format}</td>
                    <td style={{ padding: 16, fontSize: 12 }}>
                      {interview.scheduled_at ? new Date(interview.scheduled_at).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: 16 }}>
                      <span style={{
                        padding: '4px 12px',
                        background: '#E8EEF4',
                        color: '#1F4788',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                      }}>
                        {interview.status}
                      </span>
                    </td>
                    <td style={{ padding: 16, textAlign: 'center' }}>
                      <Link
                        to={`/application-console/interviews/${interview.id}/room`}
                        style={{
                          color: '#1F4788',
                          textDecoration: 'none',
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      >
                        Join →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
