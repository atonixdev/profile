import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AtonixDevLogo from '../AtonixDevLogo';
import AtonixDevLogoIcon from '../AtonixDevLogoIcon';
import SOCIALS from '../../constants/socials';

// ─────────────────────────────────────────────────────
// Mega-dropdown content — §5 of spec
// ─────────────────────────────────────────────────────
const MEGA_MENUS = {
  Software: [
    {
      title: 'Developer Tools',
      items: ['Code Editor', 'API Gateway', 'SDKs', 'CLI Tools', 'Developer Portal', 'Secrets Manager'],
    },
    {
      title: 'Application Services',
      items: ['App Hosting', 'Serverless Functions', 'Containers Runtime', 'Microservices Engine', 'Job Scheduler'],
    },
    {
      title: 'DevOps & Automation',
      items: ['CI/CD Pipelines', 'GitOps Engine', 'Artifact Registry', 'IaC Management', 'Deployment Orchestration'],
    },
    {
      title: 'AI & Intelligence',
      items: ['AI Code Assistant', 'AI Automation', 'AI Deployment Insights', 'AI Test Automation'],
    },
  ],
  Infrastructure: [
    {
      title: 'Compute',
      items: ['VMs', 'Kubernetes', 'GPU Compute', 'Autoscaling', 'Serverless Compute'],
    },
    {
      title: 'Storage',
      items: ['Object Storage', 'Block Storage', 'File Storage', 'Backup & Restore'],
    },
    {
      title: 'Databases',
      items: ['SQL', 'NoSQL', 'Redis', 'Data Warehouse', 'Search Engine'],
    },
    {
      title: 'Networking',
      items: ['VPC', 'Subnets', 'Load Balancers', 'DNS', 'VPN', 'Firewall Rules'],
    },
  ],
  Solutions: [
    {
      title: 'By Use Case',
      items: ['DevOps Modernization', 'Cloud Migration', 'AI Transformation'],
    },
    {
      title: 'By Team',
      items: ['Developers', 'DevOps', 'IT Ops', 'Security Teams'],
    },
    {
      title: 'By Industry Need',
      items: ['High Availability', 'Cost Optimization', 'Compliance Automation'],
    },
    {
      title: 'Featured Solutions',
      items: ['Digital Infrastructure', 'Intelligent Automation'],
    },
  ],
  Industries: [
    {
      title: 'Government',
      items: ['Secure Cloud', 'Digital Identity'],
    },
    {
      title: 'Finance',
      items: ['Banking Cloud', 'Compliance Automation'],
    },
    {
      title: 'Healthcare',
      items: ['Secure Data Exchange', 'Medical Cloud'],
    },
    {
      title: 'Telecom',
      items: ['Network Automation', 'Edge Computing'],
    },
  ],
  Networking: [
    {
      title: 'Core Networking',
      items: ['VPC', 'Routing', 'Load Balancing'],
    },
    {
      title: 'Security Networking',
      items: ['WAF', 'API Protection', 'DDoS Protection'],
    },
    {
      title: 'Connectivity',
      items: ['VPN', 'Direct Connect', 'Edge Locations'],
    },
    {
      title: 'Tools',
      items: ['Network Monitoring', 'Traffic Analytics'],
    },
  ],
  Security: [
    {
      title: 'Application Security',
      items: ['App Scanning', 'API Security', 'Code Security'],
    },
    {
      title: 'Cloud Security',
      items: ['IAM', 'Secrets Management', 'Zero Trust'],
    },
    {
      title: 'Monitoring',
      items: ['SIEM', 'Threat Detection', 'Incident Response'],
    },
    {
      title: 'Compliance',
      items: ['Compliance Engine', 'Audit Automation'],
    },
  ],
  Community: [
    {
      title: 'Developer Resources',
      items: ['Docs', 'API Reference', 'Tutorials', 'Training'],
    },
    {
      title: 'Community',
      items: ['Forums', 'Events', 'Meetups'],
    },
    {
      title: 'Open Source',
      items: ['GitHub Repos', 'Contributions'],
    },
    {
      title: 'Programs',
      items: ['Ambassador Program', 'Beta Access'],
    },
  ],
};

