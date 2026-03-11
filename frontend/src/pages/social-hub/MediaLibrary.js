import React, { useEffect, useRef, useState, useCallback } from 'react';

const A    = '#D4AF37';
const BD   = '1px solid #E5E7EB';
const MONO = { fontFamily: 'var(--font-mono)' };

const ALLOWED_MIME = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/quicktime', 'video/webm',
];
const MAX_BYTES = 100 * 1024 * 1024; // 100 MB

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function AssetCard({ asset, onDelete, deleting }) {
  const isVideo = asset.mime_type?.startsWith('video');
  return (
    <div style={{ background: '#FFFFFF', border: BD, overflow: 'hidden', position: 'relative' }}>
      {/* Thumbnail / icon */}
      <div style={{ background: '#F3F4F6', height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {isVideo ? (
          <div style={{ textAlign: 'center', color: '#6B7280' }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>▶</div>
            <div style={{ fontSize: 9, ...MONO }}>VIDEO</div>
          </div>
        ) : asset.storage_path ? (
          <img
            src={`/media/${asset.storage_path}`}
            alt={asset.original_name || 'media'}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            loading="lazy"
          />
        ) : (
          <div style={{ color: '#9CA3AF', fontSize: 28 }}>🖼</div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
          {asset.original_name || asset.storage_path?.split('/').pop() || asset.id.slice(0, 8)}
        </div>
        <div style={{ fontSize: 9, color: '#9CA3AF', ...MONO }}>
          {asset.mime_type} · {formatSize(asset.size_bytes || 0)}
        </div>
        {(asset.width || asset.height) && (
          <div style={{ fontSize: 9, color: '#9CA3AF', ...MONO }}>{asset.width}×{asset.height}</div>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(asset.id, asset.original_name)}
        disabled={deleting === asset.id}
        title="Delete asset"
        style={{
          position: 'absolute', top: 6, right: 6,
          width: 22, height: 22, border: 'none', borderRadius: '50%',
          background: '#EF444490', color: '#FFFFFF', cursor: 'pointer',
          fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: deleting === asset.id ? 0.5 : 1,
        }}
      >
        ×
      </button>
    </div>
  );
}

export default function SocialHubMediaLibrary() {
  const [assets, setAssets]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('all');   // all | image | video
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting]   = useState('');
  const [progress, setProgress]   = useState(0);
  const [error, setError]         = useState('');
  const [notice, setNotice]       = useState('');
  const fileInputRef = useRef(null);

  const loadAssets = useCallback(async (typeFilter) => {
    setLoading(true);
    setError('');
    try {
      const qs = typeFilter && typeFilter !== 'all' ? `?type=${typeFilter}` : '';
      const r = await fetch(`/api/social/media/${qs}`, { credentials: 'include' });
      if (!r.ok) throw new Error('Failed to load media library');
      const data = await r.json();
      setAssets(Array.isArray(data) ? data : (data.results || []));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAssets(filter); }, [filter, loadAssets]);

  async function handleUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setError('');
    setUploading(true);
    setProgress(0);

    const results = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!ALLOWED_MIME.includes(file.type)) {
        setError(`Unsupported file type: ${file.type}`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError(`File too large: ${file.name} (max 100 MB)`);
        continue;
      }
      const fd = new FormData();
      fd.append('file', file);
      try {
        const r = await fetch('/api/social/media/upload', {
          method: 'POST', credentials: 'include', body: fd,
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Upload failed');
        results.push(data);
      } catch (uploadErr) {
        setError(uploadErr.message);
      }
      setProgress(Math.round(((i + 1) / files.length) * 100));
    }
    if (results.length) {
      setNotice(`${results.length} file${results.length > 1 ? 's' : ''} uploaded.`);
      // Prepend newly uploaded assets
      setAssets(prev => [...results, ...prev]);
    }
    setUploading(false);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleDelete(assetId, name) {
    if (!window.confirm(`Delete "${name || assetId.slice(0, 8)}"? This cannot be undone.`)) return;
    setDeleting(assetId);
    try {
      const r = await fetch(`/api/social/media/${assetId}/`, { method: 'DELETE', credentials: 'include' });
      if (!r.ok) throw new Error('Delete failed');
      setAssets(prev => prev.filter(a => a.id !== assetId));
      setNotice('Asset deleted.');
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting('');
    }
  }

  const displayed = filter === 'all' ? assets : assets.filter(a =>
    filter === 'video' ? a.mime_type?.startsWith('video') : a.mime_type?.startsWith('image')
  );

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px) clamp(16px, 4vw, 36px)', color: '#1F2937', minHeight: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 9, ...MONO, letterSpacing: '0.14em', color: A, textTransform: 'uppercase', marginBottom: 6 }}>
            Social Hub / Media Library
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111827' }}>Media Library</h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '6px 0 0' }}>
            Upload and manage images and videos for your posts.
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            padding: '9px 22px', background: A, border: 'none', color: '#06080D',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            cursor: uploading ? 'wait' : 'pointer', ...MONO,
            opacity: uploading ? 0.7 : 1,
          }}
        >
          {uploading ? `Uploading… ${progress}%` : '+ Upload Media'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_MIME.join(',')}
          onChange={handleUpload}
          style={{ display: 'none' }}
        />
      </div>

      {notice && (
        <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#166534' }}>
          {notice}
          <button onClick={() => setNotice('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#166534' }}>×</button>
        </div>
      )}
      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#991B1B' }}>
          {error}
          <button onClick={() => setError('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#991B1B' }}>×</button>
        </div>
      )}

      {/* Upload progress bar */}
      {uploading && (
        <div style={{ height: 4, background: '#E5E7EB', marginBottom: 20 }}>
          <div style={{ height: '100%', background: A, width: `${progress}%`, transition: 'width 0.2s' }} />
        </div>
      )}

      {/* Filter + count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {['all', 'image', 'video'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px', border: BD,
                background: filter === f ? '#111827' : '#FFFFFF',
                color: filter === f ? '#FFFFFF' : '#374151',
                fontSize: 10, fontWeight: 700, cursor: 'pointer', ...MONO,
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: '#9CA3AF', ...MONO }}>
          {displayed.length} asset{displayed.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Allowed types note */}
      <div style={{ fontSize: 10, color: '#9CA3AF', ...MONO, marginBottom: 16 }}>
        Supported: JPEG, PNG, GIF, WebP, MP4, MOV, WebM · Max file size: 100 MB
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ color: '#6B7280', ...MONO, fontSize: 12 }}>Loading media library…</div>
      ) : displayed.length === 0 ? (
        <div style={{ background: '#FFFFFF', border: BD, padding: '32px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
          No {filter !== 'all' ? filter + ' ' : ''}assets yet. Click <strong>Upload Media</strong> to add files.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 180px), 1fr))', gap: 12 }}>
          {displayed.map(asset => (
            <AssetCard key={asset.id} asset={asset} onDelete={handleDelete} deleting={deleting} />
          ))}
        </div>
      )}

      {/* Drop hint */}
      <div
        style={{ marginTop: 24, border: `2px dashed #D1D5DB`, padding: '28px', textAlign: 'center', cursor: 'pointer', color: '#9CA3AF', fontSize: 12 }}
        onClick={() => fileInputRef.current?.click()}
      >
        Click anywhere here or use the <strong>Upload Media</strong> button to add files.
        <br />
        <span style={{ fontSize: 10 }}>Supports batch upload.</span>
      </div>
    </div>
  );
}
