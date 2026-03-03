import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      const response = await fetch(
        'http://localhost:3001/api/v1/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      );

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
      setError(
        'Backend connection error. Please ensure Rails server is running on port 3001'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div
        className="container"
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
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
                onChange={(e) => setEmail(e.target.value)}
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
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {/* PASSWORD RULES (hide when all green) */}
              {password && !isPasswordValid && (
                <ul
                  style={{
                    fontSize: '0.85rem',
                    marginTop: '6px',
                    paddingLeft: '18px',
                  }}
                >
                  <li
                    style={{
                      color: passwordRules.length(password)
                        ? 'green'
                        : 'red',
                    }}
                  >
                    Minimum 8 characters
                  </li>
                  <li
                    style={{
                      color: passwordRules.uppercase(password)
                        ? 'green'
                        : 'red',
                    }}
                  >
                    At least 1 uppercase letter
                  </li>
                  <li
                    style={{
                      color: passwordRules.number(password)
                        ? 'green'
                        : 'red',
                    }}
                  >
                    At least 1 number
                  </li>
                  <li
                    style={{
                      color: passwordRules.special(password)
                        ? 'green'
                        : 'red',
                    }}
                  >
                    At least 1 special character
                  </li>
                </ul>
              )}
            </div>

            {/* BACKEND ERROR */}
            {error && (
              <small style={{ color: 'red', display: 'block', marginBottom: '1rem' }}>
                {error}
              </small>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!isFormValid || loading}
              style={{
                width: '100%',
                opacity: isFormValid && !loading ? 1 : 0.6,
                cursor: isFormValid && !loading ? 'pointer' : 'not-allowed',
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                style={{ background: 'none', border: 'none', color: '#1F7A8C', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', textDecoration: 'underline' }}
              >
                Forgot Password?
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;