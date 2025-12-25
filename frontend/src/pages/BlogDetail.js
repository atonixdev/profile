import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogService } from '../services';

const BlogDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({
    name: '',
    email: '',
    content: '',
  });
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await blogService.getOne(slug);
        setPost(response.data);
        setComments(response.data.comments || []);
        
        // Increment view count
        await blogService.incrementViews(slug);
      } catch (error) {
        console.error('Error fetching blog post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await blogService.addComment(slug, commentForm);
      setComments([response.data, ...comments]);
      setCommentForm({ name: '', email: '', content: '' });
      alert('Comment submitted! It will appear after approval.');
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to submit comment. Please try again.');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      cloud: 'bg-blue-100 text-blue-800',
      ai: 'bg-purple-100 text-purple-800',
      devops: 'bg-green-100 text-green-800',
      infrastructure: 'bg-orange-100 text-orange-800',
      security: 'bg-red-100 text-red-800',
      tutorial: 'bg-yellow-100 text-yellow-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryLabel = (category) => {
    const categoryLabels = {
      cloud: 'Cloud Architecture',
      ai: 'AI & ML',
      devops: 'DevOps',
      infrastructure: 'Infrastructure',
      security: 'Security',
      tutorial: 'Tutorial',
    };
    return categoryLabels[category] || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading blog post...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Blog post not found</h1>
          <Link to="/blog" className="text-primary-600 hover:underline">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Back Link */}
        <Link to="/blog" className="text-primary-600 hover:text-primary-700 mb-6 inline-flex items-center">
          ← Back to Blog
        </Link>

        {/* Header */}
        <article className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="mb-6">
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4 ${getCategoryColor(post.category)}`}>
              {getCategoryLabel(post.category)}
            </span>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
            
            {/* Meta Information */}
            <div className="flex flex-wrap gap-6 text-gray-600 py-4 border-y border-gray-200">
              <div>
                <span className="font-semibold">By</span> {post.author}
              </div>
              <div>
                <span className="font-semibold">Published</span> {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div>
                <span className="font-semibold">Read Time</span> {post.read_time} minutes
              </div>
              <div>
                <span className="font-semibold">Views</span> {post.view_count}
              </div>
            </div>
          </div>

          {/* Featured Image */}
          {post.featured_image && (
            <div className="mb-8">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-8">
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </div>

          {/* Tags */}
          {post.tags_list && post.tags_list.length > 0 && (
            <div className="mb-8 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap gap-3">
                {post.tags_list.map((tag, index) => (
                  <span key={index} className="bg-primary-100 text-primary-700 px-4 py-2 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Comments Section */}
        <section className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-8">Comments ({comments.length})</h2>

          {/* Comment Form */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h3 className="text-xl font-bold mb-6">Leave a Comment</h3>
            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={commentForm.name}
                  onChange={(e) => setCommentForm({...commentForm, name: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  value={commentForm.email}
                  onChange={(e) => setCommentForm({...commentForm, email: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <textarea
                placeholder="Your Comment"
                value={commentForm.content}
                onChange={(e) => setCommentForm({...commentForm, content: e.target.value})}
                required
                rows="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Submit Comment
              </button>
            </form>
          </div>

          {/* Comments List */}
          {comments.length > 0 ? (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="pb-6 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-gray-900">{comment.name}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No comments yet. Be the first to comment!</p>
          )}
        </section>

        {/* Related Posts CTA */}
        <div className="mt-12 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Want to read more?</h3>
          <Link
            to="/blog"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-700 transition-colors"
          >
            Back to All Articles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
