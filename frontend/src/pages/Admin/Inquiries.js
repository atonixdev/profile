import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { inquiryService } from '../../services';

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const response = await inquiryService.getAll();
      setInquiries(response.data);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await inquiryService.updateStatus(id, status);
      fetchInquiries();
    } catch (error) {
      console.error('Error updating inquiry:', error);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      new: { background: '#1F0606', border: '1px solid #DC2626', color: '#DC2626' },
      in_progress: { background: '#332200', border: '1px solid #FFAA00', color: '#FFAA00' },
      completed: { background: '#003311', border: '1px solid #00AA44', color: '#00AA44' },
      archived: { background: '#F1F3F5', border: '1px solid #D1D5DB', color: '#6B7280' },
    };
    return styles[status] || styles.archived;
  };

  if (loading) {
    return <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Loading...</div>;
  }

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#111827' }}>
      <header style={{ background: '#F8F9FA', borderBottom: '1px solid #E5E7EB', padding: '0 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
          <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>Manage Inquiries</h1>
          <Link to="/admin" style={{ border: '1px solid #D1D5DB', color: '#6B7280', padding: '8px 16px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none' }}>Back to Dashboard</Link>
        </div>
      </header>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 80px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {inquiries.map((inquiry) => (
            <div key={inquiry.id} style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>{inquiry.subject}</h3>
                  <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                    {inquiry.name} &bull; {inquiry.email}{inquiry.phone ? ` • ${inquiry.phone}` : ''}
                  </p>
                  {inquiry.company && <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0' }}>Company: {inquiry.company}</p>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ ...getStatusStyle(inquiry.status), display: 'inline-block', padding: '4px 12px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {inquiry.status.replace('_', ' ')}
                  </span>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: '8px 0 0' }}>{new Date(inquiry.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.7, margin: '0 0 16px', whiteSpace: 'pre-wrap' }}>{inquiry.message}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                <span style={{ border: '1px solid #D1D5DB', color: '#6B7280', padding: '3px 10px', fontSize: '11px', textTransform: 'capitalize' }}>{inquiry.inquiry_type.replace('_', ' ')}</span>
                {inquiry.country && <span style={{ border: '1px solid #D1D5DB', color: '#6B7280', padding: '3px 10px', fontSize: '11px' }}>{inquiry.country}{inquiry.country_code ? ` (${inquiry.country_code})` : ''}</span>}
                {inquiry.budget && <span style={{ border: '1px solid #D1D5DB', color: '#6B7280', padding: '3px 10px', fontSize: '11px' }}>Budget: {inquiry.budget}</span>}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => updateStatus(inquiry.id, 'in_progress')}
                  style={{ background: '#332200', border: '1px solid #FFAA00', color: '#FFAA00', padding: '8px 16px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  In Progress
                </button>
                <button onClick={() => updateStatus(inquiry.id, 'completed')}
                  style={{ background: '#003311', border: '1px solid #00AA44', color: '#00AA44', padding: '8px 16px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Complete
                </button>
                <button onClick={() => updateStatus(inquiry.id, 'archived')}
                  style={{ background: '#F1F3F5', border: '1px solid #D1D5DB', color: '#6B7280', padding: '8px 16px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Archive
                </button>
              </div>
            </div>
          ))}
        </div>
        {inquiries.length === 0 && (
          <div style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', padding: '48px', textAlign: 'center', color: '#6B7280' }}>No inquiries yet.</div>
        )}
      </div>
    </div>
  );
};

export default AdminInquiries;
