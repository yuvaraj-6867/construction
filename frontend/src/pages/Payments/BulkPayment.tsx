import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import workerService from '../../services/workerService';
import api from '../../services/api';
import { useToast } from '../../components/Toast';
import Loading from '../../components/Loading';

const BulkPayment: React.FC = () => {
  const navigate = useNavigate();
  const { id: projectId } = useParams();
  const { showToast } = useToast();
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentType, setPaymentType] = useState('wage');
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    workerService.getAll(projectId).then(data => {
      const active = data.filter((w: any) => w.is_active);
      setWorkers(active);
      const sel: Record<string, boolean> = {};
      const amt: Record<string, string> = {};
      active.forEach((w: any) => {
        sel[w.id] = false;
        amt[w.id] = '';
      });
      setSelected(sel);
      setAmounts(amt);
    }).catch(console.error).finally(() => setLoading(false));
  }, [projectId]);

  const selectAll = (val: boolean) => {
    const s = { ...selected };
    workers.forEach(w => { s[w.id] = val; });
    setSelected(s);
  };

  const fillBalanceAmount = () => {
    // Set balance_due as amount for each selected worker
    const newAmounts = { ...amounts };
    workers.forEach(w => {
      if (selected[w.id]) {
        newAmounts[w.id] = String(Math.max(0, w.balance_due || 0));
      }
    });
    setAmounts(newAmounts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payments = workers
      .filter(w => selected[w.id] && amounts[w.id] && Number(amounts[w.id]) > 0)
      .map(w => ({
        worker_id: w.id,
        project_id: projectId,
        amount: Number(amounts[w.id]),
        date,
        payment_type: paymentType,
        notes: notes[w.id] || ''
      }));

    if (payments.length === 0) {
      showToast('Select at least one worker with an amount', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/payments/bulk_create', { payments });
      showToast(res.data.message || `${payments.length} payments recorded`, 'success');
      navigate(`/projects/${projectId}`);
    } catch (err: any) {
      showToast(err.response?.data?.errors?.[0]?.errors?.[0] || 'Some payments failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCount = workers.filter(w => selected[w.id] && amounts[w.id] && Number(amounts[w.id]) > 0).length;
  const totalAmount = workers.filter(w => selected[w.id]).reduce((s, w) => s + (Number(amounts[w.id]) || 0), 0);

  if (loading) return <Loading message="Loading workers..." />;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '2rem 3rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'white', padding: '1.5rem 2rem', borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button onClick={() => navigate(`/projects/${projectId}`)}
            style={{ background: '#f8f9fa', color: '#1F7A8C', border: '2px solid #1F7A8C', padding: '0.65rem 1.25rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>
            ← Back
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', background: 'linear-gradient(135deg, #1F7A8C, #16616F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' }}>
              💳 Bulk Payment
            </h1>
            <p style={{ margin: 0, color: '#6c757d' }}>Pay multiple workers at once</p>
          </div>
        </div>
        {selectedCount > 0 && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2E7D32' }}>₹{totalAmount.toLocaleString('en-IN')}</div>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>{selectedCount} workers selected</div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Options */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: 'white', padding: '1.25rem 1.5rem', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1F7A8C', display: 'block', marginBottom: '0.4rem' }}>Payment Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required
              style={{ padding: '0.6rem 1rem', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '0.95rem' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1F7A8C', display: 'block', marginBottom: '0.4rem' }}>Payment Type</label>
            <select value={paymentType} onChange={e => setPaymentType(e.target.value)}
              style={{ padding: '0.6rem 1rem', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '0.95rem', minWidth: '140px' }}>
              <option value="wage">Wage</option>
              <option value="advance">Advance</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <button type="button" onClick={() => selectAll(true)}
              style={{ padding: '0.6rem 1rem', background: '#e8f5e9', color: '#2e7d32', border: '1px solid #a5d6a7', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
              Select All
            </button>
            <button type="button" onClick={() => selectAll(false)}
              style={{ padding: '0.6rem 1rem', background: '#f5f5f5', color: '#666', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
              Clear All
            </button>
            <button type="button" onClick={fillBalanceAmount}
              style={{ padding: '0.6rem 1rem', background: '#e3f2fd', color: '#1565c0', border: '1px solid #90caf9', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
              Fill Balance Amounts
            </button>
          </div>
        </div>

        {/* Worker list */}
        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: '2rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'linear-gradient(135deg, #1F7A8C, #16616F)', color: 'white' }}>
              <tr>
                <th style={{ padding: '1rem', width: '48px' }}><input type="checkbox" onChange={e => selectAll(e.target.checked)} /></th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Worker</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Role</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Balance Due</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Amount (₹)</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((w, i) => (
                <tr key={w.id} style={{ background: selected[w.id] ? '#f0f9ff' : (i % 2 === 0 ? 'white' : '#f8f9fa'), transition: 'background 0.2s' }}>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                    <input type="checkbox" checked={!!selected[w.id]} onChange={e => setSelected(p => ({ ...p, [w.id]: e.target.checked }))} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ fontWeight: '600', color: '#333' }}>{w.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#999' }}>{w.phone}</div>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', color: '#666', fontSize: '0.9rem' }}>{w.role}</td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: '700', color: '#C62828' }}>
                    ₹{Number(w.balance_due || 0).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={amounts[w.id] || ''}
                      onChange={e => setAmounts(p => ({ ...p, [w.id]: e.target.value }))}
                      disabled={!selected[w.id]}
                      placeholder="0"
                      style={{ width: '120px', padding: '0.5rem 0.75rem', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '600', outline: 'none', opacity: selected[w.id] ? 1 : 0.4 }}
                      onFocus={e => e.currentTarget.style.borderColor = '#1F7A8C'}
                      onBlur={e => e.currentTarget.style.borderColor = '#e9ecef'}
                    />
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <input
                      type="text"
                      value={notes[w.id] || ''}
                      onChange={e => setNotes(p => ({ ...p, [w.id]: e.target.value }))}
                      disabled={!selected[w.id]}
                      placeholder="Optional note"
                      style={{ width: '150px', padding: '0.5rem 0.75rem', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', opacity: selected[w.id] ? 1 : 0.4 }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button type="button" onClick={() => navigate(`/projects/${projectId}`)}
            style={{ padding: '0.875rem 2rem', background: '#f8f9fa', color: '#666', border: '2px solid #dee2e6', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>
            Cancel
          </button>
          <button type="submit" disabled={submitting || selectedCount === 0}
            style={{
              padding: '0.875rem 2.5rem',
              background: submitting || selectedCount === 0 ? '#95a5a6' : 'linear-gradient(135deg, #2E7D32, #1B5E20)',
              color: 'white', border: 'none', borderRadius: '10px',
              cursor: submitting || selectedCount === 0 ? 'not-allowed' : 'pointer',
              fontWeight: '700', fontSize: '1rem',
              boxShadow: '0 4px 15px rgba(46, 125, 50, 0.3)'
            }}>
            {submitting ? 'Processing...' : `💳 Pay ${selectedCount} Workers (₹${totalAmount.toLocaleString('en-IN')})`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BulkPayment;
