import { formatDate } from '../../utils/formatDate';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams, useLocation } from 'react-router-dom';
import workerService from '../../services/workerService';
import attendanceService, { Attendance } from '../../services/attendanceService';
import api from '../../services/api';

type AttendanceStatus = 'present' | 'half-day' | 'absent';

interface AttendanceMarkingProps { embedded?: boolean; }

const AttendanceMarking: React.FC<AttendanceMarkingProps> = ({ embedded = false }) => {
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

  const [savingWorker, setSavingWorker] = useState<string | null>(null);

  // Sheet view state
  type SheetCell = { status: AttendanceStatus | null; existingId?: number; dirty: boolean };
  const today2 = new Date();
  const [sheetYear, setSheetYear] = useState(today2.getFullYear());
  const [sheetMonth, setSheetMonth] = useState(today2.getMonth() + 1);
  const [sheetData, setSheetData] = useState<Record<string, SheetCell>>({});
  const [savingSheet, setSavingSheet] = useState(false);

  useEffect(() => {
    if (projectId) loadSheetData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetYear, sheetMonth, projectId]);

  const loadSheetData = async () => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const startDate = `${sheetYear}-${pad(sheetMonth)}-01`;
    const endDate = new Date(sheetYear, sheetMonth, 0).toISOString().split('T')[0];
    try {
      const data = await attendanceService.getAll({ project_id: projectId, start_date: startDate, end_date: endDate });
      const map: Record<string, SheetCell> = {};
      data.forEach((a: any) => {
        map[`${a.worker_id}_${a.date}`] = { status: a.status as AttendanceStatus, existingId: a.id, dirty: false };
      });
      setSheetData(map);
    } catch (e) { console.error(e); }
  };

  const cycleCell = (workerId: number, dateStr: string) => {
    const key = `${workerId}_${dateStr}`;
    const current = sheetData[key]?.status ?? null;
    const next: AttendanceStatus | null =
      current === null ? 'present' : current === 'present' ? 'half-day' : current === 'half-day' ? 'absent' : null;
    setSheetData(prev => ({ ...prev, [key]: { ...(prev[key] || {}), status: next, dirty: true } }));
  };

  const changeSheetMonth = (delta: number) => {
    let m = sheetMonth + delta, y = sheetYear;
    if (m > 12) { m = 1; y++; } if (m < 1) { m = 12; y--; }
    setSheetMonth(m); setSheetYear(y);
  };

  const saveSheet = async () => {
    setSavingSheet(true);
    try {
      const dirty = Object.entries(sheetData).filter(([, c]) => c.dirty);
      await Promise.all(dirty.map(([key, cell]) => {
        const [workerIdStr, ...rest] = key.split('_');
        const dateStr = rest.join('_');
        if (cell.status === null && cell.existingId) {
          return api.delete(`/attendances/${cell.existingId}`);
        } else if (cell.status && cell.existingId) {
          return attendanceService.update(cell.existingId.toString(), { worker_id: parseInt(workerIdStr), project_id: projectId, date: dateStr, status: cell.status, notes: '' });
        } else if (cell.status) {
          return attendanceService.create({ worker_id: parseInt(workerIdStr), project_id: projectId, date: dateStr, status: cell.status, notes: '' });
        }
        return Promise.resolve();
      }));
      await loadSheetData();
    } catch { alert('Failed to save'); } finally { setSavingSheet(false); }
  };

  const handleSaveWorker = async (worker: any) => {
    setSavingWorker(worker.id);
    try {
      const existing = existingAttendances[worker.id];
      if (existing) {
        await attendanceService.update(existing.id.toString(), {
          worker_id: worker.id, project_id: projectId, date, status: attendances[worker.id], notes: existing.notes || ''
        });
      } else {
        await attendanceService.create({
          worker_id: worker.id, project_id: projectId, date, status: attendances[worker.id], notes: ''
        });
      }
      await loadExistingAttendance();
    } catch { alert('Failed to save attendance'); } finally { setSavingWorker(null); }
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

  const inner = (
    <>
      {/* Header Section */}
      {!embedded && <div style={{
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
      </div>}

      {/* Sheet View */}
      {(() => {
        const pad = (n: number) => String(n).padStart(2, '0');
        const daysInMonth = new Date(sheetYear, sheetMonth, 0).getDate();
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        const monthName = new Date(sheetYear, sheetMonth - 1, 1).toLocaleString('en-IN', { month: 'long' });
        const statusColor: Record<string, string> = { present: '#15803d', 'half-day': '#b45309', absent: '#dc2626' };
        const statusBg: Record<string, string> = { present: '#dcfce7', 'half-day': '#fef9c3', absent: '#fee2e2' };
        const dirtyCount = Object.values(sheetData).filter(c => c.dirty).length;
        return (
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', overflow: 'hidden', border: '1px solid #e9ecef' }}>
            {/* Sheet header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 1rem', borderBottom: '1px solid #e9ecef', background: '#f8f9fa', flexWrap: 'wrap' }}>
              <button onClick={() => changeSheetMonth(-1)} style={{ background: '#e9ecef', border: 'none', borderRadius: '6px', padding: '0.25rem 0.6rem', cursor: 'pointer', fontWeight: 700 }}>‹</button>
              <span style={{ fontWeight: '700', fontSize: '0.95rem', minWidth: '130px', textAlign: 'center' }}>{monthName} {sheetYear}</span>
              <button onClick={() => changeSheetMonth(1)} style={{ background: '#e9ecef', border: 'none', borderRadius: '6px', padding: '0.25rem 0.6rem', cursor: 'pointer', fontWeight: 700 }}>›</button>
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>Click cell: P → H → A → clear</span>
                {dirtyCount > 0 && (
                  <button onClick={saveSheet} disabled={savingSheet}
                    style={{ padding: '0.35rem 1rem', background: savingSheet ? '#93c5fd' : '#1F7A8C', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '0.82rem', cursor: savingSheet ? 'not-allowed' : 'pointer' }}>
                    {savingSheet ? 'Saving...' : `Save (${dirtyCount})`}
                  </button>
                )}
              </div>
            </div>
            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', fontSize: '0.75rem', minWidth: '100%' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)', color: 'white' }}>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: '700', position: 'sticky', left: 0, background: '#1F7A8C', zIndex: 2, minWidth: '120px' }}>WORKER</th>
                    {days.map(d => (
                      <th key={d} style={{ padding: '0.4rem', textAlign: 'center', fontWeight: '600', minWidth: '28px', borderLeft: '1px solid rgba(255,255,255,0.2)' }}>{d}</th>
                    ))}
                    <th style={{ padding: '0.4rem 0.6rem', textAlign: 'center', fontWeight: '600', borderLeft: '1px solid rgba(255,255,255,0.2)', minWidth: '80px' }}>SUMMARY</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map((worker, idx) => {
                    let wP = 0, wH = 0, wA = 0;
                    days.forEach(d => {
                      const s = sheetData[`${worker.id}_${sheetYear}-${pad(sheetMonth)}-${pad(d)}`]?.status;
                      if (s === 'present') wP++; else if (s === 'half-day') wH++; else if (s === 'absent') wA++;
                    });
                    return (
                      <tr key={worker.id} style={{ borderBottom: '1px solid #e9ecef', background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                        <td style={{ padding: '0.4rem 0.75rem', fontWeight: '600', color: '#1F7A8C', position: 'sticky', left: 0, background: idx % 2 === 0 ? 'white' : '#fafafa', zIndex: 1, borderRight: '2px solid #e9ecef', whiteSpace: 'nowrap' }}>
                          {worker.name}
                        </td>
                        {days.map(d => {
                          const dateStr = `${sheetYear}-${pad(sheetMonth)}-${pad(d)}`;
                          const cell = sheetData[`${worker.id}_${dateStr}`];
                          const status = cell?.status ?? null;
                          const isDirty = cell?.dirty ?? false;
                          return (
                            <td key={d} onClick={() => cycleCell(worker.id, dateStr)}
                              title={dateStr}
                              style={{
                                padding: '3px', textAlign: 'center', cursor: 'pointer',
                                background: status ? statusBg[status] : '#f8f8f8',
                                borderLeft: '1px solid #e9ecef',
                                outline: isDirty ? '2px solid #1F7A8C' : 'none',
                                outlineOffset: '-2px',
                              }}>
                              <span style={{ fontWeight: '700', color: status ? statusColor[status] : '#ccc', fontSize: '0.7rem' }}>
                                {status === 'present' ? 'P' : status === 'half-day' ? 'H' : status === 'absent' ? 'A' : '·'}
                              </span>
                            </td>
                          );
                        })}
                        <td style={{ padding: '0.3rem 0.5rem', textAlign: 'center', borderLeft: '2px solid #e9ecef', whiteSpace: 'nowrap', fontSize: '0.72rem' }}>
                          <span style={{ color: '#15803d', fontWeight: '700' }}>P{wP}</span>{' '}
                          <span style={{ color: '#b45309', fontWeight: '700' }}>H{wH}</span>{' '}
                          <span style={{ color: '#dc2626', fontWeight: '700' }}>A{wA}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Legend */}
            <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid #e9ecef', display: 'flex', gap: '1rem', fontSize: '0.72rem', color: '#666', background: '#fafafa' }}>
              {[['P', '#dcfce7', '#15803d', 'Present'], ['H', '#fef9c3', '#b45309', 'Half Day'], ['A', '#fee2e2', '#dc2626', 'Absent'], ['·', '#f8f8f8', '#ccc', 'No Record']].map(([sym, bg, col, label]) => (
                <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ background: bg as string, color: col as string, fontWeight: 700, padding: '1px 5px', borderRadius: '3px', border: '1px solid #e9ecef' }}>{sym}</span>
                  {label}
                </span>
              ))}
            </div>
          </div>
        );
      })()}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );

  if (embedded) return <div>{inner}</div>;
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%)', padding: '2rem 3rem 3rem 3rem' }}>
      {inner}
    </div>
  );
};

export default AttendanceMarking;
