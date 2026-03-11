import React, { useState } from 'react';
import AtonixDevLogo from '../components/AtonixDevLogo';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api, { setCsrfToken } from '../services/api';
import SearchableCountryDropdown from '../components/SearchableCountryDropdown';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    country: '',
    password: '',
    password_confirm: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const csrfResp = await api.get('/auth/csrf/');
      if (csrfResp?.data?.csrfToken) setCsrfToken(csrfResp.data.csrfToken);
      await api.post('/accounts/register/', {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        country: formData.country,
        password: formData.password,
      });

      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { state: { email: formData.email, from: location.state?.from } });
      }, 2000);
    } catch (err) {
      if (!err?.response) {
        setError('Cannot reach the API server. Please try again later.');
      } else if (err.response?.status === 429) {
        setError('Too many attempts. Please wait and try again.');
      } else {
        const data = err.response?.data;
        if (typeof data === 'string') {
          const trimmed = data.trim().toLowerCase();
          if (trimmed.startsWith('<!doctype html') || trimmed.startsWith('<html') || data.length > 300) {
            setError('Server error while creating account. Please try again later.');
          } else {
            setError(data);
          }
        } else if (data && typeof data === 'object') {
          const errorMessages = Object.entries(data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value[0] : value}`)
            .join(', ');
          setError(errorMessages || 'Failed to create account. Please try again.');
        } else {
          setError('Failed to create account. Please try again.');
        }
      }
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
    color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.08em',
    marginBottom: '6px',
  };

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>

        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <AtonixDevLogo size={32} variant="dark" textColor="#111827" />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            Create Account
          </h1>
          <p style={{ color: '#4B5563', fontSize: '14px' }}>Create an account to access exclusive platform features</p>
        </div>

        {/* Card */}
        <div style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', padding: '40px' }}>

          {error && (
            <div style={{ background: '#1a0000', border: '1px solid #660000', color: '#ff6666', padding: '12px 16px', marginBottom: '24px', fontSize: '13px' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ background: '#001a33', border: '1px solid #A81D37', color: '#66aaff', padding: '12px 16px', marginBottom: '24px', fontSize: '13px' }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
              <div>
                <label style={labelStyle}>First Name</label>
                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required placeholder="John" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required placeholder="Doe" style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Username</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} required placeholder="johndoe" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Country</label>
              <div style={{ border: '1px solid #D1D5DB', background: '#F1F3F5' }}>
                <SearchableCountryDropdown value={formData.country} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'} name="password"
                  value={formData.password} onChange={handleChange} required
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: '64px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
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
              <p style={{ fontSize: '11px', color: '#4B5563', marginTop: '4px' }}>Minimum 8 characters</p>
            </div>

            <div>
              <label style={labelStyle}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPasswordConfirm ? 'text' : 'password'} name="password_confirm"
                  value={formData.password_confirm} onChange={handleChange} required
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: '64px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(v => !v)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#A81D37', fontSize: '12px',
                    fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.05em',
                  }}
                  aria-label={showPasswordConfirm ? 'Hide password confirmation' : 'Show password confirmation'}
                >
                  {showPasswordConfirm ? 'HIDE' : 'SHOW'}
                </button>
              </div>
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div style={{ borderTop: '1px solid #E5E7EB', marginTop: '28px', paddingTop: '24px', textAlign: 'center' }}>
            <p style={{ color: '#4B5563', fontSize: '13px' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#A81D37', fontWeight: 700, textDecoration: 'none' }}>
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Tech tags */}
        <div style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', borderTop: 'none', padding: '20px 40px' }}>
          <p style={{ fontSize: '11px', color: '#4B5563', textAlign: 'center', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Open to all tech professionals
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
            {['Full Stack', 'DevOps', 'AI/ML', 'Cloud', 'Security', 'Systems'].map((tag) => (
              <span key={tag} style={{
                background: '#F1F3F5', border: '1px solid #E5E7EB',
                color: '#4B5563', fontSize: '11px', padding: '3px 10px',
                letterSpacing: '0.05em',
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
