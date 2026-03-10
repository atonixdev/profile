import React from 'react';

const ComingSoon = ({ title, description }) => (
  <div>
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A81D37', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
        Developer Settings
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 6 }}>{title}</h1>
      <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.65 }}>{description}</p>
    </div>

    <div
      style={{
        background: '#FFFFFF', border: '1px solid #E5E7EB',
        padding: '64px 40px', textAlign: 'center',
      }}
    >
      <div style={{ width: 32, height: 2, background: '#E5E7EB', margin: '0 auto 20px' }} />
      <p style={{ fontSize: 14, fontWeight: 700, color: '#1F2937', marginBottom: 8 }}>Coming Soon</p>
      <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.65, maxWidth: 400, margin: '0 auto' }}>
        This section is under development and will be available in a future release.
      </p>
    </div>
  </div>
);

export const Account      = () => <ComingSoon title="Account"       description="Manage your account preferences, username, and linked identities." />;
export const Security     = () => <ComingSoon title="Security"      description="Two-factor authentication, active sessions, and login history." />;
export const AccessTokens = () => <ComingSoon title="Access Tokens" description="Create and manage personal access tokens for API and CI/CD authentication." />;
export const Sessions     = () => <ComingSoon title="Sessions"      description="View and revoke active login sessions across all devices." />;
export const Notifications = () => <ComingSoon title="Notifications" description="Configure email and in-app notification preferences." />;
