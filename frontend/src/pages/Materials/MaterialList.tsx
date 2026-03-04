import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import materialService from '../../services/materialService';
import projectService from '../../services/projectService';
import ConfirmDialog from '../../components/ConfirmDialog';
import Loading from '../../components/Loading';

const MaterialList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const location = useLocation();

  // Check if we're on a project-specific route
  const isProjectRoute = location.pathname.includes('/projects/');
  const projectId = isProjectRoute ? params.id : searchParams.get('project_id');

  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [formData, setFormData] = useState({
    project_id: projectId || '',
    name: '',
    quantity: '',
    unit: 'kg',
    unit_price: '',
    total_cost: '',
    supplier_name: '',
    purchase_date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; materialId: number | null }>({
    isOpen: false,
    materialId: null,
  });

  useEffect(() => {
    loadMaterials();
    loadProjects();
  }, [projectId]);

  useEffect(() => {
    if (projectId && !editingMaterial) {
      setFormData(prev => ({
        ...prev,
        project_id: projectId
      }));
    }
  }, [projectId, editingMaterial]);

  // Auto-calculate total cost
  useEffect(() => {
    const quantity = parseFloat(formData.quantity) || 0;
    const unitPrice = parseFloat(formData.unit_price) || 0;
    const totalCost = (quantity * unitPrice).toFixed(2);
    if (formData.total_cost !== totalCost) {
      setFormData(prev => ({ ...prev, total_cost: totalCost }));
    }
  }, [formData.quantity, formData.unit_price]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const data = await materialService.getAll(projectId ? Number(projectId) : undefined);
      setMaterials(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load materials');
      console.error(err);
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

  const handleDeleteClick = (id: number) => {
    setConfirmDialog({ isOpen: true, materialId: id });
  };

  const handleDeleteConfirm = async () => {
    if (confirmDialog.materialId === null) return;

    try {
      await materialService.delete(confirmDialog.materialId.toString());
      setConfirmDialog({ isOpen: false, materialId: null });
      loadMaterials();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete material');
      console.error(err);
      setConfirmDialog({ isOpen: false, materialId: null });
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDialog({ isOpen: false, materialId: null });
  };

  const openAddDrawer = () => {
    setEditingMaterial(null);
    setFormData({
      project_id: projectId || '',
      name: '',
      quantity: '',
      unit: 'kg',
      unit_price: '',
      total_cost: '',
      supplier_name: '',
      purchase_date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setFormError('');
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (material: any) => {
    setEditingMaterial(material);
    setFormData({
      project_id: material.project_id,
      name: material.name,
      quantity: material.quantity,
      unit: material.unit,
      unit_price: material.unit_price,
      total_cost: material.total_cost,
      supplier_name: material.supplier_name || '',
      purchase_date: material.purchase_date.split('T')[0],
      notes: material.notes || ''
    });
    setFormError('');
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingMaterial(null);
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
      if (editingMaterial) {
        await materialService.update(editingMaterial.id, formData);
      } else {
        await materialService.create(formData);
      }
      closeDrawer();
      loadMaterials();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to save material');
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const downloadPurchaseOrder = () => {
    const doc = new jsPDF();
    const project = projects.find(p => String(p.id) === String(projectId));
    const poNumber = `PO-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}${String(new Date().getDate()).padStart(2,'0')}`;

    doc.setFillColor(31, 122, 140);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20); doc.setFont('helvetica', 'bold');
    doc.text('PURCHASE ORDER', 14, 18);
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text(`PO#: ${poNumber}  |  Date: ${new Date().toLocaleDateString('en-IN')}`, 14, 30);
    doc.setTextColor(50, 50, 50);

    if (project) {
      autoTable(doc, {
        startY: 46,
        body: [
          ['Project', project.name, 'Client', project.client_name || 'N/A'],
          ['Location', project.location || 'N/A', 'Date', new Date().toLocaleDateString('en-IN')],
        ],
        styles: { fontSize: 9 },
        columnStyles: { 0: { fontStyle: 'bold', fillColor: [240, 249, 255] }, 2: { fontStyle: 'bold', fillColor: [240, 249, 255] } },
        theme: 'plain',
      });
    }

    const startY = project ? (doc as any).lastAutoTable.finalY + 8 : 46;
    autoTable(doc, {
      startY,
      head: [['#', 'Material', 'Qty', 'Unit', 'Unit Price', 'Total Cost', 'Supplier']],
      body: materials.map((m, i) => [
        i + 1,
        m.name,
        m.quantity,
        m.unit,
        `\u20B9${parseFloat(m.unit_price || 0).toLocaleString('en-IN')}`,
        `\u20B9${parseFloat(m.total_cost).toLocaleString('en-IN')}`,
        m.supplier_name || '—'
      ]),
      foot: [['', '', '', '', '', `\u20B9${totalCost.toLocaleString('en-IN')}`, '']],
      headStyles: { fillColor: [31, 122, 140] },
      footStyles: { fillColor: [220, 252, 231], textColor: [22, 101, 52], fontStyle: 'bold' },
      styles: { fontSize: 8 },
      columnStyles: { 5: { halign: 'right' }, 4: { halign: 'right' } },
    });

    const yf = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(9); doc.setTextColor(150, 150, 150);
    doc.text(`Generated on ${new Date().toLocaleDateString('en-IN')} | Construction Worker Tracker`, 14, yf);

    doc.save(`purchase_order_${poNumber}.pdf`);
  };

  const totalCost = materials.reduce((sum, material) => sum + parseFloat(material.total_cost), 0);
  const totalQuantity = materials.reduce((sum, material) => sum + parseFloat(material.quantity), 0);

  if (loading) {
    return <Loading message="Loading materials..." />;
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
              Materials
            </h1>
            <p style={{
              margin: '0.5rem 0 0 0',
              color: '#6c757d',
              fontSize: '1rem'
            }}>
              {materials.length} material(s) found | Total Cost: ₹{totalCost.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {materials.length > 0 && (
            <button onClick={downloadPurchaseOrder}
              style={{ background: '#7c3aed', border: 'none', color: 'white', padding: '0.875rem 1.5rem', fontSize: '0.95rem', fontWeight: '600', borderRadius: '10px', cursor: 'pointer' }}>
              📋 Purchase Order PDF
            </button>
          )}
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
            + Add Material
          </button>
        </div>
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

      {materials.length === 0 ? (
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
          }}>🧱</div>
          <h2 style={{
            fontSize: '1.5rem',
            color: '#1F7A8C',
            marginBottom: '0.5rem'
          }}>No Materials Found</h2>
          <p style={{
            color: '#6c757d',
            marginBottom: '2rem'
          }}>Get started by adding your first material purchase</p>
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
            Add First Material
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
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.95rem' }}>NAME</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', fontSize: '0.95rem' }}>QUANTITY</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', fontSize: '0.95rem' }}>UNIT PRICE</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', fontSize: '0.95rem' }}>TOTAL COST</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.95rem' }}>SUPPLIER</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.95rem' }}>PROJECT</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', fontSize: '0.95rem' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((material) => (
                  <tr
                    key={material.id}
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
                      {material.purchase_date === 'Invalid Date' || !material.purchase_date
                        ? 'Invalid Date'
                        : new Date(material.purchase_date).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{
                      padding: '1rem',
                      fontWeight: '600',
                      color: '#1F7A8C'
                    }}>
                      {material.name}
                    </td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'right',
                      fontWeight: '500'
                    }}>
                      {material.quantity} <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>{material.unit}</span>
                    </td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'right',
                      color: '#6c757d'
                    }}>
                      ₹{parseFloat(material.unit_price).toLocaleString('en-IN')}
                    </td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'right',
                      fontWeight: '700',
                      fontSize: '1.05rem',
                      color: '#0369a1'
                    }}>
                      ₹{parseFloat(material.total_cost).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.35rem 0.75rem',
                        background: '#f0fdfa',
                        color: '#0f766e',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: '500'
                      }}>
                        {material.supplier_name || '-'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        onClick={() => navigate(`/projects/${material.project_id}`)}
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
                        {material.project?.name || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => openEditDrawer(material)}
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
                          onClick={() => handleDeleteClick(material.id)}
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
                  {editingMaterial ? 'Edit Material' : 'New Material'}
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
                {editingMaterial ? 'Update material information' : 'Add a new material purchase'}
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

              <form onSubmit={handleFormSubmit} id="material-form">
                {!isProjectRoute && (
                  <div style={{ marginBottom: '1.5rem' }}>
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

                <div style={{ marginBottom: '1.5rem' }}>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    placeholder="Material Name (e.g., Cement, Steel, Sand) *"
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleFormChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="Quantity *"
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
                    <select
                      name="unit"
                      value={formData.unit}
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
                      <option value="kg">Kilogram (kg)</option>
                      <option value="ton">Ton</option>
                      <option value="bag">Bag</option>
                      <option value="cft">Cubic Feet (cft)</option>
                      <option value="sqft">Square Feet (sqft)</option>
                      <option value="pcs">Pieces (pcs)</option>
                      <option value="ltr">Litre (ltr)</option>
                      <option value="m">Meter (m)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <input
                      type="number"
                      name="unit_price"
                      value={formData.unit_price}
                      onChange={handleFormChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="Unit Price (₹) *"
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
                    <input
                      type="number"
                      name="total_cost"
                      value={formData.total_cost}
                      readOnly
                      placeholder="Total Cost (Auto-calculated)"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        fontSize: '1rem',
                        border: '2px solid #e9ecef',
                        borderRadius: '8px',
                        background: '#f8f9fa',
                        cursor: 'not-allowed',
                        color: '#6c757d'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <input
                    type="text"
                    name="supplier_name"
                    value={formData.supplier_name}
                    onChange={handleFormChange}
                    placeholder="Supplier Name (optional)"
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
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#1F7A8C',
                    fontWeight: '600',
                    fontSize: '0.95rem'
                  }}>Purchase Date *</label>
                  <input
                    type="date"
                    name="purchase_date"
                    value={formData.purchase_date}
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

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#1F7A8C',
                    fontWeight: '600',
                    fontSize: '0.95rem'
                  }}>Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    rows={3}
                    placeholder="Add any notes about this material"
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
                  form="material-form"
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
                  {formLoading ? 'Saving...' : (editingMaterial ? 'Update Material' : 'Add Material')}
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
        title="Delete Material"
        message="Are you sure you want to delete this material entry? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

export default MaterialList;
