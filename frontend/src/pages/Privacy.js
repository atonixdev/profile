import React from 'react';
import { Link } from 'react-router-dom';

const sections = [
  {
    id: 'intro',
    title: '1. Introduction',
    content: [
      'AtonixDev (operated by AtonixCorp, "we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard personal information when you use our website, platform, APIs, and related services (collectively, the "Services").',
      'By accessing or using our Services, you agree to this Privacy Policy. If you do not agree, please discontinue use of our Services.',
    ],
  },
  {
    id: 'data-collection',
    title: '2. Information We Collect',
    content: [
      'Account Registration Data: When you register for an account, we collect your name, email address, username, and password (stored as a cryptographic hash).',
      'Usage Data: We automatically collect information about how you interact with our Services, including pages visited, features used, API call patterns, timestamps, and session identifiers.',
      'Technical Data: We collect your IP address, browser type and version, operating system, device identifiers, and referral URLs for security, analytics, and system operation purposes.',
      'Communication Data: When you submit a contact form, open a support ticket, or communicate with us by email, we collect the content of that communication and your contact details.',
      'Professional Data: For business accounts, we may collect company name, job title, industry sector, and company address for billing and service delivery purposes.',
    ],
  },
  {
    id: 'use',
    title: '3. How We Use Your Information',
    content: [
      'Service Delivery: To create and manage your account, provide access to platform features, process transactions, and fulfil our contractual obligations to you.',
      'Security & Fraud Prevention: To detect, investigate, and prevent unauthorised access, fraud, abuse, and security incidents across our infrastructure.',
      'Product Improvement: To analyse usage patterns and performance data to improve platform reliability, features, and user experience.',
      'Support & Communication: To respond to enquiries, provide technical support, and send account-related notifications and service announcements.',
      'Legal Compliance: To comply with applicable laws, regulations, court orders, and lawful requests from authorised government authorities.',
    ],
  },
  {
    id: 'sharing',
    title: '4. Information Sharing & Disclosure',
    content: [
      'We do not sell, rent, or trade personal data to third parties for marketing purposes.',
      'Service Providers: We share data with carefully vetted third-party service providers who process data on our behalf (e.g., cloud hosting, analytics) under binding data processing agreements and equivalent protections.',
      'Legal Requirements: We may disclose information where required by law, court order, or legitimate government authority, or where we believe disclosure is necessary to protect rights, property, or safety.',
      'Business Transfers: In the event of a merger, acquisition, or asset sale, personal data may be transferred as part of that transaction. Affected users will be notified.',
      'With Consent: We may share information for other purposes with your explicit prior consent.',
    ],
  },
  {
    id: 'security',
    title: '5. Data Security',
    content: [
      'We implement industry-standard security measures including AES-256 encryption at rest, TLS 1.3 in transit, multi-factor authentication, role-based access control, and continuous security monitoring.',
      'Access to personal data is restricted to authorised personnel on a need-to-know basis. All access is logged and subject to quarterly review.',
      'No method of transmission over the internet or electronic storage is 100% secure. We continuously work to apply best practices and address vulnerabilities promptly.',
    ],
  },
  {
    id: 'retention',
    title: '6. Data Retention',
    content: [
      'We retain personal data for as long as your account remains active, for as long as necessary to provide our Services, and for the periods required by applicable law.',
      'Upon account deletion, personal data is purged within 90 days except where retention is required by law or legitimate business interest (e.g., fraud prevention records).',
      'Specific retention periods for each data category are documented in our Data Protection Policy, available on request.',
    ],
  },
  {
    id: 'rights',
    title: '7. Your Rights',
    content: [
      'Depending on your jurisdiction, you may have the following rights: access to your personal data; rectification of inaccurate data; erasure ("right to be forgotten"); restriction of processing; data portability; and the right to object to processing based on legitimate interests.',
      'To exercise any right, submit a request via our Contact page. We will respond within 30 days. We may require identity verification before processing sensitive requests.',
      'You have the right to lodge a complaint with your national data protection supervisory authority if you believe we have not complied with applicable data protection law.',
    ],
  },
  {
    id: 'cookies',
    title: '8. Cookies & Tracking',
    content: [
      'We use strictly necessary cookies to maintain session state and authenticate users. We do not use advertising or cross-site tracking cookies.',
      'Analytics data is collected in aggregate and pseudonymised form. We do not use cookies for behavioural advertising or cross-platform tracking.',
      'You may configure your browser to block cookies. Note that disabling session cookies will prevent authentication from functioning.',
    ],
  },
  {
    id: 'international',
    title: '9. International Transfers',
    content: [
      'AtonixDev operates globally. Your data may be processed in jurisdictions outside your home country, including the United States and other regions where we or our service providers operate.',
      'Where we transfer data from the European Economic Area, we apply appropriate safeguards including Standard Contractual Clauses (SCCs) and equivalent mechanisms.',
    ],
  },
  {
    id: 'changes',
    title: '10. Changes to This Policy',
    content: [
      'We may update this Privacy Policy from time to time. Material changes will be communicated via email or prominent platform notification at least 14 days before taking effect.',
      'The "Last Updated" date at the top of this page reflects the most recent revision. Continued use of our Services following notice constitutes acceptance of the updated policy.',
    ],
  },
  {
    id: 'contact',
    title: '11. Contact Us',
    content: [
      'For privacy enquiries, data subject requests, or to reach our Data Protection Officer, please use our Contact page or email privacy@atonixdev.com.',
      'AtonixDev — AtonixCorp | privacy@atonixdev.com',
    ],
  },
];

