import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { selfLabService } from '../../services';

const formatApiError = (e, fallback) => {
  const status = e?.response?.status;
  const data = e?.response?.data;
  if (typeof data === 'string') {
    const t = data.trim();
    const looksLikeHtml = t.startsWith('<!DOCTYPE') || t.startsWith('<html');
    return `${fallback}${status ? ` (HTTP ${status})` : ''}${looksLikeHtml ? ' (received HTML, check /api proxy)' : ''}`;
  }
  if (data?.detail) return String(data.detail);
  if (data?.error) return String(data.error);
  if (status) return `${fallback} (HTTP ${status})`;
  return e?.message || fallback;
};

const SelfLabJournals = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [mood, setMood] = useState('');
  const [content, setContent] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await selfLabService.listJournals();
      const list = res.data?.results || res.data || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(formatApiError(e, 'Failed to load journals'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    setSaving(true);
    try {
      await selfLabService.createJournal({
        title: title.trim(),
        mood: mood.trim(),
        content: content.trim(),
      });
      setTitle('');
      setMood('');
      setContent('');
      await load();
    } catch (e2) {
      setError(formatApiError(e2, 'Failed to save journal entry'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    setError('');
    try {
      await selfLabService.deleteJournal(id);
      await load();
    } catch (e) {
      setError(formatApiError(e, 'Failed to delete journal entry'));
    }
  };

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [items]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Journals & Logs</h1>
        <p className="text-gray-600 mt-1">Write daily entries and reflections.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">New Entry</h2>
        <form onSubmit={create} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 outline-none"
                placeholder="e.g. Today I learned..."
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mood (optional)</label>
              <input
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 outline-none"
                placeholder="e.g. focused"
                disabled={saving}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 outline-none"
              disabled={saving}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Entry'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900">Entries</h2>
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
        ) : sorted.length === 0 ? (
          <div className="text-gray-600">No journal entries yet.</div>
        ) : (
          <div className="space-y-4">
            {sorted.map((j) => (
              <div key={j.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="font-bold text-gray-900">{j.title}</div>
                    <div className="text-xs text-gray-500">
                      {j.created_at ? new Date(j.created_at).toLocaleString() : '—'}
                      {j.mood ? ` • mood: ${j.mood}` : ''}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(j.id)}
                    className="text-red-600 font-semibold hover:underline"
                  >
                    Delete
                  </button>
                </div>
                <div className="text-sm text-gray-700 mt-3 whitespace-pre-wrap">{j.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelfLabJournals;
