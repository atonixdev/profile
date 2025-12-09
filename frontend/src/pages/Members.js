import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const roles = [
    { value: 'all', label: 'All Members' },
    { value: 'member', label: 'Members' },
    { value: 'contributor', label: 'Contributors' },
    { value: 'moderator', label: 'Moderators' },
    { value: 'admin', label: 'Admins' },
  ];

  const getRoleColor = (role) => {
    const colors = {
      member: 'bg-blue-100 text-blue-700',
      contributor: 'bg-green-100 text-green-700',
      moderator: 'bg-purple-100 text-purple-700',
      admin: 'bg-red-100 text-red-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        let url = 'http://localhost:8000/api/community/members/?ordering=-contribution_points';
        
        if (selectedRole !== 'all') {
          url += `&role=${selectedRole}`;
        }
        
        if (searchTerm) {
          url += `&search=${encodeURIComponent(searchTerm)}`;
        }

        const response = await axios.get(url);
        setMembers(response.data.results || response.data);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [selectedRole, searchTerm]);

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Community Members</h1>
          <p className="text-lg text-gray-600">
            Meet the talented professionals in our global community
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Role Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search Members</label>
            <input
              type="text"
              placeholder="Search by name or expertise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Members Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">Loading members...</div>
          </div>
        ) : members.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <Link
                key={member.id}
                to={`/community/member/${member.username}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                      {member.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${getRoleColor(member.role)}`}>
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">
                    {member.full_name || member.username}
                  </h3>
                  
                  {member.location && (
                    <p className="text-sm text-gray-600 mb-2">{member.location}</p>
                  )}

                  {member.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {member.bio}
                    </p>
                  )}

                  <div className="pt-4 border-t">
                    <div className="text-2xl font-bold text-primary-600">{member.contribution_points}</div>
                    <div className="text-xs text-gray-600">Contribution Points</div>
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <div className="text-xs text-gray-500">
                      Joined {new Date(member.joined_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <div className="text-lg text-gray-600">No members found matching your criteria.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;
