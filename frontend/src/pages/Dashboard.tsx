import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import Loading from '../components/Loading';
import NotificationBell from '../components/NotificationBell';
import { useToast } from '../components/Toast';
import api from '../services/api';
import '../styles/global.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface DashboardStats {
  projects: { total: number; active: number };
  workers: { total: number; active: number };
  payments: { total_wages_earned: number; total_paid: number; total_balance: number };
  today_attendance: { present: number; half_day: number; absent: number; total: number };
  recent_payments: {
    id: number;
    worker_name: string;
    project_name: string;
    amount: number;
    payment_type: string;
    date: string;
  }[];
  recent_projects: {
    id: number;
    name: string;
    status: string;
    budget: number;
    client_name: string;
    active_workers: number;
  }[];
}

const formatCurrency = (amount: number) => {
  const n = Number(amount) || 0;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toFixed(0)}`;
};

const statusColor: Record<string, string> = {
  'in-progress': '#2E7D32',
  'planning': '#E36414',
  'completed': '#1F7A8C',
  'on-hold': '#C62828',
};

const statusLabel: Record<string, string> = {
  'in-progress': 'In Progress',
  'planning': 'Planning',
  'completed': 'Completed',
  'on-hold': 'On Hold',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [sessionWarning, setSessionWarning] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    } else {
      navigate('/');
      return;
    }
    loadStats();
    checkSessionExpiry();
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  const checkSessionExpiry = () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp) {
        const expiresIn = payload.exp * 1000 - Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        if (expiresIn < fiveMinutes && expiresIn > 0) {
          setSessionWarning(true);
        }
        // Warn 5 minutes before expiry
        if (expiresIn > fiveMinutes) {
          setTimeout(() => setSessionWarning(true), expiresIn - fiveMinutes);
        }
      }
    } catch {}
  };

  const loadStats = useCallback(async (showLoader = false) => {
    if (showLoader) setRefreshing(true);
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
      if (showLoader) showToast('Dashboard refreshed', 'success');
    } catch (err: any) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user || loading) {
    return <Loading message="Loading dashboard..." />;
  }

  const attendanceTotal = stats?.today_attendance.total || 0;
  const presentCount = stats?.today_attendance.present || 0;
  const halfDayCount = stats?.today_attendance.half_day || 0;
  const absentCount = stats?.today_attendance.absent || 0;
  const presentPct = attendanceTotal > 0 ? Math.round((presentCount / attendanceTotal) * 100) : 0;
  const halfDayPct = attendanceTotal > 0 ? Math.round((halfDayCount / attendanceTotal) * 100) : 0;
  const absentPct = attendanceTotal > 0 ? Math.round((absentCount / attendanceTotal) * 100) : 0;

  return (
    <div className="app" style={{ background: '#f5f7fa', minHeight: '100vh' }}>
      {/* Top Navigation */}
      <nav style={{
        background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)',
        color: 'white',
        padding: '1.25rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
          <h1 style={{
            margin: 0,
            fontSize: '1.75rem',
            cursor: 'pointer',
            fontWeight: '700',
            letterSpacing: '-0.5px'
          }} onClick={() => navigate('/dashboard')}>
            🏗️ {t('dashboard')}
          </h1>
          <button
            onClick={() => navigate('/projects')}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              fontSize: '1rem',
              cursor: 'pointer',
              padding: '0.65rem 1.5rem',
              borderRadius: '8px',
              fontWeight: '500',
              transition: 'all 0.2s',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            📁 {t('projects')}
          </button>
          <button
            onClick={() => navigate('/reports')}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              fontSize: '1rem',
              cursor: 'pointer',
              padding: '0.65rem 1.5rem',
              borderRadius: '8px',
              fontWeight: '500',
              transition: 'all 0.2s',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            📊 Reports
          </button>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={() => loadStats(true)}
            disabled={refreshing}
            title="Refresh dashboard"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              animation: refreshing ? 'spin 1s linear infinite' : 'none'
            }}
          >
            🔄
          </button>
          <NotificationBell />
          <div style={{
            textAlign: 'right',
            background: 'rgba(255,255,255,0.1)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>{user.name}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.9, textTransform: 'capitalize' }}>{user.role}</div>
          </div>
          <button
            onClick={handleLogout}
            className="btn"
            style={{
              background: '#C62828',
              color: 'white',
              border: 'none',
              padding: '0.65rem 1.5rem',
              fontSize: '0.95rem',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(198, 40, 40, 0.3)'
            }}
          >
            🚪 {t('logout')}
          </button>
        </div>
      </nav>

      <div className="container" style={{ marginTop: '2.5rem', paddingBottom: '3rem' }}>

        {sessionWarning && (
          <div style={{
            background: '#fffbeb',
            border: '1px solid #fcd34d',
            color: '#92400e',
            padding: '0.875rem 1.5rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.95rem'
          }}>
            <span>⚠️ Your session will expire soon. Please save your work and re-login.</span>
            <button onClick={handleLogout} style={{
              background: '#f59e0b', color: 'white', border: 'none',
              padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600'
            }}>
              Re-login
            </button>
          </div>
        )}

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            color: '#991b1b',
            padding: '1rem 1.5rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            fontSize: '0.95rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-4" style={{ marginBottom: '2.5rem', gap: '1.5rem' }}>
          <div className="card" style={{
            textAlign: 'center',
            background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)',
            color: 'white',
            border: 'none',
            boxShadow: '0 8px 24px rgba(31, 122, 140, 0.2)',
            cursor: 'pointer',
            transform: 'translateY(0)',
            transition: 'all 0.3s'
          }}
          onClick={() => navigate('/projects')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(31, 122, 140, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(31, 122, 140, 0.2)';
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏗️</div>
            <h3 style={{ fontSize: '2.5rem', margin: '0', fontWeight: '700' }}>{stats?.projects.active ?? 0}</h3>
            <p style={{ opacity: 0.9, margin: '0.5rem 0 0 0', fontSize: '0.95rem' }}>{t('active_projects')}</p>
            <p style={{ opacity: 0.7, margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>Total: {stats?.projects.total ?? 0}</p>
          </div>

          <div className="card" style={{
            textAlign: 'center',
            background: 'linear-gradient(135deg, #E36414 0%, #C7530C 100%)',
            color: 'white',
            border: 'none',
            boxShadow: '0 8px 24px rgba(227, 100, 20, 0.2)',
            cursor: 'pointer',
            transform: 'translateY(0)',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(227, 100, 20, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(227, 100, 20, 0.2)';
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👷</div>
            <h3 style={{ fontSize: '2.5rem', margin: '0', fontWeight: '700' }}>{stats?.workers.active ?? 0}</h3>
            <p style={{ opacity: 0.9, margin: '0.5rem 0 0 0', fontSize: '0.95rem' }}>{t('total_workers')}</p>
            <p style={{ opacity: 0.7, margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>Total: {stats?.workers.total ?? 0}</p>
          </div>

          <div className="card" style={{
            textAlign: 'center',
            background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
            color: 'white',
            border: 'none',
            boxShadow: '0 8px 24px rgba(46, 125, 50, 0.2)',
            transform: 'translateY(0)',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(46, 125, 50, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(46, 125, 50, 0.2)';
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💰</div>
            <h3 style={{ fontSize: '2.5rem', margin: '0', fontWeight: '700' }}>{formatCurrency(stats?.payments.total_wages_earned ?? 0)}</h3>
            <p style={{ opacity: 0.9, margin: '0.5rem 0 0 0', fontSize: '0.95rem' }}>Total Payable</p>
            <p style={{ opacity: 0.7, margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>Paid: {formatCurrency(stats?.payments.total_paid ?? 0)}</p>
          </div>

          <div className="card" style={{
            textAlign: 'center',
            background: 'linear-gradient(135deg, #C62828 0%, #8E0000 100%)',
            color: 'white',
            border: 'none',
            boxShadow: '0 8px 24px rgba(198, 40, 40, 0.2)',
            transform: 'translateY(0)',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(198, 40, 40, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(198, 40, 40, 0.2)';
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⏰</div>
            <h3 style={{ fontSize: '2.5rem', margin: '0', fontWeight: '700' }}>{formatCurrency(stats?.payments.total_balance ?? 0)}</h3>
            <p style={{ opacity: 0.9, margin: '0.5rem 0 0 0', fontSize: '0.95rem' }}>{t('pending_payments')}</p>
            <p style={{ opacity: 0.7, margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>Balance due</p>
          </div>
        </div>

        {/* Quick Entry + Labor Cost Forecast */}
        <div className="grid grid-cols-2" style={{ gap: '2rem', marginBottom: '2rem' }}>
          {/* Quick Entry */}
          <div className="card" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.25rem', color: '#1F7A8C', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚡ Quick Entry
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(stats?.recent_projects || []).filter(p => p.status === 'in-progress' || p.status === 'planning').slice(0, 4).map(proj => (
                <div key={proj.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#333', fontSize: '0.95rem' }}>{proj.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#888' }}>{proj.active_workers} workers</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => navigate(`/projects/${proj.id}/attendance`)}
                      style={{ background: '#2E7D32', color: 'white', border: 'none', padding: '0.4rem 0.9rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600' }}>
                      ✓ Attendance
                    </button>
                    <button onClick={() => navigate(`/projects/${proj.id}/payments`)}
                      style={{ background: '#1F7A8C', color: 'white', border: 'none', padding: '0.4rem 0.9rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600' }}>
                      ₹ Pay
                    </button>
                  </div>
                </div>
              ))}
              {(stats?.recent_projects || []).filter(p => p.status === 'in-progress' || p.status === 'planning').length === 0 && (
                <p style={{ color: '#999', textAlign: 'center', padding: '1rem 0' }}>No active projects</p>
              )}
            </div>
          </div>

          {/* Labor Cost Forecast */}
          <div className="card" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.25rem', color: '#1F7A8C', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📈 Labor Cost Forecast
              <span style={{ fontSize: '0.8rem', color: '#999', fontWeight: 400 }}>— Next Month</span>
            </h3>
            {(() => {
              const activeWorkers = stats?.workers.active || 0;
              const totalWages = stats?.payments.total_wages_earned || 0;
              const totalPaid = stats?.payments.total_paid || 0;
              // Estimate avg daily wage from data: total wages / (active workers * ~22 days avg)
              const avgDailyWageEst = activeWorkers > 0 ? (totalWages / Math.max(activeWorkers * 22, 1)) : 0;
              // Next month working days (Mon-Sat = 26 days)
              const nextMonth = new Date();
              nextMonth.setMonth(nextMonth.getMonth() + 1);
              const daysInNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
              const workingDays = Math.round(daysInNextMonth * (26 / 30));
              const forecastAmount = avgDailyWageEst * activeWorkers * workingDays;
              const balance = totalWages - totalPaid;
              return (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ background: '#f0f9ff', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1F7A8C' }}>{formatCurrency(forecastAmount)}</div>
                      <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>Est. Next Month Cost</div>
                    </div>
                    <div style={{ background: '#fff7ed', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#E36414' }}>{formatCurrency(balance)}</div>
                      <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>Current Balance Due</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#666' }}>
                      <span>Active Workers</span><span style={{ fontWeight: '600', color: '#333' }}>{activeWorkers}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#666' }}>
                      <span>Working Days (est.)</span><span style={{ fontWeight: '600', color: '#333' }}>{workingDays} days</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#666' }}>
                      <span>Avg Daily Wage (est.)</span><span style={{ fontWeight: '600', color: '#333' }}>{formatCurrency(avgDailyWageEst)}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Bottom section */}
        <div className="grid grid-cols-2" style={{ gap: '2rem' }}>
          {/* Recent Projects */}
          <div className="card" style={{
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}>
            <h3 style={{
              margin: '0 0 1.5rem 0',
              fontSize: '1.25rem',
              color: '#1F7A8C',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📋 {t('recent_projects')}
            </h3>
            {stats?.recent_projects.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center', padding: '2rem 0' }}>No projects yet</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {stats?.recent_projects.map((proj) => (
                  <li
                    key={proj.id}
                    onClick={() => navigate(`/projects/${proj.id}`)}
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      marginBottom: '0.75rem',
                      background: 'rgba(31, 122, 140, 0.04)',
                      border: '1px solid rgba(31, 122, 140, 0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(8px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(31, 122, 140, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <strong style={{ fontSize: '1.05rem', color: '#333' }}>{proj.name}</strong>
                    <br />
                    <span style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem', display: 'inline-block' }}>
                      <span style={{ color: statusColor[proj.status] || '#666', fontWeight: '600' }}>
                        ● {statusLabel[proj.status] || proj.status}
                      </span>
                      {' | '}Budget: {formatCurrency(proj.budget)}
                      {' | '}👷 {proj.active_workers}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right column: Attendance + Payments */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Today Attendance */}
            <div className="card" style={{
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <h3 style={{
                margin: '0 0 1.25rem 0',
                fontSize: '1.25rem',
                color: '#1F7A8C',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                📊 {t('today_attendance')}
                <span style={{ fontSize: '0.85rem', color: '#999', fontWeight: 400 }}>
                  — {attendanceTotal} marked
                </span>
              </h3>
              {attendanceTotal === 0 ? (
                <p style={{ color: '#999', textAlign: 'center', padding: '1rem 0', fontSize: '0.95rem' }}>
                  No attendance marked today
                </p>
              ) : (
                <div>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: `Present (${presentCount})`, value: presentCount },
                          ...(halfDayCount > 0 ? [{ name: `Half Day (${halfDayCount})`, value: halfDayCount }] : []),
                          ...(absentCount > 0 ? [{ name: `Absent (${absentCount})`, value: absentCount }] : []),
                        ]}
                        cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                        paddingAngle={3} dataKey="value"
                      >
                        <Cell fill="#2E7D32" />
                        <Cell fill="#E36414" />
                        <Cell fill="#C62828" />
                      </Pie>
                      <Tooltip formatter={(v: any) => [`${v} workers`, '']} />
                      <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: '0.82rem' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.5rem' }}>
                    <span style={{ fontWeight: '700', color: '#2E7D32', fontSize: '0.9rem' }}>{presentPct}% Present</span>
                    {halfDayCount > 0 && <span style={{ fontWeight: '700', color: '#E36414', fontSize: '0.9rem' }}>{halfDayPct}% Half</span>}
                    {absentCount > 0 && <span style={{ fontWeight: '700', color: '#C62828', fontSize: '0.9rem' }}>{absentPct}% Absent</span>}
                  </div>
                </div>
              )}
            </div>

            {/* Recent Payments */}
            <div className="card" style={{
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <h3 style={{
                margin: '0 0 1.25rem 0',
                fontSize: '1.25rem',
                color: '#1F7A8C',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                💳 Recent Payments
              </h3>
              {stats?.recent_payments.length === 0 ? (
                <p style={{ color: '#999', textAlign: 'center', padding: '1rem 0', fontSize: '0.95rem' }}>No payments yet</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {stats?.recent_payments.map((pay) => (
                    <li key={pay.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 0',
                      borderBottom: '1px solid #f0f0f0'
                    }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.95rem', color: '#333' }}>{pay.worker_name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#999' }}>{pay.project_name} · {pay.date}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '700', color: '#2E7D32' }}>{formatCurrency(pay.amount)}</div>
                        <div style={{
                          fontSize: '0.75rem',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          background: pay.payment_type === 'advance' ? '#fff3cd' : '#d4edda',
                          color: pay.payment_type === 'advance' ? '#856404' : '#155724'
                        }}>
                          {pay.payment_type}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
