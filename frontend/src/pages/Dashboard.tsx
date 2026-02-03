import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Loading from '../components/Loading';
import '../styles/global.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) {
    return <Loading message="Loading dashboard..." />;
  }

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
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-4" style={{ marginBottom: '2.5rem', gap: '1.5rem' }}>
          <div className="card" style={{
            textAlign: 'center',
            background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)',
            color: 'white',
            border: 'none',
            boxShadow: '0 8px 24px rgba(31, 122, 140, 0.2)',
            transform: 'translateY(0)',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(31, 122, 140, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(31, 122, 140, 0.2)';
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏗️</div>
            <h3 style={{ fontSize: '2.5rem', margin: '0', fontWeight: '700' }}>12</h3>
            <p style={{ opacity: 0.9, margin: '0.5rem 0 0 0', fontSize: '0.95rem' }}>{t('active_projects')}</p>
          </div>

          <div className="card" style={{
            textAlign: 'center',
            background: 'linear-gradient(135deg, #E36414 0%, #C7530C 100%)',
            color: 'white',
            border: 'none',
            boxShadow: '0 8px 24px rgba(227, 100, 20, 0.2)',
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
            <h3 style={{ fontSize: '2.5rem', margin: '0', fontWeight: '700' }}>45</h3>
            <p style={{ opacity: 0.9, margin: '0.5rem 0 0 0', fontSize: '0.95rem' }}>{t('total_workers')}</p>
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
            <h3 style={{ fontSize: '2.5rem', margin: '0', fontWeight: '700' }}>₹2.5L</h3>
            <p style={{ opacity: 0.9, margin: '0.5rem 0 0 0', fontSize: '0.95rem' }}>{t('monthly_expenses')}</p>
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
            <h3 style={{ fontSize: '2.5rem', margin: '0', fontWeight: '700' }}>₹1.2L</h3>
            <p style={{ opacity: 0.9, margin: '0.5rem 0 0 0', fontSize: '0.95rem' }}>{t('pending_payments')}</p>
          </div>
        </div>

        {/* Quick Actions */}
        {/* <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: 0 }}>{t('quick_actions')}</h2>
          <div className="grid grid-cols-4" style={{ gap: '1rem' }}>
            <button className="btn btn-primary" style={{ padding: '1rem' }} onClick={() => navigate('/projects/new')}>
              {t('new_project')}
            </button> */}
            {/* <button className="btn btn-secondary" style={{ padding: '1rem' }} onClick={() => navigate('/attendance')}>
              {t('mark_attendance')}
            </button>
            <button className="btn btn-success" style={{ padding: '1rem' }} onClick={() => navigate('/payments/new')}>
              {t('record_payment')}
            </button>
            <button className="btn" style={{ padding: '1rem', background: 'var(--warning-color)', color: 'white' }} onClick={() => navigate('/expenses/new')}>
              {t('add_expense')}
            </button> */}
          {/* </div>
        </div> */}

        {/* Module Links */}
        {/* <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: 0 }}>{t('modules')}</h2>
          <div className="grid grid-cols-4" style={{ gap: '1rem' }}>
            <button className="btn" style={{ padding: '1rem' }} onClick={() => navigate('/projects')}>
              {t('projects')}
            </button>
            <button className="btn" style={{ padding: '1rem' }} onClick={() => navigate('/workers')}>
              {t('workers')}
            </button>
            <button className="btn" style={{ padding: '1rem' }} onClick={() => navigate('/attendance')}>
              {t('attendance')}
            </button>
            <button className="btn" style={{ padding: '1rem' }} onClick={() => navigate('/payments')}>
              {t('payments')}
            </button>
            <button className="btn" style={{ padding: '1rem' }} onClick={() => navigate('/materials')}>
              {t('materials')}
            </button>
            <button className="btn" style={{ padding: '1rem' }} onClick={() => navigate('/expenses')}>
              {t('expenses')}
            </button>
            <button className="btn" style={{ padding: '1rem' }} onClick={() => navigate('/client-advances')}>
              {t('client_advances')}
            </button>
            <button className="btn" style={{ padding: '1rem' }} onClick={() => navigate('/invoices')}>
              {t('invoices')}
            </button>
            <button className="btn" style={{ padding: '1rem' }} onClick={() => navigate('/settings')}>
              {t('settings')}
            </button>
          </div>
        </div> */}

        {/* Recent Activity */}
        <div className="grid grid-cols-2" style={{ gap: '2rem' }}>
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
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '0.75rem',
                background: 'linear-gradient(135deg, rgba(31, 122, 140, 0.05) 0%, rgba(31, 122, 140, 0.02) 100%)',
                border: '1px solid rgba(31, 122, 140, 0.1)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(8px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(31, 122, 140, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <strong style={{ fontSize: '1.05rem', color: '#333' }}>Residential Complex - Anna Nagar</strong>
                <br/>
                <span style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem', display: 'inline-block' }}>
                  <span style={{ color: '#2E7D32', fontWeight: '600' }}>● In Progress</span> | Budget: ₹50L
                </span>
              </li>
              <li style={{
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '0.75rem',
                background: 'linear-gradient(135deg, rgba(227, 100, 20, 0.05) 0%, rgba(227, 100, 20, 0.02) 100%)',
                border: '1px solid rgba(227, 100, 20, 0.1)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(8px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(227, 100, 20, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <strong style={{ fontSize: '1.05rem', color: '#333' }}>Commercial Building - T.Nagar</strong>
                <br/>
                <span style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem', display: 'inline-block' }}>
                  <span style={{ color: '#E36414', fontWeight: '600' }}>● Planning</span> | Budget: ₹80L
                </span>
              </li>
              <li style={{
                padding: '1rem',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(46, 125, 50, 0.02) 100%)',
                border: '1px solid rgba(46, 125, 50, 0.1)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(8px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(46, 125, 50, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <strong style={{ fontSize: '1.05rem', color: '#333' }}>Villa Construction - ECR</strong>
                <br/>
                <span style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem', display: 'inline-block' }}>
                  <span style={{ color: '#2E7D32', fontWeight: '600' }}>● In Progress</span> | Budget: ₹35L
                </span>
              </li>
            </ul>
          </div>

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
              📊 {t('today_attendance')}
            </h3>
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{
                marginBottom: '2rem',
                padding: '1.25rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.08) 0%, rgba(46, 125, 50, 0.03) 100%)',
                border: '1px solid rgba(46, 125, 50, 0.15)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: '600', color: '#333' }}>✓ {t('present')}</span>
                  <strong style={{ color: '#2E7D32', fontSize: '1.25rem' }}>38/45</strong>
                </div>
                <div style={{
                  background: 'rgba(46, 125, 50, 0.15)',
                  height: '12px',
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: 'linear-gradient(90deg, #2E7D32 0%, #43A047 100%)',
                    height: '100%',
                    width: '84%',
                    transition: 'width 0.5s ease'
                  }}></div>
                </div>
              </div>
              <div style={{
                padding: '1.25rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(198, 40, 40, 0.08) 0%, rgba(198, 40, 40, 0.03) 100%)',
                border: '1px solid rgba(198, 40, 40, 0.15)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: '600', color: '#333' }}>✗ {t('absent')}</span>
                  <strong style={{ color: '#C62828', fontSize: '1.25rem' }}>7/45</strong>
                </div>
                <div style={{
                  background: 'rgba(198, 40, 40, 0.15)',
                  height: '12px',
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: 'linear-gradient(90deg, #C62828 0%, #E53935 100%)',
                    height: '100%',
                    width: '16%',
                    transition: 'width 0.5s ease'
                  }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
