import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams, useLocation } from 'react-router-dom';
import workerService from '../../services/workerService';
import projectService from '../../services/projectService';
import ConfirmDialog from '../../components/ConfirmDialog';
import Loading from '../../components/Loading';
import Pagination from '../../components/Pagination';

interface WorkerListProps { embedded?: boolean; }

const WorkerList: React.FC<WorkerListProps> = ({ embedded = false }) => {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<any>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const location = useLocation();

  // Check if we're on a project-specific route
  const isProjectRoute = location.pathname.includes('/projects/');
  const projectId = isProjectRoute ? params.id : searchParams.get('project_id');

  // Search/filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    phone: '',
    address: '',
    payment_type: 'daily',
    daily_wage: '',
    contract_amount: '',
    advance_given: '',
    status: 'active',
    project_id: projectId || ''
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; workerId: string | null }>({
    isOpen: false,
    workerId: null,
  });

  useEffect(() => {
    loadWorkers();
    loadProjects();
  }, [projectId]);

  useEffect(() => {
    if (projectId && !editingWorker) {
      setFormData(prev => ({
        ...prev,
        project_id: projectId
      }));
    }
  }, [projectId, editingWorker]);

  const loadWorkers = async () => {
    try {
      const data = await workerService.getAll(projectId || undefined);
      setWorkers(data);
    } catch (error) {
      console.error('Failed to load workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  const handleDeleteClick = (id: string) => {
    setConfirmDialog({ isOpen: true, workerId: id });
  };

  const handleDeleteConfirm = async () => {
    if (confirmDialog.workerId === null) return;
    try {
      await workerService.delete(confirmDialog.workerId);
      setConfirmDialog({ isOpen: false, workerId: null });
      loadWorkers();
    } catch (error) {
      console.error('Failed to delete worker:', error);
      setConfirmDialog({ isOpen: false, workerId: null });
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDialog({ isOpen: false, workerId: null });
  };

  const openAddDrawer = () => {
    setEditingWorker(null);
    setFormData({
      name: '',
      role: '',
      phone: '',
      address: '',
      payment_type: 'daily',
      daily_wage: '',
      contract_amount: '',
      advance_given: '',
      status: 'active',
      project_id: projectId || ''
    });
    setFormError('');
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (worker: any) => {
    setEditingWorker(worker);
    setFormData({
      name: worker.name,
      role: worker.role,
      phone: worker.phone,
      address: worker.address || '',
      payment_type: worker.payment_type || 'daily',
      daily_wage: worker.daily_wage || '',
      contract_amount: worker.contract_amount || '',
      advance_given: worker.advance_given || '',
      status: worker.status,
      project_id: worker.project_id
    });
    setFormError('');
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingWorker(null);
    setFormError('');
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      if (editingWorker) {
        await workerService.update(editingWorker.id, formData);
      } else {
        await workerService.create(formData);
      }
      closeDrawer();
      loadWorkers();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to save worker');
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const filteredWorkers = workers.filter(w => {
    const matchSearch = !search || w.name.toLowerCase().includes(search.toLowerCase()) || w.role.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || w.status === statusFilter;
    const matchType = !paymentTypeFilter || (w.payment_type || 'daily') === paymentTypeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const totalPages = Math.max(1, Math.ceil(filteredWorkers.length / pageSize));
  const pagedWorkers = filteredWorkers.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const rangeStart = filteredWorkers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, filteredWorkers.length);

  // Reset to page 1 when filters change
  const handleSearchChange = (val: string) => { setSearch(val); setCurrentPage(1); };
  const handleStatusChange = (val: string) => { setStatusFilter(val); setCurrentPage(1); };
  const handlePaymentTypeChange = (val: string) => { setPaymentTypeFilter(val); setCurrentPage(1); };
  const handlePageSizeChange = (val: number) => { setPageSize(val); setCurrentPage(1); };

  if (loading) {
    return <Loading message="Loading workers..." />;
  }

  const content = (
    <>
      {/* Header — hidden when embedded */}
      {!embedded && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '2.5rem', background: 'white', padding: '1.5rem 2rem',
          borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button
              onClick={() => navigate(projectId ? `/projects/${projectId}` : '/dashboard')}
              style={{
                background: '#f8f9fa', color: '#1F7A8C', border: '2px solid #1F7A8C',
                padding: '0.75rem 1.5rem', fontSize: '0.95rem', fontWeight: '600',
                borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#1F7A8C'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateX(-3px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.color = '#1F7A8C'; e.currentTarget.style.transform = 'translateX(0)'; }}
            >
              ← Back
            </button>
            <div>
              <h1 style={{
                margin: 0, fontSize: '2.5rem', fontWeight: 'bold',
                background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>Workers</h1>
              <p style={{ margin: '0.5rem 0 0 0', color: '#6c757d', fontSize: '1rem' }}>Manage your workforce</p>
            </div>
          </div>
          <button onClick={openAddDrawer}
            style={{
              background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)', border: 'none',
              padding: '0.875rem 2rem', fontSize: '1rem', fontWeight: '600', borderRadius: '10px',
              boxShadow: '0 4px 15px rgba(31,122,140,0.3)', cursor: 'pointer', color: 'white', transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(31,122,140,0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(31,122,140,0.3)'; }}
          >
            + Add Worker
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div style={{
        display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap',
        background: embedded ? 'transparent' : 'white',
        padding: embedded ? '0' : '1rem 1.5rem',
        borderRadius: '12px',
        boxShadow: embedded ? 'none' : '0 2px 12px rgba(0,0,0,0.06)',
        alignItems: 'center'
      }}>
        <input
          type="text"
          placeholder="🔍 Search by name or role..."
          value={search}
          onChange={e => handleSearchChange(e.target.value)}
          style={{
            flex: 1, minWidth: '160px',
            padding: embedded ? '0.5rem 0.75rem' : '0.65rem 1rem',
            fontSize: embedded ? '0.875rem' : '0.95rem',
            border: '2px solid #e9ecef', borderRadius: '8px', outline: 'none'
          }}
          onFocus={e => e.currentTarget.style.borderColor = '#1F7A8C'}
          onBlur={e => e.currentTarget.style.borderColor = '#e9ecef'}
        />
        <select value={statusFilter} onChange={e => handleStatusChange(e.target.value)}
          style={{
            padding: embedded ? '0.5rem 0.75rem' : '0.65rem 1rem',
            fontSize: embedded ? '0.875rem' : '0.95rem',
            border: '2px solid #e9ecef', borderRadius: '8px', outline: 'none', cursor: 'pointer',
            minWidth: '120px'
          }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select value={paymentTypeFilter} onChange={e => handlePaymentTypeChange(e.target.value)}
          style={{
            padding: embedded ? '0.5rem 0.75rem' : '0.65rem 1rem',
            fontSize: embedded ? '0.875rem' : '0.95rem',
            border: '2px solid #e9ecef', borderRadius: '8px', outline: 'none', cursor: 'pointer',
            minWidth: '140px'
          }}>
          <option value="">All Payment Types</option>
          <option value="daily">Daily Wage</option>
          <option value="contract">Contract</option>
        </select>
        {embedded && (
          <button onClick={openAddDrawer}
            style={{
              background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)', border: 'none',
              padding: '0.5rem 1.25rem', fontSize: '0.875rem', fontWeight: '600',
              borderRadius: '8px', cursor: 'pointer', color: 'white', whiteSpace: 'nowrap'
            }}>
            + Add Worker
          </button>
        )}
        {!embedded && (
          <span style={{ alignSelf: 'center', color: '#666', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
            {filteredWorkers.length} of {workers.length} workers
          </span>
        )}
      </div>

      {/* Workers — Table (embedded) or Grid (standalone) */}
      {filteredWorkers.length > 0 ? (
        embedded ? (
          <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e9ecef' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                  {['Worker', 'Phone', 'Role', 'Daily Wage', 'Status', 'Days Worked', 'Wages Earned', 'Advances', 'Net Pay', 'Paid'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: h === 'Wages Earned' || h === 'Advances' || h === 'Paid' || h === 'Daily Wage' || h === 'Days Worked' || h === 'Net Pay' ? 'right' : 'left', color: '#1F7A8C', fontWeight: '600', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedWorkers.map((worker) => (
                  <tr key={worker.id} style={{ borderBottom: '1px solid #e9ecef' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8f9fa')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span onClick={() => navigate(`/projects/${projectId}/workers/${worker.id}`)}
                        style={{ color: '#1F7A8C', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}
                        onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                        onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}>
                        {worker.name}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#6c757d', fontSize: '0.875rem' }}>{worker.phone}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#495057', fontSize: '0.875rem' }}>{worker.role}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.875rem', color: '#1F7A8C', fontWeight: '600' }}>
                      ₹{worker.payment_type === 'contract' ? worker.contract_amount : worker.daily_wage}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600', background: worker.is_active ? '#dcfce7' : '#fee2e2', color: worker.is_active ? '#16a34a' : '#dc2626' }}>
                        {worker.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '600', fontSize: '0.875rem', color: '#6366f1' }}>
                      {worker.days_worked || 0}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '600', fontSize: '0.875rem', color: '#1F7A8C' }}>
                      ₹{parseFloat(worker.total_wages_earned || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '600', fontSize: '0.875rem', color: '#f59e0b' }}>
                      ₹{parseFloat(worker.total_advances || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '700', fontSize: '0.875rem', color: '#7c3aed' }}>
                      ₹{parseFloat(worker.balance_due || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '600', fontSize: '0.875rem', color: '#22c55e' }}>
                      ₹{parseFloat(worker.total_payments || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f0f9ff', borderTop: '2px solid #1F7A8C' }}>
                  <td colSpan={5} style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#1F7A8C' }}>TOTAL</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '700', color: '#6366f1' }}>
                    {filteredWorkers.reduce((s, w) => s + (w.days_worked || 0), 0)}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '700', color: '#1F7A8C' }}>
                    ₹{filteredWorkers.reduce((s, w) => s + parseFloat(w.total_wages_earned || 0), 0).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '700', color: '#f59e0b' }}>
                    ₹{filteredWorkers.reduce((s, w) => s + parseFloat(w.total_advances || 0), 0).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '700', color: '#7c3aed' }}>
                    ₹{filteredWorkers.reduce((s, w) => s + parseFloat(w.balance_due || 0), 0).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '700', color: '#22c55e' }}>
                    ₹{filteredWorkers.reduce((s, w) => s + parseFloat(w.total_payments || 0), 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>
            <Pagination
              currentPage={currentPage} totalPages={totalPages} pageSize={pageSize}
              totalItems={filteredWorkers.length} rangeStart={rangeStart} rangeEnd={rangeEnd}
              onPageChange={setCurrentPage} onPageSizeChange={handlePageSizeChange}
              label="workers"
            />
          </div>
        ) : (
        <div className="grid grid-cols-4" style={{ gap: '1.25rem' }}>
          {pagedWorkers.map((worker, index) => (
            <div
              key={worker.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.25rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                transition: 'all 0.3s',
                border: '1px solid #e9ecef',
                cursor: 'pointer',
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(31, 122, 140, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
              }}
            >
              <div style={{ marginBottom: '0.875rem' }}>
                <h3
                  onClick={() => navigate(isProjectRoute ? `/projects/${projectId}/workers/${worker.id}` : `/workers/${worker.id}`)}
                  style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem', color: '#1F7A8C', fontWeight: '700', cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
                >
                  {worker.name}
                </h3>
                <div style={{ color: '#6c757d', fontSize: '0.85rem', margin: '0.25rem 0' }}>💼 {worker.role}</div>
                <div style={{ color: '#6c757d', fontSize: '0.85rem', margin: '0.25rem 0' }}>📱 {worker.phone}</div>
              </div>
              <div style={{ marginBottom: '0.875rem' }}>
                <span style={{ display: 'inline-block', padding: '0.35rem 0.75rem', borderRadius: '16px', fontSize: '0.75rem', fontWeight: '600', background: worker.is_active ? '#dcfce7' : '#fee2e2', color: worker.is_active ? '#16a34a' : '#dc2626' }}>
                  {worker.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f8f9fa', borderRadius: '8px', borderLeft: '3px solid #1F7A8C' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#6c757d' }}>{worker.payment_type === 'contract' ? 'Contract' : 'Daily Wage'}</p>
                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: '#1F7A8C' }}>
                  {worker.payment_type === 'contract' ? `₹${worker.contract_amount}` : `₹${worker.daily_wage}/day`}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={{ flex: 1, background: '#f8f9fa', color: '#1F7A8C', border: '2px solid #1F7A8C', padding: '0.6rem', borderRadius: '6px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
                  onClick={() => openEditDrawer(worker)}>Edit</button>
                <button style={{ flex: 1, background: '#ef4444', color: 'white', border: 'none', padding: '0.6rem', borderRadius: '6px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
                  onClick={() => handleDeleteClick(worker.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
        )
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👷</div>
          <h3 style={{
            color: '#1F7A8C',
            marginBottom: '0.5rem',
            fontSize: '1.5rem'
          }}>
            No Workers Yet
          </h3>
          <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
            Add your first worker to get started!
          </p>
          <button
            onClick={openAddDrawer}
            style={{
              background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)',
              border: 'none',
              padding: '0.875rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '10px',
              boxShadow: '0 4px 15px rgba(31, 122, 140, 0.3)',
              cursor: 'pointer',
              color: 'white'
            }}
          >
            + Add Worker
          </button>
        </div>
      )}

      {/* Pagination Footer — standalone mode only */}
      {!embedded && (
        <div style={{ marginTop: '1rem', background: 'white', borderRadius: '10px', border: '1px solid #e9ecef', overflow: 'hidden' }}>
          <Pagination
            currentPage={currentPage} totalPages={totalPages} pageSize={pageSize}
            totalItems={filteredWorkers.length} rangeStart={rangeStart} rangeEnd={rangeEnd}
            onPageChange={setCurrentPage} onPageSizeChange={handlePageSizeChange}
            label="workers"
          />
        </div>
      )}

      {/* Right Side Drawer */}
      {isDrawerOpen && (
        <>
          {/* Overlay */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
              animation: 'fadeIn 0.3s ease-out'
            }}
            onClick={closeDrawer}
          />

          {/* Drawer Panel */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '500px',
              background: 'white',
              boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideInRight 0.3s ease-out'
            }}
          >
            {/* Drawer Header */}
            <div style={{
              padding: '1.5rem 2rem',
              borderBottom: '2px solid #e9ecef',
              background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)',
              color: 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{
                  margin: 0,
                  fontSize: '1.75rem',
                  fontWeight: 'bold'
                }}>
                  {editingWorker ? 'Edit Worker' : 'New Worker'}
                </h2>
                <button
                  onClick={closeDrawer}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: 'white',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                    e.currentTarget.style.transform = 'rotate(90deg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.transform = 'rotate(0deg)';
                  }}
                >
                  ×
                </button>
              </div>
              <p style={{
                margin: '0.5rem 0 0 0',
                fontSize: '0.95rem',
                opacity: 0.9
              }}>
                {editingWorker ? 'Update worker information' : 'Add a new worker to your team'}
              </p>
            </div>

            {/* Drawer Body */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '2rem'
            }}>
              {/* Error Alert */}
              {formError && (
                <div style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  padding: '1rem 1.5rem',
                  borderRadius: '12px',
                  marginBottom: '1.5rem',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                }}>
                  {formError}
                </div>
              )}

              <form onSubmit={handleFormSubmit} id="worker-form">
                <div style={{ marginBottom: '1.5rem' }}>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    placeholder="Worker Name *"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      fontSize: '1rem',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      transition: 'all 0.3s',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#1F7A8C';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(31, 122, 140, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e9ecef';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleFormChange}
                    required
                    placeholder="Role (e.g., Mason, Helper, Electrician) *"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      fontSize: '1rem',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      transition: 'all 0.3s',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#1F7A8C';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(31, 122, 140, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e9ecef';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    required
                    placeholder="Phone Number *"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      fontSize: '1rem',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      transition: 'all 0.3s',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#1F7A8C';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(31, 122, 140, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e9ecef';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Payment Type */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1F7A8C', fontWeight: '600', fontSize: '0.95rem' }}>
                    Payment Type *
                  </label>
                  <select
                    name="payment_type"
                    value={formData.payment_type}
                    onChange={handleFormChange}
                    required
                    style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '1rem', border: '2px solid #e9ecef', borderRadius: '8px', outline: 'none', cursor: 'pointer' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#1F7A8C'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#e9ecef'; }}
                  >
                    <option value="daily">Daily Wage</option>
                    <option value="contract">Contract (Fixed Amount)</option>
                  </select>
                </div>

                {formData.payment_type === 'daily' ? (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <input
                      type="number"
                      name="daily_wage"
                      value={formData.daily_wage}
                      onChange={handleFormChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="Daily Wage (₹) *"
                      style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '1rem', border: '2px solid #e9ecef', borderRadius: '8px', transition: 'all 0.3s', outline: 'none' }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#1F7A8C'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(31,122,140,0.1)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = '#e9ecef'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                  </div>
                ) : (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <input
                      type="number"
                      name="contract_amount"
                      value={formData.contract_amount}
                      onChange={handleFormChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="Contract Amount (₹) *"
                      style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '1rem', border: '2px solid #e9ecef', borderRadius: '8px', transition: 'all 0.3s', outline: 'none' }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#1F7A8C'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(31,122,140,0.1)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = '#e9ecef'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.35rem' }}>
                      Contract worker — attendance recorded but fixed amount applies
                    </p>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#1F7A8C',
                      fontWeight: '600',
                      fontSize: '0.95rem'
                    }}>Status *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        fontSize: '1rem',
                        border: '2px solid #e9ecef',
                        borderRadius: '8px',
                        transition: 'all 0.3s',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#1F7A8C';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(31, 122, 140, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#e9ecef';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#1F7A8C',
                      fontWeight: '600',
                      fontSize: '0.95rem'
                    }}>Advance Amount</label>
                    <input
                      type="number"
                      name="advance_given"
                      value={formData.advance_given}
                      onChange={handleFormChange}
                      min="0"
                      step="0.01"
                      placeholder="0"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        fontSize: '1rem',
                        border: '2px solid #e9ecef',
                        borderRadius: '8px',
                        transition: 'all 0.3s',
                        outline: 'none',
                        boxSizing: 'border-box' as const
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#1F7A8C';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(31, 122, 140, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#e9ecef';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {!projectId && (
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#1F7A8C',
                      fontWeight: '600',
                      fontSize: '0.95rem'
                    }}>Project *</label>
                    <select
                      name="project_id"
                      value={formData.project_id}
                      onChange={handleFormChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        fontSize: '1rem',
                        border: '2px solid #e9ecef',
                        borderRadius: '8px',
                        transition: 'all 0.3s',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#1F7A8C';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(31, 122, 140, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#e9ecef';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <option value="">Select a project</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  )}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#1F7A8C',
                    fontWeight: '600',
                    fontSize: '0.95rem'
                  }}>Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    rows={3}
                    placeholder="Enter worker address (optional)"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      fontSize: '1rem',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      transition: 'all 0.3s',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#1F7A8C';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(31, 122, 140, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e9ecef';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </form>
            </div>

            {/* Drawer Footer */}
            <div style={{
              padding: '1.5rem 2rem',
              borderTop: '2px solid #e9ecef',
              background: '#f8f9fa'
            }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  form="worker-form"
                  disabled={formLoading}
                  style={{
                    flex: 1,
                    background: formLoading ? '#95a5a6' : 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)',
                    border: 'none',
                    color: 'white',
                    padding: '1rem 2rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    borderRadius: '10px',
                    boxShadow: formLoading ? 'none' : '0 4px 15px rgba(31, 122, 140, 0.3)',
                    transition: 'all 0.3s',
                    cursor: formLoading ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!formLoading) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(31, 122, 140, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!formLoading) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(31, 122, 140, 0.3)';
                    }
                  }}
                >
                  {formLoading ? 'Saving...' : (editingWorker ? 'Update Worker' : 'Add Worker')}
                </button>
                <button
                  type="button"
                  onClick={closeDrawer}
                  style={{
                    flex: 1,
                    background: '#f8f9fa',
                    color: '#6c757d',
                    border: '2px solid #dee2e6',
                    padding: '1rem 2rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    borderRadius: '10px',
                    transition: 'all 0.3s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e9ecef';
                    e.currentTarget.style.borderColor = '#adb5bd';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f8f9fa';
                    e.currentTarget.style.borderColor = '#dee2e6';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Worker"
        message="Are you sure you want to delete this worker? This will also delete all associated attendance records. This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );

  if (embedded) {
    return <div>{content}</div>;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%)',
      padding: '2rem 3rem 3rem 3rem'
    }}>
      {content}
    </div>
  );
};

export default WorkerList;
