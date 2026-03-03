import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [saved, setSaved] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    const theme = darkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [darkMode]);

  // Apply saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const handleLanguageChange = (newLang: 'en' | 'ta') => {
    setLanguage(newLang);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '2rem 3rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1.5rem',
        background: 'white', padding: '1.5rem 2rem', borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem'
      }}>
        <button onClick={() => navigate('/dashboard')}
          style={{ background: '#f8f9fa', color: '#1F7A8C', border: '2px solid #1F7A8C', padding: '0.65rem 1.25rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>
          ← Back
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', background: 'linear-gradient(135deg, #1F7A8C, #16616F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' }}>
            ⚙️ {t('settings')}
          </h1>
          <p style={{ margin: 0, color: '#6c757d' }}>Customize your app preferences</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '700px' }}>

        {/* Dark Mode */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem 2rem', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#1F7A8C' }}>🌙 Appearance</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: '600', color: '#333' }}>Dark Mode</div>
              <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>Switch between light and dark theme</div>
            </div>
            <button
              onClick={() => setDarkMode(d => !d)}
              style={{
                width: '56px', height: '30px', borderRadius: '15px', border: 'none', cursor: 'pointer',
                background: darkMode ? '#1F7A8C' : '#e9ecef', position: 'relative', transition: 'background 0.3s'
              }}
            >
              <div style={{
                position: 'absolute', top: '3px',
                left: darkMode ? '29px' : '3px',
                width: '24px', height: '24px', borderRadius: '50%',
                background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                transition: 'left 0.3s'
              }} />
            </button>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#999' }}>
            Current theme: <strong>{darkMode ? '🌙 Dark' : '☀️ Light'}</strong>
          </div>
        </div>

        {/* Language */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem 2rem', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#1F7A8C' }}>🌐 {t('language_settings')}</h3>
          <p style={{ color: '#6c757d', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{t('select_language')}</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {[
              { lang: 'en', flag: '🇬🇧', label: 'English', active: 'Active' },
              { lang: 'ta', flag: '🇮🇳', label: 'தமிழ்', active: '✓ செயலில்' }
            ].map(({ lang, flag, label, active }) => (
              <button key={lang}
                onClick={() => handleLanguageChange(lang as 'en' | 'ta')}
                style={{
                  minWidth: '150px', padding: '1rem', borderRadius: '12px', cursor: 'pointer',
                  border: language === lang ? '2px solid #1F7A8C' : '2px solid #e9ecef',
                  background: language === lang ? 'linear-gradient(135deg, rgba(31,122,140,0.1), rgba(22,97,111,0.05))' : 'white',
                  color: language === lang ? '#1F7A8C' : '#666', fontWeight: '600', transition: 'all 0.2s'
                }}>
                <div style={{ fontSize: '2rem' }}>{flag}</div>
                <div style={{ marginTop: '0.5rem' }}>{label}</div>
                {language === lang && <div style={{ marginTop: '0.25rem', fontSize: '0.8rem' }}>✓ {active}</div>}
              </button>
            ))}
          </div>
          {saved && (
            <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#e8f5e9', color: '#2e7d32', borderRadius: '8px', fontSize: '0.9rem' }}>
              ✅ {t('language_changed')}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem 2rem', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#1F7A8C' }}>🔗 Quick Links</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { icon: '📊', label: 'Reports & Export', path: '/reports', desc: 'Worker & project reports, CSV export' },
              { icon: '📁', label: 'All Projects', path: '/projects', desc: 'Manage all construction projects' },
              { icon: '🔑', label: 'Change Password', path: '/forgot-password', desc: 'Request password reset via email' },
            ].map(item => (
              <button key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem',
                  background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '10px',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#e8f4f8'; e.currentTarget.style.borderColor = '#1F7A8C'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.borderColor = '#e9ecef'; }}
              >
                <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                <div>
                  <div style={{ fontWeight: '600', color: '#333' }}>{item.label}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>{item.desc}</div>
                </div>
                <span style={{ marginLeft: 'auto', color: '#aaa' }}>→</span>
              </button>
            ))}
          </div>
        </div>

        {/* App Info */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem 2rem', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#1F7A8C' }}>ℹ️ App Info</h3>
          <div style={{ color: '#666', fontSize: '0.9rem', lineHeight: '2' }}>
            <div>🏗️ <strong>Construction Worker Attendance & Payment App</strong></div>
            <div>📌 Version: 1.0.0</div>
            <div>🛠️ Stack: React + TypeScript + Ruby on Rails</div>
            <div>🗄️ Database: PostgreSQL</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
