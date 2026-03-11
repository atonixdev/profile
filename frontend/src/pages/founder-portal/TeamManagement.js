import React, { useState, useEffect, useCallback } from 'react';

const A    = '#A81D37';
const BD   = '1px solid #E5E7EB';
const CARD = { background: '#FFFFFF', border: BD, padding: '20px 24px', borderRadius: 4 };
const MONO = { fontFamily: 'var(--font-mono)' };
const BTN  = (bg, fg) => ({ padding: '7px 16px', border: 'none', borderRadius: 4, fontSize: 11, fontWeight: 700, background: bg, color: fg, cursor: 'pointer', letterSpacing: '0.04em', ...MONO });
const INPUT    = { width: '100%', padding: '8px 12px', border: BD, borderRadius: 4, fontSize: 13, boxSizing: 'border-box' };
const TEXTAREA = { ...INPUT, minHeight: 80, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 };
const OVERLAY  = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 };
const MODAL    = { background: '#FFFFFF', borderRadius: 6, padding: '28px 32px', width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto' };

const api = (url, opts = {}) => fetch(url, {
  credentials: 'include',
  headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...opts.headers },
  ...opts,
}).then(r => { if (r.status === 204) return null; if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); });

const colors = { backlog: '#9CA3AF', todo: '#2563EB', in_progress: '#D97706', review: '#7C3AED', done: '#16A34A' };
const priorityColors = { critical: '#DC2626', high: '#D97706', normal: '#2563EB', low: '#9CA3AF' };
const statusColors = { on_track: '#16A34A', at_risk: '#D97706', behind: '#DC2626', completed: '#6B7280' };

