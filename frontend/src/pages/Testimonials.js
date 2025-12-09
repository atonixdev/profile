import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Testimonials = () => {
  const [filterRating, setFilterRating] = useState(0);

  const testimonials = [
    {
      id: 1,
      client_name: 'Dr. Thabo Mthembu',
      client_title: 'Director of Research',
      client_company: 'Stellenbosch University AI Lab',
      content: 'Samuel\'s Neuron data center architecture transformed our AI research capabilities. The high-performance computing environment he designed supports our most demanding machine learning workloads.',
      rating: 5,
      project: 'AI Research Infrastructure',
      is_featured: true
    },
    {
      id: 2,
      client_name: 'Nomsa Khumalo',
      client_title: 'CTO',
      client_company: 'FinTech Innovations SA',
      content: 'Working with Samuel on our cloud migration was a game-changer. His OpenStack expertise and multi-region replication design ensured zero downtime during our transition.',
      rating: 5,
      project: 'Cloud Migration & Security',
      is_featured: true
    },
    {
      id: 3,
      client_name: 'James van der Merwe',
      client_title: 'DevOps Lead',
      client_company: 'Cape Town Tech Hub',
      content: 'Samuel\'s DevOps pipelines are production-ready from day one. The CI/CD workflows he built reduced our deployment time by 80% while maintaining enterprise-grade security.',
      rating: 5,
      project: 'DevOps Pipeline Implementation',
      is_featured: false
    },
    {
      id: 4,
      client_name: 'Dr. Zanele Nkosi',
      client_title: 'Head of Digital Transformation',
      client_company: 'Johannesburg Metropolitan University',
      content: 'The communication infrastructure Samuel built for our campus is remarkable. From custom SMTP servers to encrypted mail routing, everything works flawlessly.',
      rating: 5,
      project: 'Enterprise Communication System',
      is_featured: false
    },
    {
      id: 5,
      client_name: 'Marcus Johnson',
      client_title: 'CEO',
      client_company: 'African FinTech Alliance',
      content: 'Samuel\'s AI-driven marketing automation transformed our customer engagement. The segmentation engines he designed increased our conversion rates by 150%.',
      rating: 5,
      project: 'Marketing Automation Platform',
      is_featured: true
    },
    {
      id: 6,
      client_name: 'Prof. Fatima Hassan',
      client_title: 'Director',
      client_company: 'Pan-African Research Network',
      content: 'Samuel\'s systems programming expertise in C/C++ is exceptional. The backend optimizations he implemented improved our scientific computing performance by 300%.',
      rating: 5,
      project: 'Scientific Computing Platform',
      is_featured: false
    }
  ];

  const filteredTestimonials = filterRating === 0
    ? testimonials
    : testimonials.filter(t => t.rating >= filterRating);

  const averageRating = testimonials.length > 0
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
    : 0;

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Client Testimonials</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Trusted by leading African institutions and tech companies.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl font-bold text-primary-600 mb-2">{averageRating}</div>
              <div className="text-gray-600">Average Rating</div>
              <div className="flex justify-center mt-2">
                {renderStars(Math.round(averageRating))}
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl font-bold text-primary-600 mb-2">{testimonials.length}</div>
              <div className="text-gray-600">Happy Clients</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl font-bold text-primary-600 mb-2">100%</div>
              <div className="text-gray-600">Satisfaction</div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-4 shadow-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter:</label>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value={0}>All Ratings</option>
              <option value={5}>5 Stars</option>
              <option value={4}>4+ Stars</option>
              <option value={3}>3+ Stars</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTestimonials.map((testimonial) => (
            <div key={testimonial.id} className={`bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow ${testimonial.is_featured ? 'ring-2 ring-primary-500' : ''}`}>
              {testimonial.is_featured && (
                <div className="bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-full inline-block mb-4">
                  FEATURED
                </div>
              )}

              <div className="flex items-center mb-4">
                <div className="flex mr-2">
                  {renderStars(testimonial.rating)}
                </div>
                <span className="text-sm text-gray-600">({testimonial.rating}/5)</span>
              </div>

              <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>

              <div className="border-t pt-4">
                <div className="font-bold text-gray-900">{testimonial.client_name}</div>
                <div className="text-primary-600 font-medium">{testimonial.client_title}</div>
                <div className="text-gray-600 text-sm">{testimonial.client_company}</div>
                {testimonial.project && (
                  <div className="text-xs text-gray-500 mt-2">
                    {testimonial.project}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredTestimonials.length === 0 && (
          <div className="text-center text-gray-600">
            <p>No testimonials match your filter.</p>
          </div>
        )}

        <div className="mt-16 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join Our Success Stories?</h2>
          <p className="text-xl mb-6 text-primary-100">
            Let's discuss how we can transform your infrastructure forward.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all"
          >
            Start Your Project
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
