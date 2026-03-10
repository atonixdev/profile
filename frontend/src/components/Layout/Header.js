import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AtonixDevLogo from '../AtonixDevLogo';
import AtonixDevLogoIcon from '../AtonixDevLogoIcon';
import SOCIALS from '../../constants/socials';

// GS-WSF §3 — Global Header — two-tier: brand/auth bar + nav bar
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const portalRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!isPortalOpen) return;
    const handleMouseDown = (e) => {
      if (portalRef.current && !portalRef.current.contains(e.target)) {
        setIsPortalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isPortalOpen]);

  const navigation = [
    { name: 'Software',       path: '/software' },
    { name: 'Infrastructure', path: '/infrastructure' },
    { name: 'Solutions',      path: '/solutions' },
    { name: 'Industries',     path: '/industries' },
    { name: 'Networking',     path: '/platform/networking' },
    { name: 'Security',       path: '/platform/security' },
    { name: 'Community',      path: '/community' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, width: '100%' }}>

      {/* ══ TOP BAR — Logo + Auth ══════════════════════════════ */}
      <div
        style={{
          height: 52,
          background: '#000000',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <div
          style={{
            maxWidth: 1440, margin: '0 auto', padding: '0 24px',
            height: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo + wordmark */}
          <Link
            to="/"
            style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flexShrink: 0 }}
          >
            <AtonixDevLogoIcon size={42} variant="dark" showBg={false} />
            <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 1, userSelect: 'none', lineHeight: 1 }}>
              <span style={{ fontFamily: "'IBM Plex Sans', 'Inter', system-ui, sans-serif", fontWeight: 700, fontSize: 20, color: '#FFFFFF', letterSpacing: '-0.02em' }}>Atonix</span>
              <span style={{ fontFamily: "'IBM Plex Sans', 'Inter', system-ui, sans-serif", fontWeight: 700, fontSize: 20, color: '#A81D37', letterSpacing: '-0.02em' }}>Dev</span>
            </span>
          </Link>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center" style={{ gap: 12 }}>
            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    color: '#FFFFFF', padding: '4px',
                    fontFamily: 'inherit', fontWeight: 700,
                    fontSize: 11, letterSpacing: '0.08em',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    width: 36, height: 36,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', flexShrink: 0,
                  }}
                  title={user.user?.first_name || user.username || 'Account'}
                  aria-label="User menu"
                >
                  {user.oauth_avatar ? (
                    <img
                      src={user.oauth_avatar}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                    />
                  ) : (
                    <span style={{ fontSize: 14, fontWeight: 700, lineHeight: 1, userSelect: 'none' }}>
                      {(user.user?.first_name || user.username || 'A')[0].toUpperCase()}
                    </span>
                  )}
                </button>
                {isUserMenuOpen && (
                  <div
                    style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 4px)',
                      background: '#2C2C2C', border: '1px solid rgba(255,255,255,0.1)',
                      minWidth: 220, zIndex: 300,
                    }}
                  >
                    <div
                      style={{
                        padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)',
                        fontSize: 12, color: '#9CA3AF',
                      }}
                    >
                      {user.user?.email || user.email || ''}
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsUserMenuOpen(false)}
                      style={{
                        display: 'block', padding: '12px 16px',
                        color: '#FFFFFF', textDecoration: 'none',
                        fontSize: 12, fontWeight: 600,
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      style={{
                        display: 'block', padding: '12px 16px',
                        color: '#FFFFFF', textDecoration: 'none',
                        fontSize: 12, fontWeight: 600,
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '12px 16px', background: 'none', border: 'none',
                        color: '#FFFFFF', fontFamily: 'inherit', fontWeight: 600,
                        fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div ref={portalRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setIsPortalOpen((v) => !v)}
                  style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '6px 18px', background: '#A81D37',
                    color: '#FFFFFF', fontSize: 11, fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#7C1626'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#A81D37'; }}
                >
                  Portal
                </button>

                {isPortalOpen && (
                  <div
                    style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                      background: '#FFFFFF', border: '1px solid #E5E7EB',
                      borderRadius: 14, padding: '24px 20px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.16)', zIndex: 300,
                      width: 264,
                    }}
                  >
                    {/* Logo */}
                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                      <AtonixDevLogo size={24} variant="dark" textColor="#111827" />
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                      <button
                        onClick={() => { setIsPortalOpen(false); navigate('/login', { state: { mode: 'signin' } }); }}
                        style={{
                          width: '100%', padding: '11px 0',
                          background: '#A81D37', color: '#FFFFFF',
                          border: 'none', fontSize: 11, fontWeight: 700,
                          cursor: 'pointer', fontFamily: 'inherit',
                          letterSpacing: '0.08em', textTransform: 'uppercase',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#7C1626'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#A81D37'; }}
                      >
                        Console
                      </button>
                      <button
                        onClick={() => { setIsPortalOpen(false); navigate('/login', { state: { mode: 'signup' } }); }}
                        style={{
                          width: '100%', padding: '11px 0',
                          background: 'transparent', color: '#111827',
                          border: '1px solid #D1D5DB', fontSize: 11, fontWeight: 700,
                          cursor: 'pointer', fontFamily: 'inherit',
                          letterSpacing: '0.08em', textTransform: 'uppercase',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#A81D37'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; }}
                      >
                        Sign Up
                      </button>
                      <button
                        onClick={() => { setIsPortalOpen(false); navigate('/login', { state: { mode: 'contact' } }); }}
                        style={{
                          width: '100%', padding: '11px 0',
                          background: 'transparent', color: '#6B7280',
                          border: 'none', fontSize: 11, fontWeight: 600,
                          cursor: 'pointer', fontFamily: 'inherit',
                          letterSpacing: '0.06em',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#374151'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7280'; }}
                      >
                        Contact
                      </button>
                    </div>

                    {/* Social icons */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 14, alignItems: 'center' }}>
                      {SOCIALS.map((s) => (
                        <a
                          key={s.label}
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={s.label}
                          style={{
                            color: s.color,
                            display: 'inline-flex', alignItems: 'center',
                            opacity: 0.65, transition: 'opacity 0.15s', textDecoration: 'none',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.65'; }}
                        >
                          <s.Icon />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 8, flexDirection: 'column', gap: 5,
            }}
            aria-label="Toggle navigation"
          >
            <span style={{ display: 'block', width: 22, height: 2, background: '#FFFFFF', transition: 'opacity 0.15s' }} />
            <span style={{ display: 'block', width: 22, height: 2, background: '#FFFFFF', opacity: isMenuOpen ? 0 : 1, transition: 'opacity 0.15s' }} />
            <span style={{ display: 'block', width: 22, height: 2, background: '#FFFFFF', transition: 'opacity 0.15s' }} />
          </button>
        </div>
      </div>

      {/* ══ NAV BAR — Page links ═══════════════════════════════ */}
      <div
        style={{
          height: 48,
          background: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <nav
          style={{
            maxWidth: 1440, margin: '0 auto', padding: '0 24px',
            height: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Desktop links */}
          <div className="hidden md:flex items-center" style={{ gap: 28 }}>
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`nav-link${isActive(item.path) ? ' nav-active' : ''}`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* ══ Mobile Drawer ══════════════════════════════════════ */}
      {isMenuOpen && (
        <div
          style={{
            position: 'absolute', top: '100px', left: 0, right: 0,
            background: '#2C2C2C', borderBottom: '1px solid rgba(255,255,255,0.1)',
            zIndex: 99,
          }}
        >
          <div style={{ maxWidth: 1440, margin: '0 auto', padding: '8px 24px 24px' }}>
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                style={{
                  display: 'block', padding: '14px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  color: isActive(item.path) ? '#A81D37' : '#FFFFFF',
                  fontSize: 12, fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  textDecoration: 'none',
                }}
              >
                {item.name}
              </Link>
            ))}
            <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {user ? (
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '10px 24px', background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)', color: '#FFFFFF',
                    fontSize: 12, fontWeight: 700, letterSpacing: '0.1em',
                    textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Sign Out
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '10px 24px', border: '1px solid rgba(255,255,255,0.3)',
                      color: '#FFFFFF', fontSize: 12, fontWeight: 700,
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      textDecoration: 'none',
                    }}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '10px 24px', background: '#A81D37',
                      color: '#FFFFFF', fontSize: 12, fontWeight: 700,
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      textDecoration: 'none',
                    }}
                  >
                    Console
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