const Privacy = () => (
  <div style={{ background: '#FFFFFF' }}>

    {/* ── Body ── */}
    <section className="gsw-section" style={{ background: '#FFFFFF' }}>
      <div className="gsw-container">
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '0 80px', alignItems: 'start' }}>

          {/* TOC sidebar */}
          <div style={{ position: 'sticky', top: 96, paddingTop: 8 }} className="hidden md:block">
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#4B5563', fontFamily: 'var(--font-mono)', marginBottom: 16 }}>Contents</div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} style={{ fontSize: 12, color: '#4B5563', textDecoration: 'none', lineHeight: 1.5, display: 'block' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#A81D37'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#4B5563'; }}>
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4B5563', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>Related</div>
              <Link to="/terms" style={{ display: 'block', fontSize: 12, color: '#4B5563', textDecoration: 'none', marginBottom: 8 }}>Terms of Service</Link>
              <Link to="/data-protection" style={{ display: 'block', fontSize: 12, color: '#4B5563', textDecoration: 'none', marginBottom: 8 }}>Data Protection</Link>
              <Link to="/security" style={{ display: 'block', fontSize: 12, color: '#4B5563', textDecoration: 'none' }}>Security</Link>
            </div>
          </div>

          {/* Content */}
          <div>
            <div style={{ padding: '20px 24px', background: '#FFF5F5', border: '1px solid #FECACA', borderLeft: '3px solid #A81D37', marginBottom: 48 }}>
              <p style={{ fontSize: 13, color: '#1F2937', lineHeight: 1.75, margin: 0 }}>
                Please read this Privacy Policy carefully. It explains how AtonixDev collects,
                uses, and protects your personal information when you use our Services.
                By using AtonixDev Services, you acknowledge this policy.
              </p>
            </div>

            {sections.map((section) => (
              <div key={section.id} id={section.id} style={{ marginBottom: 48 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #F3F4F6' }}>
                  {section.title}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {section.content.map((para, idx) => (
                    <p key={idx} style={{ fontSize: 14, color: '#1F2937', lineHeight: 1.8, margin: 0 }}>{para}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* ── Footer bar ── */}
    <section className="gsw-section-xs" style={{ background: '#F8F9FA', borderTop: '1px solid #E5E7EB' }}>
      <div className="gsw-container" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: 13, color: '#4B5563', margin: 0 }}>
          Questions about this policy? <Link to="/contact" style={{ color: '#A81D37', textDecoration: 'none', fontWeight: 600 }}>Contact us</Link>.
        </p>
        <div style={{ display: 'flex', gap: 24 }}>
          <Link to="/terms" style={{ fontSize: 12, color: '#4B5563', textDecoration: 'none' }}>Terms of Service</Link>
          <Link to="/data-protection" style={{ fontSize: 12, color: '#4B5563', textDecoration: 'none' }}>Data Protection</Link>
          <Link to="/security" style={{ fontSize: 12, color: '#4B5563', textDecoration: 'none' }}>Security</Link>
        </div>
      </div>
    </section>

  </div>
);

export default Privacy;
