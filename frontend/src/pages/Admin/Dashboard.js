import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { inquiryService, projectService, serviceService, testimonialService } from '../../services';

const Dashboard = () => {
  const { logout } = useAuth();
  const [stats, setStats] = useState({
    projects: 0,
    services: 0,
    testimonials: 0,
    inquiries: 0,
    newInquiries: 0,
  });

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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">Total Projects</h3>
            <p className="text-3xl font-bold text-primary-600">{stats.projects}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">Services</h3>
            <p className="text-3xl font-bold text-primary-600">{stats.services}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">Testimonials</h3>
            <p className="text-3xl font-bold text-primary-600">{stats.testimonials}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">Inquiries</h3>
            <p className="text-3xl font-bold text-primary-600">
              {stats.inquiries}
              {stats.newInquiries > 0 && (
                <span className="ml-2 text-sm bg-red-500 text-white px-2 py-1 rounded">
                  {stats.newInquiries} new
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/admin/projects"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-bold mb-2">Manage Projects</h3>
            <p className="text-gray-600">Add, edit, or delete portfolio projects</p>
          </Link>

          <Link
            to="/admin/services"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-bold mb-2">Manage Services</h3>
            <p className="text-gray-600">Update your service offerings</p>
          </Link>

          <Link
            to="/admin/testimonials"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-bold mb-2">Manage Testimonials</h3>
            <p className="text-gray-600">Add or edit client testimonials</p>
          </Link>

          <Link
            to="/admin/blog"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-bold mb-2">Manage Blog</h3>
            <p className="text-gray-600">Create and publish blog posts</p>
          </Link>

          <Link
            to="/admin/inquiries"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-bold mb-2">View Inquiries</h3>
            <p className="text-gray-600">Manage contact form submissions</p>
          </Link>

          <Link
            to="/admin/profile"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-bold mb-2">Edit Profile</h3>
            <p className="text-gray-600">Update your personal information</p>
          </Link>

          <Link
            to="/"
            className="bg-primary-600 text-white rounded-lg shadow p-6 hover:bg-primary-700 transition-colors"
          >
            <h3 className="text-xl font-bold mb-2">View Public Site</h3>
            <p className="text-white">See your live website</p>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
