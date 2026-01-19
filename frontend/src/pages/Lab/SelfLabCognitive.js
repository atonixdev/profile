import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const randDigits = (len) => {
  let s = '';
  for (let i = 0; i < len; i += 1) s += String(Math.floor(Math.random() * 10));
  return s;
};

const SelfLabCognitive = () => {
  const { theme } = useOutletContext();
  const isDark = theme === 'dark';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [mode, setMode] = useState('memory'); // memory | focus | reaction

  // Memory test state
  const [memoryPhase, setMemoryPhase] = useState('idle'); // idle | show | recall | done
  const [memoryDigits, setMemoryDigits] = useState('');
  const [memoryAnswer, setMemoryAnswer] = useState('');
  const memoryShowTimer = useRef(null);

  // Focus test state
  const [focusPhase, setFocusPhase] = useState('idle'); // idle | running | done
  const [focusStream, setFocusStream] = useState('');
  const [focusTarget, setFocusTarget] = useState('A');
  const [focusCount, setFocusCount] = useState('');
  const focusStartAt = useRef(null);

  // Reaction test state
  const [reactionPhase, setReactionPhase] = useState('idle'); // idle | waiting | go | done
  const [reactionMs, setReactionMs] = useState(null);
  const reactionStartAt = useRef(null);
  const reactionTimeout = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await selfLabService.listCognitiveTests();
      const list = res.data?.results || res.data || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(formatApiError(e, 'Failed to load cognitive experiments'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    return () => {
      if (memoryShowTimer.current) clearTimeout(memoryShowTimer.current);
      if (reactionTimeout.current) clearTimeout(reactionTimeout.current);
    };
  }, [load]);

  const saveResult = async ({ testType, score, durationMs, metadata }) => {
    setSaving(true);
    setError('');
    try {
      await selfLabService.createCognitiveTest({
        test_type: testType,
        recorded_at: new Date().toISOString(),
        score,
        duration_ms: durationMs,
        metadata: metadata || {},
      });
      await load();
    } catch (e) {
      setError(formatApiError(e, 'Failed to save test result'));
    } finally {
      setSaving(false);
    }
  };

  const startMemory = () => {
    if (memoryShowTimer.current) clearTimeout(memoryShowTimer.current);
    const digits = randDigits(7);
    setMemoryDigits(digits);
    setMemoryAnswer('');
    setMemoryPhase('show');

    memoryShowTimer.current = setTimeout(() => {
      setMemoryPhase('recall');
    }, 2500);
  };

  const submitMemory = async () => {
    const correct = memoryDigits;
    const answer = memoryAnswer.trim();
    const score = answer === correct ? 1 : 0;
    setMemoryPhase('done');
    await saveResult({
      testType: 'memory',
      score,
      durationMs: null,
      metadata: { digits: correct, answer },
    });
  };

  const startFocus = () => {
    // simple stream: 60 chars with some target letters
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    let stream = '';
    for (let i = 0; i < 60; i += 1) {
      stream += chars[Math.floor(Math.random() * chars.length)];
    }
    const target = 'A';
    setFocusTarget(target);
    setFocusStream(stream);
    setFocusCount('');
    setFocusPhase('running');
    focusStartAt.current = Date.now();
  };

  const submitFocus = async () => {
    const targetCount = (focusStream.match(new RegExp(focusTarget, 'g')) || []).length;
    const guess = Number(focusCount);
    const isValid = Number.isFinite(guess);
    const errorAbs = isValid ? Math.abs(targetCount - guess) : targetCount;
    const score = Math.max(0, 1 - errorAbs / Math.max(1, targetCount));
    const durationMs = focusStartAt.current ? Date.now() - focusStartAt.current : null;

    setFocusPhase('done');
    await saveResult({
      testType: 'focus',
      score: Number(score.toFixed(4)),
      durationMs,
      metadata: { target: focusTarget, targetCount, guess },
    });
  };

  const startReaction = () => {
    if (reactionTimeout.current) clearTimeout(reactionTimeout.current);
    setReactionPhase('waiting');
    setReactionMs(null);

    const delay = 800 + Math.floor(Math.random() * 1200);
    reactionTimeout.current = setTimeout(() => {
      reactionStartAt.current = Date.now();
      setReactionPhase('go');
    }, delay);
  };

  const clickReaction = async () => {
    if (reactionPhase === 'waiting') {
      // too soon
      setReactionPhase('idle');
      setError('Too soon — wait for GO.');
      return;
    }
    if (reactionPhase !== 'go') return;

    const ms = reactionStartAt.current ? Date.now() - reactionStartAt.current : null;
    setReactionMs(ms);
    setReactionPhase('done');

    const score = ms ? Math.max(0, 1 - ms / 1000) : 0;
    await saveResult({
      testType: 'reaction',
      score: Number(score.toFixed(4)),
      durationMs: ms,
      metadata: { reaction_ms: ms },
    });
  };

  const selectedItems = useMemo(() => {
    return [...items].sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));
  }, [items]);

  const remove = async (id) => {
    setError('');
    try {
      await selfLabService.deleteCognitiveTest(id);
      await load();
    } catch (e) {
      setError(formatApiError(e, 'Failed to delete test result'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Cognitive Experiments</h1>
          <p className={`mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Run memory, focus, and cognition tests.</p>
        </div>
      </div>

      {error && (
        <div className={`${isDark ? 'bg-red-500/10 border-red-500/20 text-red-200' : 'bg-red-50 border-red-200 text-red-700'} border px-4 py-3 rounded`}>
          {error}
        </div>
      )}

      <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-xl shadow-xl p-6 space-y-4 backdrop-blur-md`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Test</div>
          <select
            value={mode}
            onChange={(e) => {
              setError('');
              setMode(e.target.value);
              setMemoryPhase('idle');
              setFocusPhase('idle');
              setReactionPhase('idle');
            }}
            className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-[#0A0F1F] border-white/10 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
            disabled={saving}
          >
            <option value="memory">Memory</option>
            <option value="focus">Focus</option>
            <option value="reaction">Reaction</option>
          </select>
          <div className={`text-xs sm:ml-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Results are saved to your Self Lab history.</div>
        </div>

        {mode === 'memory' && (
          <div className="space-y-3">
            <div className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Memorize the digits, then type them back.</div>
            {memoryPhase === 'idle' && (
              <button
                type="button"
                onClick={startMemory}
                className="px-5 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700"
                disabled={saving}
              >
                Start Memory Test
              </button>
            )}
            {memoryPhase === 'show' && (
              <div className={`p-4 rounded-lg border ${isDark ? 'border-white/10 bg-[#0A0F1F]' : 'border-gray-200 bg-gray-50'}`}>
                <div className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Remember:</div>
                <div className={`text-3xl font-mono font-bold tracking-widest ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{memoryDigits}</div>
              </div>
            )}
            {memoryPhase === 'recall' && (
              <div className="space-y-3">
                <input
                  value={memoryAnswer}
                  onChange={(e) => setMemoryAnswer(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border outline-none font-mono ${
                    isDark
                      ? 'bg-[#0A0F1F] border-white/10 text-gray-100 placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Type the digits"
                  disabled={saving}
                />
                <button
                  type="button"
                  onClick={submitMemory}
                  disabled={saving || !memoryAnswer.trim()}
                  className="px-5 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
                >
                  Submit
                </button>
              </div>
            )}
            {memoryPhase === 'done' && (
              <button
                type="button"
                onClick={startMemory}
                className={`px-5 py-2.5 rounded-lg font-semibold border ${isDark ? 'border-white/10 text-gray-100 hover:bg-white/10' : 'border-gray-200 hover:bg-gray-50'}`}
                disabled={saving}
              >
                Run Again
              </button>
            )}
          </div>
        )}

        {mode === 'focus' && (
          <div className="space-y-3">
            <div className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Count how many times the target letter appears.</div>
            {focusPhase === 'idle' && (
              <button
                type="button"
                onClick={startFocus}
                className="px-5 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700"
                disabled={saving}
              >
                Start Focus Test
              </button>
            )}
            {focusPhase !== 'idle' && (
              <div className={`p-4 rounded-lg border ${isDark ? 'border-white/10 bg-[#0A0F1F]' : 'border-gray-200 bg-gray-50'}`}>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Target</div>
                <div className={`text-lg font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{focusTarget}</div>
                <div className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Stream</div>
                <div className={`mt-1 font-mono text-sm break-all ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{focusStream}</div>
              </div>
            )}
            {focusPhase === 'running' && (
              <div className="space-y-3">
                <input
                  value={focusCount}
                  onChange={(e) => setFocusCount(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border outline-none ${
                    isDark
                      ? 'bg-[#0A0F1F] border-white/10 text-gray-100 placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Your count"
                  disabled={saving}
                />
                <button
                  type="button"
                  onClick={submitFocus}
                  disabled={saving || !focusCount.trim()}
                  className="px-5 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
                >
                  Submit
                </button>
              </div>
            )}
            {focusPhase === 'done' && (
              <button
                type="button"
                onClick={startFocus}
                className={`px-5 py-2.5 rounded-lg font-semibold border ${isDark ? 'border-white/10 text-gray-100 hover:bg-white/10' : 'border-gray-200 hover:bg-gray-50'}`}
                disabled={saving}
              >
                Run Again
              </button>
            )}
          </div>
        )}

        {mode === 'reaction' && (
          <div className="space-y-3">
            <div className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Click when you see GO.</div>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <button
                type="button"
                onClick={startReaction}
                className="px-5 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700"
                disabled={saving}
              >
                Start Reaction Test
              </button>
              <button
                type="button"
                onClick={clickReaction}
                className={`px-5 py-2.5 rounded-lg font-semibold border ${
                  reactionPhase === 'go'
                    ? 'bg-green-600 text-white border-green-700'
                    : isDark
                      ? 'border-white/10 text-gray-100 hover:bg-white/10'
                      : 'border-gray-200 hover:bg-gray-50'
                }`}
                disabled={saving || reactionPhase === 'idle'}
              >
                {reactionPhase === 'waiting' ? 'WAIT…' : reactionPhase === 'go' ? 'GO!' : reactionPhase === 'done' ? 'Done' : 'Click'}
              </button>
              {reactionMs != null && (
                <div className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Reaction: <span className="font-bold">{reactionMs} ms</span></div>
              )}
            </div>
            {reactionPhase === 'done' && (
              <button
                type="button"
                onClick={startReaction}
                className={`px-5 py-2.5 rounded-lg font-semibold border ${isDark ? 'border-white/10 text-gray-100 hover:bg-white/10' : 'border-gray-200 hover:bg-gray-50'}`}
                disabled={saving}
              >
                Run Again
              </button>
            )}
          </div>
        )}

        {saving && <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Saving result…</div>}
      </div>

      <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-xl shadow-xl p-6 backdrop-blur-md`}>
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>History</h2>
          <button
            type="button"
            onClick={load}
            className={`px-4 py-2 rounded-lg font-semibold border ${isDark ? 'border-white/10 text-gray-100 hover:bg-white/10' : 'border-gray-200 hover:bg-gray-50'}`}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading…</div>
        ) : selectedItems.length === 0 ? (
          <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>No cognitive experiments yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-left border-b ${isDark ? 'text-gray-300 border-white/10' : 'text-gray-600 border-gray-200'}`}>
                  <th className="py-2">Recorded</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Score</th>
                  <th className="py-2">Duration</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {selectedItems.map((r) => (
                  <tr key={r.id} className={`border-b last:border-b-0 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                    <td className={`py-2 font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{r.recorded_at ? new Date(r.recorded_at).toLocaleString() : '—'}</td>
                    <td className={`py-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{r.test_type}</td>
                    <td className={`py-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{r.score ?? '—'}</td>
                    <td className={`py-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{r.duration_ms != null ? `${r.duration_ms} ms` : '—'}</td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => remove(r.id)}
                        className="text-red-600 font-semibold hover:underline"
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

export default SelfLabCognitive;
