import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const EquipmentList: React.FC = () => {
  const navigate = useNavigate();
  const { id: projectId } = useParams();

  const [equipments, setEquipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '', equipment_type: '', usage_date: new Date().toISOString().split('T')[0],
    hours_used: '', daily_rate: '', operator_name: '', notes: '',
  });

  useEffect(() => { loadEquipments(); }, [projectId]);

  const loadEquipments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/equipments', { params: { project_id: projectId } });
      setEquipments(Array.isArray(res.data) ? res.data : []);
    } catch { setError('Failed to load equipment'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/equipments', { equipment: { ...formData, project_id: projectId } });
      setShowForm(false);
      setFormData({ name: '', equipment_type: '', usage_date: new Date().toISOString().split('T')[0], hours_used: '', daily_rate: '', operator_name: '', notes: '' });
      loadEquipments();
    } catch (err: any) {
      setError(err.response?.data?.errors?.join(', ') || 'Failed to save');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this equipment record?')) return;
    await api.delete(`/equipments/${id}`);
    loadEquipments();
  };

  const totalCost = equipments.reduce((s, e) => s + parseFloat(e.total_cost || 0), 0);

  return (
    <div className="app">
      <nav style={{ background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)', color: 'white', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          ← Back
        </button>
        <span style={{ fontWeight: 700, fontSize: '1.1rem', flex: 1 }}>🚜 Equipment & Machinery</span>
        <button onClick={() => setShowForm(!showForm)} style={{ background: 'white', color: '#1F7A8C', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
          + Add
        </button>
      </nav>

      <div style={{ padding: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
        {/* Summary */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="card" style={{ flex: 1, textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1F7A8C' }}>{equipments.length}</div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>Total Entries</div>
          </div>
          <div className="card" style={{ flex: 1, textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#E36414' }}>₹{totalCost.toLocaleString('en-IN')}</div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>Total Cost</div>
          </div>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1F7A8C' }}>Add Equipment Usage</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label">Equipment Name *</label>
                  <input className="input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="label">Type</label>
                  <select className="input" value={formData.equipment_type} onChange={e => setFormData({ ...formData, equipment_type: e.target.value })}>
                    <option value="">Select type</option>
                    {['Excavator', 'Crane', 'Mixer', 'Generator', 'Compactor', 'Loader', 'Bulldozer', 'Truck', 'Other'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Usage Date</label>
                  <input type="date" className="input" value={formData.usage_date} onChange={e => setFormData({ ...formData, usage_date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="label">Hours Used</label>
                  <input type="number" className="input" placeholder="e.g. 8" value={formData.hours_used} onChange={e => setFormData({ ...formData, hours_used: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="label">Rate per Day (₹)</label>
                  <input type="number" className="input" placeholder="e.g. 5000" value={formData.daily_rate} onChange={e => setFormData({ ...formData, daily_rate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="label">Operator Name</label>
                  <input className="input" placeholder="Optional" value={formData.operator_name} onChange={e => setFormData({ ...formData, operator_name: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="label">Notes</label>
                  <input className="input" placeholder="Optional" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                </div>
              </div>
              {error && <p style={{ color: 'red', fontSize: '0.85rem', margin: '0.5rem 0' }}>{error}</p>}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
                <button type="button" className="btn" onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Loading...</div>
        ) : equipments.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚜</div>
            <p>No equipment records yet. Click "+ Add" to log equipment usage.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                  {['Name', 'Type', 'Date', 'Hours', 'Rate/Day', 'Total Cost', 'Operator', ''].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: '#666', fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {equipments.map((eq) => (
                  <tr key={eq.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{eq.name}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#666' }}>{eq.equipment_type || '—'}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#666' }}>{eq.usage_date ? new Date(eq.usage_date).toLocaleDateString('en-IN') : '—'}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{eq.hours_used || '—'}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{eq.daily_rate ? `₹${parseFloat(eq.daily_rate).toLocaleString()}` : '—'}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#E36414' }}>
                      {eq.total_cost ? `₹${parseFloat(eq.total_cost).toLocaleString()}` : '—'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#666' }}>{eq.operator_name || '—'}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <button onClick={() => handleDelete(eq.id)} style={{ background: '#fee2e2', color: '#c62828', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
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

export default EquipmentList;
