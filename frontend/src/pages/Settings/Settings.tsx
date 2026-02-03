import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const Settings: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [saved, setSaved] = useState(false);

  const handleLanguageChange = (newLang: 'en' | 'ta') => {
    setLanguage(newLang);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>{t('settings')}</h1>
      </div>

      <div className="card">
        <h2>{t('language_settings')}</h2>
        <p className="text-gray" style={{ marginBottom: '2rem' }}>
          {t('select_language')}
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            className={`btn ${language === 'en' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleLanguageChange('en')}
            style={{ minWidth: '150px', padding: '1rem' }}
          >
            <div style={{ fontSize: '2rem' }}>🇬🇧</div>
            <div style={{ marginTop: '0.5rem' }}>{t('english')}</div>
            {language === 'en' && <div style={{ marginTop: '0.25rem', fontSize: '0.875rem' }}>✓ Active</div>}
          </button>

          <button
            className={`btn ${language === 'ta' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleLanguageChange('ta')}
            style={{ minWidth: '150px', padding: '1rem' }}
          >
            <div style={{ fontSize: '2rem' }}>🇮🇳</div>
            <div style={{ marginTop: '0.5rem' }}>{t('tamil')}</div>
            {language === 'ta' && <div style={{ marginTop: '0.25rem', fontSize: '0.875rem' }}>✓ செயலில்</div>}
          </button>
        </div>

        {saved && (
          <div className="alert alert-success" style={{ marginTop: '2rem' }}>
            {t('language_changed')}
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2>{language === 'en' ? 'Preview' : 'முன்னோட்டம்'}</h2>
        <div style={{ padding: '1rem', background: 'var(--background-color)', borderRadius: '8px' }}>
          <h3>{t('dashboard')}</h3>
          <p>{t('active_projects')}: 12</p>
          <p>{t('total_workers')}: 45</p>
          <div style={{ marginTop: '1rem' }}>
            <button className="btn btn-primary">{t('new_project')}</button>
            <button className="btn btn-secondary" style={{ marginLeft: '0.5rem' }}>{t('mark_attendance')}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
