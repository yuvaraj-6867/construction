import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams, useLocation } from 'react-router-dom';
import expenseService from '../../services/expenseService';
import projectService from '../../services/projectService';
import ConfirmDialog from '../../components/ConfirmDialog';
import Loading from '../../components/Loading';

const ExpenseList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const location = useLocation();

  // Check if we're on a project-specific route
  const isProjectRoute = location.pathname.includes('/projects/');
  const projectId = isProjectRoute ? params.id : searchParams.get('project_id');

  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [formData, setFormData] = useState({
    project_id: projectId || '',
    category: 'transportation',
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    notes: ''
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; expenseId: number | null }>({
    isOpen: false,
    expenseId: null,
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadExpenses();
    loadProjects();
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      setFormData(prev => ({ ...prev, project_id: projectId }));
    }
  }, [projectId]);

  const loadProjects = async () => {
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await expenseService.getAll(projectId ? Number(projectId) : undefined);
      setExpenses(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load expenses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setConfirmDialog({ isOpen: true, expenseId: id });
  };

  const handleDeleteConfirm = async () => {
    if (confirmDialog.expenseId === null) return;

    try {
      await expenseService.delete(confirmDialog.expenseId.toString());
      setConfirmDialog({ isOpen: false, expenseId: null });
      loadExpenses();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete expense');
      console.error(err);
      setConfirmDialog({ isOpen: false, expenseId: null });
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDialog({ isOpen: false, expenseId: null });
  };

  // Drawer handlers
  const openAddDrawer = () => {
    setEditingExpense(null);
    setFormData({
      project_id: projectId || '',
      category: 'transportation',
      description: '',
      amount: '',
      expense_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      notes: ''
    });
    setFormError('');
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (expense: any) => {
    setEditingExpense(expense);
    setFormData({
      project_id: expense.project_id,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      expense_date: expense.expense_date.split('T')[0],
      payment_method: expense.payment_method || 'cash',
      notes: expense.notes || ''
    });
    setFormError('');
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingExpense(null);
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
      if (editingExpense) {
        await expenseService.update(editingExpense.id, formData);
      } else {
        await expenseService.create(formData);
      }
      closeDrawer();
      loadExpenses();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to save expense');
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const totalAmount = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

  // Group expenses by category
  const expensesByCategory = expenses.reduce((acc: any, expense) => {
    const category = expense.category || 'Other';
    if (!acc[category]) acc[category] = 0;
    acc[category] += parseFloat(expense.amount);
    return acc;
  }, {});

  if (loading) {
    return <Loading message="Loading expenses..." />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%)',
      padding: '2rem 3rem 3rem 3rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        background: 'white',
        padding: '1.5rem 2rem',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button
            onClick={() => {
              if (isProjectRoute && projectId) {
                navigate(`/projects/${projectId}`);
              } else {
                navigate('/dashboard');
              }
            }}
            style={{
              background: '#f8f9fa',
              color: '#1F7A8C',
              border: '2px solid #1F7A8C',
              padding: '0.75rem 1.5rem',
              fontSize: '0.95rem',
              fontWeight: '600',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
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
            ← Back
          </button>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '2.5rem',
              background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold'
            }}>
              Expenses
            </h1>
            <p style={{
              margin: '0.5rem 0 0 0',
              color: '#6c757d',
              fontSize: '1rem'
            }}>
              {expenses.length} expense(s) found | Total: ₹{totalAmount.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
        <button
          onClick={openAddDrawer}
          style={{
            background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)',
            border: 'none',
            color: 'white',
            padding: '0.875rem 2rem',
            fontSize: '1rem',
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

      {error && (
        <div style={{
          padding: '1rem 1.5rem',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          fontSize: '1rem',
          fontWeight: '500'
        }}>
          {error}
        </div>
      )}

      {/* Category Summary Cards */}
      {Object.keys(expensesByCategory).length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {Object.entries(expensesByCategory).map(([category, amount]: [string, any]) => (
            <div
              key={category}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.25rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                textAlign: 'center',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
              }}
            >
              <h3 style={{
                margin: '0 0 0.5rem 0',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#ef4444'
              }}>
                ₹{amount.toLocaleString('en-IN')}
              </h3>
              <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>{category}</p>
            </div>
          ))}
        </div>
      )}

      {expenses.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem'
          }}>💸</div>
          <h2 style={{
            fontSize: '1.5rem',
            color: '#1F7A8C',
            marginBottom: '0.5rem'
          }}>No Expenses Found</h2>
          <p style={{
            color: '#6c757d',
            marginBottom: '2rem'
          }}>Get started by adding your first expense</p>
          <button
            onClick={openAddDrawer}
            style={{
              background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)',
              border: 'none',
              color: 'white',
              padding: '0.875rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '10px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(31, 122, 140, 0.3)',
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
            Add First Expense
          </button>
        </div>
      ) : (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{
                  background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)',
                  color: 'white'
                }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.95rem' }}>DATE</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.95rem' }}>CATEGORY</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.95rem' }}>DESCRIPTION</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', fontSize: '0.95rem' }}>AMOUNT</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.95rem' }}>PAYMENT METHOD</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.95rem' }}>PROJECT</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', fontSize: '0.95rem' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    style={{
                      borderBottom: '1px solid #e9ecef',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f8f9fa';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'white';
                    }}
                  >
                    <td style={{ padding: '1rem' }}>
                      {expense.expense_date === 'Invalid Date' || !expense.expense_date
                        ? 'Invalid Date'
                        : new Date(expense.expense_date).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.35rem 0.75rem',
                        background: '#fef3c7',
                        color: '#92400e',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: '500'
                      }}>
                        {expense.category || 'Other'}
                      </span>
                    </td>
                    <td style={{
                      padding: '1rem',
                      fontWeight: '500',
                      color: '#1F7A8C'
                    }}>
                      {expense.description}
                    </td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'right',
                      fontWeight: '700',
                      fontSize: '1.05rem',
                      color: '#ef4444'
                    }}>
                      ₹{parseFloat(expense.amount).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.35rem 0.75rem',
                        background: '#e0f2fe',
                        color: '#0369a1',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: '500'
                      }}>
                        {expense.payment_method?.replace('_', ' ') || '-'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        onClick={() => navigate(`/projects/${expense.project_id}`)}
                        style={{
                          color: '#1F7A8C',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.textDecoration = 'underline';
                          e.currentTarget.style.color = '#16616F';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.textDecoration = 'none';
                          e.currentTarget.style.color = '#1F7A8C';
                        }}
                      >
                        {expense.project?.name || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => openEditDrawer(expense)}
                          style={{
                            background: '#f97316',
                            border: 'none',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#ea580c';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f97316';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(expense.id)}
                          style={{
                            background: '#ef4444',
                            border: 'none',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#dc2626';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#ef4444';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
              width: '550px',
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
                  {editingExpense ? 'Edit Expense' : 'New Expense'}
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
                {editingExpense ? 'Update expense information' : 'Add a new expense to your project'}
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

              <form onSubmit={handleFormSubmit} id="expense-form">
                {!isProjectRoute && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#1F7A8C',
                      fontWeight: '600',
                      fontSize: '0.95rem'
                    }}>
                      Project *
                    </label>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#1F7A8C',
                      fontWeight: '600',
                      fontSize: '0.95rem'
                    }}>
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
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
                      <option value="transportation">Transportation</option>
                      <option value="equipment_rental">Equipment Rental</option>
                      <option value="tools">Tools</option>
                      <option value="utilities">Utilities</option>
                      <option value="permits">Permits & Licenses</option>
                      <option value="insurance">Insurance</option>
                      <option value="professional_fees">Professional Fees</option>
                      <option value="repairs">Repairs & Maintenance</option>
                      <option value="miscellaneous">Miscellaneous</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#1F7A8C',
                      fontWeight: '600',
                      fontSize: '0.95rem'
                    }}>
                      Payment Method
                    </label>
                    <select
                      name="payment_method"
                      value={formData.payment_method}
                      onChange={handleFormChange}
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
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                      <option value="upi">UPI</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#1F7A8C',
                      fontWeight: '600',
                      fontSize: '0.95rem'
                    }}>
                      Amount (₹) *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleFormChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="Enter amount"
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

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#1F7A8C',
                      fontWeight: '600',
                      fontSize: '0.95rem'
                    }}>
                      Expense Date *
                    </label>
                    <input
                      type="date"
                      name="expense_date"
                      value={formData.expense_date}
                      onChange={handleFormChange}
                      required
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
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#1F7A8C',
                    fontWeight: '600',
                    fontSize: '0.95rem'
                  }}>
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    required
                    rows={2}
                    placeholder="Brief description of the expense"
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

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#1F7A8C',
                    fontWeight: '600',
                    fontSize: '0.95rem'
                  }}>
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    rows={3}
                    placeholder="Add any additional notes (optional)"
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
                  form="expense-form"
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
                  {formLoading ? 'Saving...' : (editingExpense ? 'Update Expense' : 'Add Expense')}
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

      <style>{`
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

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

export default ExpenseList;
