import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import projectService from '../../services/projectService';
import ConfirmDialog from '../../components/ConfirmDialog';
import Loading from '../../components/Loading';
import '../../styles/global.css';

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    client_name: '',
    location: '',
    budget: '',
    start_date: '',
    end_date: '',
    status: 'planning',
    description: '',
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; projectId: string | null }>({
    isOpen: false,
    projectId: null,
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setConfirmDialog({ isOpen: true, projectId: id });
  };

  const handleDeleteConfirm = async () => {
    if (confirmDialog.projectId === null) return;
    try {
      await projectService.delete(confirmDialog.projectId);
      setConfirmDialog({ isOpen: false, projectId: null });
      loadProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      setConfirmDialog({ isOpen: false, projectId: null });
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDialog({ isOpen: false, projectId: null });
  };

  const openAddDrawer = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      client_name: '',
      location: '',
      budget: '',
      start_date: '',
      end_date: '',
      status: 'planning',
      description: '',
    });
    setFormError('');
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (project: any) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      client_name: project.client_name,
      location: project.location,
      budget: project.budget,
      start_date: project.start_date,
      end_date: project.end_date || '',
      status: project.status,
      description: project.description || '',
    });
    setFormError('');
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingProject(null);
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
      const data = {
        ...formData,
        budget: parseFloat(formData.budget),
      };

      if (editingProject) {
        await projectService.update(editingProject.id, data);
      } else {
        await projectService.create(data);
      }
      closeDrawer();
      loadProjects();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to save project');
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading projects..." />;
  }

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
        marginBottom: '2.5rem',
        background: 'white',
        padding: '1.5rem 2rem',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button
              onClick={() => navigate('/dashboard')}
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
              ← Back to Dashboard
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
                Projects
              </h1>
              <p style={{
                margin: '0.5rem 0 0 0',
                color: '#6c757d',
                fontSize: '1rem'
              }}>
                Manage all your construction projects
              </p>
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={openAddDrawer}
            style={{
              background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)',
              border: 'none',
              padding: '0.875rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '10px',
              boxShadow: '0 4px 15px rgba(31, 122, 140, 0.3)',
              transition: 'all 0.3s',
              cursor: 'pointer',
              color: 'white'
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
            + New Project
          </button>
        </div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-4" style={{ gap: '1.25rem' }}>
            {projects.map((project, index) => (
              <div
                key={project.id}
                className="card"
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
                {/* Project Header */}
                <div style={{ marginBottom: '0.875rem' }}>
                  <h3
                    onClick={() => navigate(`/projects/${project.id}`)}
                    style={{
                      margin: '0 0 0.5rem 0',
                      fontSize: '1.15rem',
                      color: '#1F7A8C',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#16616F';
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#1F7A8C';
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                  >
                    {project.name}
                  </h3>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    margin: '0.35rem 0',
                    color: '#6c757d'
                  }}>
                    <span style={{ fontSize: '0.95rem' }}>📍</span>
                    <span style={{ fontSize: '0.85rem' }}>{project.location}</span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    margin: '0.35rem 0',
                    color: '#6c757d'
                  }}>
                    <span style={{ fontSize: '0.95rem' }}>👤</span>
                    <span style={{ fontSize: '0.85rem' }}>{project.client_name}</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div style={{ marginBottom: '0.875rem' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '16px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    background: project.status === 'in-progress'
                      ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                      : project.status === 'completed'
                      ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                      : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    boxShadow: project.status === 'in-progress'
                      ? '0 2px 8px rgba(34, 197, 94, 0.3)'
                      : project.status === 'completed'
                      ? '0 2px 8px rgba(59, 130, 246, 0.3)'
                      : '0 2px 8px rgba(245, 158, 11, 0.3)'
                  }}>
                    {project.status.replace('-', ' ')}
                  </span>
                </div>

                {/* Budget */}
                <div style={{
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  borderRadius: '8px',
                  borderLeft: '3px solid #1F7A8C'
                }}>
                  <p style={{
                    margin: 0,
                    fontSize: '0.75rem',
                    color: '#6c757d',
                    marginBottom: '0.15rem'
                  }}>
                    Budget
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '1.15rem',
                    fontWeight: 'bold',
                    color: '#1F7A8C'
                  }}>
                    ₹{(project.budget / 100000).toFixed(1)}L
                  </p>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn"
                    style={{
                      flex: 1,
                      background: '#f8f9fa',
                      color: '#1F7A8C',
                      border: '2px solid #1F7A8C',
                      padding: '0.6rem',
                      borderRadius: '6px',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                    onClick={() => openEditDrawer(project)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#1F7A8C';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f8f9fa';
                      e.currentTarget.style.color = '#1F7A8C';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn"
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '0.6rem',
                      borderRadius: '6px',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleDeleteClick(project.id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏗️</div>
            <h3 style={{
              color: '#1F7A8C',
              marginBottom: '0.5rem',
              fontSize: '1.5rem'
            }}>
              No Projects Yet
            </h3>
            <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
              Create your first project to get started!
            </p>
            <button
              className="btn btn-primary"
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
              + Create Project
            </button>
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
                  {editingProject ? 'Edit Project' : 'New Project'}
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
                {editingProject ? 'Update project information' : 'Create a new construction project'}
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

              <form onSubmit={handleFormSubmit} id="project-form">
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#1F7A8C',
                    fontWeight: '600',
                    fontSize: '0.95rem'
                  }}>
                    Project Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#1F7A8C',
                      fontWeight: '600',
                      fontSize: '0.95rem'
                    }}>
                      Client Name *
                    </label>
                    <input
                      type="text"
                      name="client_name"
                      value={formData.client_name}
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
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
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
                    Budget (₹) *
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleFormChange}
                    required
                    min="0"
                    step="0.01"
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
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#1F7A8C',
                      fontWeight: '600',
                      fontSize: '0.95rem'
                    }}>
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
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
                      End Date
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
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
                    Status *
                  </label>
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
                    <option value="planning">Planning</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#1F7A8C',
                    fontWeight: '600',
                    fontSize: '0.95rem'
                  }}>
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={4}
                    placeholder="Enter project description (optional)"
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
                  form="project-form"
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
                  {formLoading ? 'Saving...' : (editingProject ? 'Update Project' : 'Create Project')}
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
        title="Delete Project"
        message="Are you sure you want to delete this project? This will also delete all associated data including workers, materials, expenses, payments, invoices, and client advances. This action cannot be undone."
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
    </div>
  );
};

export default ProjectList;
