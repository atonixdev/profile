import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AtonixDevLogo from '../components/AtonixDevLogo';
import api, { setCsrfToken } from '../services/api';
import { inquiryService } from '../services';
import SearchableCountryDropdown from '../components/SearchableCountryDropdown';
import SOCIALS from '../constants/socials';

const Portal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useContext(AuthContext);

  // Card mode state
  const [cardMode, setCardMode] = useState('access'); // access, signin, signup, contact
  const [fadeOut, setFadeOut] = useState(false);

  // Sign-in form
  const [signInData, setSignInData] = useState({
    username: '',
    password: '',
    rememberMe: false,
    otp: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [signInError, setSignInError] = useState('');
  const [signInLoading, setSignInLoading] = useState(false);

  // Sign-up form
  const [signUpData, setSignUpData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    country: '',
    password: '',
    password_confirm: '',
  });
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpPasswordConfirm, setShowSignUpPasswordConfirm] = useState(false);
  const [signUpError, setSignUpError] = useState('');
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState('');

  // Contact form
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    inquiry_type: 'general',
    subject: '',
    message: '',
  });
  const [contactError, setContactError] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState('');

  const prefill = location.state?.email || '';

  useEffect(() => {
    if (prefill && !signInData.username) {
      setSignInData((prev) => ({ ...prev, username: prefill }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill]);

  // Card transition helper
  const switchCard = (newMode) => {
    setFadeOut(true);
    setTimeout(() => {
      setCardMode(newMode);
      setFadeOut(false);
    }, 100);
  };

  // ════════════════════════════  Sign In Handlers  ════════════════════════════

  const handleSignInChange = (e) => {
    const { name, type, checked, value } = e.target;
    setSignInData({ ...signInData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setSignInError('');

    if (!signInData.username || !signInData.password) {
      setSignInError('Please fill in all fields');
      return;
    }

    setSignInLoading(true);

    try {
      const result = await authLogin(signInData.username, signInData.password, signInData.otp || undefined);
      if (!result.success) {
        if (result.requiresOtp) setShowOtp(true);
        setSignInError(result.error || 'Login failed. Please try again.');
        setSignInLoading(false);
        return;
      }
      const redirectPath = location.state?.from || '/lab';
      navigate(redirectPath);
    } catch (err) {
      setSignInError('Login failed. Please try again.');
      setSignInLoading(false);
    }
  };

  // ════════════════════════════  Sign Up Handlers  ════════════════════════════

  const handleSignUpChange = (e) => {
    setSignUpData({ ...signUpData, [e.target.name]: e.target.value });
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setSignUpError('');
    setSignUpSuccess('');

    if (signUpData.password !== signUpData.password_confirm) {
      setSignUpError('Passwords do not match');
      return;
    }

    if (signUpData.password.length < 8) {
      setSignUpError('Password must be at least 8 characters long');
      return;
    }

    setSignUpLoading(true);

    try {
      const csrfResp = await api.get('/auth/csrf/');
      if (csrfResp?.data?.csrfToken) setCsrfToken(csrfResp.data.csrfToken);
      await api.post('/accounts/register/', {
        username: signUpData.username,
        email: signUpData.email,
        first_name: signUpData.first_name,
        last_name: signUpData.last_name,
        country: signUpData.country,
        password: signUpData.password,
      });

      setSignUpSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        setSignUpLoading(false);
        switchCard('signin');
        setSignInData((prev) => ({ ...prev, username: signUpData.email }));
      }, 1500);
    } catch (err) {
      if (!err?.response) {
        setSignUpError('Cannot reach the API server. Please try again later.');
      } else if (err.response?.status === 429) {
        setSignUpError('Too many attempts. Please wait and try again.');
      } else {
        const data = err.response?.data;
        if (typeof data === 'string') {
          const trimmed = data.trim().toLowerCase();
          if (trimmed.startsWith('<!doctype html') || trimmed.startsWith('<html')) {
            setSignUpError('Server error while creating account. Please try again later.');
          } else {
            setSignUpError(data);
          }
        } else if (data && typeof data === 'object') {
          const errorMessages = Object.entries(data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value[0] : value}`)
            .join(', ');
          setSignUpError(errorMessages || 'Failed to create account. Please try again.');
        }
      }
      setSignUpLoading(false);
    }
  };

  // ════════════════════════════  Contact Handlers  ════════════════════════════

  const handleContactChange = (e) => {
    setContactData({ ...contactData, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactError('');
    setContactSuccess('');

    if (!contactData.name || !contactData.email || !contactData.subject || !contactData.message) {
      setContactError('Please fill in all fields');
      return;
    }

    setContactLoading(true);

    try {
      const csrfResp = await api.get('/auth/csrf/');
      if (csrfResp?.data?.csrfToken) setCsrfToken(csrfResp.data.csrfToken);

      await inquiryService.create({
        inquirer_name: contactData.name,
        inquirer_email: contactData.email,
        inquiry_type: contactData.inquiry_type,
        subject: contactData.subject,
        message: contactData.message,
      });

      setContactSuccess('Message sent! We\'ll get back to you soon.');
      setTimeout(() => {
        setContactData({ name: '', email: '', inquiry_type: 'general', subject: '', message: '' });
        setContactLoading(false);
        switchCard('access');
      }, 2000);
    } catch (err) {
      setContactError(err?.response?.data?.detail || 'Failed to send inquiry. Please try again.');
      setContactLoading(false);
    }
  };


  // ════════════════════════════  Helper Styles  ════════════════════════════

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: '#F1F3F5', border: '1px solid #D1D5DB',
    color: '#111827', padding: '11px 13px',
    fontSize: '13px', fontFamily: 'inherit',
    outline: 'none', transition: 'border-color 0.15s',
  };

  const labelStyle = {
    display: 'block', fontSize: '10px', fontWeight: 700,
    color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em',
    marginBottom: '5px',
  };

  const buttonPrimary = {
    width: '100%', padding: '12px 0',
    background: '#A81D37', color: '#FFFFFF',
    border: 'none', fontSize: '12px', fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit',
    letterSpacing: '0.08em', textTransform: 'uppercase',
    transition: 'background 0.15s',
  };

  const buttonSecondary = {
    width: '100%', padding: '12px 0',
    background: 'transparent', color: '#111827',
    border: '1px solid #D1D5DB', fontSize: '12px', fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit',
    letterSpacing: '0.08em', textTransform: 'uppercase',
    transition: 'border-color 0.15s, background 0.15s',
  };

  const buttonGhost = {
    width: '100%', padding: '12px 0',
    background: 'transparent', color: '#6B7280',
    border: 'none', fontSize: '12px', fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit',
    letterSpacing: '0.06em',
    transition: 'color 0.15s',
  };

  // ════════════════════════════  Render Card  ════════════════════════════
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
      }}
    >
      <div
        style={{
          opacity: fadeOut ? 0 : 1,
          transition: 'opacity 0.15s ease-in-out',
          width: '100%',
          maxWidth: '360px',
        }}
      >
        {cardMode === 'access' && (
          /* ══ ACCESS CARD ══════════════════════════════════════════════ */
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '14px',
              padding: '32px 24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)',
            }}
          >
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <AtonixDevLogo size={28} variant="dark" textColor="#111827" />
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
              <button
                onClick={() => switchCard('signin')}
                style={buttonPrimary}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#7C1626')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#A81D37')}
              >
                Console
              </button>
              <button
                onClick={() => switchCard('signup')}
                style={buttonSecondary}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#A81D37')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#D1D5DB')}
              >
                Sign Up
              </button>
              <button
                onClick={() => switchCard('contact')}
                style={buttonGhost}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#374151')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
              >
                Contact
              </button>
            </div>

            {/* Social Media */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '16px',
                alignItems: 'center',
              }}
            >
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: social.color,
                    display: 'inline-flex',
                    alignItems: 'center',
                    transition: 'opacity 0.15s',
                    opacity: 0.7,
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
                  aria-label={social.label}
                >
                  <social.Icon />
                </a>
              ))}
            </div>
          </div>
        )}

        {cardMode === 'signin' && (
          /* ══ SIGN IN CARD ═════════════════════════════════════════════ */
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '14px',
              padding: '32px 24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)',
            }}
          >
            {/* Back button */}
            <button
              onClick={() => switchCard('access')}
              style={{
                background: 'none',
                border: 'none',
                color: '#6B7280',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                letterSpacing: '0.06em',
                marginBottom: '20px',
                padding: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
            >
              ← Back
            </button>

            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <AtonixDevLogo size={24} variant="dark" textColor="#111827" />
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#111827',
                marginBottom: '4px',
                textAlign: 'center',
              }}
            >
              Sign In
            </h1>
            <p
              style={{
                fontSize: '12px',
                color: '#6B7280',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              Welcome back to AtonixDev
            </p>

            {/* Error message */}
            {signInError && (
              <div
                style={{
                  background: '#fee',
                  border: '1px solid #fcc',
                  color: '#c33',
                  padding: '10px 12px',
                  marginBottom: '16px',
                  fontSize: '12px',
                  borderRadius: '4px',
                }}
              >
                {signInError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSignInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Username or Email</label>
                <input
                  type="text"
                  name="username"
                  value={signInData.username}
                  onChange={handleSignInChange}
                  disabled={signInLoading}
                  required
                  placeholder="Enter username or email"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={signInData.password}
                    onChange={handleSignInChange}
                    disabled={signInLoading}
                    required
                    placeholder="Enter password"
                    style={{ ...inputStyle, paddingRight: '52px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={signInLoading}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#A81D37',
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      padding: 0,
                    }}
                  >
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              {showOtp && (
                <div>
                  <label style={labelStyle}>One-Time Code</label>
                  <input
                    type="text"
                    name="otp"
                    value={signInData.otp}
                    onChange={handleSignInChange}
                    disabled={signInLoading}
                    placeholder="000000"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    style={inputStyle}
                  />
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={signInData.rememberMe}
                  onChange={handleSignInChange}
                  disabled={signInLoading}
                  style={{
                    width: '13px',
                    height: '13px',
                    accentColor: '#A81D37',
                    cursor: 'pointer',
                  }}
                />
                <label htmlFor="rememberMe" style={{ fontSize: '12px', color: '#6B7280', cursor: 'pointer' }}>
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                disabled={signInLoading}
                style={{
                  ...buttonPrimary,
                  marginTop: '8px',
                  background: signInLoading ? '#E5E7EB' : '#A81D37',
                  color: signInLoading ? '#9CA3AF' : '#FFFFFF',
                }}
                onMouseEnter={(e) => {
                  if (!signInLoading) e.currentTarget.style.background = '#7C1626';
                }}
                onMouseLeave={(e) => {
                  if (!signInLoading) e.currentTarget.style.background = '#A81D37';
                }}
              >
                {signInLoading ? 'Signing In…' : 'Sign In'}
              </button>
            </form>

            {/* Footer links */}
            <div style={{ marginTop: '16px', fontSize: '11px', color: '#9CA3AF', textAlign: 'center' }}>
              Don't have an account?{' '}
              <button
                onClick={() => switchCard('signup')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#A81D37',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 700,
                  fontSize: '11px',
                  padding: 0,
                  textDecoration: 'none',
                }}
              >
                Sign up
              </button>
            </div>
          </div>
        )}

        {cardMode === 'signup' && (
          /* ══ SIGN UP CARD ═════════════════════════════════════════════ */
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '14px',
              padding: '32px 24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Back button */}
            <button
              onClick={() => switchCard('access')}
              style={{
                background: 'none',
                border: 'none',
                color: '#6B7280',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                letterSpacing: '0.06em',
                marginBottom: '20px',
                padding: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
            >
              ← Back
            </button>

            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <AtonixDevLogo size={24} variant="dark" textColor="#111827" />
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#111827',
                marginBottom: '4px',
                textAlign: 'center',
              }}
            >
              Create Account
            </h1>
            <p
              style={{
                fontSize: '12px',
                color: '#6B7280',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              Join AtonixDev today
            </p>

            {/* Error/Success messages */}
            {signUpError && (
              <div
                style={{
                  background: '#fee',
                  border: '1px solid #fcc',
                  color: '#c33',
                  padding: '10px 12px',
                  marginBottom: '16px',
                  fontSize: '12px',
                  borderRadius: '4px',
                }}
              >
                {signUpError}
              </div>
            )}
            {signUpSuccess && (
              <div
                style={{
                  background: '#efe',
                  border: '1px solid #cfc',
                  color: '#3c3',
                  padding: '10px 12px',
                  marginBottom: '16px',
                  fontSize: '12px',
                  borderRadius: '4px',
                }}
              >
                {signUpSuccess}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSignUpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={signUpData.first_name}
                    onChange={handleSignUpChange}
                    disabled={signUpLoading}
                    placeholder="John"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={signUpData.last_name}
                    onChange={handleSignUpChange}
                    disabled={signUpLoading}
                    placeholder="Doe"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={signUpData.email}
                  onChange={handleSignUpChange}
                  disabled={signUpLoading}
                  required
                  placeholder="you@example.com"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Username</label>
                <input
                  type="text"
                  name="username"
                  value={signUpData.username}
                  onChange={handleSignUpChange}
                  disabled={signUpLoading}
                  required
                  placeholder="username"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Country</label>
                <SearchableCountryDropdown
                  value={signUpData.country}
                  onChange={(val) => setSignUpData({ ...signUpData, country: val })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    name="password"
                    value={signUpData.password}
                    onChange={handleSignUpChange}
                    disabled={signUpLoading}
                    required
                    placeholder="Min. 8 characters"
                    style={{ ...inputStyle, paddingRight: '52px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    disabled={signUpLoading}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#A81D37',
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      padding: 0,
                    }}
                  >
                    {showSignUpPassword ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showSignUpPasswordConfirm ? 'text' : 'password'}
                    name="password_confirm"
                    value={signUpData.password_confirm}
                    onChange={handleSignUpChange}
                    disabled={signUpLoading}
                    required
                    placeholder="Confirm password"
                    style={{ ...inputStyle, paddingRight: '52px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPasswordConfirm(!showSignUpPasswordConfirm)}
                    disabled={signUpLoading}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#A81D37',
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      padding: 0,
                    }}
                  >
                    {showSignUpPasswordConfirm ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={signUpLoading}
                style={{
                  ...buttonPrimary,
                  marginTop: '8px',
                  background: signUpLoading ? '#E5E7EB' : '#A81D37',
                  color: signUpLoading ? '#9CA3AF' : '#FFFFFF',
                }}
                onMouseEnter={(e) => {
                  if (!signUpLoading) e.currentTarget.style.background = '#7C1626';
                }}
                onMouseLeave={(e) => {
                  if (!signUpLoading) e.currentTarget.style.background = '#A81D37';
                }}
              >
                {signUpLoading ? 'Creating Account…' : 'Create Account'}
              </button>
            </form>

            {/* Footer */}
            <div style={{ marginTop: '12px', fontSize: '11px', color: '#9CA3AF', textAlign: 'center' }}>
              Already have an account?{' '}
              <button
                onClick={() => switchCard('signin')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#A81D37',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 700,
                  fontSize: '11px',
                  padding: 0,
                  textDecoration: 'none',
                }}
              >
                Sign in
              </button>
            </div>
          </div>
        )}

        {cardMode === 'contact' && (
          /* ══ CONTACT CARD ═════════════════════════════════════════════ */
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '14px',
              padding: '32px 24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)',
            }}
          >
            {/* Back button */}
            <button
              onClick={() => switchCard('access')}
              style={{
                background: 'none',
                border: 'none',
                color: '#6B7280',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                letterSpacing: '0.06em',
                marginBottom: '20px',
                padding: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
            >
              ← Back
            </button>

            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <AtonixDevLogo size={24} variant="dark" textColor="#111827" />
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#111827',
                marginBottom: '4px',
                textAlign: 'center',
              }}
            >
              Contact Us
            </h1>
            <p
              style={{
                fontSize: '12px',
                color: '#6B7280',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              Get in touch with our team
            </p>

            {/* Error/Success messages */}
            {contactError && (
              <div
                style={{
                  background: '#fee',
                  border: '1px solid #fcc',
                  color: '#c33',
                  padding: '10px 12px',
                  marginBottom: '16px',
                  fontSize: '12px',
                  borderRadius: '4px',
                }}
              >
                {contactError}
              </div>
            )}
            {contactSuccess && (
              <div
                style={{
                  background: '#efe',
                  border: '1px solid #cfc',
                  color: '#3c3',
                  padding: '10px 12px',
                  marginBottom: '16px',
                  fontSize: '12px',
                  borderRadius: '4px',
                }}
              >
                {contactSuccess}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={contactData.name}
                  onChange={handleContactChange}
                  disabled={contactLoading}
                  required
                  placeholder="Your name"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={contactData.email}
                  onChange={handleContactChange}
                  disabled={contactLoading}
                  required
                  placeholder="your@email.com"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Inquiry Type</label>
                <select
                  name="inquiry_type"
                  value={contactData.inquiry_type}
                  onChange={handleContactChange}
                  disabled={contactLoading}
                  style={inputStyle}
                >
                  <option value="general">General Inquiry</option>
                  <option value="sales">Sales</option>
                  <option value="support">Technical Support</option>
                  <option value="partnership">Partnership</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={contactData.subject}
                  onChange={handleContactChange}
                  disabled={contactLoading}
                  required
                  placeholder="What's this about?"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Message</label>
                <textarea
                  name="message"
                  value={contactData.message}
                  onChange={handleContactChange}
                  disabled={contactLoading}
                  required
                  placeholder="Tell us more..."
                  rows="4"
                  style={{
                    ...inputStyle,
                    resize: 'none',
                    fontFamily: 'inherit',
                    lineHeight: '1.5',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={contactLoading}
                style={{
                  ...buttonPrimary,
                  marginTop: '8px',
                  background: contactLoading ? '#E5E7EB' : '#A81D37',
                  color: contactLoading ? '#9CA3AF' : '#FFFFFF',
                }}
                onMouseEnter={(e) => {
                  if (!contactLoading) e.currentTarget.style.background = '#7C1626';
                }}
                onMouseLeave={(e) => {
                  if (!contactLoading) e.currentTarget.style.background = '#A81D37';
                }}
              >
                {contactLoading ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portal;
