import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testimonialService } from '../../services';

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await testimonialService.getAll();
      setTestimonials(response.data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        await testimonialService.delete(id);
        fetchTestimonials();
      } catch (error) {
        console.error('Error deleting testimonial:', error);
        alert('Failed to delete testimonial');
      }
    }
  };

  const togglePublished = async (testimonial) => {
    try {
      await testimonialService.update(testimonial.id, {
        ...testimonial,
        is_published: !testimonial.is_published,
      });
      fetchTestimonials();
    } catch (error) {
      console.error('Error updating testimonial:', error);
    }
  };

  const thStyle = { padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', background: '#F1F3F5', borderBottom: '1px solid #D1D5DB' };
  const tdStyle = { padding: '14px 16px', fontSize: '14px', color: '#374151', borderBottom: '1px solid #F3F4F6' };

  if (loading) {
    return <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Loading...</div>;
  }

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#111827' }}>
      <header style={{ background: '#F8F9FA', borderBottom: '1px solid #E5E7EB', padding: '0 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
          <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>Manage Testimonials</h1>
          <Link to="/admin" style={{ border: '1px solid #D1D5DB', color: '#6B7280', padding: '8px 16px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none' }}>Back to Dashboard</Link>
        </div>
      </header>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 80px' }}>
        <div style={{ overflowX: 'auto', background: '#F8F9FA', border: '1px solid #E5E7EB' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Client</th>
                <th style={thStyle}>Company</th>
                <th style={thStyle}>Rating</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Featured</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.map((t) => (
                <tr key={t.id}>
                  <td style={tdStyle}>{t.client_name}</td>
                  <td style={tdStyle}>{t.client_company || <span style={{ color: '#6B7280' }}>—</span>}</td>
                  <td style={tdStyle}><span style={{ color: '#FFAA00' }}>{'★'.repeat(t.rating)}</span></td>
                  <td style={tdStyle}>
                    <button onClick={() => togglePublished(t)}
                      style={{ background: t.is_published ? '#003311' : '#F1F3F5', border: `1px solid ${t.is_published ? '#00AA44' : '#D1D5DB'}`, color: t.is_published ? '#00AA44' : '#6B7280', padding: '4px 12px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                      {t.is_published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td style={tdStyle}>{t.is_featured ? <span style={{ color: '#A81D37', fontWeight: 700 }}>Featured</span> : <span style={{ color: '#6B7280' }}>—</span>}</td>
                  <td style={tdStyle}>
                    <button onClick={() => handleDelete(t.id)}
                      style={{ background: 'transparent', border: 'none', color: '#CC0033', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTestimonials;
