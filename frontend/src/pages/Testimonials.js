import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testimonialService } from '../services';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState(0);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await testimonialService.getAll();
        // Handle paginated response from Django REST Framework
        const testimonialsData = response.data.results || response.data;
        setTestimonials(testimonialsData);
        setFilteredTestimonials(testimonialsData);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (filterRating === 0) {
      setFilteredTestimonials(testimonials);
    } else {
      setFilteredTestimonials(testimonials.filter(t => t.rating >= filterRating));
    }
  }, [testimonials, filterRating]);

  const averageRating = testimonials.length > 0 
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Client Testimonials</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            What my clients say about working with me
          </p>
          
          {/* Rating Summary */}
          {testimonials.length > 0 && (
            <div className="bg-white rounded-lg p-6 max-w-md mx-auto shadow-lg mb-8">
              <div className="flex items-center justify-center mb-2">
                <div className="text-3xl text-yellow-500 mr-2">
                  {'★'.repeat(Math.round(averageRating))}
                </div>
                <span className="text-2xl font-bold">{averageRating}</span>
              </div>
              <p className="text-gray-600">Average rating from {testimonials.length} reviews</p>
            </div>
          )}
        </div>

        {/* Filter Section */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-4 shadow-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by minimum rating:
            </label>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={0}>All Ratings</option>
              <option value={5}>5 Stars</option>
              <option value={4}>4+ Stars</option>
              <option value={3}>3+ Stars</option>
            </select>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {filteredTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="text-yellow-500 text-lg mr-2">
                  {'★'.repeat(testimonial.rating)}
                  {'☆'.repeat(5 - testimonial.rating)}
                </div>
                <span className="text-sm text-gray-600">({testimonial.rating}/5)</span>
              </div>

              {/* Content */}
              <p className="text-gray-700 italic mb-6 leading-relaxed">"{testimonial.content}"</p>

              {/* Client Info */}
              <div className="flex items-center border-t pt-4">
                {testimonial.client_avatar ? (
                  <img
                    src={testimonial.client_avatar}
                    alt={testimonial.client_name}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full mr-4 bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-bold text-lg">
                      {testimonial.client_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{testimonial.client_name}</h4>
                  {testimonial.client_title && (
                    <p className="text-gray-600 text-sm">{testimonial.client_title}</p>
                  )}
                  {testimonial.client_company && (
                    <p className="text-primary-600 text-sm font-medium">{testimonial.client_company}</p>
                  )}
                </div>
              </div>

              {/* Project */}
              {testimonial.project && (
                <div className="mt-4 text-sm text-primary-600 bg-primary-50 px-3 py-1 rounded-full inline-block">
                  Project: {testimonial.project}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredTestimonials.length === 0 && (
          <div className="text-center text-gray-600 py-12">
            <p className="text-xl mb-4">No testimonials match your filter.</p>
            <button
              onClick={() => setFilterRating(0)}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Show All Testimonials
            </button>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-primary-600 text-white rounded-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Have a Project in Mind?</h2>
            <p className="mb-6">I'd love to hear about your next project and discuss how we can work together.</p>
            <Link
              to="/contact"
              className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get In Touch
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
