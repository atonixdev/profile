import React, { useState, useEffect } from 'react';
import axios from 'axios';

const roles = [
  { value: 'all', label: 'All Roles' },
  { value: 'member', label: 'Member' },
  { value: 'contributor', label: 'Contributor' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'admin', label: 'Admin' },
];

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        let url = 'http://localhost:8000/api/community/members/?ordering=-contribution_points';
        if (selectedRole !== 'all') url += `&role=${selectedRole}`;
        if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
        const response = await axios.get(url);
        setMembers(response.data.results || response.data);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [selectedRole, searchTerm]);

  const selectStyle = { background: '#F1F3F5', border: '1px solid #D1D5DB', color: '#111827', padding: '10px 14px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', width: '100%' };
  const inputStyle = { ...selectStyle };

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#111827' }}>
      <div style={{ background: '#F8F9FA', borderBottom: '1px solid #E5E7EB', padding: '80px 0 60px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>Community</p>
          <h1 style={{ fontSize: '48px', fontWeight: 800, color: '#111827', margin: '0 0 16px' }}>Members</h1>
          <p style={{ fontSize: '18px', color: '#6B7280' }}>Connect with contributors and engineers in our community.</p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Filter by Role</label>
            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} style={selectStyle}>
              {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Search</label>
            <input type="text" placeholder="Search members..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={inputStyle} />
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#6B7280' }}>Loading members...</p>
        ) : members.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {members.map((m) => (
              <div key={m.id} style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ width: '48px', height: '48px', background: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                    {(m.user && m.user.username ? m.user.username : m.full_name || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                      {m.user && m.user.full_name ? m.user.full_name : m.user && m.user.username ? m.user.username : m.full_name || 'Member'}
                    </div>
                    <div style={{ fontSize: '11px', marginTop: '4px' }}>
                      <span style={{ background: '#F1F3F5', border: '1px solid #D1D5DB', color: '#aaa', padding: '2px 8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {m.role || 'member'}
                      </span>
                    </div>
                  </div>
                </div>
                {m.bio && <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6, marginBottom: '16px' }}>{m.bio}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
                  <span style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Contribution Points</span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#DC2626' }}>{m.contribution_points || 0}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#6B7280' }}>No members found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;
