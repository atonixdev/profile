import React, { useState, useEffect } from 'react';
import axios from 'axios';

const eventTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'meetup', label: 'Meetup' },
  { value: 'conference', label: 'Conference' },
  { value: 'hackathon', label: 'Hackathon' },
];

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [onlineFilter, setOnlineFilter] = useState('all');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        let url = 'http://localhost:8000/api/community/events/?ordering=event_date';
        if (selectedType !== 'all') url += `&event_type=${selectedType}`;
        if (onlineFilter === 'online') url += '&is_online=true';
        if (onlineFilter === 'inperson') url += '&is_online=false';
        const response = await axios.get(url);
        setEvents(response.data.results || response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [selectedType, onlineFilter]);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const mo = d.toLocaleString('en-US', { month: 'short' });
    const day = d.getDate();
    const yr = d.getFullYear();
    let h = d.getHours(), m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const ms = m < 10 ? '0' + m : m;
    return `${mo} ${day}, ${yr} ${h}:${ms} ${ampm}`;
  };

  const selectStyle = { background: '#F1F3F5', border: '1px solid #D1D5DB', color: '#111827', padding: '10px 14px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', width: '100%' };

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#111827' }}>
      <div style={{ background: '#F8F9FA', borderBottom: '1px solid #E5E7EB', padding: '80px 0 60px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>Community</p>
          <h1 style={{ fontSize: '48px', fontWeight: 800, color: '#111827', margin: '0 0 16px' }}>Events</h1>
          <p style={{ fontSize: '18px', color: '#6B7280' }}>Webinars, workshops, hackathons, and more from the AtonixCorp community.</p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Event Type</label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} style={selectStyle}>
              {eventTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Format</label>
            <select value={onlineFilter} onChange={(e) => setOnlineFilter(e.target.value)} style={selectStyle}>
              <option value="all">All Formats</option>
              <option value="online">Online</option>
              <option value="inperson">In-Person</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#6B7280' }}>Loading events...</p>
        ) : events.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            {events.map((ev) => (
              <div key={ev.id} style={{ background: '#F8F9FA', border: '1px solid #E5E7EB' }}>
                {ev.featured_image && (
                  <img src={ev.featured_image} alt={ev.title} style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }} />
                )}
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                    <span style={{ background: '#DC2626', color: '#fff', padding: '3px 10px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {ev.event_type}
                    </span>
                    {ev.is_online && (
                      <span style={{ border: '1px solid #D1D5DB', color: '#aaa', padding: '3px 10px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Online
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '10px', lineHeight: 1.3 }}>{ev.title}</h3>
                  {ev.description && <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6, marginBottom: '16px' }}>{ev.description}</p>}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#6B7280', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
                    {ev.event_date && <span>Date: {formatDate(ev.event_date)}</span>}
                    {ev.location && <span>Location: {ev.location}</span>}
                    {ev.max_attendees && <span>Capacity: {ev.max_attendees}</span>}
                  </div>
                  <a href={`/community/events/${ev.id}`}
                    style={{ display: 'inline-block', marginTop: '20px', background: '#DC2626', color: '#fff', padding: '10px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none' }}>
                    View Details
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#6B7280' }}>No events found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
