import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { inquiryService, projectService, serviceService, testimonialService } from '../../services';
import AtonixDevLogoIcon from '../../components/AtonixDevLogoIcon';

const Dashboard = () => {
  const { logout } = useAuth();
  const [stats, setStats] = useState({ projects: 0, services: 0, testimonials: 0, inquiries: 0, newInquiries: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projects, services, testimonials, inquiries] = await Promise.all([
          projectService.getAll(),
          serviceService.getAll(),
          testimonialService.getAll(),
          inquiryService.getAll(),
        ]);
        setStats({
          projects: projects.data.length,
          services: services.data.length,
          testimonials: testimonials.data.length,
          inquiries: inquiries.data.length,
          newInquiries: inquiries.data.filter((i) => i.status === 'new').length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  const statItems = [
    { label: 'Total Projects', value: stats.projects },
    { label: 'Services', value: stats.services },
    { label: 'Testimonials', value: stats.testimonials },
    { label: 'Inquiries', value: stats.inquiries, badge: stats.newInquiries },
  ];

  const navCards = [
    { to: '/admin/projects', title: 'Manage Projects', desc: 'Add, edit, or delete portfolio projects' },
    { to: '/admin/services', title: 'Manage Services', desc: 'Update your service offerings' },
    { to: '/admin/testimonials', title: 'Manage Testimonials', desc: 'Add or edit client testimonials' },
    { to: '/admin/blog', title: 'Manage Blog', desc: 'Create and publish blog posts' },
    { to: '/admin/inquiries', title: 'View Inquiries', desc: 'Manage contact form submissions' },
    { to: '/admin/chat', title: 'Manage Chats', desc: 'View and respond to visitor messages' },
    { to: '/admin/profile', title: 'Edit Profile', desc: 'Update your personal information' },
  ];

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#111827' }}>
      {/* Header */}
      <header style={{ background: '#F8F9FA', borderBottom: '1px solid #E5E7EB', padding: '0 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AtonixDevLogoIcon size={28} variant="dark" />
            <span style={{ color: '#D1D5DB' }}>|</span>
            <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>Admin Dashboard</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/" style={{ color: '#6B7280', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>View Site</Link>
            <button
              onClick={logout}
              style={{ background: 'transparent', border: '1px solid #D1D5DB', color: '#6B7280', padding: '8px 16px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px 80px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#E5E7EB', marginBottom: '48px' }}>
          {statItems.map(item => (
            <div key={item.label} style={{ background: '#F8F9FA', padding: '28px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>{item.label}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <span style={{ fontSize: '36px', fontWeight: 800, color: '#A81D37' }}>{item.value}</span>
                {item.badge > 0 && (
                  <span style={{ background: '#CC0033', color: '#FFFFFF', padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>
                    {item.badge} new
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {navCards.map(card => (
            <Link
              key={card.to}
              to={card.to}
              style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', borderLeft: '3px solid #A81D37', padding: '24px', textDecoration: 'none', display: 'block' }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>{card.title}</h3>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>{card.desc}</p>
            </Link>
          ))}
          <Link
            to="/"
            style={{ background: '#A81D37', border: '1px solid #A81D37', padding: '24px', textDecoration: 'none', display: 'block' }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>View Public Site</h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>See your live website</p>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
