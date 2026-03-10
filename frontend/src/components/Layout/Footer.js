import React from 'react';
import { Link } from 'react-router-dom';
import AtonixDevLogo from '../AtonixDevLogo';
import SOCIALS from '../../constants/socials';

// GS-WSF §6 — Institutional Footer — AWS/Oracle/IBM standard
const Footer = () => {
  const currentYear = new Date().getFullYear();

  const cols = [
    {
      title: 'Company',
      links: [
        { label: 'About Us',               to: '/about' },
        { label: 'Careers',                to: '/careers' },
        { label: 'Government Contracting', to: '/government' },
        { label: 'Capabilities Statement', to: '/capabilities' },
        { label: 'Contact',                to: '/contact' },
      ],
    },
    {
      title: 'Platform',
      links: [
        { label: 'Software',       to: '/software' },
        { label: 'Infrastructure', to: '/infrastructure' },
        { label: 'Solutions',      to: '/solutions' },
        { label: 'Industries',     to: '/industries' },
        { label: 'Community',      to: '/community' },
        { label: 'Blog',           to: '/blog' },
      ],
    },
    {
      title: 'Trust & Compliance',
      links: [
        { label: 'Security & Compliance', to: '/security' },
        { label: 'Data Protection',       to: '/privacy' },
        { label: 'Legal',                 to: '/legal' },
        { label: 'Privacy Policy',        to: '/privacy' },
        { label: 'Terms of Service',      to: '/terms' },
      ],
    },
    {
      title: 'Corporate Solutions',
      links: [
        { label: 'Enterprise Software',   to: '/enterprise-software' },
        { label: 'AI & Automation',       to: '/ai-automation' },
        { label: 'Cloud Engineering',     to: '/cloud-engineering' },
        { label: 'DevOps & Security',     to: '/devops-security' },
        { label: 'Case Studies',          to: '/case-studies' },
      ],
    },
  ];

  return (
    <footer style={{ background: '#353535', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
      {/* Main grid */}
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '64px 24px 48px' }}>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-10">

          {/* Brand column — spans 2 */}
          <div className="md:col-span-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <AtonixDevLogo size={28} variant="dark" textColor="#FFFFFF" />
            </div>
            <p style={{ color: '#9CA3AF', fontSize: 13, lineHeight: 1.7, marginBottom: 24, maxWidth: 300 }}>
              A global enterprise technology company delivering secure, scalable, and intelligent
              software, cloud, and infrastructure solutions for governments, corporations, and
              high-growth organizations worldwide.
            </p>
            {/* Social icons — monochrome, small */}
            <div style={{ display: 'flex', gap: 8 }}>
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  style={{
                    width: 32, height: 32,
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#9CA3AF',
                    transition: 'color 0.15s ease, border-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#FFFFFF';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#9CA3AF';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                  }}
                >
                  <s.Icon />
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
                  textTransform: 'uppercase', color: '#FFFFFF',
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
                      color: '#9CA3AF', fontSize: 13,
                        transition: 'color 0.15s ease', textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF'; }}
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
        borderTop: '1px solid rgba(255,255,255,0.1)',
          maxWidth: 1440, margin: '0 auto', padding: '20px 24px',
          display: 'flex', flexWrap: 'wrap', gap: 16,
          justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <p style={{ color: '#9CA3AF', fontSize: 12, margin: 0 }}>
          &copy; {currentYear} AtonixDev — AtonixCorp. All rights reserved.
        </p>
        <div style={{ display: 'flex', gap: 24 }}>
          {[
            { label: 'Privacy Policy',  to: '/privacy'  },
            { label: 'Terms of Service', to: '/terms'   },
            { label: 'Compliance',       to: '/security' },
          ].map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              style={{ color: '#9CA3AF', fontSize: 12, textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF'; }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
