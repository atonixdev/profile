import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AtonixDevLogo from '../components/AtonixDevLogo';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
    otp: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useContext(AuthContext);

  const prefill = location.state?.email || '';

  useEffect(() => {
    if (prefill && !formData.username) {
      setFormData((prev) => ({ ...prev, username: prefill }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill]);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const result = await authLogin(formData.username, formData.password, formData.otp || undefined);
      if (!result.success) {
        if (result.requiresOtp) setShowOtp(true);
        setError(result.error || 'Login failed. Please try again.');
        return;
      }
      const redirectPath = location.state?.from || '/lab';
      navigate(redirectPath);
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: '#F1F3F5', border: '1px solid #D1D5DB',
    color: '#111827', padding: '12px 14px',
    fontSize: '14px', fontFamily: 'inherit',
    outline: 'none', transition: 'border-color 0.15s',
  };

  const labelStyle = {
    display: 'block', fontSize: '12px', fontWeight: 600,
    color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em',
    marginBottom: '6px',
  };

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>

        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <AtonixDevLogo size={32} variant="dark" textColor="#111827" />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            Welcome Back
          </h1>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', padding: '40px' }}>

          {error && (
            <div style={{ background: '#1a0000', border: '1px solid #660000', color: '#ff6666', padding: '12px 16px', marginBottom: '24px', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Username or Email</label>
              <input
                type="text" name="username" value={formData.username}
                onChange={handleChange} disabled={loading} required
                placeholder="Enter your username or email"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'} name="password"
                  value={formData.password} onChange={handleChange}
                  disabled={loading} required
                  placeholder="Enter your password"
                  style={{ ...inputStyle, paddingRight: '64px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  disabled={loading}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#A81D37', fontSize: '12px',
                    fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.05em',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            {showOtp && (
              <div>
                <label style={labelStyle}>One-Time Code (OTP)</label>
                <input
                  type="text" name="otp" value={formData.otp} onChange={handleChange}
                  disabled={loading} placeholder="123456"
                  inputMode="numeric" autoComplete="one-time-code"
                  style={inputStyle}
                />
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox" id="rememberMe" name="rememberMe"
                checked={formData.rememberMe} onChange={handleChange}
                disabled={loading}
                style={{ width: '14px', height: '14px', accentColor: '#A81D37' }}
              />
              <label htmlFor="rememberMe" style={{ fontSize: '13px', color: '#6B7280', cursor: 'pointer' }}>
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '14px 24px', background: loading ? '#E5E7EB' : '#A81D37',
                color: '#111827', border: 'none', fontSize: '13px',
                fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                transition: 'background 0.15s', marginTop: '4px',
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #E5E7EB', margin: '28px 0', position: 'relative' }}>
            <span style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              background: '#F8F9FA', padding: '0 12px', color: '#6B7280', fontSize: '12px',
            }}>
              Don't have an account?
            </span>
          </div>

          <Link
            to="/register"
            style={{
              display: 'block', textAlign: 'center', padding: '12px 24px',
              background: 'transparent', color: '#111827',
              border: '1px solid #D1D5DB', fontSize: '13px',
              fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              textDecoration: 'none', transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#A81D37'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#D1D5DB'}
          >
            Create Account
          </Link>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#6B7280', marginTop: '20px' }}>
            By signing in, you agree to our{' '}
            <button style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', padding: 0 }}>
              Terms of Service
            </button>{' '}and{' '}
            <button style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', padding: 0 }}>
              Privacy Policy
            </button>
          </p>
        </div>

        {/* Help block */}
        <div style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', borderTop: 'none', padding: '24px 40px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Need help?</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'Reset your password' },
              { label: 'Contact support' },
              { label: 'Learn about the platform', href: '/about' },
            ].map((item, i) => (
              item.href
                ? <a key={i} href={item.href} style={{ color: '#6B7280', fontSize: '13px', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#A81D37'}
                    onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
                  >{item.label}</a>
                : <button key={i} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '13px', cursor: 'pointer', textAlign: 'left', padding: 0, fontFamily: 'inherit', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#A81D37'}
                    onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
                  >{item.label}</button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
