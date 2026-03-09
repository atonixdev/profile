import React from 'react';
import { Link } from 'react-router-dom';

// GS-WSF §6 — Institutional Footer — AWS/Oracle/IBM standard
const Footer = () => {
  const currentYear = new Date().getFullYear();

  const cols = [
    {
      title: 'Company',
      links: [
        { label: 'About', to: '/about' },
        { label: 'Services', to: '/services' },
        { label: 'Portfolio', to: '/portfolio' },
      ],
    },
    {
      title: 'Platform',
      links: [
        { label: 'Blog', to: '/blog' },
        { label: 'Community', to: '/community' },
        { label: 'Resources', to: '/community/resources' },
      ],
    },
    {
      title: 'Solutions',
      links: [
        { label: 'Software Engineering', to: '/services' },
        { label: 'AI Automation', to: '/services' },
        { label: 'FinTech Engineering', to: '/services' },
        { label: 'Technical Architecture', to: '/services' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Contact', to: '/contact' },
        { label: 'FAQ', to: '/help' },
        { label: 'Sign In', to: '/login' },
        { label: 'Create Account', to: '/register' },
      ],
    },
  ];

  const socials = [
    {
      label: 'LinkedIn',
      href: 'https://linkedin.com/in/atonixdev',
      icon: (
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      label: 'GitHub',
      href: 'https://github.com/atonixdev',
      icon: (
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
        </svg>
      ),
    },
    {
      label: 'Twitter',
      href: 'https://twitter.com/atonixdev',
      icon: (
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      ),
    },
    {
      label: 'GitLab',
      href: 'https://gitlab.com/atonixdev',
      icon: (
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23.955 13.587l-1.342-4.135-2.664-8.189a.894.894 0 00-1.7 0L15.585 9.452H8.415L5.751 1.263a.894.894 0 00-1.7 0L1.387 9.452.045 13.587a1.276 1.276 0 00.462 1.426L12 23.112l11.493-8.099a1.277 1.277 0 00.462-1.426z" />
        </svg>
      ),
    },
  ];

  return (
    <footer style={{ background: '#FFFFFF', borderTop: '1px solid #E5E7EB' }}>
      {/* Main grid */}
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '64px 24px 48px' }}>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-10">

          {/* Brand column — spans 2 */}
          <div className="md:col-span-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div
                style={{
                  width: 32, height: 32, background: '#DC2626',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 12, color: '#111827', letterSpacing: '0.04em',
                  flexShrink: 0,
                }}
              >
                AC
              </div>
              <span
                style={{
                  color: '#111827', fontWeight: 700,
                  fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase',
                }}
              >
                AtonixDev
              </span>
            </div>
            <p style={{ color: '#6B7280', fontSize: 13, lineHeight: 1.7, marginBottom: 24, maxWidth: 300 }}>
              Principal Architect &amp; Technical Innovator at AtonixCorp. Building sovereign infrastructure and intelligent systems for Africa and the global market.
            </p>
            {/* Social icons — monochrome, small */}
            <div style={{ display: 'flex', gap: 8 }}>
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  style={{
                    width: 32, height: 32,
                    background: '#F1F3F5', border: '1px solid #E5E7EB',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#6B7280',
                    transition: 'color 0.15s ease, border-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#111827';
                    e.currentTarget.style.borderColor = '#6B7280';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#6B7280';
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {cols.map((col) => (
            <div key={col.title}>
              <div
                style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
                  textTransform: 'uppercase', color: '#111827',
                  marginBottom: 20,
                }}
              >
                {col.title}
              </div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      style={{
                        color: '#6B7280', fontSize: 13,
                        transition: 'color 0.15s ease', textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#111827'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7280'; }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Legal bar */}
      <div
        style={{
          borderTop: '1px solid #E5E7EB',
          maxWidth: 1440, margin: '0 auto', padding: '20px 24px',
          display: 'flex', flexWrap: 'wrap', gap: 16,
          justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <p style={{ color: '#6B7280', fontSize: 12, margin: 0 }}>
          &copy; {currentYear} AtonixDev — AtonixCorp. All rights reserved.
        </p>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((t) => (
            <span
              key={t}
              style={{ color: '#6B7280', fontSize: 12, cursor: 'default' }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