// Slugify a product name for URL
const toSlug = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ─────────────────────────────────────────────────────
// MegaDropdown — one panel for a nav item
// ─────────────────────────────────────────────────────
const MegaDropdown = ({ columns, isOpen, onClose, onMouseEnter, onMouseLeave }) => {
  if (!isOpen) return null;
  return (
    <div
      role="menu"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'fixed',
        top: 104,
        left: 0,
        right: 0,
        background: '#FFFFFF',
        borderTop: '2px solid #A81D37',
        borderBottom: '1px solid #E5E7EB',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        zIndex: 200,
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '32px 40px',
          display: 'grid',
          gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
          gap: 16,
        }}
      >
        {columns.map((col) => (
          <div key={col.title}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#111827',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                marginBottom: 12,
                paddingBottom: 8,
                borderBottom: '1px solid #F3F4F6',
              }}
            >
              {col.title}
            </div>
            <ul role="none" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {col.items.map((item) => (
                <li key={item} role="none">
                  <Link
                    role="menuitem"
                    to={`/platform/${toSlug(item)}`}
                    onClick={onClose}
                    style={{
                      display: 'block',
                      padding: '6px 0',
                      fontSize: 14,
                      color: '#374151',
                      textDecoration: 'none',
                      fontWeight: 400,
                      lineHeight: 1.4,
                      transition: 'color 0.12s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#A81D37'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#374151'; }}
                    onFocus={(e) => { e.currentTarget.style.color = '#A81D37'; }}
                    onBlur={(e) => { e.currentTarget.style.color = '#374151'; }}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────
// SearchBar — icon only, expands on click
// ─────────────────────────────────────────────────────
const SearchBar = () => {
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Global "/" shortcut
  useEffect(() => {
    const handler = (e) => {
      if (e.key === '/' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        transition: 'width 0.25s ease',
        width: open ? 260 : 28,
        overflow: 'hidden',
      }}
    >
      {/* Icon button — always visible */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Search"
        style={{
          position: 'absolute',
          right: 0,
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: open ? 'rgba(255,255,255,0.15)' : 'transparent',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          color: '#FFFFFF',
          flexShrink: 0,
          zIndex: 1,
          transition: 'background 0.15s',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="6.5" cy="6.5" r="5" />
          <path d="M10.5 10.5L14 14" strokeLinecap="round" />
        </svg>
      </button>

      {/* Expanding input */}
      <input
        ref={inputRef}
        type="search"
        aria-label="Search"
        placeholder="Search…"
        onBlur={() => setOpen(false)}
        style={{
          width: open ? 'calc(100% - 32px)' : 0,
          height: 28,
          paddingLeft: 10,
          paddingRight: 8,
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.4)',
          borderRadius: 4,
          fontSize: 12,
          color: '#FFFFFF',
          outline: 'none',
          fontFamily: 'inherit',
          opacity: open ? 1 : 0,
          transition: 'opacity 0.2s ease',
          marginRight: 4,
        }}
      />
    </div>
  );
};

// GS-WSF §3 — Global Header — two-tier: brand/auth bar + nav bar
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState(null);
  const closeTimerRef = useRef(null);
  const [portalUsername, setPortalUsername] = useState('');
  const [portalPassword, setPortalPassword] = useState('');
  const [portalError, setPortalError] = useState('');
  const [portalLoading, setPortalLoading] = useState(false);
  const portalRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, login } = useAuth();

  const handlePortalLogin = async (e) => {
    e.preventDefault();
    setPortalError('');
    setPortalLoading(true);
    const result = await login(portalUsername, portalPassword);
    setPortalLoading(false);
    if (result.success) {
      setIsPortalOpen(false);
      setPortalUsername('');
      setPortalPassword('');
    } else {
      setPortalError(result.error || 'Login failed');
    }
  };

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

  const handleNavHover = (name) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setOpenDropdown(name);
  };

  const handleNavLeave = () => {
    closeTimerRef.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  const cancelDropdownClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  };

  const handleNavClick = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleNavKeyDown = (e, name, index) => {
    if (e.key === 'ArrowDown') {
      setOpenDropdown(name);
    } else if (e.key === 'Escape') {
      setOpenDropdown(null);
    } else if (e.key === 'ArrowRight') {
      e.currentTarget.parentElement.nextElementSibling?.querySelector('a')?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.currentTarget.parentElement.previousElementSibling?.querySelector('a')?.focus();
    }
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  const handleMobileNavClick = (name) => {
    setMobileOpenDropdown(mobileOpenDropdown === name ? null : name);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, width: '100%' }}>

      {/* ══ TOP UTILITY HEADER (Tier 1) ═══════════════════════ */}
      <div
        style={{
          height: 40,
          background: '#02010a',
          borderBottom: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <div
          style={{
            maxWidth: 1440, margin: '0 auto', padding: '0 24px',
            height: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Left: Region + Language */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <select
              aria-label="Region"
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: 12,
                color: '#FFFFFF',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <option>Global</option>
              <option>US East</option>
              <option>EU West</option>
              <option>Asia Pacific</option>
            </select>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>•</span>
            <select
              aria-label="Language"
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: 12,
                color: '#FFFFFF',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <option>English</option>
              <option>Español</option>
              <option>Français</option>
              <option>Deutsch</option>
            </select>
          </div>

          {/* Center: Global Search */}
          <div style={{ margin: '0 16px' }}>
            <SearchBar />
          </div>

          {/* Right: Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Link
              to="/pricing"
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.85)',
                textDecoration: 'none',
                fontWeight: 500,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
            >
              Pricing
            </Link>
            <Link
              to="/docs"
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.85)',
                textDecoration: 'none',
                fontWeight: 500,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
            >
              Documentation
            </Link>
            <Link
              to="/support"
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.85)',
                textDecoration: 'none',
                fontWeight: 500,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
            >
              Support
            </Link>
            {user ? (
              <Link
                to="/dashboard"
                style={{
                  fontSize: 12,
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Dashboard
              </Link>
            ) : (
              <div ref={portalRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => { setIsPortalOpen((v) => !v); setPortalError(''); }}
                  style={{
                    fontSize: 12, color: '#FFFFFF', fontWeight: 600,
                    background: 'rgba(255,255,255,0.18)',
                    border: '1px solid rgba(255,255,255,0.45)',
                    borderRadius: 20,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    padding: '4px 14px',
                    letterSpacing: '0.03em',
                    transition: 'background 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.28)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.45)'; }}
                >
                  Portal
                </button>
                {isPortalOpen && (
                  <div
                    style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 10px)',
                      background: '#FFFFFF', border: '1px solid #E5E7EB',
                      borderRadius: 14, padding: '24px 20px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.16)', zIndex: 400,
                      width: 264,
                    }}
                  >
                    {/* Logo */}
                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                      <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 700, fontSize: 20, color: '#111827' }}>Atonix</span>
                      <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 700, fontSize: 20, color: '#A81D37' }}>Dev</span>
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
                        onClick={() => { setIsPortalOpen(false); navigate('/register'); }}
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
                        onClick={() => { setIsPortalOpen(false); navigate('/contact'); }}
                        style={{
                          width: '100%', padding: '11px 0',
                          background: 'transparent', color: '#111827',
                          border: '1px solid #D1D5DB', fontSize: 11, fontWeight: 700,
                          cursor: 'pointer', fontFamily: 'inherit',
                          letterSpacing: '0.08em', textTransform: 'uppercase',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#A81D37'; e.currentTarget.style.color = '#A81D37'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.color = '#111827'; }}
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
        </div>
      </div>

      {/* ══ PRIMARY NAVIGATION HEADER (Tier 2) ═══════════════ */}
      <div
        style={{
          height: 64,
          background: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <nav
          style={{
            maxWidth: 1440, margin: '0 auto', padding: '0 24px',
            height: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', position: 'relative',
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flexShrink: 0 }}
          >
            <AtonixDevLogoIcon size={42} variant="light" showBg={false} />
            <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 1, userSelect: 'none', lineHeight: 1 }}>
              <span style={{ fontFamily: "'IBM Plex Sans', 'Inter', system-ui, sans-serif", fontWeight: 700, fontSize: 20, color: '#111827', letterSpacing: '-0.02em' }}>Atonix</span>
              <span style={{ fontFamily: "'IBM Plex Sans', 'Inter', system-ui, sans-serif", fontWeight: 700, fontSize: 20, color: '#A81D37', letterSpacing: '-0.02em' }}>Dev</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center" style={{ gap: 0, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            {navigation.map((item, index) => (
              <div
                key={item.name}
                onMouseEnter={() => handleNavHover(item.name)}
                onMouseLeave={handleNavLeave}
              >
                <Link
                  data-nav={item.name}
                  to={item.path}
                  onClick={() => handleNavClick(item.name)}
                  onKeyDown={(e) => handleNavKeyDown(e, item.name, index)}
                  style={{
                    display: 'block',
                    padding: '20px 16px',
                    fontSize: 14,
                    fontWeight: 600,
                    color: isActive(item.path) || openDropdown === item.name ? '#A81D37' : '#111827',
                    textDecoration: 'none',
                    letterSpacing: '0.02em',
                    transition: 'color 0.12s',
                    cursor: 'pointer',
                  }}
                  aria-haspopup="true"
                  aria-expanded={openDropdown === item.name}
                >
                  {item.name}
                </Link>
                {/* Mega Dropdown */}
                <MegaDropdown
                  columns={MEGA_MENUS[item.name] || []}
                  isOpen={openDropdown === item.name}
                  onClose={closeDropdown}
                  onMouseEnter={cancelDropdownClose}
                  onMouseLeave={handleNavLeave}
                />
              </div>
            ))}
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
            <span style={{ display: 'block', width: 22, height: 2, background: '#111827', transition: 'opacity 0.15s' }} />
            <span style={{ display: 'block', width: 22, height: 2, background: '#111827', opacity: isMenuOpen ? 0 : 1, transition: 'opacity 0.15s' }} />
            <span style={{ display: 'block', width: 22, height: 2, background: '#111827', transition: 'opacity 0.15s' }} />
          </button>
        </nav>
      </div>

      {/* ══ MOBILE MENU DRAWER ═════════════════════════════════ */}
      {isMenuOpen && (
        <div
          style={{
            position: 'fixed', top: 104, left: 0, right: 0, bottom: 0, zIndex: 90,
            background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end',
          }}
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            style={{
              width: '85%', maxWidth: 320, background: '#FFFFFF',
              height: '100%', padding: 24, overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Navigation */}
            <nav style={{ marginBottom: 32 }}>
              {navigation.map((item) => (
                <div key={item.name}>
                  <button
                    onClick={() => handleMobileNavClick(item.name)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '16px 0',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 16, fontWeight: 600, color: '#111827',
                      borderBottom: '1px solid #E5E7EB',
                    }}
                  >
                    {item.name}
                  </button>
                  {mobileOpenDropdown === item.name && (
                    <div style={{ padding: '16px 0 24px 16px' }}>
                      {(MEGA_MENUS[item.name] || []).map((column, colIndex) => (
                        <div key={colIndex} style={{ marginBottom: 24 }}>
                          <h4 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
                            {column.title}
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {column.items.map((item, linkIndex) => (
                              <Link
                                key={linkIndex}
                                to={`/platform/${toSlug(item)}`}
                                onClick={() => setIsMenuOpen(false)}
                                style={{
                                  fontSize: 14, color: '#6B7280', textDecoration: 'none',
                                  padding: '4px 0',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = '#A81D37'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7280'; }}
                              >
                                {item}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Mobile Auth */}
            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 24 }}>
              {user ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#A81D37', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontSize: 16, fontWeight: 600 }}>
                      {user.first_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>
                        {user.first_name || user.email?.split('@')[0] || 'User'}
                      </div>
                      <div style={{ fontSize: 14, color: '#6B7280' }}>{user.email}</div>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      display: 'block', padding: '12px 0', fontSize: 16, color: '#111827',
                      textDecoration: 'none', borderBottom: '1px solid #E5E7EB',
                    }}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      display: 'block', padding: '12px 0', fontSize: 16, color: '#111827',
                      textDecoration: 'none', borderBottom: '1px solid #E5E7EB',
                    }}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => { setIsMenuOpen(false); logout(); }}
                    style={{
                      width: '100%', textAlign: 'left', padding: '12px 0',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 16, color: '#DC2626',
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      padding: '12px 0', textAlign: 'center', borderRadius: 6,
                      fontSize: 16, fontWeight: 500, color: '#111827',
                      textDecoration: 'none', background: 'none', border: '1px solid #D1D5DB',
                    }}
                  >
                    Portal
                  </Link>

                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
