import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams, useLocation } from 'react-router-dom';
import invoiceService from '../../services/invoiceService';
import projectService from '../../services/projectService';
import ConfirmDialog from '../../components/ConfirmDialog';
import Loading from '../../components/Loading';

const InvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const location = useLocation();

  // Check if we're on a project-specific route
  const isProjectRoute = location.pathname.includes('/projects/');
  const projectId = isProjectRoute ? params.id : searchParams.get('project_id');

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [formData, setFormData] = useState({
    project_id: projectId || '',
    invoice_number: '',
    amount: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    status: 'draft',
    payment_date: '',
    notes: ''
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; invoiceId: number | null }>({
    isOpen: false,
    invoiceId: null,
  });

  useEffect(() => {
    loadInvoices();
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

  const generateInvoiceNumber = () => {
    const date = new Date();
    const invNum = `INV-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000)}`;
    setFormData(prev => ({ ...prev, invoice_number: invNum }));
  };

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await invoiceService.getAll(projectId ? Number(projectId) : undefined);
      setInvoices(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setConfirmDialog({ isOpen: true, invoiceId: id });
  };

  const handleDeleteConfirm = async () => {
    if (confirmDialog.invoiceId === null) return;

    try {
      await invoiceService.delete(confirmDialog.invoiceId.toString());
      setConfirmDialog({ isOpen: false, invoiceId: null });
      loadInvoices();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete invoice');
      setConfirmDialog({ isOpen: false, invoiceId: null });
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDialog({ isOpen: false, invoiceId: null });
  };

  // Drawer handlers
  const openAddDrawer = () => {
    setEditingInvoice(null);
    generateInvoiceNumber();
    setFormData({
      project_id: projectId || '',
      invoice_number: '',
      amount: '',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: '',
      status: 'draft',
      payment_date: '',
      notes: ''
    });
    setFormError('');
    setIsDrawerOpen(true);
    // Generate invoice number after opening
    setTimeout(generateInvoiceNumber, 100);
  };

  const openEditDrawer = (invoice: any) => {
    setEditingInvoice(invoice);
    setFormData({
      project_id: invoice.project_id,
      invoice_number: invoice.invoice_number,
      amount: invoice.amount,
      issue_date: invoice.issue_date.split('T')[0],
      due_date: invoice.due_date ? invoice.due_date.split('T')[0] : '',
      status: invoice.status,
      payment_date: invoice.payment_date ? invoice.payment_date.split('T')[0] : '',
      notes: invoice.notes || ''
    });
    setFormError('');
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingInvoice(null);
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
      if (editingInvoice) {
        await invoiceService.update(editingInvoice.id, formData);
      } else {
        await invoiceService.create(formData);
      }
      closeDrawer();
      loadInvoices();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to save invoice');
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
  const paidAmount = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
  const pendingAmount = totalAmount - paidAmount;

  if (loading) {
    return <Loading message="Loading invoices..." />;
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
              Invoices
            </h1>
            <p style={{
              margin: '0.5rem 0 0 0',
              color: '#6c757d',
              fontSize: '1rem'
            }}>
              {invoices.length} invoice(s) found | Paid: ₹{paidAmount.toLocaleString('en-IN')} | Pending: ₹{pendingAmount.toLocaleString('en-IN')}
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
          + Create Invoice
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

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
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
            fontSize: '1.75rem',
            fontWeight: 'bold',
            color: '#1F7A8C'
          }}>
            ₹{totalAmount.toLocaleString('en-IN')}
          </h3>
          <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>Total Invoiced</p>
        </div>
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
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
            fontSize: '1.75rem',
            fontWeight: 'bold',
            color: '#22c55e'
          }}>
            ₹{paidAmount.toLocaleString('en-IN')}
          </h3>
          <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>Paid</p>
        </div>
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
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
            fontSize: '1.75rem',
            fontWeight: 'bold',
            color: '#f59e0b'
          }}>
            ₹{pendingAmount.toLocaleString('en-IN')}
          </h3>
          <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>Pending</p>
        </div>
      </div>

      {invoices.length === 0 ? (
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
          }}>📄</div>
          <h2 style={{
            fontSize: '1.5rem',
            color: '#1F7A8C',
            marginBottom: '0.5rem'
          }}>No Invoices Found</h2>
          <p style={{
            color: '#6c757d',
            marginBottom: '2rem'
          }}>Get started by creating your first invoice</p>
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
            Create First Invoice
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
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.95rem' }}>INVOICE #</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.95rem' }}>PROJECT</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.95rem' }}>ISSUE DATE</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.95rem' }}>DUE DATE</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', fontSize: '0.95rem' }}>AMOUNT</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.95rem' }}>STATUS</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.95rem' }}>PAYMENT DATE</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', fontSize: '0.95rem' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
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
                    <td style={{
                      padding: '1rem',
                      fontWeight: '700',
                      color: '#1F7A8C',
                      fontSize: '1rem'
                    }}>
                      {inv.invoice_number}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        onClick={() => navigate(`/projects/${inv.project_id}`)}
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
                        {inv.project?.name || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {inv.issue_date === 'Invalid Date' || !inv.issue_date
                        ? 'Invalid Date'
                        : new Date(inv.issue_date).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-IN') : '-'}
                    </td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'right',
                      fontWeight: '700',
                      fontSize: '1.05rem',
                      color: '#1F7A8C'
                    }}>
                      ₹{parseFloat(inv.amount).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.35rem 0.75rem',
                        background: inv.status === 'paid' ? '#dcfce7' : inv.status === 'sent' ? '#dbeafe' : '#fef3c7',
                        color: inv.status === 'paid' ? '#15803d' : inv.status === 'sent' ? '#1e40af' : '#92400e',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        textTransform: 'capitalize'
                      }}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#6c757d' }}>
                      {inv.payment_date ? new Date(inv.payment_date).toLocaleDateString('en-IN') : '-'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => openEditDrawer(inv)}
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
                          onClick={() => handleDeleteClick(inv.id)}
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
              width: '600px',
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
                  {editingInvoice ? 'Edit Invoice' : 'New Invoice'}
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
                {editingInvoice ? 'Update invoice details' : 'Create a new invoice for your project'}
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

              <form onSubmit={handleFormSubmit} id="invoice-form">
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
                      Invoice Number *
                    </label>
                    <input
                      type="text"
                      name="invoice_number"
                      value={formData.invoice_number}
                      onChange={handleFormChange}
                      required
                      placeholder="Auto-generated"
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
                      Issue Date *
                    </label>
                    <input
                      type="date"
                      name="issue_date"
                      value={formData.issue_date}
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

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#1F7A8C',
                      fontWeight: '600',
                      fontSize: '0.95rem'
                    }}>
                      Due Date
                    </label>
                    <input
                      type="date"
                      name="due_date"
                      value={formData.due_date}
                      onChange={handleFormChange}
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#1F7A8C',
                      fontWeight: '600',
                      fontSize: '0.95rem'
                    }}>
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
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
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
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
                      Payment Date
                    </label>
                    <input
                      type="date"
                      name="payment_date"
                      value={formData.payment_date}
                      onChange={handleFormChange}
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
                  form="invoice-form"
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
                  {formLoading ? 'Saving...' : (editingInvoice ? 'Update Invoice' : 'Create Invoice')}
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
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

export default InvoiceList;
