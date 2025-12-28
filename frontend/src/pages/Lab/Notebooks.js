import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { notebookService } from '../../services';

const formatApiError = (e, fallback) => {
  return e?.response?.data?.detail || e?.response?.data?.error || fallback;
};

const Notebooks = () => {
  const { search } = useOutletContext();
  const navigate = useNavigate();
  const [notebooks, setNotebooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await notebookService.listNotebooks();
      const list = res.data?.results || res.data || [];
      setNotebooks(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(formatApiError(e, 'Failed to load notebooks'));
      setNotebooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search) return notebooks;
    const q = search.toLowerCase();
    return notebooks.filter((n) => (n.name || '').toLowerCase().includes(q));
  }, [notebooks, search]);

  const handleCreate = async () => {
    setCreating(true);
    setError('');
    try {
      const res = await notebookService.createNotebook({ name: 'Untitled Notebook' });
      const created = res.data;
      await load();
      if (created?.id) navigate(`/lab/notebooks/${created.id}`);
    } catch (e) {
      setError(formatApiError(e, 'Failed to create notebook'));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notebook?')) return;
    setError('');
    try {
      await notebookService.deleteNotebook(id);
      await load();
    } catch (e) {
      setError(formatApiError(e, 'Failed to delete notebook'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-xl">Loading notebooks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Notebooks</h1>
          <p className="text-gray-600 mt-1">A Jupyter-style notebook environment inside Experimental Lab.</p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          disabled={creating}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-60"
        >
          {creating ? 'Creating…' : 'New Notebook'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        {filtered.length === 0 ? (
          <div className="text-gray-600">No notebooks yet. Click “New Notebook”.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-2">Name</th>
                  <th className="py-2">Updated</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((n) => (
                  <tr key={n.id} className="border-b last:border-b-0">
                    <td className="py-2 font-semibold text-gray-900">
                      <Link to={`/lab/notebooks/${n.id}`} className="hover:underline">
                        {n.name || 'Untitled Notebook'}
                      </Link>
                    </td>
                    <td className="py-2">{n.updated_at ? new Date(n.updated_at).toLocaleString() : '-'}</td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(n.id)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50"
                      >
                        Delete
                      </button>
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

export default Notebooks;
