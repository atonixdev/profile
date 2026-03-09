import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AtonixDevLogo from '../AtonixDevLogo';

// GS-WSF §3 — Global Header — identical on every page
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Home',         path: '/' },
    { name: 'About',        path: '/about' },
    { name: 'Services',     path: '/services' },
    { name: 'Portfolio',    path: '/portfolio' },
    { name: 'Blog',         path: '/blog' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
  };

  return (
    <header
      style={{
        height: '80px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <nav
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 24px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
        }}
      >
        {/* ── Logo ─────────────────────────────────────────── */}
        <Link
          to="/"
          style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flexShrink: 0 }}
        >
          <AtonixDevLogo size={32} variant="dark" textColor="#111827" />
        </Link>

        {/* ── Desktop Nav ───────────────────────────────────── */}
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
          {user && (
            <Link
              to="/community"
              className={`nav-link${isActive('/community') ? ' nav-active' : ''}`}
            >
              Community
            </Link>
          )}
        </div>

        {/* ── Desktop Auth ──────────────────────────────────── */}
        <div className="hidden md:flex items-center" style={{ gap: 16 }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                style={{
                  background: '#F1F3F5',
                  border: '1px solid #D1D5DB',
                  color: '#111827',
                  padding: '8px 20px',
                  fontFamily: 'inherit', fontWeight: 700,
                  fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                {user.user?.first_name || user.username || 'Account'}
              </button>
              {isUserMenuOpen && (
                <div
                  style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 4px)',
                    background: '#F1F3F5', border: '1px solid #E5E7EB',
                    minWidth: 220, zIndex: 200,
                  }}
                >
                  <div
                    style={{
                      padding: '12px 16px', borderBottom: '1px solid #E5E7EB',
                      fontSize: 12, color: '#6B7280',
                    }}
                  >
                    {user.user?.email || user.email || ''}
                  </div>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '12px 16px', background: 'none', border: 'none',
                      color: '#111827', fontFamily: 'inherit', fontWeight: 600,
                      fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-link">Sign In</Link>
              <Link
                to="/register"
                className="gsw-btn gsw-btn-accent"
                style={{ padding: '10px 20px', fontSize: 12 }}
              >
                Console
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile Hamburger ──────────────────────────────── */}
        <button
          className="flex md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 8, flexDirection: 'column', gap: 5,
          }}
          aria-label="Toggle navigation"
        >
          <span style={{ display: 'block', width: 22, height: 2, background: '#111827', transition: 'opacity 0.15s' }} />
          <span style={{ display: 'block', width: 22, height: 2, background: '#111827', opacity: isMenuOpen ? 0 : 1, transition: 'opacity 0.15s' }} />
          <span style={{ display: 'block', width: 22, height: 2, background: '#111827', transition: 'opacity 0.15s' }} />
        </button>
      </nav>

      {/* ── Mobile Drawer ─────────────────────────────────── */}
      {isMenuOpen && (
        <div
          style={{
            position: 'absolute', top: '80px', left: 0, right: 0,
            background: '#FFFFFF', borderBottom: '1px solid #E5E7EB', zIndex: 99,
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
                  borderBottom: '1px solid #F1F3F5',
                  color: isActive(item.path) ? '#DC2626' : '#FFFFFF',
                  fontSize: 12, fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  textDecoration: 'none',
                }}
              >
                {item.name}
              </Link>
            ))}
            {user && (
              <Link
                to="/community"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  display: 'block', padding: '14px 0',
                  borderBottom: '1px solid #F1F3F5',
                  color: isActive('/community') ? '#DC2626' : '#FFFFFF',
                  fontSize: 12, fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  textDecoration: 'none',
                }}
              >
                Community
              </Link>
            )}
            <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {user ? (
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '10px 24px', background: '#F1F3F5',
                    border: '1px solid #D1D5DB', color: '#111827',
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
                      padding: '10px 24px', border: '1px solid #D1D5DB',
                      color: '#111827', fontSize: 12, fontWeight: 700,
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
                      padding: '10px 24px', background: '#DC2626',
                      color: '#111827', fontSize: 12, fontWeight: 700,
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
