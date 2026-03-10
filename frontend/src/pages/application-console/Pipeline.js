import React, { useState, useEffect } from 'react';

export default function HiringPipeline() {
  const [pipeline, setPipeline] = useState({
    submitted: 0,
    screening: 0,
    interview: 0,
    offer: 0,
    hired: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/employment/applications/')
      .then(r => r.json())
      .then(apps => {
        const counts = {
          submitted: 0, screening: 0, interview: 0,
          offer: 0, hired: 0, rejected: 0,
        };
        apps.forEach(app => {
          if (counts.hasOwnProperty(app.status)) counts[app.status]++;
        });
        setPipeline(counts);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const stages = [
    { key: 'submitted', label: 'Submitted', color: '#E8EEF4' },
    { key: 'screening', label: 'Screening', color: '#FEF3C7' },
    { key: 'interview', label: 'Interview', color: '#DBEAFE' },
    { key: 'offer', label: 'Offer', color: '#D1FAE5' },
    { key: 'hired', label: 'Hired', color: '#C7F0D8' },
  ];

  const total = Object.values(pipeline).reduce((a, b) => a + b, 0) || 1;

  return (
    <div>
      <h1>Hiring Pipeline</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ marginTop: 32 }}>
          {stages.map(stage => {
            const count = pipeline[stage.key];
            const percent = Math.round((count / total) * 100);
            return (
              <div key={stage.key} style={{ marginBottom: 24 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                  fontSize: 12,
                  fontWeight: 600,
                }}>
                  <span>{stage.label}</span>
                  <span>{count} ({percent}%)</span>
                </div>
                <div style={{
                  background: '#E8EEF4',
                  borderRadius: 8,
                  height: 24,
                  overflow: 'hidden',
                }}>
                  <div
                    style={{
                      background: stage.color,
                      height: '100%',
                      width: `${percent}%`,
                      transition: 'width 300ms ease',
                    }}
                  />
                </div>
              </div>
            );
          })}

          <div style={{
            marginTop: 48,
            padding: 24,
            background: '#F8FAFC',
            borderRadius: 8,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Total in Pipeline</div>
            <div style={{ fontSize: 40, fontWeight: 700, color: '#1F4788' }}>
              {total}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
