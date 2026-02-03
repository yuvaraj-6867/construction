import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import projectService from '../../services/projectService';

const ProjectForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      const data = await projectService.getById(id!);
      setFormData({
        name: data.name,
        client_name: data.client_name,
        location: data.location,
        budget: data.budget,
        start_date: data.start_date,
        end_date: data.end_date || '',
        status: data.status,
        description: data.description || '',
      });
    } catch (error) {
      alert('Failed to load project');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        budget: parseFloat(formData.budget),
      };

      if (id) {
        await projectService.update(id, data);
      } else {
        await projectService.create(data);
      }

      navigate('/projects');
    } catch (error) {
      alert('Failed to save project');
    } finally {
      setLoading(false);
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
        marginBottom: '2rem',
        background: 'white',
        padding: '1.5rem 2rem',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button
            type="button"
            onClick={() => navigate('/projects')}
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
            ← Back to Projects
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
              {id ? 'Edit Project' : 'New Project'}
            </h1>
            <p style={{
              margin: '0.5rem 0 0 0',
              color: '#6c757d',
              fontSize: '1rem'
            }}>
              {id ? 'Update project information' : 'Create a new construction project'}
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2.5rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        maxWidth: '900px',
        margin: '0 auto',
        border: '1px solid #e9ecef'
      }}>
        <form onSubmit={handleSubmit}>
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
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

          <div className="grid grid-cols-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
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
                className="form-input"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
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
                className="form-input"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
              className="form-input"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
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

          <div className="grid grid-cols-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
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
                className="form-input"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
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
                className="form-input"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
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
              className="form-input"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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

          <div style={{ marginBottom: '2rem' }}>
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
              className="form-input"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

          <div style={{
            display: 'flex',
            gap: '1rem',
            paddingTop: '1rem',
            borderTop: '2px solid #e9ecef'
          }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                background: loading ? '#95a5a6' : 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)',
                border: 'none',
                color: 'white',
                padding: '1rem 2rem',
                fontSize: '1rem',
                fontWeight: '600',
                borderRadius: '10px',
                boxShadow: loading ? 'none' : '0 4px 15px rgba(31, 122, 140, 0.3)',
                transition: 'all 0.3s',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(31, 122, 140, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(31, 122, 140, 0.3)';
                }
              }}
            >
              {loading ? 'Saving...' : id ? 'Update Project' : 'Create Project'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/projects')}
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
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
