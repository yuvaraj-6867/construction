import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const WorkerLoanList: React.FC = () => {
  const { id: workerId } = useParams();
  const navigate = useNavigate();
  const [loans, setLoans] = useState<any[]>([]);
  const [worker, setWorker] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLoan, setEditingLoan] = useState<any>(null);
  const [form, setForm] = useState({ project_id: '', loan_amount: '', repaid_amount: '', loan_date: new Date().toISOString().split('T')[0], purpose: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAll();
    api.get('/projects').then(r => setProjects(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    api.get(`/workers/${workerId}`).then(r => setWorker(r.data)).catch(() => {});
  }, [workerId]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const res = await api.get('/worker_loans', { params: { worker_id: workerId } });
      setLoans(Array.isArray(res.data) ? res.data : []);
    } catch { setLoans([]); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditingLoan(null);
    setForm({ project_id: '', loan_amount: '', repaid_amount: '', loan_date: new Date().toISOString().split('T')[0], purpose: '', notes: '' });
    setError(''); setShowForm(true);
  };

  const openEdit = (loan: any) => {
    setEditingLoan(loan);
    setForm({ project_id: loan.project_id, loan_amount: loan.loan_amount, repaid_amount: loan.repaid_amount, loan_date: loan.loan_date, purpose: loan.purpose || '', notes: loan.notes || '' });
    setError(''); setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const payload = { worker_loan: { ...form, worker_id: workerId } };
      if (editingLoan) {
        await api.put(`/worker_loans/${editingLoan.id}`, payload);
      } else {
        await api.post('/worker_loans', payload);
      }
      setShowForm(false); loadAll();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this loan record?')) return;
    try { await api.delete(`/worker_loans/${id}`); setLoans(prev => prev.filter(l => l.id !== id)); }
    catch { alert('Failed to delete'); }
  };

  const totalLoaned = loans.reduce((s, l) => s + Number(l.loan_amount || 0), 0);
  const totalRepaid = loans.reduce((s, l) => s + Number(l.repaid_amount || 0), 0);
  const totalBalance = totalLoaned - totalRepaid;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '2rem 3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1.5rem 2rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button onClick={() => navigate(`/workers/${workerId}`)}
            style={{ background: '#f8f9fa', color: '#1F7A8C', border: '2px solid #1F7A8C', padding: '0.65rem 1.25rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>
            ← Back
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', background: 'linear-gradient(135deg, #1F7A8C, #16616F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' }}>
              💰 Worker Loans
            </h1>
            <p style={{ margin: 0, color: '#6c757d' }}>{worker?.name} — {loans.length} loan(s)</p>
          </div>
        </div>
        <button onClick={openAdd}
          style={{ background: 'linear-gradient(135deg, #1F7A8C, #16616F)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem' }}>
          + Add Loan
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Loaned', value: totalLoaned, color: '#ef4444' },
          { label: 'Total Repaid', value: totalRepaid, color: '#22c55e' },
          { label: 'Outstanding Balance', value: totalBalance, color: totalBalance > 0 ? '#f59e0b' : '#22c55e' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 'bold', color }}>₹{Number(value).toLocaleString('en-IN')}</h3>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#1F7A8C' }}>{editingLoan ? '✏️ Edit Loan' : '💰 Add Loan'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#555', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Project *</label>
                  <select value={form.project_id} onChange={e => setForm({...form, project_id: e.target.value})} required
                    style={{ width: '100%', padding: '0.65rem', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '0.95rem' }}>
                    <option value="">Select project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#555', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Loan Date *</label>
                  <input type="date" value={form.loan_date} onChange={e => setForm({...form, loan_date: e.target.value})} required
                    style={{ width: '100%', padding: '0.65rem', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#555', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Loan Amount (₹) *</label>
                  <input type="number" value={form.loan_amount} onChange={e => setForm({...form, loan_amount: e.target.value})} required min="1"
                    style={{ width: '100%', padding: '0.65rem', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#555', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Repaid Amount (₹)</label>
                  <input type="number" value={form.repaid_amount} onChange={e => setForm({...form, repaid_amount: e.target.value})} min="0"
                    style={{ width: '100%', padding: '0.65rem', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', color: '#555', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Purpose</label>
                <input value={form.purpose} onChange={e => setForm({...form, purpose: e.target.value})} placeholder="e.g. Medical, Education..."
                  style={{ width: '100%', padding: '0.65rem', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }} />
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
                  {saving ? 'Saving...' : editingLoan ? 'Update' : 'Add Loan'}
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

      {/* Loans Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>Loading...</div>
      ) : loans.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💰</div>
          <h2 style={{ color: '#1F7A8C' }}>No Loans</h2>
          <p style={{ color: '#999' }}>No loan records for this worker</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #1F7A8C, #16616F)', color: 'white' }}>
                {['Date','Project','Loan Amount','Repaid','Balance','Purpose','Actions'].map(h => (
                  <th key={h} style={{ padding: '1rem', textAlign: h === 'Loan Amount' || h === 'Repaid' || h === 'Balance' ? 'right' : 'left', fontWeight: '600', fontSize: '0.9rem' }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loans.map(loan => (
                <tr key={loan.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '1rem' }}>{new Date(loan.loan_date).toLocaleDateString('en-IN')}</td>
                  <td style={{ padding: '1rem', color: '#1F7A8C', fontWeight: '500' }}>{loan.project_name}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', color: '#ef4444' }}>₹{Number(loan.loan_amount).toLocaleString('en-IN')}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', color: '#22c55e' }}>₹{Number(loan.repaid_amount).toLocaleString('en-IN')}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', color: Number(loan.balance) > 0 ? '#f59e0b' : '#22c55e' }}>₹{Number(loan.balance).toLocaleString('en-IN')}</td>
                  <td style={{ padding: '1rem', color: '#666' }}>{loan.purpose || '—'}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openEdit(loan)} style={{ background: '#f97316', border: 'none', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>Edit</button>
                      <button onClick={() => handleDelete(loan.id)} style={{ background: '#ef4444', border: 'none', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WorkerLoanList;
