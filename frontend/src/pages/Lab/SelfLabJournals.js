import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
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
  const outlet = useOutletContext();
  const theme = outlet?.theme || 'light';

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

  const headerMutedClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const panelClass = theme === 'dark' ? 'bg-white/5 border border-white/10 rounded-lg p-6' : 'bg-white rounded-lg shadow-md p-6';
  const titleClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const labelClass = theme === 'dark' ? 'text-gray-200' : 'text-gray-700';
  const inputClass = theme === 'dark'
    ? 'w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white outline-none placeholder:text-gray-400'
    : 'w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 outline-none';
  const textareaClass = theme === 'dark'
    ? 'w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white outline-none'
    : 'w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 outline-none';
  const subtleTextClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const metaTextClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const refreshBtnClass = theme === 'dark'
    ? 'px-4 py-2 border border-white/10 rounded-lg font-semibold hover:bg-white/10 text-white'
    : 'px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Journals & Logs</h1>
        <p className={`${headerMutedClass} mt-1`}>Write daily entries and reflections.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className={panelClass}>
        <h2 className={`text-xl font-bold ${titleClass} mb-4`}>New Entry</h2>
        <form onSubmit={create} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-semibold ${labelClass} mb-2`}>Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
                placeholder="e.g. Today I learned..."
                disabled={saving}
              />
            </div>
            <div>
              <label className={`block text-sm font-semibold ${labelClass} mb-2`}>Mood (optional)</label>
              <input
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className={inputClass}
                placeholder="e.g. focused"
                disabled={saving}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-semibold ${labelClass} mb-2`}>Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className={textareaClass}
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

      <div className={panelClass}>
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className={`text-xl font-bold ${titleClass}`}>Entries</h2>
          <button
            type="button"
            onClick={load}
            className={refreshBtnClass}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className={subtleTextClass}>Loading…</div>
        ) : sorted.length === 0 ? (
          <div className={subtleTextClass}>No journal entries yet.</div>
        ) : (
          <div className="space-y-4">
            {sorted.map((j) => (
              <div key={j.id} className={theme === 'dark' ? 'border border-white/10 bg-white/5 rounded-lg p-4' : 'border border-gray-200 rounded-lg p-4'}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className={`font-bold ${titleClass}`}>{j.title}</div>
                    <div className={`text-xs ${metaTextClass}`}>
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
                <div className={theme === 'dark' ? 'text-sm text-gray-100 mt-3 whitespace-pre-wrap' : 'text-sm text-gray-700 mt-3 whitespace-pre-wrap'}>{j.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelfLabJournals;
