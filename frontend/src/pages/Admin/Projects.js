import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../../services';

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectService.getAll();
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectService.delete(id);
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project');
      }
    }
  };

  const togglePublished = async (project) => {
    try {
      await projectService.update(project.id, {
        ...project,
        is_published: !project.is_published,
      });
      fetchProjects();
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow mb-8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Manage Projects</h1>
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
        <div className="mb-4">
          <p className="text-gray-600">
            Note: Full CRUD interface would include create/edit modals or separate pages.
            This is a simplified view showing list and delete functionality.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Featured
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id}>
                  <td className="px-6 py-4">{project.title}</td>
                  <td className="px-6 py-4 capitalize">{project.category}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => togglePublished(project)}
                      className={`px-3 py-1 rounded ${
                        project.is_published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {project.is_published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {project.is_featured ? 'Featured' : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProjects;
