import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/global.css';

interface QuickUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

const roleColors: Record<string, string> = {
  admin: '#e74c3c',
  manager: '#e67e22',
  supervisor: '#2980b9',
  accountant: '#8e44ad',
};

const roleAbbr = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [quickUsers, setQuickUsers] = useState<QuickUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10}$/;

  const passwordRules = {
    length: (val: string) => val.length >= 8,
    uppercase: (val: string) => /[A-Z]/.test(val),
    number: (val: string) => /[0-9]/.test(val),
    special: (val: string) => /[^A-Za-z0-9]/.test(val),
  };

  const isEmailValid = emailRegex.test(email);
  const isPhoneValid = phoneRegex.test(email);
  const isEmailOrPhoneValid = isEmailValid || isPhoneValid;

  const isPasswordValid =
    passwordRules.length(password) &&
    passwordRules.uppercase(password) &&
    passwordRules.number(password) &&
    passwordRules.special(password);

  const isFormValid = isEmailOrPhoneValid && isPasswordValid;

  // Fetch users for quick login
  useEffect(() => {
    api.get('/auth/users_list')
      .then((r) => setQuickUsers(r.data.users || []))
      .catch(() => {});
  }, []);

  const handleQuickSelect = async (user: QuickUser) => {
    setSelectedUser(user.id);
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/quick_login', { user_id: user.id });
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/dashboard';
    } catch {
      setError('Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isEmailOrPhoneValid) {
      setError('Please enter a valid email or 10-digit phone number');
      return;
    }

    if (!isPasswordValid) {
      setError('Password does not meet requirements');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/dashboard';
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Invalid email or password');
      }
    } catch {
      setError('Backend connection error. Please ensure Rails server is running on port 3001');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1.5rem',
          gap: '1.5rem',
        }}
      >
        {/* Back to landing */}
        <button
          onClick={() => navigate('/')}
          style={{ position: 'fixed', top: '1rem', left: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#1F7A8C', fontWeight: 600, fontSize: '0.9rem' }}
        >
          ← Home
        </button>

        {/* LOGIN FORM CARD */}
        <div className="card" style={{ maxWidth: '450px', width: '100%' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            🏗️ Construction Management
          </h1>

          <form onSubmit={handleSubmit}>
            {/* EMAIL / PHONE */}
            <div className="form-group">
              <label className="label">Email or Phone</label>
              <input
                type="text"
                className="input"
                placeholder="Enter email or 10-digit phone number"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSelectedUser(null);
                }}
              />
              {email && !isEmailOrPhoneValid && (
                <small style={{ color: 'red', fontSize: '0.85rem' }}>
                  Please enter a valid email or 10-digit phone number
                </small>
              )}
            </div>

            {/* PASSWORD */}
            <div className="form-group">
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {password && !isPasswordValid && (
                <ul style={{ fontSize: '0.85rem', marginTop: '6px', paddingLeft: '18px' }}>
                  <li style={{ color: passwordRules.length(password) ? 'green' : 'red' }}>Minimum 8 characters</li>
                  <li style={{ color: passwordRules.uppercase(password) ? 'green' : 'red' }}>At least 1 uppercase letter</li>
                  <li style={{ color: passwordRules.number(password) ? 'green' : 'red' }}>At least 1 number</li>
                  <li style={{ color: passwordRules.special(password) ? 'green' : 'red' }}>At least 1 special character</li>
                </ul>
              )}
            </div>

            {error && (
              <small style={{ color: 'red', display: 'block', marginBottom: '1rem' }}>{error}</small>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!isFormValid || loading}
              style={{ width: '100%', opacity: isFormValid && !loading ? 1 : 0.6, cursor: isFormValid && !loading ? 'pointer' : 'not-allowed' }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              style={{ background: 'none', border: 'none', color: '#1F7A8C', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', textDecoration: 'underline' }}
            >
              Forgot Password?
            </button>
          </div>
        </div>

        {/* QUICK LOGIN SECTION - below form */}
        {quickUsers.length > 0 && (
          <div style={{ width: 'auto' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '0.6rem', textAlign: 'center' }}>
              Quick Demo Access
            </p>
            <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '0.5rem', justifyContent: 'center' }}>
              {quickUsers.map((user) => {
                const color = roleColors[user.role?.toLowerCase()] || '#1F7A8C';
                const isSelected = selectedUser === user.id;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleQuickSelect(user)}
                    style={{
                      background: color,
                      border: `2px solid ${isSelected ? '#fff' : color}`,
                      borderRadius: '20px',
                      padding: '0.45rem 0.85rem',
                      cursor: 'pointer',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      transition: 'all 0.18s',
                      outline: isSelected ? `3px solid ${color}` : 'none',
                      outlineOffset: '2px',
                      boxShadow: isSelected ? `0 0 0 3px rgba(255,255,255,0.4)` : `0 2px 6px ${color}55`,
                      opacity: 1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
