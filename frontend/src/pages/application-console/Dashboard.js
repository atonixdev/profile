import React, { useState, useEffect } from 'react';

export default function ApplicationConsoleDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard metrics
    fetch('/api/employment/jobs/')
      .then(r => r.json())
      .then(jobs => {
        setStats({
          total_jobs: jobs.length || 0,
          active_jobs: (jobs || []).filter(j => j.status === 'open').length || 0,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1>Employment Console Dashboard</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 24, marginTop: 32 }}>
          <Card title="Active Job Postings" value={stats?.active_jobs || 0} />
          <Card title="Total Openings" value={stats?.total_jobs || 0} />
          <Card title="Pending Applications" value="—" />
          <Card title="Scheduled Interviews" value="—" />
        </div>
      )}
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: 8,
      padding: 24,
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: '#1F4788' }}>
        {value}
      </div>
    </div>
  );
}
