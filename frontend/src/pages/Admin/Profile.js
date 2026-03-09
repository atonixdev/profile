import React from 'react';
import { Link } from 'react-router-dom';

const AdminProfile = () => {
  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#111827' }}>
      <header style={{ background: '#F8F9FA', borderBottom: '1px solid #E5E7EB', padding: '0 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
          <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>Edit Profile</h1>
          <Link to="/admin" style={{ border: '1px solid #D1D5DB', color: '#6B7280', padding: '8px 16px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none' }}>Back to Dashboard</Link>
        </div>
      </header>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 80px' }}>
        <div style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', padding: '40px' }}>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>Profile editing interface. Use Django Admin at <code style={{ background: '#F1F3F5', border: '1px solid #D1D5DB', color: '#DC2626', padding: '2px 8px', fontSize: '13px' }}>/admin</code> to manage:</p>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['Full name and title', 'Bio and detailed about section', 'Profile avatar upload', 'Contact information', 'Social media links', 'Skills management'].map(item => (
              <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#4B5563' }}>
                <span style={{ width: '6px', height: '6px', background: '#DC2626', flexShrink: 0, display: 'inline-block' }} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
