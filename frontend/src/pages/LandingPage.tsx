import React from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  { icon: '📋', title: 'Project Management', desc: 'Track multiple construction projects with budgets, timelines, and status updates.' },
  { icon: '👷', title: 'Worker Management', desc: 'Manage workers, roles, daily wages, and contract details in one place.' },
  { icon: '✅', title: 'Attendance Tracking', desc: 'Mark daily attendance — present, half-day, or absent — with auto wage calculation.' },
  { icon: '💰', title: 'Payment Tracking', desc: 'Record and track all worker payments with receipts and payment history.' },
  { icon: '📊', title: 'Reports & Analytics', desc: 'Generate detailed reports on workers, projects, and financials with CSV export.' },
  { icon: '🔔', title: 'Notifications', desc: 'Real-time in-app notifications for payments, alerts, and important events.' },
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', color: '#fff', fontFamily: 'sans-serif' }}>
      {/* NAVBAR */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 2.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.4rem', fontWeight: 700 }}>
          <span>🏗️</span>
          <span>ConstructPro</span>
        </div>
        <button
          onClick={() => navigate('/login')}
          style={{ background: '#1F7A8C', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.4rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}
        >
          Login →
        </button>
      </nav>

      {/* HERO */}
      <section style={{ textAlign: 'center', padding: '5rem 2rem 3rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏗️</div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>
          Construction Management
          <br />
          <span style={{ color: '#4FC3F7' }}>Made Simple</span>
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.75)', maxWidth: '560px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          Track workers, attendance, payments, and project finances — all in one powerful platform built for the construction industry.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/login')}
            style={{ background: '#1F7A8C', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.85rem 2rem', fontWeight: 700, cursor: 'pointer', fontSize: '1rem', boxShadow: '0 4px 20px rgba(31,122,140,0.5)' }}
          >
            Get Started →
          </button>
          <button
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '10px', padding: '0.85rem 2rem', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}
          >
            Learn More
          </button>
        </div>
      </section>

      {/* STATS STRIP */}
      <section style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', padding: '2.5rem 2rem', background: 'rgba(255,255,255,0.05)', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {[['Track Projects', '📁'], ['Manage Workers', '👷'], ['Daily Attendance', '✅'], ['Payment History', '💳']].map(([label, icon]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem' }}>{icon}</div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.3rem' }}>{label}</div>
          </div>
        ))}
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: '4rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Everything You Need</h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: '3rem', fontSize: '1rem' }}>
          A complete toolkit for managing construction projects end-to-end.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.5rem' }}>
          {features.map(({ icon, title, desc }) => (
            <div key={title} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', padding: '1.75rem', transition: 'transform 0.2s', cursor: 'default' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>{icon}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(31,122,140,0.2)', borderTop: '1px solid rgba(31,122,140,0.3)', borderBottom: '1px solid rgba(31,122,140,0.3)' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>Ready to get started?</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem', fontSize: '1rem' }}>
          Log in to your account and start managing your projects today.
        </p>
        <button
          onClick={() => navigate('/login')}
          style={{ background: '#1F7A8C', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.9rem 2.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '1.05rem', boxShadow: '0 4px 20px rgba(31,122,140,0.5)' }}
        >
          Login to Dashboard →
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{ textAlign: 'center', padding: '1.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        🏗️ ConstructPro — Construction Management System
      </footer>
    </div>
  );
};

export default LandingPage;
