import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectService } from '../services';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await projectService.getOne(id);
        setProject(response.data);
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>Loading...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
          <p style={{ color: '#6B7280', marginBottom: '24px' }}>Project not found.</p>
          <Link to="/portfolio" style={{ color: '#DC2626', textDecoration: 'none', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            &larr; Back to Portfolio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#111827' }}>
      {/* Hero */}
      <div style={{ background: '#F8F9FA', borderBottom: '1px solid #E5E7EB', padding: '80px 0 60px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
          <Link
            to="/portfolio"
            style={{ color: '#DC2626', textDecoration: 'none', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '32px' }}
          >
            &larr; Back to Portfolio
          </Link>
          {project.category && (
            <div style={{ marginBottom: '16px' }}>
              <span style={{ background: '#DC2626', color: '#fff', padding: '4px 12px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {project.category}
              </span>
            </div>
          )}
          <h1 style={{ fontSize: '40px', fontWeight: 800, lineHeight: 1.2, color: '#111827', margin: '0 0 20px' }}>
            {project.title}
          </h1>
          {project.short_description && (
            <p style={{ fontSize: '18px', color: '#6B7280', lineHeight: 1.6, maxWidth: '600px' }}>
              {project.short_description}
            </p>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        {project.thumbnail && (
          <div style={{ margin: '48px 0' }}>
            <img
              src={project.thumbnail}
              alt={project.title}
              style={{ width: '100%', maxHeight: '480px', objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '48px', padding: '48px 0 80px', alignItems: 'start' }}>
          <div>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>
              Project Overview
            </h2>
            <div
              style={{ fontSize: '16px', color: '#4B5563', lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: project.description || project.long_description || project.short_description || '' }}
            />
          </div>

          <div>
            {project.technologies && project.technologies.length > 0 && (
              <div style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', padding: '28px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>
                  Technologies
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {project.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      style={{ border: '1px solid #D1D5DB', color: '#374151', padding: '4px 10px', fontSize: '12px', fontWeight: 600 }}
                    >
                      {typeof tech === 'object' ? tech.name : tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {(project.live_url || project.github_url) && (
              <div style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', padding: '28px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>
                  Links
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {project.live_url && (
                    <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'block', background: '#DC2626', color: '#fff', padding: '12px 20px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none', textAlign: 'center' }}>
                      Live Demo
                    </a>
                  )}
                  {project.github_url && (
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'block', border: '1px solid #D1D5DB', color: '#111827', padding: '12px 20px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none', textAlign: 'center' }}>
                      View on GitHub
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ background: '#F8F9FA', borderTop: '1px solid #E5E7EB', padding: '64px 24px', textAlign: 'center' }}>
        <p style={{ color: '#6B7280', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Portfolio</p>
        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: '0 0 32px' }}>Explore More Projects</h2>
        <Link to="/portfolio"
          style={{ display: 'inline-block', background: '#DC2626', color: '#fff', padding: '14px 32px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none' }}>
          View All Projects
        </Link>
      </div>
    </div>
  );
};

export default ProjectDetail;
