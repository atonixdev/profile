import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogService } from '../../services';

const AdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'ai',
    tags: '',
    featured_image: '',
    published: false,
  });

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await blogService.getAll({}, token);
      setPosts(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingPost) {
        await blogService.update(editingPost.id, formData, token);
      } else {
        await blogService.create(formData, token);
      }
      fetchPosts();
      resetForm();
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const token = localStorage.getItem('token');
        await blogService.delete(id, token);
        fetchPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      tags: post.tags,
      featured_image: post.featured_image || '',
      published: post.published,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ title: '', excerpt: '', content: '', category: 'ai', tags: '', featured_image: '', published: false });
    setEditingPost(null);
    setShowForm(false);
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' };
  const inputStyle = { width: '100%', background: '#F8F9FA', border: '1px solid #D1D5DB', color: '#111827', padding: '10px 14px', fontSize: '14px', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', outline: 'none' };
  const thStyle = { padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', background: '#F1F3F5', borderBottom: '1px solid #D1D5DB' };
  const tdStyle = { padding: '14px 16px', fontSize: '14px', color: '#374151', borderBottom: '1px solid #F3F4F6' };

  if (loading) {
    return <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>Loading...</div>;
  }

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#111827' }}>
      <header style={{ background: '#F8F9FA', borderBottom: '1px solid #E5E7EB', padding: '0 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
          <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>Manage Blog Posts</h1>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowForm(!showForm)}
              style={{ background: '#A81D37', border: 'none', color: '#fff', padding: '8px 16px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
            >
              {showForm ? 'Cancel' : 'Add New Post'}
            </button>
            <Link to="/admin" style={{ border: '1px solid #D1D5DB', color: '#6B7280', padding: '8px 16px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none' }}>Back to Dashboard</Link>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 80px' }}>
        {showForm && (
          <div style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', padding: '32px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 24px' }}>
              {editingPost ? 'Edit Post' : 'Create New Post'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Excerpt</label>
                <textarea value={formData.excerpt} onChange={(e) => setFormData({...formData, excerpt: e.target.value})} style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} rows="3" required />
              </div>
              <div>
                <label style={labelStyle}>Content (HTML)</label>
                <textarea value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} style={{ ...inputStyle, resize: 'vertical', minHeight: '200px' }} rows="10" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={inputStyle}>
                    <option value="ai">Artificial Intelligence</option>
                    <option value="bigdata">Big Data</option>
                    <option value="robotics">Robotics</option>
                    <option value="cloud">Cloud Computing</option>
                    <option value="devops">DevOps</option>
                    <option value="cybersecurity">Cybersecurity</option>
                    <option value="blockchain">Blockchain</option>
                    <option value="iot">Internet of Things</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Tags (comma-separated)</label>
                  <input type="text" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} style={inputStyle} placeholder="AI, Machine Learning, Technology" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Featured Image URL</label>
                <input type="url" value={formData.featured_image} onChange={(e) => setFormData({...formData, featured_image: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" id="published" checked={formData.published} onChange={(e) => setFormData({...formData, published: e.target.checked})} style={{ width: '16px', height: '16px', accentColor: '#A81D37' }} />
                <label htmlFor="published" style={{ fontSize: '13px', color: '#374151', cursor: 'pointer' }}>Publish immediately</label>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" style={{ background: '#A81D37', border: 'none', color: '#fff', padding: '12px 28px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  {editingPost ? 'Update Post' : 'Create Post'}
                </button>
                <button type="button" onClick={resetForm} style={{ background: 'transparent', border: '1px solid #D1D5DB', color: '#6B7280', padding: '12px 28px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Date</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} style={{ background: 'transparent' }}>
                  <td style={tdStyle}><span style={{ color: '#111827', fontWeight: 500 }}>{post.title}</span></td>
                  <td style={tdStyle}><span style={{ color: '#6B7280', textTransform: 'capitalize' }}>{post.category.replace('_', ' ')}</span></td>
                  <td style={tdStyle}>
                    <span style={post.published
                      ? { background: '#003311', border: '1px solid #00AA44', color: '#00AA44', padding: '3px 10px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }
                      : { background: '#F1F3F5', border: '1px solid #D1D5DB', color: '#6B7280', padding: '3px 10px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td style={tdStyle}>{formatDate(post.created_at)}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <button onClick={() => handleEdit(post)} style={{ background: 'transparent', border: 'none', color: '#A81D37', cursor: 'pointer', fontSize: '13px', fontWeight: 600, marginRight: '16px', padding: 0, fontFamily: 'Inter, sans-serif' }}>Edit</button>
                    <button onClick={() => handleDelete(post.id)} style={{ background: 'transparent', border: 'none', color: '#CC0033', cursor: 'pointer', fontSize: '13px', fontWeight: 600, padding: 0, fontFamily: 'Inter, sans-serif' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {posts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px', color: '#6B7280', fontSize: '14px' }}>
              No blog posts yet. Create your first post above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBlog;
