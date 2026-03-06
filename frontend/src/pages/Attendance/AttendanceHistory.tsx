import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import attendanceService from '../../services/attendanceService';
import workerService from '../../services/workerService';
import projectService from '../../services/projectService';

const AttendanceHistory: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();

  const workerId = params.workerId || searchParams.get('worker_id') || '';
  const projectId = params.id || searchParams.get('project_id') || '';

  const [attendances, setAttendances] = useState<any[]>([]);
  const [worker, setWorker] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getDefaultStartDate = () => {
    const d = new Date();
    d.setDate(1); // first of current month
    return d.toISOString().split('T')[0];
  };
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        if (workerId) {
          const w = await workerService.getById(workerId);
          setWorker(w);
        }
        if (projectId) {
          const p = await projectService.getById(projectId);
          setProject(p);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadMeta();
  }, [workerId, projectId]);

  useEffect(() => {
    loadAttendances();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workerId, projectId, startDate, endDate]);

  const loadAttendances = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (workerId) filters.worker_id = workerId;
      if (projectId) filters.project_id = projectId;
      if (startDate) filters.start_date = startDate;
      if (endDate) filters.end_date = endDate;
      const data = await attendanceService.getAll(filters);
      console.log('Attendance data received:', data);
      // Sort descending by date
      data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAttendances(data);
    } catch (error) {
      console.error('Failed to load attendance history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'present':
        return { bg: '#dcfce7', color: '#16a34a', label: '✓ Present' };
      case 'half-day':
        return { bg: '#fef9c3', color: '#ca8a04', label: '◐ Half Day' };
      case 'absent':
        return { bg: '#fee2e2', color: '#dc2626', label: '✗ Absent' };
      default:
        return { bg: '#f3f4f6', color: '#6b7280', label: status };
    }
  };

  const presentCount = attendances.filter(a => a.status === 'present').length;
  const halfDayCount = attendances.filter(a => a.status === 'half-day').length;
  const absentCount = attendances.filter(a => a.status === 'absent').length;
  const effectiveDays = presentCount + halfDayCount * 0.5;

  const backPath = workerId
    ? (projectId ? `/projects/${projectId}/workers/${workerId}` : `/workers/${workerId}`)
    : (projectId ? `/projects/${projectId}` : '/dashboard');

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '2rem 3rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1.5rem',
        background: 'white', padding: '1.5rem 2rem', borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem'
      }}>
        <button
          onClick={() => navigate(backPath)}
          style={{
            background: '#f8f9fa', color: '#1F7A8C', border: '2px solid #1F7A8C',
            padding: '0.75rem 1.5rem', fontWeight: '600', borderRadius: '10px',
            cursor: 'pointer', fontSize: '0.95rem'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#1F7A8C'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.color = '#1F7A8C'; }}
        >
          ← Back
        </button>
        <div>
          <h1 style={{
            margin: 0, fontSize: '2rem', fontWeight: 'bold',
            background: 'linear-gradient(135deg, #1F7A8C, #16616F)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            📅 Attendance History
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#6c757d' }}>
            {worker ? `Worker: ${worker.name}` : ''}
            {worker && project ? ' · ' : ''}
            {project ? `Project: ${project.name}` : ''}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: 'white', borderRadius: '16px', padding: '1.5rem 2rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)', marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#1F7A8C' }}>🔍 Filter by Date Range</h3>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem' }}>
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              style={{
                padding: '0.65rem 1rem', border: '2px solid #e9ecef', borderRadius: '8px',
                fontSize: '1rem', outline: 'none'
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#1F7A8C'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#e9ecef'; }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem' }}>
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              style={{
                padding: '0.65rem 1rem', border: '2px solid #e9ecef', borderRadius: '8px',
                fontSize: '1rem', outline: 'none'
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#1F7A8C'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#e9ecef'; }}
            />
          </div>
          <button
            onClick={() => {
              setStartDate(getDefaultStartDate());
              setEndDate(new Date().toISOString().split('T')[0]);
            }}
            style={{
              padding: '0.65rem 1.25rem', background: '#f8f9fa', border: '2px solid #e9ecef',
              borderRadius: '8px', cursor: 'pointer', color: '#6c757d', fontWeight: '600'
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Days', value: attendances.length, color: '#1F7A8C' },
          { label: 'Present', value: presentCount, color: '#22c55e' },
          { label: 'Half Day', value: halfDayCount, color: '#f59e0b' },
          { label: 'Absent', value: absentCount, color: '#ef4444' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'white', borderRadius: '12px', padding: '1.25rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.07)', textAlign: 'center',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
            <div style={{ color: '#6c757d', fontSize: '0.875rem', marginTop: '0.25rem' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Effective days info */}
      {worker && (
        <div style={{
          background: 'white', borderRadius: '12px', padding: '1rem 1.5rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.07)', marginBottom: '2rem',
          display: 'flex', gap: '2rem', flexWrap: 'wrap'
        }}>
          <span style={{ color: '#374151' }}>
            <strong style={{ color: '#1F7A8C' }}>Effective Days:</strong> {effectiveDays}
          </span>
          {worker.daily_wage && (
            <span style={{ color: '#374151' }}>
              <strong style={{ color: '#1F7A8C' }}>Estimated Wages:</strong>{' '}
              ₹{(effectiveDays * parseFloat(worker.daily_wage)).toLocaleString('en-IN')}
            </span>
          )}
          <span style={{ color: '#374151' }}>
            <strong style={{ color: '#1F7A8C' }}>Attendance Rate:</strong>{' '}
            {attendances.length > 0
              ? `${Math.round((effectiveDays / attendances.length) * 100)}%`
              : 'N/A'}
          </span>
        </div>
      )}

      {/* Attendance Table */}
      <div style={{
        background: 'white', borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#6c757d', fontSize: '1.1rem' }}>
            Loading attendance history...
          </div>
        ) : attendances.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
            <h3 style={{ color: '#1F7A8C', marginBottom: '0.5rem' }}>No Records Found</h3>
            <p style={{ color: '#6c757d' }}>No attendance records for the selected date range</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)', color: 'white' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.9rem' }}>DATE</th>
                  {!workerId && <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.9rem' }}>WORKER</th>}
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.9rem' }}>DAY</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', fontSize: '0.9rem' }}>STATUS</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', fontSize: '0.9rem' }}>WAGE EARNED</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.9rem' }}>NOTES</th>
                </tr>
              </thead>
              <tbody>
                {attendances.map((record, idx) => {
                  const st = getStatusStyle(record.status);
                  const d = new Date(record.date + 'T00:00:00');
                  const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' });
                  const wage = record.wage || 0;
                  return (
                    <tr
                      key={record.id}
                      style={{ borderBottom: '1px solid #e9ecef', background: idx % 2 === 0 ? 'white' : '#fafafa' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#f0f9ff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = idx % 2 === 0 ? 'white' : '#fafafa'; }}
                    >
                      <td style={{ padding: '0.875rem 1rem', fontWeight: '600', color: '#374151' }}>
                        {record.date ? new Date(record.date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                      </td>
                      {!workerId && (
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <span
                            onClick={() => record.worker_id && navigate(`/workers/${record.worker_id}`)}
                            style={{ color: '#1F7A8C', fontWeight: '500', cursor: record.worker_id ? 'pointer' : 'default' }}
                          >
                            {record.worker_name || (record.worker && record.worker.name) || `Worker #${record.worker_id || 'Unknown'}`}
                          </span>
                        </td>
                      )}
                      <td style={{ padding: '0.875rem 1rem', color: '#6c757d', fontSize: '0.9rem' }}>{dayName}</td>
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.3rem 0.85rem', borderRadius: '20px',
                          background: st.bg, color: st.color,
                          fontSize: '0.85rem', fontWeight: '600'
                        }}>
                          {st.label}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: '600', color: '#16a34a' }}>
                        ₹{parseFloat(wage).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: '#6c757d', fontSize: '0.875rem' }}>
                        {record.notes || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceHistory;
