import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogService } from '../services';

const BlogDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({ name: '', email: '', content: '' });
  const [comments, setComments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await blogService.getOne(slug);
        setPost(response.data);
        setComments(response.data.comments || []);
        await blogService.incrementViews(slug);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await blogService.addComment(slug, commentForm);
      setSubmitMessage('Comment submitted for review.');
      setCommentForm({ name: '', email: '', content: '' });
    } catch (error) {
      setSubmitMessage('Failed to submit comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    background: '#F1F3F5',
    border: '1px solid #D1D5DB',
    color: '#111827',
    padding: '12px 14px',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    width: '100%',
    display: 'block',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '6px',
  };

  if (loading) {
    return (
      <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', marginBottom: '24px' }}>Post not found.</p>
          <Link to="/blog" style={{ color: '#A81D37', textDecoration: 'none', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            &larr; Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#111827' }}>
      {/* Hero */}
      <div style={{ background: '#F8F9FA', borderBottom: '1px solid #E5E7EB', padding: '80px 0 60px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
          <Link
            to="/blog"
            style={{ color: '#A81D37', textDecoration: 'none', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '32px' }}
          >
            &larr; Back to Blog
          </Link>
          {post.category && (
            <div style={{ marginBottom: '16px' }}>
              <span style={{ background: '#A81D37', color: '#fff', padding: '4px 12px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {post.category}
              </span>
            </div>
          )}
          <h1 style={{ fontSize: '40px', fontWeight: 800, lineHeight: 1.2, color: '#111827', margin: '0 0 24px' }}>
            {post.title}
          </h1>
          <div style={{ display: 'flex', gap: '24px', color: '#6B7280', fontSize: '13px' }}>
            {post.author && <span>{post.author}</span>}
            {post.published_at && (
              <span>{new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            )}
            {post.views && <span>{post.views} views</span>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
        {/* Featured Image */}
        {post.featured_image && (
          <div style={{ margin: '48px 0' }}>
            <img
              src={post.featured_image}
              alt={post.title}
              style={{ width: '100%', height: '400px', objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}

        {/* Article Content */}
        <article style={{ padding: '48px 0', borderBottom: '1px solid #E5E7EB' }}>
          {post.excerpt && (
            <p style={{ fontSize: '18px', color: '#374151', lineHeight: 1.7, marginBottom: '32px', borderLeft: '3px solid #A81D37', paddingLeft: '20px' }}>
              {post.excerpt}
            </p>
          )}
          {post.content && (
            <div
              className="blog-content"
              style={{ fontSize: '16px', color: '#4B5563', lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          )}
        </article>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={{ padding: '32px 0', borderBottom: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(Array.isArray(post.tags) ? post.tags : post.tags.split(',')).map((tag, idx) => (
                <span
                  key={idx}
                  style={{ border: '1px solid #D1D5DB', color: '#6B7280', padding: '4px 12px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}
                >
                  {String(tag).trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <section style={{ padding: '64px 0' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: '0 0 40px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Comments ({comments.length})
          </h2>

          {comments.length > 0 && (
            <div style={{ marginBottom: '48px' }}>
              {comments.map((comment, idx) => (
                <div
                  key={idx}
                  style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '16px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: '#111827', fontWeight: 700, fontSize: '14px' }}>{comment.name}</span>
                    <span style={{ color: '#6B7280', fontSize: '12px' }}>
                      {comment.created_at && new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ color: '#4B5563', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>{comment.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Comment Form */}
          <div style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', padding: '40px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: '0 0 32px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Leave a Comment
            </h3>
            {submitMessage && (
              <div style={{ background: '#F1F3F5', border: '1px solid #D1D5DB', color: '#A81D37', padding: '12px 16px', marginBottom: '24px', fontSize: '14px' }}>
                {submitMessage}
              </div>
            )}
            <form onSubmit={handleCommentSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Name *</label>
                  <input
                    type="text"
                    value={commentForm.name}
                    onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input
                    type="email"
                    value={commentForm.email}
                    onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '28px' }}>
                <label style={labelStyle}>Comment *</label>
                <textarea
                  value={commentForm.content}
                  onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                  required
                  rows={5}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: '#A81D37',
                  color: '#111827',
                  border: 'none',
                  padding: '14px 32px',
                  fontSize: '13px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
                  fontFamily: 'inherit',
                }}
              >
                {submitting ? 'Submitting...' : 'Post Comment'}
              </button>
            </form>
          </div>
        </section>
      </div>

      {/* CTA */}
      <div style={{ background: '#F8F9FA', borderTop: '1px solid #E5E7EB', padding: '64px 24px', textAlign: 'center' }}>
        <p style={{ color: '#6B7280', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Atonix Blog</p>
        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: '0 0 32px' }}>Explore More Articles</h2>
        <Link
          to="/blog"
          style={{ display: 'inline-block', background: '#A81D37', color: '#fff', padding: '14px 32px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none' }}
        >
          View All Posts
        </Link>
      </div>
    </div>
  );
};

export default BlogDetail;
