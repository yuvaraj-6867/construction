import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const MilestoneList: React.FC = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [milestones, setMilestones] = useState<any[]>([]);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form, setForm] = useState({ title: '', target_date: '', completion_pct: '0', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAll();
    api.get(`/projects/${projectId}`).then(r => setProjectName(r.data.name || '')).catch(() => {});
  }, [projectId]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const res = await api.get('/project_milestones', { params: { project_id: projectId } });
      setMilestones(Array.isArray(res.data) ? res.data : []);
    } catch { setMilestones([]); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditingItem(null);
    setForm({ title: '', target_date: '', completion_pct: '0', notes: '' });
    setError(''); setShowForm(true);
  };

  const openEdit = (m: any) => {
    setEditingItem(m);
    setForm({ title: m.title, target_date: m.target_date || '', completion_pct: String(m.completion_pct || 0), notes: m.notes || '' });
    setError(''); setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const payload = { project_milestone: { ...form, project_id: projectId, completed: Number(form.completion_pct) === 100 } };
      if (editingItem) {
        await api.put(`/project_milestones/${editingItem.id}`, payload);
      } else {
        await api.post('/project_milestones', payload);
      }
      setShowForm(false); loadAll();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this milestone?')) return;
    try { await api.delete(`/project_milestones/${id}`); setMilestones(prev => prev.filter(m => m.id !== id)); }
    catch { alert('Delete failed'); }
  };

  const completedCount = milestones.filter(m => m.completed || Number(m.completion_pct) === 100).length;
  const overallPct = milestones.length === 0 ? 0 : Math.round(milestones.reduce((s, m) => s + Number(m.completion_pct || 0), 0) / milestones.length);

  const statusColor = (pct: number) => pct === 100 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '2rem 3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1.5rem 2rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button onClick={() => navigate(`/projects/${projectId}`)}
            style={{ background: '#f8f9fa', color: '#1F7A8C', border: '2px solid #1F7A8C', padding: '0.65rem 1.25rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>
            ← Back
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', background: 'linear-gradient(135deg, #1F7A8C, #16616F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' }}>
              🏁 Milestones
            </h1>
            <p style={{ margin: 0, color: '#6c757d' }}>{projectName} — {completedCount}/{milestones.length} completed · {overallPct}% overall</p>
          </div>
        </div>
        <button onClick={openAdd}
          style={{ background: 'linear-gradient(135deg, #1F7A8C, #16616F)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem' }}>
          + Add Milestone
        </button>
      </div>

      {/* Progress Bar */}
      {milestones.length > 0 && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem 2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: '700', color: '#1F7A8C' }}>Overall Project Progress</span>
            <span style={{ fontWeight: '700', color: statusColor(overallPct) }}>{overallPct}%</span>
          </div>
          <div style={{ height: '16px', background: '#e9ecef', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${overallPct}%`, background: `linear-gradient(135deg, ${statusColor(overallPct)}, ${statusColor(overallPct)}cc)`, borderRadius: '8px', transition: 'width 0.5s' }} />
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#1F7A8C' }}>{editingItem ? '✏️ Edit Milestone' : '🏁 Add Milestone'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', color: '#555', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Title *</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="e.g. Foundation Complete"
                  style={{ width: '100%', padding: '0.65rem', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#555', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Target Date</label>
                  <input type="date" value={form.target_date} onChange={e => setForm({...form, target_date: e.target.value})}
                    style={{ width: '100%', padding: '0.65rem', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#555', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Completion % ({form.completion_pct}%)</label>
                  <input type="range" min="0" max="100" step="5" value={form.completion_pct} onChange={e => setForm({...form, completion_pct: e.target.value})}
                    style={{ width: '100%', cursor: 'pointer' }} />
                </div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', color: '#555', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2}
                  style={{ width: '100%', padding: '0.65rem', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '0.95rem', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              {error && <p style={{ color: '#C62828', marginBottom: '1rem' }}>{error}</p>}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" disabled={saving}
                  style={{ flex: 1, background: 'linear-gradient(135deg, #1F7A8C, #16616F)', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  {saving ? 'Saving...' : editingItem ? 'Update' : 'Add'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ flex: 1, background: '#f0f0f0', color: '#666', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Milestone Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>Loading...</div>
      ) : milestones.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏁</div>
          <h2 style={{ color: '#1F7A8C' }}>No Milestones</h2>
          <p style={{ color: '#999', marginBottom: '1.5rem' }}>Track project phases and completion</p>
          <button onClick={openAdd} style={{ background: 'linear-gradient(135deg, #1F7A8C, #16616F)', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
            Add First Milestone
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {milestones.map(m => {
            const pct = Number(m.completion_pct || 0);
            const isOverdue = m.target_date && new Date(m.target_date) < new Date() && pct < 100;
            return (
              <div key={m.id} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem 2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', borderLeft: `4px solid ${statusColor(pct)}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1F7A8C', fontWeight: '700' }}>{m.title}</h3>
                      {pct === 100 && <span style={{ background: '#dcfce7', color: '#16a34a', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>✓ Completed</span>}
                      {isOverdue && <span style={{ background: '#fee2e2', color: '#dc2626', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>⚠ Overdue</span>}
                    </div>
                    {m.target_date && <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: '0.85rem' }}>Target: {new Date(m.target_date).toLocaleDateString('en-IN')}</p>}
                    {m.notes && <p style={{ margin: '0.25rem 0 0', color: '#888', fontSize: '0.85rem' }}>{m.notes}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => openEdit(m)} style={{ background: '#f97316', border: 'none', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>Edit</button>
                    <button onClick={() => handleDelete(m.id)} style={{ background: '#ef4444', border: 'none', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>Delete</button>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ flex: 1, height: '10px', background: '#e9ecef', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(135deg, ${statusColor(pct)}, ${statusColor(pct)}cc)`, borderRadius: '5px', transition: 'width 0.5s' }} />
                  </div>
                  <span style={{ fontWeight: '700', color: statusColor(pct), fontSize: '0.9rem', minWidth: '40px' }}>{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MilestoneList;
