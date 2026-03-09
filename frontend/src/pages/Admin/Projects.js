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

  const thStyle = { padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', background: '#F1F3F5', borderBottom: '1px solid #D1D5DB' };
  const tdStyle = { padding: '14px 16px', fontSize: '14px', color: '#374151', borderBottom: '1px solid #F3F4F6' };

  if (loading) {
    return <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>Loading...</div>;
  }

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#111827' }}>
      <header style={{ background: '#F8F9FA', borderBottom: '1px solid #E5E7EB', padding: '0 24px', marginBottom: '0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
          <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>Manage Projects</h1>
          <Link to="/admin" style={{ border: '1px solid #D1D5DB', color: '#6B7280', padding: '8px 16px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none' }}>
            Back to Dashboard
          </Link>
        </div>
      </header>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 80px' }}>
        <div style={{ overflowX: 'auto', background: '#F8F9FA', border: '1px solid #E5E7EB' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Featured</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td style={tdStyle}>{project.title}</td>
                  <td style={{ ...tdStyle, textTransform: 'capitalize' }}>{project.category}</td>
                  <td style={tdStyle}>
                    <button onClick={() => togglePublished(project)}
                      style={{ background: project.is_published ? '#003311' : '#F1F3F5', border: `1px solid ${project.is_published ? '#00AA44' : '#D1D5DB'}`, color: project.is_published ? '#00AA44' : '#6B7280', padding: '4px 12px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                      {project.is_published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td style={tdStyle}>{project.is_featured ? <span style={{ color: '#DC2626', fontWeight: 700 }}>Featured</span> : <span style={{ color: '#6B7280' }}>—</span>}</td>
                  <td style={tdStyle}>
                    <button onClick={() => handleDelete(project.id)}
                      style={{ background: 'transparent', border: 'none', color: '#CC0033', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {projects.length === 0 && <div style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', padding: '48px', textAlign: 'center', color: '#6B7280' }}>No projects found.</div>}
      </div>
    </div>
  );
};

export default AdminProjects;
