import React, { useState, useEffect } from 'react';

export default function Evaluations() {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/employment/evaluations/')
      .then(r => r.json())
      .then(data => {
        setEvaluations(Array.isArray(data) ? data : data.results || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const recommendationColor = (rec) => {
    const colors = {
      'strong_hire': '#D1FAE5',
      'hire': '#B3E5FC',
      'hold': '#FEF3C7',
      'no_hire': '#FCDFE7',
      'strong_no_hire': '#FEE2E2',
    };
    return colors[rec] || '#E8EEF4';
  };

  return (
    <div>
      <h1>Evaluations & Decisions</h1>

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
                <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 700 }}>Score</th>
                <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 700 }}>Recommendation</th>
                <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 700 }}>Admin Decision</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: 32, textAlign: 'center', color: '#999' }}>
                    No evaluations yet
                  </td>
                </tr>
              ) : (
                evaluations.map(eval_item => (
                  <tr key={eval_item.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    <td style={{ padding: 16 }}>{eval_item.application_name}</td>
                    <td style={{ padding: 16 }}>
                      <strong style={{ color: '#1F4788', fontSize: 16 }}>{eval_item.overall_score || '—'}</strong>/10
                    </td>
                    <td style={{ padding: 16 }}>
                      <span style={{
                        padding: '4px 12px',
                        background: recommendationColor(eval_item.recommendation),
                        color: '#1F4788',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                      }}>
                        {eval_item.recommendation.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: 16 }}>
                      <span style={{
                        padding: '4px 12px',
                        background: eval_item.admin_decision === 'approved' ? '#D1FAE5' : eval_item.admin_decision === 'rejected' ? '#FEE2E2' : '#E8EEF4',
                        color: '#1F4788',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                      }}>
                        {eval_item.admin_decision?.toUpperCase() || 'PENDING'}
                      </span>
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
