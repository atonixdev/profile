import React, { useCallback, useEffect, useState } from 'react';
import { aiLabService } from '../../services';

const formatApiError = (e, fallback) => {
  const status = e?.response?.status;
  const data = e?.response?.data;
  if (typeof data === 'string') {
    const looksLikeHtml = data.trim().startsWith('<!DOCTYPE') || data.trim().startsWith('<html');
    return `${fallback}${status ? ` (HTTP ${status})` : ''}${looksLikeHtml ? ' (received HTML, check /api proxy)' : ''}`;
  }
  if (data?.detail) return String(data.detail);
  if (data?.error) return String(data.error);
  if (status) return `${fallback} (HTTP ${status})`;
  return e?.message || fallback;
};

const AILabDatasets = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await aiLabService.listDatasets();
      const list = res.data?.results || res.data || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(formatApiError(e, 'Failed to load datasets'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !file) {
      setError('Name and file are required');
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append('name', name.trim());
      form.append('description', description);
      form.append('file', file);
      await aiLabService.createDataset(form);
      setName('');
      setDescription('');
      setFile(null);
      await load();
    } catch (e2) {
      setError(formatApiError(e2, 'Upload failed'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dataset Manager</h1>
        <p className="text-gray-600 mt-1">Upload and manage training datasets.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Dataset</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 outline-none"
              placeholder="e.g. customer-churn-v1"
              disabled={uploading}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 outline-none"
              placeholder="Optional"
              disabled={uploading}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">File</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full"
              disabled={uploading}
            />
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="px-5 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900">Datasets</h2>
          <button
            type="button"
            onClick={load}
            className="px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50"
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-gray-600">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-gray-600">No datasets uploaded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-2">Name</th>
                  <th className="py-2">Created</th>
                  <th className="py-2">File</th>
                </tr>
              </thead>
              <tbody>
                {items.map((d) => (
                  <tr key={d.id} className="border-b last:border-b-0">
                    <td className="py-2 text-gray-900 font-semibold">{d.name}</td>
                    <td className="py-2 text-gray-600">{d.created_at ? new Date(d.created_at).toLocaleString() : '-'}</td>
                    <td className="py-2">
                      {d.file_url ? (
                        <a className="text-primary-700 hover:underline" href={d.file_url} target="_blank" rel="noreferrer">Download</a>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AILabDatasets;
