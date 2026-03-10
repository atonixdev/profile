import React from 'react';
import { Link } from 'react-router-dom';

const termsSections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: [
      'By accessing or using AtonixDev Services (the "Services"), operated by AtonixCorp ("AtonixDev", "we", "us", "our"), you agree to be bound by these Terms of Service ("Terms") and all applicable laws and regulations.',
      'If you are accessing the Services on behalf of an organisation, you represent and warrant that you have the authority to bind that organisation to these Terms.',
      'We reserve the right to update these Terms at any time. Material changes will be communicated with at least 14 days notice. Continued use following notice constitutes acceptance.',
    ],
  },
  {
    id: 'services',
    title: '2. Description of Services',
    content: [
      'AtonixDev provides enterprise software engineering, cloud infrastructure, AI automation, developer tools, documentation, community resources, and related professional services.',
      'We reserve the right to modify, suspend, or discontinue any aspect of the Services at any time with reasonable notice, except where immediate action is required for security or legal reasons.',
      'Certain features may require a paid subscription, enterprise licence, or separate service agreement. Those engagements are governed by executed contracts, which supersede these Terms in the event of conflict.',
    ],
  },
  {
    id: 'accounts',
    title: '3. User Accounts',
    content: [
      'You must provide accurate, current, and complete information when creating an account. You are responsible for maintaining the confidentiality of your credentials.',
      'You must notify us immediately of any unauthorised use of your account. We are not liable for losses resulting from unauthorised use of your account before notification.',
      'You may not create accounts on behalf of others without authorisation, use automated means to create accounts, or create accounts for purposes that violate these Terms.',
      'We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or pose a security risk.',
    ],
  },
  {
    id: 'acceptable-use',
    title: '4. Acceptable Use Policy',
    content: [
      'You agree not to use the Services to: (a) violate any applicable law or regulation; (b) infringe the intellectual property rights of others; (c) transmit malware, viruses, or destructive code; (d) conduct denial-of-service attacks or network scanning without authorisation; (e) access systems or data without authorisation.',
      'You may not use the Services to build competing products or services, to circumvent any technical measures, or to extract or scrape data from the platform without our written consent.',
      'Violation of this Acceptable Use Policy may result in immediate account suspension and may be reported to appropriate authorities.',
    ],
  },
  {
    id: 'ip',
    title: '5. Intellectual Property',
    content: [
      'AtonixDev and its licensors own all intellectual property rights in the Services, including software, documentation, trademarks, logos, and platform content. Nothing in these Terms transfers any IP rights to you.',
      'Subject to these Terms and payment of applicable fees, we grant you a limited, non-exclusive, non-transferable, revocable licence to access and use the Services for your internal business purposes.',
      'You retain ownership of data and content you submit to the Services. By submitting content, you grant us a limited licence to process, store, and transmit that content solely to provide the Services.',
    ],
  },
  {
    id: 'payment',
    title: '6. Payment Terms',
    content: [
      'Fees for paid Services are set out in your order form or service agreement. All fees are due in accordance with the payment terms specified in that agreement.',
      'We reserve the right to suspend access to paid Services for non-payment after reasonable notice. We will not issue refunds for partial period use except as required by law or specified in your agreement.',
      'All fees are exclusive of taxes. You are responsible for all applicable taxes, levies, or duties imposed by taxing authorities.',
    ],
  },
  {
    id: 'confidentiality',
    title: '7. Confidentiality',
    content: [
      'Each party agrees to hold the other party\'s Confidential Information in strict confidence and not to disclose it to third parties or use it except to fulfil obligations under these Terms.',
      '"Confidential Information" means any non-public information disclosed by one party to the other that is designated as confidential or that reasonably should be understood to be confidential given the nature and circumstances of disclosure.',
      'Confidentiality obligations do not apply to information that is or becomes publicly known through no breach, that was independently developed, or that is required to be disclosed by law or court order.',
    ],
  },
  {
    id: 'disclaimers',
    title: '8. Disclaimers & Warranties',
    content: [
      'THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.',
      'WE DO NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS. YOUR USE OF THE SERVICES IS AT YOUR SOLE RISK.',
      'The above disclaimer does not apply to the extent that applicable law does not permit it.',
    ],
  },
  {
    id: 'liability',
    title: '9. Limitation of Liability',
    content: [
      'TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, ATONIXDEV WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, DATA LOSS, OR BUSINESS INTERRUPTION.',
      'OUR AGGREGATE LIABILITY FOR ANY CLAIMS ARISING UNDER THESE TERMS WILL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE 12 MONTHS PRECEDING THE CLAIM.',
      'These limitations apply regardless of whether we have been advised of the possibility of such damages and regardless of the form of action.',
    ],
  },
  {
    id: 'termination',
    title: '10. Termination',
    content: [
      'Either party may terminate these Terms upon written notice if the other party materially breaches these Terms and fails to cure such breach within 30 days of notice.',
      'We may terminate or suspend your access immediately, without prior notice, if we determine that you have violated these Terms, engaged in fraudulent activity, or posed a security risk.',
      'Upon termination, your right to use the Services ceases immediately. Sections that by their nature should survive termination will survive, including IP ownership, confidentiality, disclaimers, and limitation of liability.',
    ],
  },
  {
    id: 'governing-law',
    title: '11. Governing Law & Dispute Resolution',
    content: [
      'These Terms are governed by and construed in accordance with applicable law. Disputes will be resolved by binding arbitration under mutually agreed rules, except that either party may seek injunctive relief in a court of competent jurisdiction.',
      'If arbitration is not agreed, disputes will be resolved in the courts of the jurisdiction specified in your enterprise service agreement.',
    ],
  },
  {
    id: 'general',
    title: '12. General',
    content: [
      'These Terms, together with any executed service agreement, constitute the entire agreement between you and AtonixDev regarding the Services and supersede all prior agreements.',
      'If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.',
      'Our failure to enforce any right under these Terms shall not waive that right.',
      'You may not assign your rights under these Terms without our written consent. We may assign these Terms without restriction.',
    ],
  },
  {
    id: 'contact-legal',
    title: '13. Contact',
    content: [
      'For legal enquiries or notices under these Terms: legal@atonixdev.com',
      'AtonixDev — AtonixCorp',
    ],
  },
];

