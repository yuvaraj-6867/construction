import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset_password', { token, password, password_confirmation: passwordConfirmation });
      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.errors?.join(', ') || err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1F7A8C 0%, #0d4a57 100%)' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔐</div>
          <h2 style={{ margin: 0, color: '#1F7A8C', fontSize: '1.75rem', fontWeight: '700' }}>Reset Password</h2>
          <p style={{ color: '#6c757d', marginTop: '0.5rem', fontSize: '0.9rem' }}>Password must have uppercase, number & special char</p>
        </div>

        {success ? (
          <div style={{ background: '#e8f5e9', border: '1px solid #a5d6a7', color: '#2e7d32', padding: '1.5rem', borderRadius: '10px', textAlign: 'center' }}>
            ✅ Password reset successfully! Redirecting to login...
          </div>
        ) : (
          <>
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={token}
                onChange={e => setToken(e.target.value)}
                required
                placeholder="Reset token (from email)"
                style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '0.95rem', border: '2px solid #e9ecef', borderRadius: '10px', outline: 'none', marginBottom: '1rem', boxSizing: 'border-box' }}
                onFocus={e => e.currentTarget.style.borderColor = '#1F7A8C'}
                onBlur={e => e.currentTarget.style.borderColor = '#e9ecef'}
              />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="New password"
                style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '0.95rem', border: '2px solid #e9ecef', borderRadius: '10px', outline: 'none', marginBottom: '1rem', boxSizing: 'border-box' }}
                onFocus={e => e.currentTarget.style.borderColor = '#1F7A8C'}
                onBlur={e => e.currentTarget.style.borderColor = '#e9ecef'}
              />
              <input
                type="password"
                value={passwordConfirmation}
                onChange={e => setPasswordConfirmation(e.target.value)}
                required
                placeholder="Confirm new password"
                style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '0.95rem', border: '2px solid #e9ecef', borderRadius: '10px', outline: 'none', marginBottom: '1.25rem', boxSizing: 'border-box' }}
                onFocus={e => e.currentTarget.style.borderColor = '#1F7A8C'}
                onBlur={e => e.currentTarget.style.borderColor = '#e9ecef'}
              />
              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '0.875rem', background: loading ? '#95a5a6' : 'linear-gradient(135deg, #1F7A8C, #16616F)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '1rem' }}>
                {loading ? 'Resetting...' : '🔐 Reset Password'}
              </button>
            </form>
          </>
        )}

        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.9rem' }}>
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
