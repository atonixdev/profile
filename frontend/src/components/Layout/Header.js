import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AtonixDevLogo from '../AtonixDevLogo';

// GS-WSF §3 — Global Header — two-tier: brand/auth bar + nav bar
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Software',       path: '/software' },
    { name: 'Infrastructure', path: '/infrastructure' },
    { name: 'Solutions',      path: '/solutions' },
    { name: 'Industries',     path: '/industries' },
    { name: 'Contact',        path: '/contact' },
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
            <AtonixDevLogo size={30} variant="dark" textColor="#FFFFFF" />
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
                    color: '#FFFFFF', padding: '6px 18px',
                    fontFamily: 'inherit', fontWeight: 700,
                    fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  {user.user?.first_name || user.username || 'Account'}
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
              <>
                <Link
                  to="/login"
                  style={{
                    color: '#FFFFFF', fontSize: 11, fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    textDecoration: 'none', padding: '6px 0',
                    borderBottom: '1px solid transparent',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderBottomColor = '#A81D37'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderBottomColor = 'transparent'; }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '6px 18px', background: '#A81D37',
                    color: '#FFFFFF', fontSize: 11, fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    textDecoration: 'none', transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#7A1528'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#A81D37'; }}
                >
                  Console
                </Link>
              </>
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
          background: 'transparent',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
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
