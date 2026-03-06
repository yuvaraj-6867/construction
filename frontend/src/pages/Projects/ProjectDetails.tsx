import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import projectService from '../../services/projectService';
import workerService from '../../services/workerService';
import attendanceService from '../../services/attendanceService';
import paymentService from '../../services/paymentService';
import materialService from '../../services/materialService';
import expenseService from '../../services/expenseService';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';

type TabType = 'overview' | 'workers' | 'attendance' | 'payments' | 'materials' | 'expenses' | 'invoices' | 'client-advances';
type ModalType = 'workers' | 'attendance' | 'payments' | 'materials' | 'expenses' | 'invoices' | 'client-advances' | null;

const ProjectDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [workers, setWorkers] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [allWorkers, setAllWorkers] = useState<any[]>([]);
  const [allAttendances, setAllAttendances] = useState<any[]>([]);
  const [allPayments, setAllPayments] = useState<any[]>([]);
  const [allMaterials, setAllMaterials] = useState<any[]>([]);
  const [allExpenses, setAllExpenses] = useState<any[]>([]);
  const [editingWorker, setEditingWorker] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    loadProject();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'workers' && id) {
      loadWorkers();
    } else if (activeTab === 'attendance' && id) {
      loadAttendances();
    } else if (activeTab === 'payments' && id) {
      loadPayments();
    } else if (activeTab === 'materials' && id) {
      loadMaterials();
    } else if (activeTab === 'expenses' && id) {
      loadExpenses();
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

  const loadWorkers = async () => {
    try {
      const data = await workerService.getAll(id!);
      setWorkers(data.filter((w: any) => w.is_active));
    } catch (error) {
      console.error('Failed to load workers:', error);
    }
  };

  const loadAttendances = async () => {
    try {
      const data = await attendanceService.getAll({ project_id: id! });
      setAttendances(data.slice(0, 10));
    } catch (error) {
      console.error('Failed to load attendances:', error);
    }
  };

  const loadPayments = async () => {
    try {
      const data = await paymentService.getAll(undefined, id!);
      setPayments(data.slice(0, 10));
    } catch (error) {
      console.error('Failed to load payments:', error);
    }
  };

  const loadMaterials = async () => {
    try {
      const data = await materialService.getAll(id!);
      setMaterials(data.slice(0, 10));
    } catch (error) {
      console.error('Failed to load materials:', error);
    }
  };

  const loadExpenses = async () => {
    try {
      const data = await expenseService.getAll(id!);
      setExpenses(data.slice(0, 10));
    } catch (error) {
      console.error('Failed to load expenses:', error);
    }
  };

  const handleEditWorker = (worker: any) => {
    setEditingWorker(worker);
    setEditForm({
      name: worker.name || '',
      phone: worker.phone || '',
      role: worker.role || '',
      daily_wage: worker.daily_wage || '',
      payment_type: worker.payment_type || 'daily',
      contract_amount: worker.contract_amount || '',
      status: worker.is_active ? 'active' : 'inactive',
    });
  };

  const handleSaveWorker = async () => {
    if (!editingWorker) return;
    setEditSaving(true);
    try {
      await workerService.update(editingWorker.id, editForm);
      setEditingWorker(null);
      loadWorkers();
    } catch (error) {
      alert('Failed to save worker');
    } finally {
      setEditSaving(false);
    }
  };

  const handleOpenModal = async (type: ModalType) => {
    setOpenModal(type);

    // Load all data based on modal type
    try {
      switch (type) {
        case 'workers':
          const workersData = await workerService.getAll(id!);
          setAllWorkers(workersData.filter((w: any) => w.is_active));
          break;
        case 'attendance':
          const attendanceData = await attendanceService.getAll({ project_id: id! });
          setAllAttendances(attendanceData);
          break;
        case 'payments':
          const paymentsData = await paymentService.getAll(undefined, id!);
          setAllPayments(paymentsData);
          break;
        case 'materials':
          const materialsData = await materialService.getAll(id!);
          setAllMaterials(materialsData);
          break;
        case 'expenses':
          const expensesData = await expenseService.getAll(id!);
          setAllExpenses(expensesData);
          break;
      }
    } catch (error) {
      console.error(`Failed to load ${type} data:`, error);
    }
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

  const tabs: { id: TabType | string; label: string; icon: string; path?: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'workers', label: 'Workers', icon: '👷' },
    { id: 'attendance', label: 'Attendance', icon: '✓' },
    { id: 'payments', label: 'Payments', icon: '💰' },
    { id: 'materials', label: 'Materials', icon: '🧱' },
    { id: 'expenses', label: 'Expenses', icon: '💸' },
    { id: 'invoices', label: 'Invoices', icon: '📄' },
    { id: 'client-advances', label: 'Client Advances', icon: '💵' },
    { id: 'equipment', label: 'Equipment', icon: '🔧', path: `/projects/${id}/equipment` },
    { id: 'diary', label: 'Work Diary', icon: '📓', path: `/projects/${id}/diary` },
    { id: 'milestones', label: 'Milestones', icon: '🏁', path: `/projects/${id}/milestones` },
    { id: 'subcontractors', label: 'Subcontractors', icon: '🏗️', path: `/projects/${id}/subcontractors` },
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
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {[
                  { label: 'Project', value: project.name || '-' },
                  { label: 'Client', value: project.client_name || '-' },
                  { label: 'Location', value: project.location || '-' },
                  { label: 'Budget', value: project.budget ? `₹${parseFloat(project.budget).toLocaleString('en-IN')}` : '-' },
                  { label: 'Start Date', value: project.start_date || '-' },
                  { label: 'End Date', value: project.end_date || 'Not set' },
                ].map((row, i) => (
                  <div key={row.label} style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr',
                    padding: '0.45rem 0.6rem',
                    borderRadius: '6px',
                    background: i % 2 === 0 ? '#f8f9fa' : 'white',
                    fontSize: '0.875rem',
                    alignItems: 'center'
                  }}>
                    <strong style={{ color: '#1F7A8C', fontSize: '0.8rem' }}>{row.label}</strong>
                    <span style={{ color: '#374151' }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', padding: '0.45rem 0.6rem', borderRadius: '6px', background: '#f8f9fa', fontSize: '0.875rem', alignItems: 'center' }}>
                  <strong style={{ color: '#1F7A8C', fontSize: '0.8rem' }}>Status</strong>
                  <span style={{
                    display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '12px',
                    fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', width: 'fit-content',
                    background: project.status === 'in-progress' ? '#22c55e' : project.status === 'completed' ? '#3b82f6' : '#f59e0b',
                    color: 'white'
                  }}>
                    {(project.status || 'unknown').replace('-', ' ')}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', padding: '0.45rem 0.6rem', borderRadius: '6px', background: 'white', fontSize: '0.875rem', alignItems: 'start' }}>
                  <strong style={{ color: '#1F7A8C', fontSize: '0.8rem' }}>Description</strong>
                  <span style={{ color: '#374151' }}>{project.description || 'No description'}</span>
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
        return (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '1.5rem',
                color: '#1F7A8C',
                fontWeight: 'bold'
              }}>
                Project Workers ({workers.length})
              </h2>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => navigate(`/projects/${id}/workers`)}
                  style={{
                    background: '#f8f9fa',
                    border: '2px solid #1F7A8C',
                    color: '#1F7A8C',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1F7A8C';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f8f9fa';
                    e.currentTarget.style.color = '#1F7A8C';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  View All Workers
                </button>
                <button
                  onClick={() => navigate(`/projects/${id}/workers`)}
                  style={{
                    background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)',
                    border: 'none',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(31, 122, 140, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(31, 122, 140, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(31, 122, 140, 0.3)';
                  }}
                >
                  + Add Worker
                </button>
              </div>
            </div>

            {/* Worker Balance Summary Table */}
            {workers.length > 0 && (
              <div style={{
                background: 'white', borderRadius: '12px', padding: '1.5rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)', border: '1px solid #e9ecef',
                marginBottom: '1.5rem', overflowX: 'auto'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, color: '#1F7A8C', fontWeight: '700', fontSize: '1.1rem' }}>
                    💰 Worker Balance Summary
                  </h3>

                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                      {['Worker', 'Phone', 'Role', 'Daily Wage', 'Status', 'Wages Earned', 'Advances', 'Paid', 'Balance Due', 'Action'].map(h => (
                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: ['Worker', 'Phone', 'Role', 'Status', 'Action'].includes(h) ? 'left' : 'right', color: '#1F7A8C', fontWeight: '600', fontSize: '0.85rem', borderBottom: '2px solid #e9ecef' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {workers.map(w => {
                      const wages = parseFloat(w.total_wages_earned || 0);
                      const paid = parseFloat(w.total_payments || 0);
                      const balance = parseFloat(w.balance_due || 0);
                      return (
                        <tr key={w.id} style={{ borderBottom: '1px solid #e9ecef' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#f8f9fa'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
                        >
                          <td style={{ padding: '0.75rem 1rem', fontWeight: '600', color: '#1F7A8C', cursor: 'pointer' }}
                            onClick={() => navigate(`/projects/${id}/workers/${w.id}`)}>
                            {w.name}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: '#6c757d', fontSize: '0.875rem' }}>{w.phone || '-'}</td>
                          <td style={{ padding: '0.75rem 1rem', color: '#6c757d', fontSize: '0.875rem' }}>{w.role}</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#374151', fontSize: '0.875rem' }}>
                            ₹{parseFloat(w.daily_wage || 0).toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600',
                              background: w.is_active ? '#dcfce7' : '#fee2e2', color: w.is_active ? '#16a34a' : '#dc2626' }}>
                              {w.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '600', color: '#374151' }}>
                            ₹{wages.toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#f59e0b', fontWeight: '600' }}>
                            ₹{parseFloat(w.total_advances || 0).toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#22c55e', fontWeight: '600' }}>
                            ₹{paid.toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '700',
                            color: balance > 0 ? '#ef4444' : balance < 0 ? '#22c55e' : '#6c757d' }}>
                            {balance > 0 ? `₹${balance.toLocaleString('en-IN')} owed` : balance < 0 ? `₹${Math.abs(balance).toLocaleString('en-IN')} excess` : '✓ Settled'}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <button onClick={() => handleEditWorker(w)}
                              style={{ padding: '0.3rem 0.75rem', background: '#f8f9fa', border: '1px solid #1F7A8C', color: '#1F7A8C', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#f0f9ff', borderTop: '2px solid #1F7A8C' }}>
                      <td colSpan={5} style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#1F7A8C' }}>TOTAL</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '700', color: '#374151' }}>
                        ₹{workers.reduce((s, w) => s + parseFloat(w.total_wages_earned || 0), 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '700', color: '#f59e0b' }}>
                        ₹{workers.reduce((s, w) => s + parseFloat(w.total_advances || 0), 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '700', color: '#22c55e' }}>
                        ₹{workers.reduce((s, w) => s + parseFloat(w.total_payments || 0), 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '700', color: '#ef4444' }}>
                        ₹{workers.reduce((s, w) => s + Math.max(0, parseFloat(w.balance_due || 0)), 0).toLocaleString('en-IN')} owed
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Inline Worker Edit Modal */}
            {editingWorker && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={(e) => { if (e.target === e.currentTarget) setEditingWorker(null); }}>
                <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '480px', maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #e9ecef', paddingBottom: '0.75rem' }}>
                    <h3 style={{ margin: 0, color: '#1F7A8C', fontSize: '1.2rem', fontWeight: '700' }}>Edit Worker</h3>
                    <button onClick={() => setEditingWorker(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6c757d', lineHeight: 1 }}>&times;</button>
                  </div>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {[
                      { label: 'Name', key: 'name', type: 'text' },
                      { label: 'Phone', key: 'phone', type: 'text' },
                      { label: 'Role', key: 'role', type: 'text' },
                      { label: 'Daily Wage (₹)', key: 'daily_wage', type: 'number' },
                      { label: 'Contract Amount (₹)', key: 'contract_amount', type: 'number' },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.3rem' }}>{f.label}</label>
                        <input
                          type={f.type}
                          value={editForm[f.key] || ''}
                          onChange={e => setEditForm((prev: any) => ({ ...prev, [f.key]: e.target.value }))}
                          style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                        />
                      </div>
                    ))}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.3rem' }}>Payment Type</label>
                      <select value={editForm.payment_type || 'daily'} onChange={e => setEditForm((prev: any) => ({ ...prev, payment_type: e.target.value }))}
                        style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem' }}>
                        <option value="daily">Daily</option>
                        <option value="contract">Contract</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.3rem' }}>Status</label>
                      <select value={editForm.status || 'active'} onChange={e => setEditForm((prev: any) => ({ ...prev, status: e.target.value }))}
                        style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem' }}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => setEditingWorker(null)}
                      style={{ padding: '0.6rem 1.25rem', background: '#f8f9fa', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer', fontWeight: '600' }}>
                      Cancel
                    </button>
                    <button onClick={handleSaveWorker} disabled={editSaving}
                      style={{ padding: '0.6rem 1.5rem', background: editSaving ? '#93c5fd' : '#1F7A8C', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer', fontWeight: '600' }}>
                      {editSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        );
      case 'attendance':
        return (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '1.5rem',
                color: '#1F7A8C',
                fontWeight: 'bold'
              }}>
                Recent Attendance ({attendances.length})
              </h2>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => navigate(`/projects/${id}/attendance`)}
                  style={{
                    background: '#f8f9fa',
                    border: '2px solid #1F7A8C',
                    color: '#1F7A8C',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1F7A8C';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f8f9fa';
                    e.currentTarget.style.color = '#1F7A8C';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  View All Attendance
                </button>
                <button
                  onClick={() => navigate(`/attendance?project_id=${id}`)}
                  style={{
                    background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)',
                    border: 'none',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(31, 122, 140, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(31, 122, 140, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(31, 122, 140, 0.3)';
                  }}
                >
                  Mark Attendance
                </button>
              </div>
            </div>

            {attendances.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#1F7A8C', fontWeight: '600' }}>Worker</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#1F7A8C', fontWeight: '600' }}>Date</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#1F7A8C', fontWeight: '600' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendances.map((attendance, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #e9ecef' }}>
                        <td style={{ padding: '1rem' }}>{attendance.worker?.name || 'N/A'}</td>
                        <td style={{ padding: '1rem' }}>{attendance.date}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            background: attendance.status === 'present'
                              ? '#22c55e'
                              : attendance.status === 'half-day'
                              ? '#f59e0b'
                              : '#ef4444',
                            color: 'white'
                          }}>
                            {attendance.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                background: '#f8f9fa',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✓</div>
                <h3 style={{
                  color: '#1F7A8C',
                  marginBottom: '0.5rem',
                  fontSize: '1.5rem'
                }}>
                  No Attendance Records
                </h3>
                <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
                  Start marking attendance for workers!
                </p>
              </div>
            )}
          </div>
        );
      case 'payments':
        return (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '1.5rem',
                color: '#1F7A8C',
                fontWeight: 'bold'
              }}>
                Recent Payments ({payments.length})
              </h2>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => navigate(`/projects/${id}/payments`)}
                  style={{
                    background: '#f8f9fa',
                    border: '2px solid #1F7A8C',
                    color: '#1F7A8C',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1F7A8C';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f8f9fa';
                    e.currentTarget.style.color = '#1F7A8C';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  View All Payments
                </button>
                <button
                  onClick={() => navigate(`/projects/${id}/bulk-payment`)}
                  style={{
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    border: 'none', color: 'white',
                    padding: '0.75rem 1.5rem', fontSize: '0.95rem', fontWeight: '600',
                    borderRadius: '10px', boxShadow: '0 4px 15px rgba(34,197,94,0.3)',
                    cursor: 'pointer', transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  💳 Bulk Payment
                </button>
                <button
                  onClick={() => navigate(`/projects/${id}/payments`)}
                  style={{
                    background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)',
                    border: 'none',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(31, 122, 140, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(31, 122, 140, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(31, 122, 140, 0.3)';
                  }}
                >
                  + Add Payment
                </button>
              </div>
            </div>

            {payments.length > 0 ? (
              <div style={{
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                border: '1px solid #e9ecef',
                overflowX: 'auto'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#1F7A8C', fontWeight: '600' }}>Worker</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#1F7A8C', fontWeight: '600' }}>Date</th>
                      <th style={{ padding: '1rem', textAlign: 'right', color: '#1F7A8C', fontWeight: '600' }}>Amount</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#1F7A8C', fontWeight: '600' }}>Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment, index) => (
                      <tr key={index} style={{
                        borderBottom: '1px solid #e9ecef',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                      >
                        <td style={{ padding: '1rem', fontWeight: '500' }}>{payment.worker?.name || 'N/A'}</td>
                        <td style={{ padding: '1rem', color: '#6c757d' }}>
                          {new Date(payment.payment_date).toLocaleDateString('en-IN')}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#22c55e' }}>
                          ₹{parseFloat(payment.amount).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            background: payment.payment_method === 'cash'
                              ? '#d1fae5'
                              : payment.payment_method === 'bank_transfer'
                              ? '#dbeafe'
                              : '#fef3c7',
                            color: payment.payment_method === 'cash'
                              ? '#065f46'
                              : payment.payment_method === 'bank_transfer'
                              ? '#1e40af'
                              : '#92400e'
                          }}>
                            {payment.payment_method?.replace('_', ' ') || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💰</div>
                <h3 style={{ color: '#1F7A8C', marginBottom: '0.5rem', fontSize: '1.25rem' }}>No Payments Yet</h3>
                <p style={{ color: '#6c757d' }}>Start recording worker payments!</p>
              </div>
            )}
          </div>
        );
      case 'materials':
        return (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '1.5rem',
                color: '#1F7A8C',
                fontWeight: 'bold'
              }}>
                Project Materials ({materials.length})
              </h2>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => navigate(`/projects/${id}/materials`)}
                  style={{
                    background: '#f8f9fa',
                    border: '2px solid #1F7A8C',
                    color: '#1F7A8C',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1F7A8C';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f8f9fa';
                    e.currentTarget.style.color = '#1F7A8C';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  View All Materials
                </button>
                <button
                  onClick={() => navigate(`/projects/${id}/materials`)}
                  style={{
                    background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)',
                    border: 'none',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(31, 122, 140, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(31, 122, 140, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(31, 122, 140, 0.3)';
                  }}
                >
                  + Add Material
                </button>
              </div>
            </div>

            {materials.length > 0 ? (
              <div style={{
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                border: '1px solid #e9ecef',
                overflowX: 'auto'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#1F7A8C', fontWeight: '600' }}>Material Name</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#1F7A8C', fontWeight: '600' }}>Category</th>
                      <th style={{ padding: '1rem', textAlign: 'right', color: '#1F7A8C', fontWeight: '600' }}>Quantity</th>
                      <th style={{ padding: '1rem', textAlign: 'right', color: '#1F7A8C', fontWeight: '600' }}>Cost</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#1F7A8C', fontWeight: '600' }}>Supplier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((material, index) => (
                      <tr key={index} style={{
                        borderBottom: '1px solid #e9ecef',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                      >
                        <td style={{ padding: '1rem', fontWeight: '500' }}>{material.material_name}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            background: '#e0f2fe',
                            color: '#0369a1'
                          }}>
                            {material.category || 'N/A'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right', color: '#6c757d' }}>
                          {parseFloat(material.quantity).toLocaleString('en-IN')} {material.unit || ''}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#1F7A8C' }}>
                          ₹{parseFloat(material.cost_per_unit).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '1rem', color: '#6c757d' }}>{material.supplier || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🧱</div>
                <h3 style={{ color: '#1F7A8C', marginBottom: '0.5rem', fontSize: '1.25rem' }}>No Materials Yet</h3>
                <p style={{ color: '#6c757d' }}>Start tracking construction materials!</p>
              </div>
            )}
          </div>
        );
      case 'expenses':
        return (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '1.5rem',
                color: '#1F7A8C',
                fontWeight: 'bold'
              }}>
                Recent Expenses ({expenses.length})
              </h2>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => navigate(`/projects/${id}/expenses`)}
                  style={{
                    background: '#f8f9fa',
                    border: '2px solid #1F7A8C',
                    color: '#1F7A8C',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1F7A8C';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f8f9fa';
                    e.currentTarget.style.color = '#1F7A8C';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  View All Expenses
                </button>
                <button
                  onClick={() => navigate(`/projects/${id}/expenses`)}
                  style={{
                    background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)',
                    border: 'none',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(31, 122, 140, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(31, 122, 140, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(31, 122, 140, 0.3)';
                  }}
                >
                  + Add Expense
                </button>
              </div>
            </div>

            {expenses.length > 0 ? (
              <div style={{
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                border: '1px solid #e9ecef',
                overflowX: 'auto'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#1F7A8C', fontWeight: '600' }}>Category</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#1F7A8C', fontWeight: '600' }}>Description</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#1F7A8C', fontWeight: '600' }}>Date</th>
                      <th style={{ padding: '1rem', textAlign: 'right', color: '#1F7A8C', fontWeight: '600' }}>Amount</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#1F7A8C', fontWeight: '600' }}>Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense, index) => (
                      <tr key={index} style={{
                        borderBottom: '1px solid #e9ecef',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                      >
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            background: '#fef3c7',
                            color: '#92400e'
                          }}>
                            {expense.category || 'N/A'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', fontWeight: '500' }}>{expense.description}</td>
                        <td style={{ padding: '1rem', color: '#6c757d' }}>
                          {new Date(expense.expense_date).toLocaleDateString('en-IN')}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#ef4444' }}>
                          ₹{parseFloat(expense.amount).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '1rem', color: '#6c757d' }}>
                          {expense.payment_method?.replace('_', ' ') || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💸</div>
                <h3 style={{ color: '#1F7A8C', marginBottom: '0.5rem', fontSize: '1.25rem' }}>No Expenses Yet</h3>
                <p style={{ color: '#6c757d' }}>Start tracking project expenses!</p>
              </div>
            )}
          </div>
        );
      case 'invoices':
        return (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '1.5rem',
                color: '#1F7A8C',
                fontWeight: 'bold'
              }}>
                Invoices
              </h2>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => navigate(`/projects/${id}/invoices`)}
                  style={{
                    background: '#f8f9fa',
                    border: '2px solid #1F7A8C',
                    color: '#1F7A8C',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1F7A8C';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f8f9fa';
                    e.currentTarget.style.color = '#1F7A8C';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  View All Invoices
                </button>
                <button
                  onClick={() => navigate(`/projects/${id}/invoices`)}
                  style={{
                    background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)',
                    border: 'none',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(31, 122, 140, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(31, 122, 140, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(31, 122, 140, 0.3)';
                  }}
                >
                  + Create Invoice
                </button>
              </div>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
              <h3 style={{ color: '#1F7A8C', marginBottom: '0.5rem', fontSize: '1.25rem' }}>No Invoices Yet</h3>
              <p style={{ color: '#6c757d' }}>Generate invoices for your clients!</p>
            </div>
          </div>
        );
      case 'client-advances':
        return (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '1.5rem',
                color: '#1F7A8C',
                fontWeight: 'bold'
              }}>
                Client Advances
              </h2>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => navigate(`/projects/${id}/client-advances`)}
                  style={{
                    background: '#f8f9fa',
                    border: '2px solid #1F7A8C',
                    color: '#1F7A8C',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1F7A8C';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f8f9fa';
                    e.currentTarget.style.color = '#1F7A8C';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  View All Advances
                </button>
                <button
                  onClick={() => navigate(`/projects/${id}/client-advances`)}
                  style={{
                    background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)',
                    border: 'none',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(31, 122, 140, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(31, 122, 140, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(31, 122, 140, 0.3)';
                  }}
                >
                  + Record Advance
                </button>
              </div>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💵</div>
              <h3 style={{ color: '#1F7A8C', marginBottom: '0.5rem', fontSize: '1.25rem' }}>No Client Advances Yet</h3>
              <p style={{ color: '#6c757d' }}>Track advance payments from clients!</p>
            </div>
          </div>
        );
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
        <button
          onClick={() => navigate(`/projects/${id}/edit`)}
          style={{
            background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)',
            border: 'none',
            color: 'white',
            padding: '0.5rem 1.2rem',
            fontSize: '0.85rem',
            fontWeight: '600',
            borderRadius: '6px',
            boxShadow: '0 1px 4px rgba(31, 122, 140, 0.2)',
            transition: 'all 0.3s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 3px 8px rgba(31, 122, 140, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 4px rgba(31, 122, 140, 0.2)';
          }}
        >
          Edit Project
        </button>
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
            onClick={() => tab.path ? navigate(tab.path) : setActiveTab(tab.id as TabType)}
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

      {/* Modals */}
      <Modal
        isOpen={openModal === 'workers'}
        onClose={() => setOpenModal(null)}
        title="All Workers"
        size="xlarge"
      >
        {allWorkers.length > 0 ? (
          <div className="grid grid-cols-3" style={{ gap: '1.25rem' }}>
            {allWorkers.map((worker) => (
              <div
                key={worker.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s',
                  border: '1px solid #e9ecef'
                }}
              >
                <h3
                  onClick={() => {
                    setOpenModal(null);
                    navigate(`/projects/${id}/workers/${worker.id}`);
                  }}
                  style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '1.15rem',
                    color: '#1F7A8C',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {worker.name}
                </h3>
                <div style={{ marginBottom: '0.5rem', color: '#6c757d' }}>
                  <div>💼 {worker.role}</div>
                  <div>📱 {worker.phone}</div>
                </div>
                <div style={{
                  padding: '0.75rem',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  marginTop: '0.75rem'
                }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#6c757d' }}>Daily Wage</p>
                  <p style={{ margin: 0, fontSize: '1.15rem', fontWeight: 'bold', color: '#1F7A8C' }}>
                    ₹{worker.daily_wage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>No workers found</p>
        )}
      </Modal>

      <Modal
        isOpen={openModal === 'attendance'}
        onClose={() => setOpenModal(null)}
        title="All Attendance Records"
        size="xlarge"
      >
        {allAttendances.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1F7A8C', fontWeight: '600' }}>Worker</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1F7A8C', fontWeight: '600' }}>Date</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1F7A8C', fontWeight: '600' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {allAttendances.map((attendance, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e9ecef' }}>
                  <td style={{ padding: '1rem' }}>{attendance.worker?.name || 'N/A'}</td>
                  <td style={{ padding: '1rem' }}>{attendance.date}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: attendance.status === 'present' ? '#22c55e' : attendance.status === 'half-day' ? '#f59e0b' : '#ef4444',
                      color: 'white'
                    }}>
                      {attendance.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>No attendance records found</p>
        )}
      </Modal>

      <Modal
        isOpen={openModal === 'payments'}
        onClose={() => setOpenModal(null)}
        title="All Payments"
        size="xlarge"
      >
        {allPayments.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1F7A8C', fontWeight: '600' }}>Worker</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1F7A8C', fontWeight: '600' }}>Date</th>
                <th style={{ padding: '1rem', textAlign: 'right', color: '#1F7A8C', fontWeight: '600' }}>Amount</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1F7A8C', fontWeight: '600' }}>Method</th>
              </tr>
            </thead>
            <tbody>
              {allPayments.map((payment, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e9ecef' }}>
                  <td style={{ padding: '1rem' }}>{payment.worker?.name || 'N/A'}</td>
                  <td style={{ padding: '1rem' }}>{new Date(payment.payment_date).toLocaleDateString('en-IN')}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#22c55e' }}>
                    ₹{parseFloat(payment.amount).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '1rem' }}>{payment.payment_method?.replace('_', ' ') || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>No payments found</p>
        )}
      </Modal>

      <Modal
        isOpen={openModal === 'materials'}
        onClose={() => setOpenModal(null)}
        title="All Materials"
        size="xlarge"
      >
        {allMaterials.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1F7A8C', fontWeight: '600' }}>Material Name</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1F7A8C', fontWeight: '600' }}>Category</th>
                <th style={{ padding: '1rem', textAlign: 'right', color: '#1F7A8C', fontWeight: '600' }}>Quantity</th>
                <th style={{ padding: '1rem', textAlign: 'right', color: '#1F7A8C', fontWeight: '600' }}>Cost</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1F7A8C', fontWeight: '600' }}>Supplier</th>
              </tr>
            </thead>
            <tbody>
              {allMaterials.map((material, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e9ecef' }}>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>{material.material_name}</td>
                  <td style={{ padding: '1rem' }}>{material.category || 'N/A'}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {parseFloat(material.quantity).toLocaleString('en-IN')} {material.unit || ''}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#1F7A8C' }}>
                    ₹{parseFloat(material.cost_per_unit).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '1rem' }}>{material.supplier || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>No materials found</p>
        )}
      </Modal>

      <Modal
        isOpen={openModal === 'expenses'}
        onClose={() => setOpenModal(null)}
        title="All Expenses"
        size="xlarge"
      >
        {allExpenses.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1F7A8C', fontWeight: '600' }}>Category</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1F7A8C', fontWeight: '600' }}>Description</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1F7A8C', fontWeight: '600' }}>Date</th>
                <th style={{ padding: '1rem', textAlign: 'right', color: '#1F7A8C', fontWeight: '600' }}>Amount</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1F7A8C', fontWeight: '600' }}>Method</th>
              </tr>
            </thead>
            <tbody>
              {allExpenses.map((expense, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e9ecef' }}>
                  <td style={{ padding: '1rem' }}>{expense.category || 'N/A'}</td>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>{expense.description}</td>
                  <td style={{ padding: '1rem' }}>{new Date(expense.expense_date).toLocaleDateString('en-IN')}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#ef4444' }}>
                    ₹{parseFloat(expense.amount).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '1rem' }}>{expense.payment_method?.replace('_', ' ') || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>No expenses found</p>
        )}
      </Modal>

      <Modal
        isOpen={openModal === 'invoices'}
        onClose={() => setOpenModal(null)}
        title="All Invoices"
        size="xlarge"
      >
        <p style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>No invoices available</p>
      </Modal>

      <Modal
        isOpen={openModal === 'client-advances'}
        onClose={() => setOpenModal(null)}
        title="All Client Advances"
        size="xlarge"
      >
        <p style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>No client advances available</p>
      </Modal>
    </div>
  );
};

export default ProjectDetails;
