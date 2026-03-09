import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const resourceTypes = [
  { value: 'all', label: 'All Resources' },
  { value: 'tutorial', label: 'Tutorials' },
  { value: 'guide', label: 'Guides' },
  { value: 'template', label: 'Templates' },
  { value: 'tool', label: 'Tools' },
  { value: 'library', label: 'Libraries' },
  { value: 'documentation', label: 'Documentation' },
];

const difficultyLevels = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const typeColor = (type) => {
  const m = { tutorial: '#DC2626', guide: '#00AA44', template: '#8833FF', tool: '#FF6600', library: '#CC0033', documentation: '#00AACC' };
  return m[type] || '#6B7280';
};

const diffColor = (level) => {
  const m = { beginner: '#00AA44', intermediate: '#FFAA00', advanced: '#CC0033' };
  return m[level] || '#6B7280';
};

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        let url = 'http://localhost:8000/api/community/resources/?ordering=-featured,-created_at';
        if (selectedType !== 'all') url += `&resource_type=${selectedType}`;
        if (selectedDifficulty !== 'all') url += `&difficulty_level=${selectedDifficulty}`;
        if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
        const response = await axios.get(url);
        setResources(response.data.results || response.data);
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, [selectedType, selectedDifficulty, searchTerm]);

  const selectStyle = { background: '#F1F3F5', border: '1px solid #D1D5DB', color: '#111827', padding: '10px 14px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', width: '100%' };
  const inputStyle = { ...selectStyle };
  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' };

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#111827' }}>
      <div style={{ background: '#F8F9FA', borderBottom: '1px solid #E5E7EB', padding: '80px 0 60px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>Community</p>
          <h1 style={{ fontSize: '48px', fontWeight: 800, color: '#111827', margin: '0 0 16px' }}>Community Resources</h1>
          <p style={{ fontSize: '18px', color: '#6B7280' }}>Discover tutorials, guides, and templates shared by the community.</p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '48px' }}>
          <div>
            <label style={labelStyle}>Type</label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} style={selectStyle}>
              {resourceTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Difficulty</label>
            <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)} style={selectStyle}>
              {difficultyLevels.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Search</label>
            <input type="text" placeholder="Search resources..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={inputStyle} />
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#6B7280' }}>Loading resources...</p>
        ) : resources.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {resources.map((r) => (
              <Link key={r.id} to={`/community/resource/${r.slug}`}
                style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                    <span style={{ background: typeColor(r.resource_type), color: '#111827', padding: '3px 10px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {r.resource_type}
                    </span>
                    <span style={{ border: `1px solid ${diffColor(r.difficulty_level)}`, color: diffColor(r.difficulty_level), padding: '3px 10px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {r.difficulty_level}
                    </span>
                    {r.featured && (
                      <span style={{ border: '1px solid #FFAA00', color: '#FFAA00', padding: '3px 10px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Featured
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '10px', lineHeight: 1.4, flex: 1 }}>{r.title}</h3>
                  <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6, marginBottom: '14px' }}>{r.description}</p>
                  {r.tags && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                      {r.tags.split(',').slice(0, 3).map((tag, i) => (
                        <span key={i} style={{ border: '1px solid #D1D5DB', color: '#6B7280', padding: '2px 8px', fontSize: '11px' }}>{tag.trim()}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{r.author_info && r.author_info.full_name ? r.author_info.full_name : 'Community'}</div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>{new Date(r.created_at).toLocaleDateString()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#DC2626' }}>{r.view_count}</div>
                      <div style={{ fontSize: '10px', color: '#6B7280', textTransform: 'uppercase' }}>Views</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#6B7280' }}>No resources found. Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;
