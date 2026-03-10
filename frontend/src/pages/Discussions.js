import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const categories = [
  { value: 'all', label: 'All' },
  { value: 'general', label: 'General' },
  { value: 'help', label: 'Help & Support' },
  { value: 'showcase', label: 'Showcase' },
  { value: 'ideas', label: 'Ideas' },
  { value: 'cloud', label: 'Cloud' },
  { value: 'ai-ml', label: 'AI / ML' },
  { value: 'devops', label: 'DevOps' },
  { value: 'security', label: 'Security' },
];

const Discussions = () => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const cat = searchParams.get('category') || 'all';
    const q = searchParams.get('q') || '';
    setSelectedCategory(cat);
    setSearchTerm(q);
  }, [searchParams]);

  useEffect(() => {
    const fetchDiscussions = async () => {
      setLoading(true);
      try {
        let url = 'http://localhost:8000/api/community/discussions/?ordering=-created_at';
        if (selectedCategory !== 'all') url += `&category=${selectedCategory}`;
        if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
        const response = await axios.get(url);
        setDiscussions(response.data.results || response.data);
      } catch (error) {
        console.error('Error fetching discussions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDiscussions();
  }, [selectedCategory, searchTerm]);

  const handleCategoryChange = (val) => {
    setSelectedCategory(val);
    const params = {};
    if (val !== 'all') params.category = val;
    if (searchTerm) params.q = searchTerm;
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (selectedCategory !== 'all') params.category = selectedCategory;
    if (searchTerm) params.q = searchTerm;
    setSearchParams(params);
  };

  const inputStyle = { background: '#F1F3F5', border: '1px solid #D1D5DB', color: '#111827', padding: '10px 14px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', width: '100%', display: 'block' };
  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' };

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#111827' }}>
      <div style={{ background: '#F8F9FA', borderBottom: '1px solid #E5E7EB', padding: '80px 0 60px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <Link to="/community" style={{ color: '#A81D37', textDecoration: 'none', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'inline-block', marginBottom: '24px' }}>&larr; Community Hub</Link>
          <h1 style={{ fontSize: '48px', fontWeight: 800, color: '#111827', margin: '0 0 16px' }}>Discussions</h1>
          <p style={{ fontSize: '18px', color: '#6B7280' }}>Join conversations with the AtonixCorp engineering community.</p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px 80px', display: 'grid', gridTemplateColumns: '240px 1fr', gap: '40px', alignItems: 'start' }}>
        <div>
          <div style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', padding: '28px' }}>
            <div style={{ marginBottom: '28px' }}>
              <label style={labelStyle}>Search</label>
              <form onSubmit={handleSearch}>
                <input type="text" placeholder="Search discussions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={inputStyle} />
              </form>
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {categories.map(cat => (
                  <button key={cat.value} onClick={() => handleCategoryChange(cat.value)}
                    style={{ background: selectedCategory === cat.value ? '#A81D37' : 'transparent', border: 'none', color: selectedCategory === cat.value ? '#fff' : '#6B7280', padding: '8px 12px', textAlign: 'left', fontSize: '13px', fontWeight: selectedCategory === cat.value ? 700 : 400, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          {loading ? (
            <p style={{ color: '#6B7280' }}>Loading discussions...</p>
          ) : discussions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {discussions.map((d) => (
                <Link key={d.id} to={`/community/discussions/${d.id}`}
                  style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', borderLeft: '3px solid #A81D37', padding: '20px 24px', textDecoration: 'none', display: 'block' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>{d.title}</div>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6B7280' }}>
                        {d.author_info && d.author_info.username && <span>{d.author_info.username}</span>}
                        {d.category && <span style={{ color: '#A81D37', fontWeight: 600 }}>{d.category}</span>}
                        {d.created_at && <span>{new Date(d.created_at).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    {d.reply_count !== undefined && (
                      <div style={{ textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>{d.reply_count}</div>
                        <div style={{ fontSize: '10px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Replies</div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', padding: '48px', textAlign: 'center' }}>
              <p style={{ color: '#6B7280', fontSize: '15px' }}>No discussions found. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Discussions;