const Terms = () => (
  <div style={{ background: '#FFFFFF' }}>

    {/* ── Header ── */}
    <section style={{ position: 'relative', background: '#FFFFFF', overflow: 'hidden', padding: '120px 0 80px' }}>
      <div className="hero-grid-bg" />
      <div className="hero-accent-bar" />
      <div className="gsw-container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <span className="gsw-eyebrow">Legal</span>
        <h1 style={{ fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 800, color: '#111827', lineHeight: 1.1, marginBottom: 16 }}>
          Terms of Service
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>
          Last Updated: March 2026 &nbsp;·&nbsp; Effective: March 2026
        </p>
      </div>
    </section>
    <hr className="gsw-divider" />

    {/* ── Body ── */}
    <section className="gsw-section" style={{ background: '#FFFFFF' }}>
      <div className="gsw-container">
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '0 80px', alignItems: 'start' }}>

          {/* TOC */}
          <div style={{ position: 'sticky', top: 96, paddingTop: 8 }} className="hidden md:block">
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9CA3AF', fontFamily: 'var(--font-mono)', marginBottom: 16 }}>Contents</div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {termsSections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} style={{ fontSize: 12, color: '#6B7280', textDecoration: 'none', lineHeight: 1.5, display: 'block' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#A81D37'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7280'; }}>
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>Related</div>
              <Link to="/privacy" style={{ display: 'block', fontSize: 12, color: '#6B7280', textDecoration: 'none', marginBottom: 8 }}>Privacy Policy</Link>
              <Link to="/data-protection" style={{ display: 'block', fontSize: 12, color: '#6B7280', textDecoration: 'none', marginBottom: 8 }}>Data Protection</Link>
              <Link to="/security" style={{ display: 'block', fontSize: 12, color: '#6B7280', textDecoration: 'none' }}>Security</Link>
            </div>
          </div>

          {/* Content */}
          <div>
            <div style={{ padding: '20px 24px', background: '#FFF5F5', border: '1px solid #FECACA', borderLeft: '3px solid #A81D37', marginBottom: 48 }}>
              <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.75, margin: 0 }}>
                These Terms of Service govern your access to and use of AtonixDev Services.
                Enterprise and government engagements are additionally governed by your executed service agreement.
                In the event of conflict, the service agreement prevails.
              </p>
            </div>

            {termsSections.map((section) => (
              <div key={section.id} id={section.id} style={{ marginBottom: 48 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #F3F4F6' }}>
                  {section.title}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {section.content.map((para, idx) => (
                    <p key={idx} style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, margin: 0 }}>{para}</p>
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
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
          Legal questions? <Link to="/contact" style={{ color: '#A81D37', textDecoration: 'none', fontWeight: 600 }}>Contact us</Link>.
        </p>
        <div style={{ display: 'flex', gap: 24 }}>
          <Link to="/privacy" style={{ fontSize: 12, color: '#6B7280', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link to="/data-protection" style={{ fontSize: 12, color: '#6B7280', textDecoration: 'none' }}>Data Protection</Link>
          <Link to="/security" style={{ fontSize: 12, color: '#6B7280', textDecoration: 'none' }}>Security</Link>
        </div>
      </div>
    </section>

  </div>
);

export default Terms;
