import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { notebookService } from '../../services';

const formatApiError = (e, fallback) => {
  return e?.response?.data?.detail || e?.response?.data?.error || fallback;
};

const NotebookEditor = () => {
  const { notebookId } = useParams();
  const navigate = useNavigate();
  const { theme } = useOutletContext();

  const [notebook, setNotebook] = useState(null);
  const [cells, setCells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [kernelStatus, setKernelStatus] = useState({ status: 'unknown' });
  const [installPkg, setInstallPkg] = useState('');
  const [installOutput, setInstallOutput] = useState(null);
  const [installing, setInstalling] = useState(false);

  const [runningCellId, setRunningCellId] = useState(null);

  // Debounced autosave per cell
  const saveTimersRef = useRef(new Map());

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [nbRes, cellRes, statusRes] = await Promise.all([
        notebookService.getNotebook(notebookId),
        notebookService.listCells(notebookId),
        notebookService.kernelStatus().catch(() => ({ data: { status: 'error' } })),
      ]);

      setNotebook(nbRes.data);
      const list = cellRes.data?.results || cellRes.data || [];
      setCells(Array.isArray(list) ? list : []);
      setKernelStatus(statusRes.data || { status: 'unknown' });
    } catch (e) {
      setError(formatApiError(e, 'Failed to load notebook'));
      setNotebook(null);
      setCells([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const timers = saveTimersRef.current;
    // Cleanup timers
    return () => {
      for (const t of timers.values()) {
        clearTimeout(t);
      }
      timers.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notebookId]);

  const monacoTheme = useMemo(() => (theme === 'dark' ? 'vs-dark' : 'vs'), [theme]);

  const updateNotebookName = async (name) => {
    if (!notebook?.id) return;
    try {
      const res = await notebookService.updateNotebook(notebook.id, { name });
      setNotebook(res.data);
    } catch (e) {
      setError(formatApiError(e, 'Failed to rename notebook'));
    }
  };

  const handleDeleteNotebook = async () => {
    if (!notebook?.id) return;
    if (!window.confirm('Delete this notebook?')) return;
    try {
      await notebookService.deleteNotebook(notebook.id);
      navigate('/lab/notebooks');
    } catch (e) {
      setError(formatApiError(e, 'Failed to delete notebook'));
    }
  };

  const handleAddCell = async () => {
    setError('');
    try {
      const res = await notebookService.createCell(notebookId, { code: '' });
      const created = res.data;
      setCells((prev) => [...prev, created].sort((a, b) => (a.position || 0) - (b.position || 0)));
    } catch (e) {
      setError(formatApiError(e, 'Failed to add cell'));
    }
  };

  const scheduleSaveCell = (cellId, patch) => {
    const existing = saveTimersRef.current.get(cellId);
    if (existing) clearTimeout(existing);

    const t = setTimeout(async () => {
      try {
        const res = await notebookService.updateCell(cellId, patch);
        setCells((prev) => prev.map((c) => (String(c.id) === String(cellId) ? res.data : c)));
      } catch (e) {
        setError(formatApiError(e, 'Failed to save cell'));
      }
    }, 800);

    saveTimersRef.current.set(cellId, t);
  };

  const handleChangeCode = (cellId, code) => {
    setCells((prev) => prev.map((c) => (String(c.id) === String(cellId) ? { ...c, code } : c)));
    scheduleSaveCell(cellId, { code });
  };

  const handleRunCell = async (cell) => {
    setError('');
    setRunningCellId(cell.id);
    try {
      const res = await notebookService.runCell(cell.id, cell.code || '');
      setCells((prev) => prev.map((c) => (String(c.id) === String(cell.id) ? res.data : c)));
    } catch (e) {
      setError(formatApiError(e, 'Failed to run cell'));
    } finally {
      setRunningCellId(null);
    }
  };

  const handleInstall = async () => {
    const pkg = installPkg.trim();
    if (!pkg) return;
    setInstalling(true);
    setInstallOutput(null);
    setError('');
    try {
      const res = await notebookService.installPackage(pkg);
      setInstallOutput(res.data);
      const st = await notebookService.kernelStatus().catch(() => null);
      if (st?.data) setKernelStatus(st.data);
    } catch (e) {
      setError(formatApiError(e, 'Failed to install package'));
    } finally {
      setInstalling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-xl">Loading notebook...</div>
      </div>
    );
  }

  if (!notebook) {
    return (
      <div className="space-y-4">
        <div className="text-2xl font-bold">Notebook</div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
        )}
        <button
          type="button"
          onClick={() => navigate('/lab/notebooks')}
          className="px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50"
        >
          Back to Notebooks
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Notebook</h1>
          <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2">
            <input
              value={notebook.name || ''}
              onChange={(e) => setNotebook((prev) => ({ ...prev, name: e.target.value }))}
              onBlur={(e) => updateNotebookName(e.target.value)}
              className="w-full sm:max-w-xl px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Notebook name"
            />
            <div className="text-sm text-gray-600">
              Kernel: <span className="font-semibold">{kernelStatus?.status || 'unknown'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate('/lab/notebooks')}
            className="px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleDeleteNotebook}
            className="px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50"
          >
            Delete
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="font-bold text-gray-900">Notebook Actions</div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleAddCell}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700"
            >
              Add Cell
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-2">
          <input
            value={installPkg}
            onChange={(e) => setInstallPkg(e.target.value)}
            placeholder="Install package (e.g., numpy)"
            className="w-full md:max-w-md px-3 py-2 border border-gray-300 rounded-lg"
          />
          <button
            type="button"
            onClick={handleInstall}
            disabled={installing || !installPkg.trim()}
            className="px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-60"
          >
            {installing ? 'Installing…' : 'Install'}
          </button>
        </div>

        {installOutput && (
          <div className="bg-gray-50 border border-gray-200 rounded p-3 text-sm whitespace-pre-wrap">
            {installOutput.stderr ? installOutput.stderr : installOutput.stdout}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {cells.length === 0 ? (
          <div className="text-gray-600">No cells yet. Click “Add Cell”.</div>
        ) : (
          cells
            .slice()
            .sort((a, b) => (a.position || 0) - (b.position || 0))
            .map((cell, idx) => (
              <div key={cell.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <div className="font-semibold text-gray-900">Cell {idx + 1}</div>
                  <button
                    type="button"
                    onClick={() => handleRunCell(cell)}
                    disabled={runningCellId === cell.id}
                    className="px-3 py-1.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-60"
                  >
                    {runningCellId === cell.id ? 'Running…' : 'Run'}
                  </button>
                </div>

                <div className="p-4">
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <Editor
                      height="220px"
                      language="python"
                      theme={monacoTheme}
                      value={cell.code || ''}
                      onChange={(value) => handleChangeCode(cell.id, value || '')}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                      }}
                    />
                  </div>

                  {(cell.last_stdout || cell.last_stderr) && (
                    <div className="mt-4">
                      <div className="text-xs text-gray-600 mb-2">
                        Last run: {cell.last_executed_at ? new Date(cell.last_executed_at).toLocaleString() : '-'}
                        {cell.last_duration_ms ? ` • ${cell.last_duration_ms} ms` : ''}
                        {cell.last_exit_code !== null && cell.last_exit_code !== undefined ? ` • exit ${cell.last_exit_code}` : ''}
                      </div>

                      {cell.last_stdout && (
                        <pre className="text-sm bg-gray-50 border border-gray-200 rounded p-3 whitespace-pre-wrap overflow-x-auto">{cell.last_stdout}</pre>
                      )}
                      {cell.last_stderr && (
                        <pre className="text-sm bg-red-50 border border-red-200 text-red-700 rounded p-3 whitespace-pre-wrap overflow-x-auto mt-2">{cell.last_stderr}</pre>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default NotebookEditor;
