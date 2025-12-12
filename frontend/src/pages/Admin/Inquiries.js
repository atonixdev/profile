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

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow mb-8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Manage Inquiries</h1>
            <Link
              to="/admin"
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4">
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <div key={inquiry.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">{inquiry.subject}</h3>
                  <p className="text-gray-600">
                    {inquiry.name} • {inquiry.email}
                    {inquiry.phone && ` • ${inquiry.phone}`}
                  </p>
                  {inquiry.company && (
                    <p className="text-gray-600">Company: {inquiry.company}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(inquiry.status)}`}>
                    {inquiry.status.replace('_', ' ')}
                  </span>
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(inquiry.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 whitespace-pre-wrap">{inquiry.message}</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-gray-100 px-3 py-1 rounded text-sm capitalize">
                  {inquiry.inquiry_type.replace('_', ' ')}
                </span>
                {inquiry.country && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">
                    📍 {inquiry.country} {inquiry.country_code && `(${inquiry.country_code})`}
                  </span>
                )}
                {inquiry.budget && (
                  <span className="bg-gray-100 px-3 py-1 rounded text-sm">
                    Budget: {inquiry.budget}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus(inquiry.id, 'in_progress')}
                  className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                >
                  In Progress
                </button>
                <button
                  onClick={() => updateStatus(inquiry.id, 'completed')}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Complete
                </button>
                <button
                  onClick={() => updateStatus(inquiry.id, 'archived')}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Archive
                </button>
              </div>
            </div>
          ))}
        </div>

        {inquiries.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
            No inquiries yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInquiries;
