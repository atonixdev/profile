import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [onlineFilter, setOnlineFilter] = useState('all');

  const eventTypes = [
    { value: 'all', label: 'All Events' },
    { value: 'webinar', label: 'Webinars' },
    { value: 'workshop', label: 'Workshops' },
    { value: 'meetup', label: 'Meetups' },
    { value: 'conference', label: 'Conferences' },
    { value: 'hackathon', label: 'Hackathons' },
  ];

  const getEventTypeColor = (type) => {
    const colors = {
      webinar: 'bg-blue-100 text-blue-700',
      workshop: 'bg-green-100 text-green-700',
      meetup: 'bg-purple-100 text-purple-700',
      conference: 'bg-orange-100 text-orange-700',
      hackathon: 'bg-red-100 text-red-700',
      other: 'bg-gray-100 text-gray-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        let url = 'http://localhost:8000/api/community/events/?ordering=event_date';
        
        if (selectedType !== 'all') {
          url += `&event_type=${selectedType}`;
        }
        
        if (onlineFilter !== 'all') {
          const isOnline = onlineFilter === 'online';
          url += `&is_online=${isOnline}`;
        }

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
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Community Events</h1>
          <p className="text-lg text-gray-600">
            Join webinars, workshops, and meetups to learn and connect with the community
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Event Type Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Event Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {eventTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Online/In-Person Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Format</label>
            <select
              value={onlineFilter}
              onChange={(e) => setOnlineFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Events</option>
              <option value="online">Online Events</option>
              <option value="in-person">In-Person Events</option>
            </select>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">Loading events...</div>
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {events.map((event) => (
              <Link
                key={event.id}
                to={`/community/event/${event.slug}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-all overflow-hidden"
              >
                {event.featured_image && (
                  <img
                    src={event.featured_image}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-3 py-1 rounded text-sm font-semibold ${getEventTypeColor(event.event_type)}`}>
                      {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
                    </span>
                    {event.is_online && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">
                        Online
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 hover:text-primary-600">
                    {event.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-semibold">Date:</span>
                      <span className="ml-2">{formatDate(event.event_date)}</span>
                    </div>
                    
                    {event.location && !event.is_online && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-semibold">Location:</span>
                        <span className="ml-2">{event.location}</span>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-semibold">Attending:</span>
                      <span className="ml-2">{event.attendee_count} people</span>
                    </div>
                  </div>

                  {event.organizer_info && (
                    <div className="pt-4 border-t">
                      <div className="text-xs text-gray-600">
                        Organized by <span className="font-semibold">{event.organizer_info.full_name || event.organizer_info.username}</span>
                      </div>
                    </div>
                  )}

                  <button className="w-full mt-4 bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                    View Details
                  </button>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <div className="text-lg text-gray-600">No events found. Check back soon!</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
