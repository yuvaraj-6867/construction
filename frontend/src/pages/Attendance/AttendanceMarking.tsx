import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams, useLocation } from 'react-router-dom';
import workerService from '../../services/workerService';
import attendanceService, { Attendance } from '../../services/attendanceService';

type AttendanceStatus = 'present' | 'half-day' | 'absent';

const AttendanceMarking: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  // Check if we're on a project-specific route
  const isProjectRoute = location.pathname.includes('/projects/');
  const projectId = (isProjectRoute ? params.id : searchParams.get('project_id')) || '';
  const [workers, setWorkers] = useState<any[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendances, setAttendances] = useState<Record<string, AttendanceStatus>>({});
  const [existingAttendances, setExistingAttendances] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (projectId) {
      loadWorkers();
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId && date) {
      loadExistingAttendance();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, projectId]);

  const loadWorkers = async () => {
    try {
      const data = await workerService.getAll(projectId);
      setWorkers(data.filter((w: any) => w.is_active));

      // Initialize attendances
      const initial: Record<string, AttendanceStatus> = {};
      data.forEach((w: any) => {
        if (w.is_active) initial[w.id] = 'present';
      });
      setAttendances(initial);
    } catch (error) {
      console.error('Failed to load workers:', error);
    }
  };

  const loadExistingAttendance = async () => {
    try {
      setLoadingExisting(true);
      const data = await attendanceService.getAll({ project_id: projectId, date });
      if (data.length > 0) {
        // Map existing records
        const existingMap: Record<string, any> = {};
        const statusMap: Record<string, AttendanceStatus> = {};
        data.forEach((a: any) => {
          existingMap[a.worker_id] = a;
          statusMap[a.worker_id] = a.status as AttendanceStatus;
        });
        setExistingAttendances(existingMap);
        setAttendances(prev => ({ ...prev, ...statusMap }));
        setIsEditMode(true);
      } else {
        setExistingAttendances({});
        setIsEditMode(false);
        // Reset to all present
        const initial: Record<string, AttendanceStatus> = {};
        workers.forEach((w: any) => { initial[w.id] = 'present'; });
        setAttendances(initial);
      }
    } catch (error) {
      console.error('Failed to load existing attendance:', error);
    } finally {
      setLoadingExisting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      if (isEditMode) {
        // Update existing attendance records individually
        const updatePromises = workers.map(worker => {
          const existing = existingAttendances[worker.id];
          if (existing) {
            return attendanceService.update(existing.id.toString(), {
              worker_id: worker.id,
              project_id: projectId,
              date,
              status: attendances[worker.id],
              notes: existing.notes || ''
            });
          } else {
            // Worker didn't have attendance for this date - create new
            return attendanceService.create({
              worker_id: worker.id,
              project_id: projectId,
              date,
              status: attendances[worker.id],
              notes: ''
            });
          }
        });
        await Promise.all(updatePromises);
      } else {
        // Bulk create new attendance
        const data: Attendance[] = workers.map(worker => ({
          worker_id: worker.id,
          project_id: projectId,
          date,
          status: attendances[worker.id],
          notes: ''
        }));
        await attendanceService.bulkCreate(data);
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      // Reload to confirm saved state
      await loadExistingAttendance();
    } catch (error) {
      alert('Failed to save attendance');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return '#22c55e';
      case 'half-day':
        return '#f59e0b';
      case 'absent':
        return '#ef4444';
      default:
        return '#6c757d';
    }
  };

  const presentCount = Object.values(attendances).filter(s => s === 'present').length;
  const halfDayCount = Object.values(attendances).filter(s => s === 'half-day').length;
  const absentCount = Object.values(attendances).filter(s => s === 'absent').length;

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
            onClick={() => navigate(projectId ? `/projects/${projectId}` : '/dashboard')}
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
              {isEditMode ? '✏️ Edit Attendance' : 'Mark Attendance'}
            </h1>
            <p style={{
              margin: '0.5rem 0 0 0',
              color: '#6c757d',
              fontSize: '1rem'
            }}>
              {isEditMode
                ? `Editing existing attendance for ${date}`
                : 'Record daily worker attendance'}
            </p>
          </div>
        </div>
        {isEditMode && (
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffc107',
            color: '#856404',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            ✏️ Edit Mode — Attendance already recorded for this date
          </div>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div style={{
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>✓</span>
          <span style={{ fontWeight: '600' }}>
            Attendance {isEditMode ? 'updated' : 'marked'} successfully!
          </span>
        </div>
      )}

      {/* Summary Stats */}
      {workers.length > 0 && (
        <div className="grid grid-cols-4" style={{ gap: '1.25rem', marginBottom: '2rem' }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
            textAlign: 'center',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{ color: '#1F7A8C', margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 'bold' }}>
              {workers.length}
            </h3>
            <p style={{ color: '#6c757d', margin: 0, fontSize: '0.9rem' }}>Total Workers</p>
          </div>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
            textAlign: 'center',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{ color: '#22c55e', margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 'bold' }}>
              {presentCount}
            </h3>
            <p style={{ color: '#6c757d', margin: 0, fontSize: '0.9rem' }}>Present</p>
          </div>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
            textAlign: 'center',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{ color: '#f59e0b', margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 'bold' }}>
              {halfDayCount}
            </h3>
            <p style={{ color: '#6c757d', margin: 0, fontSize: '0.9rem' }}>Half Day</p>
          </div>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
            textAlign: 'center',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{ color: '#ef4444', margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 'bold' }}>
              {absentCount}
            </h3>
            <p style={{ color: '#6c757d', margin: 0, fontSize: '0.9rem' }}>Absent</p>
          </div>
        </div>
      )}

      {/* Attendance Form */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2.5rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e9ecef'
      }}>
        <form onSubmit={handleSubmit}>
          {/* Date Selector */}
          <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
            <div style={{ flex: 1, maxWidth: '320px' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#1F7A8C',
                fontWeight: '600',
                fontSize: '0.95rem'
              }}>
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
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
            {loadingExisting && (
              <div style={{ color: '#6c757d', fontSize: '0.9rem', paddingBottom: '0.75rem' }}>
                Checking existing records...
              </div>
            )}
          </div>

          {/* Workers Grid */}
          {workers.length > 0 ? (
            <>
              <div className="grid grid-cols-3" style={{ gap: '1.25rem', marginBottom: '2rem' }}>
                {workers.map((worker, index) => {
                  const hasExisting = !!existingAttendances[worker.id];
                  return (
                    <div
                      key={worker.id}
                      style={{
                        background: '#f8f9fa',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        border: `2px solid ${getStatusColor(attendances[worker.id])}`,
                        transition: 'all 0.3s',
                        animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
                        position: 'relative'
                      }}
                    >
                      {hasExisting && (
                        <div style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          background: '#1F7A8C',
                          color: 'white',
                          fontSize: '0.65rem',
                          fontWeight: '700',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px',
                          textTransform: 'uppercase'
                        }}>
                          Saved
                        </div>
                      )}
                      {/* Worker Info */}
                      <div style={{ marginBottom: '1rem' }}>
                        <h3 style={{
                          margin: '0 0 0.5rem 0',
                          fontSize: '1.1rem',
                          color: '#1F7A8C',
                          fontWeight: '700'
                        }}>
                          {worker.name}
                        </h3>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '0.5rem',
                          color: '#6c757d', fontSize: '0.9rem', marginBottom: '0.25rem'
                        }}>
                          <span>💼</span><span>{worker.role}</span>
                        </div>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '0.5rem',
                          color: '#6c757d', fontSize: '0.9rem'
                        }}>
                          <span>💰</span><span>₹{worker.daily_wage}/day</span>
                        </div>
                      </div>

                      {/* Status Buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {(['present', 'half-day', 'absent'] as AttendanceStatus[]).map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setAttendances({ ...attendances, [worker.id]: status })}
                            style={{
                              padding: '0.75rem',
                              border: attendances[worker.id] === status ? 'none' : '2px solid #e9ecef',
                              borderRadius: '8px',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              background: attendances[worker.id] === status
                                ? `linear-gradient(135deg, ${getStatusColor(status)} 0%, ${getStatusColor(status)}dd 100%)`
                                : 'white',
                              color: attendances[worker.id] === status ? 'white' : '#6c757d',
                              boxShadow: attendances[worker.id] === status
                                ? `0 2px 8px ${getStatusColor(status)}40`
                                : 'none'
                            }}
                            onMouseEnter={(e) => {
                              if (attendances[worker.id] !== status) {
                                e.currentTarget.style.borderColor = getStatusColor(status);
                                e.currentTarget.style.transform = 'scale(1.02)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (attendances[worker.id] !== status) {
                                e.currentTarget.style.borderColor = '#e9ecef';
                                e.currentTarget.style.transform = 'scale(1)';
                              }
                            }}
                          >
                            {status === 'present' && '✓ Present (100%)'}
                            {status === 'half-day' && '◐ Half Day (50%)'}
                            {status === 'absent' && '✗ Absent (0%)'}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Submit Button */}
              <div style={{
                paddingTop: '1.5rem',
                borderTop: '2px solid #e9ecef',
                display: 'flex',
                gap: '1rem'
              }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    background: loading ? '#95a5a6' : isEditMode
                      ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
                      : 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)',
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
                >
                  {loading
                    ? (isEditMode ? 'Updating...' : 'Saving...')
                    : (isEditMode ? '✏️ Update Attendance' : 'Save Attendance')}
                </button>
              </div>
            </>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'white',
              borderRadius: '16px'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👷</div>
              <h3 style={{ color: '#1F7A8C', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
                No Active Workers
              </h3>
              <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
                No active workers found for this project
              </p>
            </div>
          )}
        </form>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AttendanceMarking;
