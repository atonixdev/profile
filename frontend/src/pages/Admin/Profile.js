import React from 'react';
import { Link } from 'react-router-dom';

const AdminProfile = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow mb-8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Edit Profile</h1>
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
        <div className="bg-white rounded-lg shadow p-8">
          <p className="text-gray-600">
            Profile editing interface would go here. This would include forms for:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700">
            <li>Full name and title</li>
            <li>Bio and detailed about section</li>
            <li>Profile avatar and resume upload</li>
            <li>Contact information</li>
            <li>Social media links</li>
            <li>Skills management</li>
          </ul>
          <p className="mt-4 text-gray-600">
            You can access the profile editing through Django Admin at <code>/admin</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