const TeamManagement = () => {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [tab, setTab]           = useState('overview'); // overview | kanban | okr
  const [tasks, setTasks]       = useState([]);
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskModal, setTaskModal] = useState(false);
  const [editTask, setEditTask]  = useState(null);
  const [taskForm, setTaskForm]  = useState({});

  const fetchDashboard = useCallback(() => {
    fetch('/api/portal/dashboard/team/', { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const fetchTasks = useCallback(() => {
    setTaskLoading(true);
    api('/api/portal/tasks/')
      .then(d => { setTasks(Array.isArray(d) ? d : (d.results || [])); setTaskLoading(false); })
      .catch(() => setTaskLoading(false));
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  useEffect(() => {
    if (tab === 'kanban') fetchTasks();
  }, [tab, fetchTasks]);

  const openTaskModal = (task = null) => {
    setEditTask(task);
    setTaskForm(task
      ? { title: task.title, description: task.description, status: task.status, priority: task.priority, due_date: task.due_date || '' }
      : { title: '', description: '', status: 'todo', priority: 'normal', due_date: '' }
    );
    setTaskModal(true);
  };

  const saveTask = () => {
    const method = editTask ? 'PUT' : 'POST';
    const url    = editTask ? `/api/portal/tasks/${editTask.id}/` : '/api/portal/tasks/';
    api(url, { method, body: JSON.stringify(taskForm) })
      .then(() => { setTaskModal(false); fetchTasks(); fetchDashboard(); })
      .catch(err => alert(`Save failed: ${err.message}`));
  };

  const deleteTask = id => {
    if (!window.confirm('Delete this task?')) return;
    api(`/api/portal/tasks/${id}/`, { method: 'DELETE' })
      .then(() => { fetchTasks(); fetchDashboard(); });
  };

  if (loading) return <div style={{ padding: '40px 32px', color: '#6B7280', ...MONO, fontSize: 12 }}>Loading…</div>;
  if (error) return <div style={{ padding: '40px 32px', color: '#DC2626', ...MONO, fontSize: 12 }}>Error: {error}</div>;
  if (!data) return null;

  const wf = data.workforce || {};
  const departments = data.departments || [];
  const taskCounts = data.tasks || {};
  const okrData = data.okr_summary || {};

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 28px) clamp(16px, 4vw, 32px)', maxWidth: 1440 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: A, ...MONO }}>TEM</span>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Team & Resource Management</h1>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Staff allocation, departments, performance tracking, and organizational structure</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: BD }}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'kanban', label: `Kanban (${Object.values(taskCounts).reduce((a,b) => a+b, 0)})` },
          { key: 'okr', label: `OKRs (${okrData.total || 0})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '10px 20px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
            border: 'none', borderBottom: tab === t.key ? `2px solid ${A}` : '2px solid transparent',
            background: 'none', color: tab === t.key ? A : '#6B7280', cursor: 'pointer', ...MONO,
          }}>{t.label}</button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === 'overview' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14, marginBottom: 28 }}>
            <div style={{ ...CARD, borderTop: '3px solid #16A34A' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Total Active Users</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{wf.total_active_users || 0}</div>
            </div>
            <div style={{ ...CARD, borderTop: '3px solid #2563EB' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Staff Members</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{wf.staff_members || 0}</div>
            </div>
            <div style={{ ...CARD, borderTop: `3px solid ${A}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Superusers</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{wf.superusers || 0}</div>
            </div>
            <div style={{ ...CARD, borderTop: '3px solid #7C3AED' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7280', ...MONO, marginBottom: 6 }}>Departments</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{departments.length}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 14, marginBottom: 28 }}>
            <div style={CARD}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 14 }}>Department Registry</div>
              {departments.length === 0 ? (
                <div style={{ fontSize: 12, color: '#9CA3AF', padding: '20px 0', textAlign: 'center' }}>No departments configured yet</div>
              ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                  {departments.map(d => (
                    <div key={d.id} style={{ padding: '10px 12px', border: BD, borderRadius: 4, background: '#F9FAFB' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.08em', padding: '2px 6px', borderRadius: 2, background: 'rgba(37,99,235,0.10)', color: '#2563EB', ...MONO }}>{d.code}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{d.name}</span>
                      </div>
                      <div style={{ fontSize: 10, color: '#6B7280' }}>Head: <span style={{ fontWeight: 600, color: '#374151' }}>{d.head || 'Unassigned'}</span></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={CARD}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 14 }}>Access Control Summary</div>
              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: BD, paddingBottom: 8 }}>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>RBAC</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#16A34A', ...MONO }}>ENFORCED</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: BD, paddingBottom: 8 }}>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>Department Isolation</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#16A34A', ...MONO }}>ACTIVE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 4 }}>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>Audit Trail Logging</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#16A34A', ...MONO }}>ENABLED</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* KANBAN TAB */}
      {tab === 'kanban' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button onClick={() => openTaskModal()} style={BTN(A, '#FFF')}>+ New Task</button>
          </div>
          {taskLoading ? (
            <div style={{ fontSize: 12, color: '#9CA3AF', ...MONO, padding: '40px 0', textAlign: 'center' }}>Loading tasks…</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 12, overflowX: 'auto' }}>
              {['backlog', 'todo', 'in_progress', 'review', 'done'].map(colStatus => {
                const colTasks = tasks.filter(t => t.status === colStatus);
                return (
                  <div key={colStatus} style={{ background: '#F9FAFB', border: BD, borderRadius: 4, minHeight: 400, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '12px 14px', borderBottom: BD, background: colors[colStatus], color: '#FFFFFF' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', ...MONO }}>{colStatus.replace('_', ' ')}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{colTasks.length}</div>
                    </div>
                    <div style={{ flex: 1, padding: 10, overflow: 'auto', display: 'grid', gap: 8, alignContent: 'flex-start' }}>
                      {colTasks.length === 0 ? (
                        <div style={{ fontSize: 11, color: '#D1D5DB', textAlign: 'center', padding: '24px 0', ...MONO }}>—</div>
                      ) : colTasks.map(t => (
                        <div key={t.id} style={{ background: '#FFF', border: BD, borderRadius: 4, padding: '10px 12px' }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#111827', marginBottom: 4, lineHeight: 1.35 }}>{t.title}</div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.06em', padding: '2px 6px', borderRadius: 2, background: `${priorityColors[t.priority] || '#9CA3AF'}18`, color: priorityColors[t.priority] || '#9CA3AF', ...MONO }}>{t.priority?.toUpperCase()}</span>
                            <span style={{ fontSize: 9, color: '#9CA3AF', ...MONO }}>{t.due_date || ''}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            <button onClick={() => openTaskModal(t)} style={{ fontSize: 9, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', padding: 0, ...MONO }}>Edit</button>
                            <button onClick={() => deleteTask(t.id)} style={{ fontSize: 9, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0, ...MONO }}>Del</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* OKR TAB */}
      {tab === 'okr' && (
        <div style={CARD}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1F2937', ...MONO, marginBottom: 16 }}>
            OKR Tracking & Progress
           </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 12, marginBottom: 20 }}>
            {Object.entries({
              'On Track': okrData.on_track,
              'At Risk': okrData.at_risk,
              'Behind': okrData.behind,
              'Completed': okrData.completed,
            }).map(([label, count]) => {
              const statusCol = label.toLowerCase().replace(' ', '_');
              return (
                <div key={label} style={{ padding: '12px 14px', border: BD, borderRadius: 4, background: '#F9FAFB' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: statusColors[statusCol], ...MONO, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{count || 0}</div>
                </div>
              );
            })}
          </div>

          {okrData.total === 0 ? (
            <div style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', padding: '40px 0' }}>No OKRs defined for this quarter</div>
          ) : (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#374151', ...MONO, marginBottom: 12 }}>Avg Progress: {okrData.avg_progress?.toFixed(0) || 0}%</div>
              <div style={{ width: '100%', height: 8, background: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${okrData.avg_progress || 0}%`, background: okrData.avg_progress >= 75 ? '#16A34A' : okrData.avg_progress >= 50 ? '#D97706' : '#DC2626', transition: 'width 0.3s' }} />
              </div>
            </>
          )}
        </div>
      )}

      {/* TASK MODAL */}
      {taskModal && (
        <div style={OVERLAY} onClick={() => setTaskModal(false)}>
          <div style={MODAL} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 20px' }}>{editTask ? 'Edit Task' : 'New Task'}</h2>
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Title</label>
                <input style={INPUT} value={taskForm.title || ''} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Description</label>
                <textarea style={TEXTAREA} value={taskForm.description || ''} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Status</label>
                  <select style={INPUT} value={taskForm.status || 'todo'} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>
                    <option value="backlog">Backlog</option>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Priority</label>
                  <select style={INPUT} value={taskForm.priority || 'normal'} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Due Date</label>
                <input type="date" style={INPUT} value={taskForm.due_date || ''} onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button onClick={() => setTaskModal(false)} style={BTN('#F3F4F6', '#374151')}>Cancel</button>
              <button onClick={saveTask} style={BTN(A, '#FFF')}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
