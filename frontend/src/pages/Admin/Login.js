import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AtonixDevLogo from '../../components/AtonixDevLogo';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(username, password, otp);

    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.error);
      if (result.requiresOtp) setShowOtp(true);
    }

    setLoading(false);
  };

  const inputStyle = {
    background: '#F1F3F5',
    border: '1px solid #D1D5DB',
    color: '#111827',
    padding: '14px 16px',
    fontSize: '15px',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    width: '100%',
    display: 'block',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: 700,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '8px',
  };

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '16px' }}>
            <AtonixDevLogo size={36} variant="dark" textColor="#111827" />
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#111827', margin: 0 }}>Admin Login</h1>
          <p style={{ color: '#6B7280', marginTop: '12px', fontSize: '14px' }}>Sign in to manage your content</p>
        </div>

        {error && (
          <div style={{ background: '#F1F3F5', border: '1px solid #CC0033', color: '#FF4444', padding: '14px 16px', marginBottom: '24px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <div style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', padding: '40px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="username" style={labelStyle}>Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="password" style={labelStyle}>Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={inputStyle}
              />
            </div>

            {showOtp && (
              <div style={{ marginBottom: '24px' }}>
                <label htmlFor="otp" style={labelStyle}>One-time Code (OTP)</label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  style={inputStyle}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: '#A81D37',
                color: '#111827',
                border: 'none',
                padding: '15px',
                fontSize: '13px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
