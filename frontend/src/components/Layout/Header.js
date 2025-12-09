import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Blog', path: '/blog' },
    { name: 'Testimonials', path: '/testimonials' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold text-xl w-10 h-10 rounded-lg flex items-center justify-center shadow-lg">
              SR
            </div>
            <span className="text-xl font-bold text-gray-800 hidden sm:block">
              Realm
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`${
                  isActive(item.path)
                    ? 'text-primary-600 font-semibold'
                    : 'text-gray-700 hover:text-primary-600'
                } transition-colors`}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Community Link - Only if logged in */}
            {user && (
              <Link
                to="/community"
                className={`${
                  isActive('/community')
                    ? 'text-primary-600 font-semibold'
                    : 'text-gray-700 hover:text-primary-600'
                } transition-colors`}
              >
                Community
              </Link>
            )}
          </div>

          {/* Auth / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary-100 text-primary-700 font-semibold hover:bg-primary-200 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm">
                    {user.user?.first_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden lg:inline">{user.user?.first_name || user.username}</span>
                </button>
                
                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b text-sm text-gray-600">
                      {user.user?.email || user.email || 'user@example.com'}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 font-semibold transition-colors"
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
                  className="px-4 py-2 text-gray-700 font-semibold hover:text-primary-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  Join Community
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-2 pb-4 border-t pt-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`block py-2 ${
                  isActive(item.path)
                    ? 'text-primary-600 font-semibold'
                    : 'text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Community Link - Only if logged in */}
            {user && (
              <Link
                to="/community"
                className={`block py-2 ${
                  isActive('/community')
                    ? 'text-primary-600 font-semibold'
                    : 'text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Community
              </Link>
            )}

            {/* Mobile Auth Links */}
            <div className="pt-4 border-t space-y-2">
              {user ? (
                <>
                  <div className="px-0 py-2 text-sm text-gray-600">
                    {user.user?.email || user.email || 'user@example.com'}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left py-2 text-gray-700 font-semibold"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block py-2 text-gray-700 font-semibold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block py-2 bg-primary-600 text-white rounded font-semibold text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Join Community
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
