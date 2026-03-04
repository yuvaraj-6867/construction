import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const SubcontractorList: React.FC = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [subs, setSubs] = useState<any[]>([]);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form, setForm] = useState({ name: '', specialty: '', contract_amount: '', paid_amount: '', phone: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAll();
    api.get(`/projects/${projectId}`).then(r => setProjectName(r.data.name || '')).catch(() => {});
  }, [projectId]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const res = await api.get('/subcontractors', { params: { project_id: projectId } });
      setSubs(Array.isArray(res.data) ? res.data : []);
    } catch { setSubs([]); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditingItem(null);
    setForm({ name: '', specialty: '', contract_amount: '', paid_amount: '', phone: '', notes: '' });
    setError(''); setShowForm(true);
  };

  const openEdit = (s: any) => {
    setEditingItem(s);
    setForm({ name: s.name, specialty: s.specialty || '', contract_amount: s.contract_amount, paid_amount: s.paid_amount, phone: s.phone || '', notes: s.notes || '' });
    setError(''); setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const payload = { subcontractor: { ...form, project_id: projectId } };
      if (editingItem) {
        await api.put(`/subcontractors/${editingItem.id}`, payload);
      } else {
        await api.post('/subcontractors', payload);
      }
      setShowForm(false); loadAll();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this subcontractor?')) return;
    try { await api.delete(`/subcontractors/${id}`); setSubs(prev => prev.filter(s => s.id !== id)); }
    catch { alert('Delete failed'); }
  };

  const totalContract = subs.reduce((s, c) => s + Number(c.contract_amount || 0), 0);
  const totalPaid = subs.reduce((s, c) => s + Number(c.paid_amount || 0), 0);
  const totalBalance = totalContract - totalPaid;

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
              🏗️ Subcontractors
            </h1>
            <p style={{ margin: 0, color: '#6c757d' }}>{projectName} — {subs.length} subcontractor(s)</p>
          </div>
        </div>
        <button onClick={openAdd}
          style={{ background: 'linear-gradient(135deg, #1F7A8C, #16616F)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem' }}>
          + Add Subcontractor
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Contract Value', value: totalContract, color: '#1F7A8C' },
          { label: 'Total Paid', value: totalPaid, color: '#22c55e' },
          { label: 'Balance Due', value: totalBalance, color: totalBalance > 0 ? '#ef4444' : '#22c55e' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem', fontWeight: 'bold', color }}>₹{Number(value).toLocaleString('en-IN')}</h3>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '520px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#1F7A8C' }}>{editingItem ? '✏️ Edit Subcontractor' : '🏗️ Add Subcontractor'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#555', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Name *</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Company/Person name"
                    style={{ width: '100%', padding: '0.65rem', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#555', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Specialty</label>
                  <input value={form.specialty} onChange={e => setForm({...form, specialty: e.target.value})} placeholder="e.g. Electrical, Plumbing..."
                    style={{ width: '100%', padding: '0.65rem', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#555', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Contract Amount (₹)</label>
                  <input type="number" value={form.contract_amount} onChange={e => setForm({...form, contract_amount: e.target.value})} min="0"
                    style={{ width: '100%', padding: '0.65rem', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#555', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Paid Amount (₹)</label>
                  <input type="number" value={form.paid_amount} onChange={e => setForm({...form, paid_amount: e.target.value})} min="0"
                    style={{ width: '100%', padding: '0.65rem', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#555', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Phone</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Phone number"
                    style={{ width: '100%', padding: '0.65rem', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }} />
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

      {/* Subcontractors Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>Loading...</div>
      ) : subs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏗️</div>
          <h2 style={{ color: '#1F7A8C' }}>No Subcontractors</h2>
          <p style={{ color: '#999', marginBottom: '1.5rem' }}>Track subcontractors and their contracts</p>
          <button onClick={openAdd} style={{ background: 'linear-gradient(135deg, #1F7A8C, #16616F)', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
            Add First Subcontractor
          </button>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #1F7A8C, #16616F)', color: 'white' }}>
                {['Name','Specialty','Phone','Contract','Paid','Balance Due','Actions'].map(h => (
                  <th key={h} style={{ padding: '1rem', textAlign: ['Contract','Paid','Balance Due'].includes(h) ? 'right' : 'left', fontWeight: '600', fontSize: '0.9rem' }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subs.map(s => {
                const waUrl = s.phone ? `https://wa.me/91${s.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${s.name}, regarding the project subcontract.`)}` : null;
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '1rem', fontWeight: '600', color: '#1F7A8C' }}>{s.name}</td>
                    <td style={{ padding: '1rem', color: '#666' }}>{s.specialty || '—'}</td>
                    <td style={{ padding: '1rem' }}>
                      {s.phone ? (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span>{s.phone}</span>
                          {waUrl && <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#25d366', fontSize: '1.2rem', textDecoration: 'none' }}>💬</a>}
                        </div>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', color: '#1F7A8C' }}>₹{Number(s.contract_amount).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', color: '#22c55e' }}>₹{Number(s.paid_amount).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', color: Number(s.balance_due) > 0 ? '#ef4444' : '#22c55e' }}>₹{Number(s.balance_due).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => openEdit(s)} style={{ background: '#f97316', border: 'none', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>Edit</button>
                        <button onClick={() => handleDelete(s.id)} style={{ background: '#ef4444', border: 'none', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SubcontractorList;
