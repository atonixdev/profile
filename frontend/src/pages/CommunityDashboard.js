import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CommunityDashboard = () => {
  const [stats, setStats] = useState({ total_members: 547, total_discussions: 124, total_events: 46, total_resources: 53 });
  const [discussions, setDiscussions] = useState([]);
  const [events, setEvents] = useState([]);
  const [topMembers, setTopMembers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, discRes, evRes, memRes] = await Promise.all([
          axios.get('http://localhost:8000/api/community/statistics/current/').catch(() => null),
          axios.get('http://localhost:8000/api/community/discussions/?ordering=-created_at&page_size=5').catch(() => null),
          axios.get('http://localhost:8000/api/community/events/?ordering=event_date&page_size=4').catch(() => null),
          axios.get('http://localhost:8000/api/community/members/?ordering=-contribution_points&page_size=6').catch(() => null),
        ]);
        if (statsRes) setStats(s => ({ ...s, ...statsRes.data }));
        if (discRes) setDiscussions(discRes.data.results || discRes.data);
        if (evRes) setEvents(evRes.data.results || evRes.data);
        if (memRes) setTopMembers(memRes.data.results || memRes.data);
      } catch (error) {
        console.error('Error fetching community data:', error);
      }
    };
    fetchData();
  }, []);

  const statItems = [
    { label: 'Members', value: stats.total_members },
    { label: 'Discussions', value: stats.total_discussions || stats.total_posts || 124 },
    { label: 'Events', value: stats.total_events },
    { label: 'Resources', value: stats.total_resources },
  ];

  const navLinks = [
    { label: 'Discussions', path: '/community/discussions', desc: 'Join conversations' },
    { label: 'Events', path: '/community/events', desc: 'Upcoming meetups & webinars' },
    { label: 'Members', path: '/community/members', desc: 'Connect with contributors' },
    { label: 'Resources', path: '/community/resources', desc: 'Tutorials and guides' },
  ];

  const sectionHead = { fontSize: '14px', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' };

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#111827' }}>
      {/* Hero */}
      <div style={{ background: '#F8F9FA', borderBottom: '1px solid #E5E7EB', padding: '80px 0 60px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>Community</p>
          <h1 style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1.1, color: '#111827', margin: '0 0 20px' }}>AtonixCorp Community Hub</h1>
          <p style={{ fontSize: '18px', color: '#6B7280', maxWidth: '560px' }}>
            Connect with engineers, share knowledge, and collaborate on cutting-edge technology projects.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 24px 80px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#E5E7EB', marginBottom: '64px' }}>
          {statItems.map(item => (
            <div key={item.label} style={{ background: '#F8F9FA', padding: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>
                {item.value.toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '64px' }}>
          {navLinks.map(nav => (
            <Link
              key={nav.label}
              to={nav.path}
              style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', borderLeft: '3px solid #DC2626', padding: '28px', textDecoration: 'none', display: 'block', transition: 'border-color 0.15s' }}
            >
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>{nav.label}</div>
              <div style={{ fontSize: '13px', color: '#6B7280' }}>{nav.desc}</div>
            </Link>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginBottom: '64px' }}>
          {/* Recent Discussions */}
          <div>
            <h2 style={sectionHead}>Recent Discussions</h2>
            {discussions.length > 0 ? discussions.map((d, i) => (
              <Link
                key={d.id || i}
                to={`/community/discussions/${d.id}`}
                style={{ display: 'block', background: '#F8F9FA', border: '1px solid #E5E7EB', borderLeft: '3px solid #DC2626', padding: '16px 20px', marginBottom: '12px', textDecoration: 'none' }}
              >
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>{d.title}</div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6B7280' }}>
                  {d.author_info?.username && <span>{d.author_info.username}</span>}
                  {d.reply_count !== undefined && <span>{d.reply_count} replies</span>}
                </div>
              </Link>
            )) : (
              <p style={{ color: '#6B7280', fontSize: '14px' }}>No discussions yet.</p>
            )}
            <Link to="/community/discussions" style={{ display: 'inline-block', marginTop: '16px', color: '#DC2626', textDecoration: 'none', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              View All Discussions &rarr;
            </Link>
          </div>

          {/* Upcoming Events */}
          <div>
            <h2 style={sectionHead}>Upcoming Events</h2>
            {events.length > 0 ? events.map((ev, i) => (
              <div key={ev.id || i} style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', padding: '16px 20px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '6px', flex: 1 }}>{ev.title}</div>
                  {ev.is_online && <span style={{ fontSize: '10px', background: '#DC2626', color: '#fff', padding: '2px 8px', fontWeight: 700, textTransform: 'uppercase', marginLeft: '8px', flexShrink: 0 }}>Online</span>}
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>
                  {ev.event_date && new Date(ev.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            )) : (
              <p style={{ color: '#6B7280', fontSize: '14px' }}>No upcoming events.</p>
            )}
            <Link to="/community/events" style={{ display: 'inline-block', marginTop: '16px', color: '#DC2626', textDecoration: 'none', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              View All Events &rarr;
            </Link>
          </div>
        </div>

        {/* Top Contributors */}
        <div>
          <h2 style={sectionHead}>Top Contributors</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {topMembers.length > 0 ? topMembers.map((m, i) => (
              <div key={m.id || i} style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '44px', height: '44px', background: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                  {(m.user?.username || m.full_name || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                    {m.user?.full_name || m.user?.username || m.full_name || 'Member'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#DC2626', fontWeight: 600 }}>
                    {m.contribution_points || 0} pts
                  </div>
                </div>
              </div>
            )) : (
              <p style={{ color: '#6B7280', fontSize: '14px', gridColumn: '1/-1' }}>No members yet.</p>
            )}
          </div>
          <Link to="/community/members" style={{ display: 'inline-block', marginTop: '16px', color: '#DC2626', textDecoration: 'none', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            View All Members &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CommunityDashboard;
