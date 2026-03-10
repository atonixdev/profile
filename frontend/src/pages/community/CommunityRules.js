import React from 'react';
import { Link } from 'react-router-dom';

// GS-WSF — Community Guidelines
const SECTIONS = [
  {
    title: 'Code of Conduct',
    items: [
      'Treat all members with respect and professionalism at all times.',
      'No harassment, discrimination, personal attacks, or hostile language of any kind.',
      'Engage constructively — challenge ideas, not individuals.',
      'Use clear, professional, and internationally appropriate language.',
      'Respect intellectual property, proper attribution, and licensing standards.',
      'Do not share confidential, proprietary, or sensitive business information in public threads.',
    ],
  },
  {
    title: 'Posting Guidelines',
    items: [
      'Post in the correct category to ensure proper visibility and organisation.',
      'Use clear, descriptive titles that accurately summarise the topic.',
      'Provide sufficient context and technical detail for others to understand your question.',
      'Include code samples, error logs, architecture diagrams, or links where relevant.',
      'Search existing discussions before creating a new thread to avoid duplication.',
      'Mark your thread as resolved when a satisfactory answer has been provided.',
      'Keep discussions focused on the stated topic — avoid derailing conversations.',
    ],
  },
  {
    title: 'Moderation Policy',
    items: [
      'All posts and content are subject to moderation by the AtonixDev community team.',
      'Off-topic, promotional, spam, or low-quality content will be removed without notice.',
      'Repeated violations of community guidelines will result in account suspension.',
      'Severe violations — including harassment or malicious activity — result in permanent removal.',
      'Moderation decisions are final. Appeals may be submitted to the AtonixDev support team.',
      'AtonixDev reserves the right to edit, remove, or archive any content at its discretion.',
    ],
  },
  {
    title: 'Privacy Notice',
    items: [
      'Your display name, posts, and activity are visible to all registered community members.',
      'Do not share personally identifiable information in public discussion threads.',
      'AtonixDev does not sell or share community data with third parties for marketing purposes.',
      'All community activity is governed by the AtonixDev Privacy Policy.',
      'You may request deletion of your account and all associated data at any time via support.',
    ],
  },
];

const CommunityRules = () => (
  <div style={{ background: '#FFFFFF' }}>

    {/* Page Header */}
    <section style={{ background: '#F8F9FA', borderBottom: '1px solid #E5E7EB', padding: '56px 24px 40px' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <nav style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16, fontFamily: 'var(--font-mono)' }}>
          <Link to="/community" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Community</Link>
          {' / '}
          <span style={{ color: '#111827' }}>Guidelines</span>
        </nav>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#111827', lineHeight: 1.1, marginBottom: 16 }}>
          Community Guidelines
        </h1>
        <p style={{ fontSize: 15, color: '#6B7280', maxWidth: 600, lineHeight: 1.75 }}>
          AtonixDev Community is a professional space for engineers, architects, and technologists.
          These guidelines ensure it remains structured, respectful, and valuable for all participants.
        </p>
      </div>
    </section>

    {/* Content */}
    <section className="gsw-section" style={{ background: '#FFFFFF' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px' }}>

        {SECTIONS.map((sec, i) => (
          <div
            key={sec.title}
            style={{ marginBottom: i < SECTIONS.length - 1 ? 56 : 0 }}
          >
            <div style={{ width: 32, height: 2, background: '#A81D37', marginBottom: 16 }} />
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 24 }}>
              {sec.title}
            </h2>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sec.items.map((item, j) => (
                <li
                  key={j}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 16,
                    padding: '14px 16px',
                    background: '#F8F9FA', border: '1px solid #E5E7EB',
                  }}
                >
                  <div
                    style={{
                      width: 5, height: 5, background: '#A81D37',
                      flexShrink: 0, marginTop: 7,
                    }}
                  />
                  <span style={{ fontSize: 14, color: '#374151', lineHeight: 1.75 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Acknowledgement block */}
        <div
          style={{
            marginTop: 56, padding: '32px 36px',
            background: '#111827', borderLeft: '3px solid #A81D37',
          }}
        >
          <p style={{ fontSize: 14, color: '#9CA3AF', lineHeight: 1.8, marginBottom: 20 }}>
            By participating in the AtonixDev Community, you agree to abide by these guidelines
            in full. Questions regarding moderation, account policy, or community standards may
            be directed to our support team.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link
              to="/contact"
              style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '10px 24px', background: '#A81D37', color: '#FFFFFF',
                fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', textDecoration: 'none',
              }}
            >
              Contact Support
            </Link>
            <Link
              to="/community"
              style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '10px 24px', background: 'transparent', color: '#FFFFFF',
                fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            >
              Back to Community
            </Link>
          </div>
        </div>
      </div>
    </section>

  </div>
);

export default CommunityRules;
