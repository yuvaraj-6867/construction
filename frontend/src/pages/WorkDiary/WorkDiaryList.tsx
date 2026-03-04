import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const weatherOptions = ['Sunny', 'Cloudy', 'Rainy', 'Windy', 'Stormy', 'Other'];

const WorkDiaryList: React.FC = () => {
  const navigate = useNavigate();
  const { id: projectId } = useParams();

  const [diaries, setDiaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDiary, setSelectedDiary] = useState<any>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '', description: '', weather: 'Sunny',
    workers_present_count: '', work_done: '', issues: '',
  });

  useEffect(() => { loadDiaries(); }, [projectId]);

  const loadDiaries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/work_diaries', { params: { project_id: projectId } });
      setDiaries(Array.isArray(res.data) ? res.data : []);
    } catch { setError('Failed to load diary'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (selectedDiary) {
        await api.put(`/work_diaries/${selectedDiary.id}`, { work_diary: { ...formData, project_id: projectId } });
      } else {
        await api.post('/work_diaries', { work_diary: { ...formData, project_id: projectId } });
      }
      setShowForm(false);
      setSelectedDiary(null);
      resetForm();
      loadDiaries();
    } catch (err: any) {
      setError(err.response?.data?.errors?.join(', ') || 'Failed to save');
    }
  };

  const resetForm = () => setFormData({
    date: new Date().toISOString().split('T')[0],
    title: '', description: '', weather: 'Sunny', workers_present_count: '', work_done: '', issues: '',
  });

  const handleEdit = (diary: any) => {
    setSelectedDiary(diary);
    setFormData({
      date: diary.date, title: diary.title || '', description: diary.description || '',
      weather: diary.weather || 'Sunny', workers_present_count: diary.workers_present_count || '',
      work_done: diary.work_done || '', issues: diary.issues || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this diary entry?')) return;
    await api.delete(`/work_diaries/${id}`);
    loadDiaries();
  };

  const weatherEmoji: Record<string, string> = {
    Sunny: '☀️', Cloudy: '☁️', Rainy: '🌧️', Windy: '💨', Stormy: '⛈️', Other: '🌡️'
  };

  return (
    <div className="app">
      <nav style={{ background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)', color: 'white', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          ← Back
        </button>
        <span style={{ fontWeight: 700, fontSize: '1.1rem', flex: 1 }}>📓 Daily Work Diary</span>
        <button onClick={() => { setShowForm(!showForm); setSelectedDiary(null); resetForm(); }} style={{ background: 'white', color: '#1F7A8C', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
          + Add Entry
        </button>
      </nav>

      <div style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
        {/* Add/Edit Form */}
        {showForm && (
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1F7A8C' }}>{selectedDiary ? 'Edit Entry' : 'New Diary Entry'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label">Date *</label>
                  <input type="date" className="input" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="label">Weather</label>
                  <select className="input" value={formData.weather} onChange={e => setFormData({ ...formData, weather: e.target.value })}>
                    {weatherOptions.map(w => <option key={w} value={w}>{weatherEmoji[w]} {w}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Title</label>
                  <input className="input" placeholder="e.g. Foundation work" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="label">Workers Present</label>
                  <input type="number" className="input" placeholder="e.g. 12" value={formData.workers_present_count} onChange={e => setFormData({ ...formData, workers_present_count: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="label">Work Done</label>
                  <textarea className="input" rows={3} placeholder="Describe work completed today..." value={formData.work_done} onChange={e => setFormData({ ...formData, work_done: e.target.value })} style={{ resize: 'vertical' }} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="label">Issues / Blockers</label>
                  <textarea className="input" rows={2} placeholder="Any problems or delays..." value={formData.issues} onChange={e => setFormData({ ...formData, issues: e.target.value })} style={{ resize: 'vertical' }} />
                </div>
              </div>
              {error && <p style={{ color: 'red', fontSize: '0.85rem', margin: '0.5rem 0' }}>{error}</p>}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{selectedDiary ? 'Update' : 'Save'}</button>
                <button type="button" className="btn" onClick={() => { setShowForm(false); setSelectedDiary(null); }} style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Diary Entries */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Loading...</div>
        ) : diaries.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📓</div>
            <p>No diary entries yet. Click "+ Add Entry" to start logging daily work.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {diaries.map((diary) => (
              <div key={diary.id} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 700, color: '#1F7A8C', fontSize: '1rem' }}>
                        {new Date(diary.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <span style={{ fontSize: '1.1rem' }}>{weatherEmoji[diary.weather] || '🌡️'} {diary.weather}</span>
                      {diary.workers_present_count > 0 && (
                        <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '0.2rem 0.5rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
                          👷 {diary.workers_present_count} workers
                        </span>
                      )}
                    </div>
                    {diary.title && <div style={{ fontWeight: 600, marginTop: '0.25rem', color: '#333' }}>{diary.title}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleEdit(diary)} style={{ background: '#E3F2FD', color: '#1565C0', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                    <button onClick={() => handleDelete(diary.id)} style={{ background: '#fee2e2', color: '#c62828', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                  </div>
                </div>
                {diary.work_done && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Work Done</span>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#333', fontSize: '0.9rem' }}>{diary.work_done}</p>
                  </div>
                )}
                {diary.issues && (
                  <div style={{ background: '#FFF3E0', padding: '0.5rem 0.75rem', borderRadius: '8px', borderLeft: '3px solid #F57C00' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#E65100' }}>Issues: </span>
                    <span style={{ color: '#333', fontSize: '0.9rem' }}>{diary.issues}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkDiaryList;
