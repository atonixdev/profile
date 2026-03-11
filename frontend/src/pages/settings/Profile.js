import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const u = user?.user || {};

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A81D37', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
          Developer Settings
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 6 }}>Profile</h1>
        <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.65 }}>
          Your public-facing developer profile information.
        </p>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 20, marginBottom: 20 }}>
          {[
            { label: 'First Name',  value: u.first_name || '—' },
            { label: 'Last Name',   value: u.last_name  || '—' },
            { label: 'Username',    value: u.username   || '—' },
            { label: 'Email',       value: u.email      || '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4B5563', marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>{value}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            padding: '14px 16px', background: '#F8F9FA',
            border: '1px solid #E5E7EB', borderLeft: '3px solid #A81D37',
            fontSize: 13, color: '#4B5563', lineHeight: 1.6,
          }}
        >
          Full profile editing is coming in a future release. Contact support for profile updates.
        </div>
      </div>
    </div>
  );
};

export default Profile;
