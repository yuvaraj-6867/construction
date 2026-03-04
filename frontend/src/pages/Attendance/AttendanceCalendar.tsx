import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const statusColor: Record<string, string> = {
  present: '#2E7D32',
  'half-day': '#F57C00',
  absent: '#C62828',
};

const statusBg: Record<string, string> = {
  present: '#E8F5E9',
  'half-day': '#FFF3E0',
  absent: '#FFEBEE',
};

const AttendanceCalendar: React.FC = () => {
  const navigate = useNavigate();
  const { id: workerId } = useParams();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [worker, setWorker] = useState<any>(null);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [workerId, year, month]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [workerRes, attRes] = await Promise.all([
        api.get(`/workers/${workerId}`),
        api.get('/attendances', {
          params: {
            worker_id: workerId,
            start_date: `${year}-${String(month).padStart(2, '0')}-01`,
            end_date: new Date(year, month, 0).toISOString().split('T')[0],
          },
        }),
      ]);
      setWorker(workerRes.data);
      const map: Record<string, string> = {};
      (attRes.data || []).forEach((a: any) => {
        map[a.date] = a.status;
      });
      setAttendanceMap(map);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }
    setMonth(m);
    setYear(y);
  };

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();

  const monthName = new Date(year, month - 1, 1).toLocaleString('en-IN', { month: 'long' });

  const summary = Object.values(attendanceMap).reduce(
    (acc, s) => {
      if (s === 'present') acc.present++;
      else if (s === 'half-day') acc.half++;
      else if (s === 'absent') acc.absent++;
      return acc;
    },
    { present: 0, half: 0, absent: 0 }
  );

  return (
    <div className="app">
      <nav style={{ background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)', color: 'white', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          ← Back
        </button>
        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
          📅 Attendance Calendar {worker ? `— ${worker.name}` : ''}
        </span>
      </nav>

      <div style={{ padding: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
        {/* Month navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <button onClick={() => changeMonth(-1)} style={{ background: '#f0f0f0', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '1.2rem' }}>‹</button>
          <h2 style={{ margin: 0, fontSize: '1.3rem' }}>{monthName} {year}</h2>
          <button onClick={() => changeMonth(1)} style={{ background: '#f0f0f0', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '1.2rem' }}>›</button>
        </div>

        {/* Summary */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Present', count: summary.present, color: '#2E7D32', bg: '#E8F5E9' },
            { label: 'Half Day', count: summary.half, color: '#F57C00', bg: '#FFF3E0' },
            { label: 'Absent', count: summary.absent, color: '#C62828', bg: '#FFEBEE' },
          ].map(({ label, count, color, bg }) => (
            <div key={label} style={{ flex: 1, textAlign: 'center', background: bg, borderRadius: '12px', padding: '0.75rem', border: `1px solid ${color}30` }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color }}>{count}</div>
              <div style={{ fontSize: '0.75rem', color: '#666' }}>{label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Loading...</div>
        ) : (
          <div className="card" style={{ padding: '1rem' }}>
            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#888', padding: '4px' }}>{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {/* Empty cells for first day offset */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const status = attendanceMap[dateStr];
                const isToday = dateStr === today.toISOString().split('T')[0];

                return (
                  <div
                    key={day}
                    style={{
                      textAlign: 'center',
                      padding: '6px 2px',
                      borderRadius: '8px',
                      background: status ? statusBg[status] : '#f8f8f8',
                      border: isToday ? '2px solid #1F7A8C' : '1px solid #eee',
                      fontSize: '0.8rem',
                      fontWeight: isToday ? 700 : 500,
                      color: status ? statusColor[status] : '#999',
                    }}
                  >
                    <div>{day}</div>
                    {status && (
                      <div style={{ fontSize: '0.6rem', marginTop: '2px' }}>
                        {status === 'present' ? 'P' : status === 'half-day' ? 'H' : 'A'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { label: 'Present (P)', color: '#2E7D32', bg: '#E8F5E9' },
                { label: 'Half Day (H)', color: '#F57C00', bg: '#FFF3E0' },
                { label: 'Absent (A)', color: '#C62828', bg: '#FFEBEE' },
                { label: 'No Record', color: '#999', bg: '#f8f8f8' },
              ].map(({ label, color, bg }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: bg, border: `1px solid ${color}50` }} />
                  <span style={{ color: '#666' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceCalendar;
