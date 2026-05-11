import { formatDate } from '../../utils/formatDate';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import projectService from '../../services/projectService';
import api from '../../services/api';
import WorkerList from '../Workers/WorkerList';
import WorkerDetails from '../Workers/WorkerDetails';
import PaymentList from '../Payments/PaymentList';
import BulkPayment from '../Payments/BulkPayment';
import AttendanceMarking from '../Attendance/AttendanceMarking';
import AttendanceHistory from '../Attendance/AttendanceHistory';
import AttendanceCalendar from '../Attendance/AttendanceCalendar';
import MaterialList from '../Materials/MaterialList';
import ExpenseList from '../Expenses/ExpenseList';
import ClientAdvanceList from '../ClientAdvances/ClientAdvanceList';
import EquipmentList from '../Equipment/EquipmentList';
import WorkDiaryList from '../WorkDiary/WorkDiaryList';
import MilestoneList from '../Milestones/MilestoneList';
import SubcontractorList from '../Subcontractors/SubcontractorList';
import Loading from '../../components/Loading';

// Advances Tab — shows worker advance payments for this project
const AdvancesTab: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [advances, setAdvances] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ worker_id: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/payments', { params: { project_id: projectId, payment_type: 'advance' } }),
      api.get('/workers', { params: { project_id: projectId } })
    ]).then(([pRes, wRes]) => {
      setAdvances(pRes.data || []);
      setWorkers(wRes.data || []);
    }).finally(() => setLoading(false));
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/payments', { payment: { ...formData, project_id: projectId, payment_type: 'advance' } });
      setAdvances(prev => [res.data, ...prev]);
      setFormData({ worker_id: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
      setShowForm(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this advance?')) return;
    await api.delete(`/payments/${id}`);
    setAdvances(prev => prev.filter(a => a.id !== id));
  };

  if (loading) return <Loading message="Loading advances..." />;

  const total = advances.reduce((s, a) => s + parseFloat(a.amount || 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, color: '#1F7A8C', fontSize: '1.1rem', fontWeight: '700' }}>Worker Advances</h3>
          <p style={{ margin: '0.25rem 0 0', color: '#6c757d', fontSize: '0.85rem' }}>
            Total: <strong style={{ color: '#f59e0b' }}>₹{total.toLocaleString('en-IN')}</strong>
          </p>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          style={{ background: 'linear-gradient(135deg, #1F7A8C, #16616F)', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}>
          {showForm ? 'Cancel' : '+ Add Advance'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#f8f9fa', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#1F7A8C', display: 'block', marginBottom: '0.3rem' }}>Worker *</label>
            <select required value={formData.worker_id} onChange={e => setFormData(p => ({ ...p, worker_id: e.target.value }))}
              style={{ width: '100%', padding: '0.6rem', border: '2px solid #e9ecef', borderRadius: '6px', outline: 'none', fontSize: '0.9rem' }}>
              <option value="">Select worker</option>
              {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#1F7A8C', display: 'block', marginBottom: '0.3rem' }}>Amount (₹) *</label>
            <input required type="number" min="1" value={formData.amount} onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))}
              placeholder="0" style={{ width: '100%', padding: '0.6rem', border: '2px solid #e9ecef', borderRadius: '6px', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#1F7A8C', display: 'block', marginBottom: '0.3rem' }}>Date *</label>
            <input required type="date" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
              style={{ width: '100%', padding: '0.6rem', border: '2px solid #e9ecef', borderRadius: '6px', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#1F7A8C', display: 'block', marginBottom: '0.3rem' }}>Notes</label>
            <input type="text" value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
              placeholder="Optional" style={{ width: '100%', padding: '0.6rem', border: '2px solid #e9ecef', borderRadius: '6px', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" disabled={saving}
            style={{ background: '#22c55e', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </form>
      )}

      {advances.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#f8f9fa', borderRadius: '12px', color: '#6c757d' }}>
          No advances recorded yet.
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e9ecef' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                {['Worker', 'Amount', 'Date', 'Notes', ''].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: h === 'Amount' ? 'right' : 'left', color: '#1F7A8C', fontWeight: '600', fontSize: '0.85rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {advances.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid #e9ecef' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f8f9fa')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: '600', color: '#374151' }}>{a.worker_name || a.worker?.name || '-'}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '700', color: '#f59e0b' }}>₹{parseFloat(a.amount).toLocaleString('en-IN')}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#6c757d', fontSize: '0.875rem' }}>{formatDate(a.payment_date || a.date)}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#6c757d', fontSize: '0.875rem' }}>{a.notes || '-'}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <button onClick={() => handleDelete(a.id)}
                      style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '0.3rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f0f9ff', borderTop: '2px solid #1F7A8C' }}>
                <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#1F7A8C' }}>TOTAL</td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '700', color: '#f59e0b' }}>₹{total.toLocaleString('en-IN')}</td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

type TabType = 'overview' | 'workers' | 'attendance' | 'payments' | 'advances' | 'materials' | 'expenses' | 'client-advances' | 'equipment' | 'diary' | 'milestones' | 'subcontractors';

const ProjectDetails: React.FC = () => {
  const { id, workerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getTabFromPath = (): TabType => {
    const segment = location.pathname.split('/')[3];
    const validTabs: TabType[] = ['workers', 'attendance', 'payments', 'advances', 'materials', 'expenses', 'client-advances', 'equipment', 'diary', 'milestones', 'subcontractors'];
    return validTabs.includes(segment as TabType) ? (segment as TabType) : 'overview';
  };

  const [activeTab, setActiveTab] = useState<TabType>(getTabFromPath);
  const [workers, setWorkers] = useState<any[]>([]);
  const [attSubTab, setAttSubTab] = useState<'marking' | 'history' | 'calendar'>('marking');
  const [paySubTab, setPaySubTab] = useState<'list' | 'bulk'>('list');
  const [calendarWorkerId, setCalendarWorkerId] = useState<string>('');

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  useEffect(() => {
    loadProject();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'attendance' && id) {
      loadWorkersForDropdown();
    }
  }, [activeTab, id]);

  const loadProject = async () => {
    try {
      const data = await projectService.getById(id!);
      setProject(data);
    } catch (error) {
      alert('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkersForDropdown = async () => {
    try {
      const res = await api.get('/workers', { params: { project_id: id } });
      setWorkers(res.data.filter((w: any) => w.is_active));
    } catch (error) { console.error('Failed to load workers:', error); }
  };

  if (loading) {
    return <Loading message="Loading project details..." />;
  }

  if (!project) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%)',
        padding: '2rem 3rem 3rem 3rem'
      }}>
        <div style={{
          padding: '2rem',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          borderRadius: '12px',
          fontSize: '1.1rem',
          textAlign: 'center'
        }}>
          Project not found
        </div>
      </div>
    );
  }

  const stats = project.stats || {};

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'workers', label: 'Workers', icon: '👷' },
    { id: 'attendance', label: 'Attendance', icon: '✓' },
    { id: 'payments', label: 'Payments', icon: '💰' },
    { id: 'advances', label: 'Advances', icon: '💳' },
    { id: 'materials', label: 'Materials', icon: '🧱' },
    { id: 'expenses', label: 'Expenses', icon: '💸' },
    { id: 'client-advances', label: 'Client Advances', icon: '💵' },
    { id: 'equipment', label: 'Equipment', icon: '🔧' },
    { id: 'diary', label: 'Work Diary', icon: '📓' },
    { id: 'milestones', label: 'Milestones', icon: '🏁' },
    { id: 'subcontractors', label: 'Subcontractors', icon: '🏗️' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
            {/* Project Details Card */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.25rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
              border: '1px solid #e9ecef'
            }}>
              <h2 style={{
                margin: '0 0 1rem 0',
                fontSize: '1.1rem',
                color: '#1F7A8C',
                fontWeight: 'bold',
                borderBottom: '2px solid #e9ecef',
                paddingBottom: '0.5rem'
              }}>
                Project Information
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {[
                  { label: 'Project', value: project.name || '-' },
                  { label: 'Client', value: project.client_name || '-' },
                  { label: 'Location', value: project.location || '-' },
                  { label: 'Budget', value: project.budget ? `₹${parseFloat(project.budget).toLocaleString('en-IN')}` : '-' },
                  { label: 'Start Date', value: project.start_date || '-' },
                  { label: 'End Date', value: project.end_date || 'Not set' },
                ].map((row, i) => (
                  <div key={row.label} style={{
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    background: i % 2 === 0 ? '#f8f9fa' : '#f0f9ff',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.72rem', color: '#6c757d', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.2rem' }}>{row.label}</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1F7A8C' }}>{row.value}</div>
                  </div>
                ))}
                <div style={{ padding: '0.6rem 0.75rem', borderRadius: '8px', background: '#f8f9fa', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#6c757d', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.2rem' }}>Status</div>
                  <span style={{
                    display: 'inline-block', padding: '0.2rem 0.7rem', borderRadius: '12px',
                    fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase',
                    background: project.status === 'in-progress' ? '#22c55e' : project.status === 'completed' ? '#3b82f6' : '#f59e0b',
                    color: 'white'
                  }}>
                    {(project.status || 'unknown').replace('-', ' ')}
                  </span>
                </div>
                <div style={{ padding: '0.6rem 0.75rem', borderRadius: '8px', background: '#f0f9ff', textAlign: 'center', gridColumn: 'span 1' }}>
                  <div style={{ fontSize: '0.72rem', color: '#6c757d', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.2rem' }}>Description</div>
                  <div style={{ fontSize: '0.85rem', color: '#374151' }}>{project.description || 'No description'}</div>
                </div>
              </div>
            </div>

            {/* Cost Breakdown & Financial Summary */}
            <div style={{
              background: 'white', borderRadius: '12px', padding: '1.25rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)', border: '1px solid #e9ecef'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', borderBottom: '2px solid #e9ecef', paddingBottom: '0.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1F7A8C', fontWeight: 'bold' }}>
                  Financial Summary
                </h2>
                {(() => {
                  const budget = parseFloat(project.budget || 0);
                  const total = parseFloat(stats.total_labor_cost || 0) + parseFloat(stats.total_material_cost || 0) + parseFloat(stats.total_expenses || 0);
                  const pct = budget > 0 ? Math.round((total / budget) * 100) : 0;
                  if (pct >= 100) return <span style={{ background: '#C62828', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}>🚨 Over Budget ({pct}%)</span>;
                  if (pct >= 80) return <span style={{ background: '#F57C00', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}>⚠️ Budget Alert ({pct}%)</span>;
                  return null;
                })()}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', marginBottom: '1rem' }}>
                {[
                  { label: 'Labor Cost', value: stats.total_labor_cost || 0, color: '#3b82f6', icon: '👷' },
                  { label: 'Material Cost', value: stats.total_material_cost || 0, color: '#f59e0b', icon: '🧱' },
                  { label: 'Other Expenses', value: stats.total_expenses || 0, color: '#ef4444', icon: '💸' },
                ].map(item => (
                  <div key={item.label} style={{
                    background: '#f8f9fa', borderRadius: '8px', padding: '0.75rem',
                    borderLeft: `4px solid ${item.color}`, textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{item.icon}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: item.color }}>
                      ₹{parseFloat(item.value || 0).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '0.15rem' }}>{item.label}</div>
                  </div>
                ))}
              </div>

              {/* Total cost vs Budget */}
              {(() => {
                const budget = parseFloat(project.budget || 0);
                const laborCost = parseFloat(stats.total_labor_cost || 0);
                const materialCost = parseFloat(stats.total_material_cost || 0);
                const expenseCost = parseFloat(stats.total_expenses || 0);
                const totalCost = laborCost + materialCost + expenseCost;
                const utilization = budget > 0 ? Math.min(100, Math.round((totalCost / budget) * 100)) : 0;
                const profitLoss = budget - totalCost;
                return (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '600', color: '#374151' }}>Budget Utilization</span>
                      <span style={{ fontWeight: '700', color: utilization > 90 ? '#ef4444' : '#1F7A8C' }}>{utilization}%</span>
                    </div>
                    <div style={{ background: '#e9ecef', borderRadius: '8px', height: '12px', overflow: 'hidden', marginBottom: '1rem' }}>
                      <div style={{
                        height: '100%', borderRadius: '8px',
                        background: utilization > 90 ? 'linear-gradient(90deg, #ef4444, #dc2626)' :
                          utilization > 70 ? 'linear-gradient(90deg, #f59e0b, #d97706)' :
                          'linear-gradient(90deg, #22c55e, #16a34a)',
                        width: `${utilization}%`,
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem' }}>
                      <div style={{ padding: '0.6rem', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>Budget</div>
                        <div style={{ fontWeight: '700', color: '#1F7A8C', fontSize: '0.95rem' }}>
                          ₹{budget.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div style={{ padding: '0.6rem', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>Total Cost</div>
                        <div style={{ fontWeight: '700', color: '#ef4444', fontSize: '0.95rem' }}>
                          ₹{totalCost.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div style={{ padding: '0.6rem', background: profitLoss >= 0 ? '#dcfce7' : '#fee2e2', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>{profitLoss >= 0 ? 'Surplus' : 'Over Budget'}</div>
                        <div style={{ fontWeight: '700', color: profitLoss >= 0 ? '#16a34a' : '#dc2626', fontSize: '0.95rem' }}>
                          {profitLoss >= 0 ? '+' : '-'}₹{Math.abs(profitLoss).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>
        );
      case 'workers':
        if (workerId) return <WorkerDetails />;
        return <WorkerList embedded />;
      case 'attendance':
        return (
          <div>
            {/* Sub-tab bar */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '2px solid #e9ecef', paddingBottom: '0' }}>
              {([
                { key: 'marking', label: '✓ Mark Attendance' },
                { key: 'history', label: '📅 History' },
                { key: 'calendar', label: '🗓 Calendar' },
              ] as const).map(({ key, label }) => (
                <button key={key} onClick={() => setAttSubTab(key)}
                  style={{
                    padding: '0.6rem 1.25rem', border: 'none', borderRadius: '8px 8px 0 0',
                    fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer',
                    background: attSubTab === key ? '#1F7A8C' : '#f8f9fa',
                    color: attSubTab === key ? 'white' : '#6c757d',
                    borderBottom: attSubTab === key ? '2px solid #1F7A8C' : '2px solid transparent',
                    marginBottom: '-2px'
                  }}>
                  {label}
                </button>
              ))}
            </div>

            {attSubTab === 'marking' && <AttendanceMarking embedded />}
            {attSubTab === 'history' && <AttendanceHistory embedded />}
            {attSubTab === 'calendar' && (
              <div>
                <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label style={{ fontWeight: '600', color: '#1F7A8C', fontSize: '0.9rem' }}>Select Worker:</label>
                  <select value={calendarWorkerId} onChange={e => setCalendarWorkerId(e.target.value)}
                    style={{ padding: '0.5rem 0.75rem', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', minWidth: '200px' }}>
                    <option value="">-- Select a worker --</option>
                    {workers.map((w: any) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
                {calendarWorkerId
                  ? <AttendanceCalendar embedded workerIdProp={calendarWorkerId} />
                  : <div style={{ textAlign: 'center', padding: '3rem', background: '#f8f9fa', borderRadius: '12px', color: '#6c757d' }}>Select a worker to view their attendance calendar</div>
                }
              </div>
            )}
          </div>
        );
      case 'payments':
        return (
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '2px solid #e9ecef', paddingBottom: '0' }}>
              {([
                { key: 'list', label: '💰 Payment List' },
                { key: 'bulk', label: '💳 Bulk Payment' },
              ] as { key: 'list' | 'bulk'; label: string }[]).map(sub => (
                <button key={sub.key} onClick={() => setPaySubTab(sub.key)}
                  style={{
                    padding: '0.5rem 1.25rem', border: 'none', cursor: 'pointer', fontWeight: '600',
                    fontSize: '0.9rem', borderRadius: '8px 8px 0 0',
                    background: paySubTab === sub.key ? 'linear-gradient(135deg, #1F7A8C, #16616F)' : 'transparent',
                    color: paySubTab === sub.key ? 'white' : '#6c757d',
                    borderBottom: paySubTab === sub.key ? 'none' : '2px solid transparent',
                  }}>
                  {sub.label}
                </button>
              ))}
            </div>
            {paySubTab === 'list' ? <PaymentList embedded /> : <BulkPayment embedded />}
          </div>
        );
      case 'advances':
        return <AdvancesTab projectId={id!} />;
      case 'materials':
        return <MaterialList embedded />;
      case 'expenses':
        return <ExpenseList embedded />;
      case 'client-advances':
        return <ClientAdvanceList embedded />;
      case 'equipment':
        return <EquipmentList embedded />;
      case 'diary':
        return <WorkDiaryList embedded />;
      case 'milestones':
        return <MilestoneList embedded />;
      case 'subcontractors':
        return <SubcontractorList embedded />;
      default:
        return null;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%)',
      padding: '2rem 3rem 3rem 3rem'
    }}>
      {/* Header Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        background: 'white',
        padding: '0.75rem 1.25rem',
        borderRadius: '10px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => navigate('/projects')}
            style={{
              background: '#f8f9fa',
              color: '#1F7A8C',
              border: '2px solid #1F7A8C',
              padding: '0.4rem 0.8rem',
              fontSize: '0.8rem',
              fontWeight: '600',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1F7A8C';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'translateX(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f8f9fa';
              e.currentTarget.style.color = '#1F7A8C';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            ← Back to Projects
          </button>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '1.4rem',
              background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold'
            }}>
              {project.name}
            </h1>
            <p style={{
              margin: '0.2rem 0 0 0',
              color: '#6c757d',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
              <span>📍</span> {project.location}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4" style={{ gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '0.6rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          textAlign: 'center',
          transition: 'all 0.3s',
          border: '1px solid #e9ecef'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(31, 122, 140, 0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
        }}
        >
          <h3 style={{
            color: '#1F7A8C',
            margin: '0 0 0.15rem 0',
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}>
            {stats.total_workers || 0}
          </h3>
          <p style={{ color: '#6c757d', margin: 0, fontSize: '0.7rem' }}>Total Workers</p>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '0.6rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          textAlign: 'center',
          transition: 'all 0.3s',
          border: '1px solid #e9ecef'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(31, 122, 140, 0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
        }}
        >
          <h3 style={{
            color: '#3b82f6',
            margin: '0 0 0.15rem 0',
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}>
            ₹{((stats.total_labor_cost || 0) / 1000).toFixed(1)}K
          </h3>
          <p style={{ color: '#6c757d', margin: 0, fontSize: '0.7rem' }}>Labor Cost</p>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '0.6rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          textAlign: 'center',
          transition: 'all 0.3s',
          border: '1px solid #e9ecef'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(31, 122, 140, 0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
        }}
        >
          <h3 style={{
            color: '#f59e0b',
            margin: '0 0 0.15rem 0',
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}>
            ₹{((stats.total_cost || 0) / 100000).toFixed(1)}L
          </h3>
          <p style={{ color: '#6c757d', margin: 0, fontSize: '0.7rem' }}>Total Cost</p>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '0.6rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          textAlign: 'center',
          transition: 'all 0.3s',
          border: '1px solid #e9ecef'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(31, 122, 140, 0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
        }}
        >
          <h3 style={{
            color: stats.profit_loss >= 0 ? '#22c55e' : '#ef4444',
            margin: '0 0 0.15rem 0',
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}>
            ₹{((stats.profit_loss || 0) / 100000).toFixed(1)}L
          </h3>
          <p style={{ color: '#6c757d', margin: 0, fontSize: '0.7rem' }}>Profit/Loss</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        background: 'white',
        borderRadius: '12px 12px 0 0',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        border: '1px solid #e9ecef',
        borderBottom: 'none',
        overflowX: 'auto',
        display: 'flex'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              const path = tab.id === 'overview' ? `/projects/${id}` : `/projects/${id}/${tab.id}`;
              navigate(path);
            }}
            style={{
              flex: '1',
              padding: '1rem 1.5rem',
              border: 'none',
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)'
                : 'transparent',
              color: activeTab === tab.id ? 'white' : '#6c757d',
              fontWeight: '600',
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.3s',
              borderBottom: activeTab === tab.id ? 'none' : '2px solid #e9ecef',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = '#f8f9fa';
                e.currentTarget.style.color = '#1F7A8C';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#6c757d';
              }
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{
        background: 'white',
        borderRadius: '0 0 12px 12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        border: '1px solid #e9ecef',
        borderTop: 'none',
        padding: '2rem'
      }}>
        {renderTabContent()}
      </div>

    </div>
  );
};

export default ProjectDetails;
