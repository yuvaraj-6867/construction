import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api.post('/auth/forgot_password', { email });
      setMessage(res.data.message);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1F7A8C 0%, #0d4a57 100%)' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔑</div>
          <h2 style={{ margin: 0, color: '#1F7A8C', fontSize: '1.75rem', fontWeight: '700' }}>Forgot Password</h2>
          <p style={{ color: '#6c757d', marginTop: '0.5rem' }}>Enter your email to receive reset instructions</p>
        </div>

        {message && (
          <div style={{ background: '#e8f5e9', border: '1px solid #a5d6a7', color: '#2e7d32', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', textAlign: 'center' }}>
            ✅ {message}
          </div>
        )}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="Your email address"
            style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '1rem', border: '2px solid #e9ecef', borderRadius: '10px', outline: 'none', marginBottom: '1.25rem', boxSizing: 'border-box' }}
            onFocus={e => e.currentTarget.style.borderColor = '#1F7A8C'}
            onBlur={e => e.currentTarget.style.borderColor = '#e9ecef'}
          />
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '0.875rem', background: loading ? '#95a5a6' : 'linear-gradient(135deg, #1F7A8C, #16616F)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '1rem' }}>
            {loading ? 'Sending...' : '📧 Send Reset Link'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/reset-password')}
            style={{ background: 'none', border: 'none', color: '#1F7A8C', cursor: 'pointer', fontSize: '0.9rem', marginRight: '1rem' }}>
            Have a token? Reset now
          </button>
          <button onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.9rem' }}>
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
