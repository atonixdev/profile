import React, { useState } from 'react';

const faqs = [
  { category: 'General', question: 'What is AtonixCorp?', answer: 'AtonixCorp is a technology company specializing in AI, cloud computing, IoT, and enterprise software solutions. We help businesses leverage cutting-edge technology to drive innovation and growth.' },
  { category: 'General', question: 'Where are you located?', answer: 'We operate globally with a distributed team. We work with clients worldwide and offer remote collaboration for all projects.' },
  { category: 'General', question: 'How can I contact AtonixCorp?', answer: 'You can reach us through our contact form, email, or by scheduling a consultation through our website. We typically respond within 24 hours.' },
  { category: 'Services', question: 'What services does AtonixCorp offer?', answer: 'We offer AI/ML development, cloud architecture, IoT solutions, cybersecurity, DevOps & CI/CD, blockchain development, and custom enterprise software. Each service is tailored to your specific needs.' },
  { category: 'Services', question: 'Do you offer ongoing support after project completion?', answer: 'Yes, we offer flexible maintenance and support packages for all completed projects. This includes bug fixes, performance optimization, and feature enhancements.' },
  { category: 'Services', question: 'Can you integrate with our existing systems?', answer: 'Absolutely. We specialize in system integration and have experience connecting with a wide range of legacy and modern platforms including ERP systems, CRMs, and custom databases.' },
  { category: 'Project Process', question: 'What is your typical project timeline?', answer: 'Timelines vary based on project complexity. A simple web application may take 4-8 weeks, while complex enterprise solutions can take 3-6 months. We provide detailed timelines during the proposal phase.' },
  { category: 'Project Process', question: 'How do you handle project management?', answer: 'We use agile methodologies with regular sprint reviews, transparent progress tracking, and weekly check-in calls. You will have a dedicated project manager as your point of contact.' },
  { category: 'Project Process', question: 'What information do you need to start a project?', answer: 'We begin with discovery sessions to understand your goals, technical requirements, existing infrastructure, budget, and timeline. The more context you provide, the better we can scope the work.' },
  { category: 'Pricing', question: 'How is pricing determined?', answer: 'Pricing is based on project scope, complexity, and timeline. We offer fixed-price contracts for well-defined projects and time & materials billing for evolving projects. Request a quote to get a detailed estimate.' },
  { category: 'Pricing', question: 'Do you offer flexible payment options?', answer: 'Yes, we offer milestone-based payments for larger projects. A portion is due at project kickoff, with subsequent payments tied to project milestones.' },
  { category: 'Pricing', question: 'Do you offer retainer arrangements?', answer: 'Yes, we offer monthly retainer packages for ongoing development, maintenance, and consulting services at discounted rates compared to project-based billing.' },
  { category: 'Technical', question: 'What technologies do you work with?', answer: 'We work with Python, Node.js, React, Django, FastAPI, AWS, GCP, Azure, TensorFlow, PyTorch, Docker, Kubernetes, and many more. We select the best tools for each project.' },
  { category: 'Technical', question: 'How do you ensure security?', answer: 'Security is built into every phase of development. We follow OWASP standards, conduct security audits, implement encryption, and stay current with security best practices.' },
  { category: 'Technical', question: 'Do you provide source code and documentation?', answer: 'Yes, you own all code and assets produced during your project. We provide complete source code, technical documentation, and deployment guides.' },
];

const categories = ['All', 'General', 'Services', 'Project Process', 'Pricing', 'Technical'];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filtered = selectedCategory === 'All' ? faqs : faqs.filter(f => f.category === selectedCategory);

  const btnBase = {
    padding: '8px 20px',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    cursor: 'pointer',
    border: '1px solid #D1D5DB',
    fontFamily: 'inherit',
    transition: 'all 0.15s ease',
  };

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh' }}>

      <section className="gsw-section">
        <div className="gsw-container" style={{ maxWidth: 900 }}>
        {/* Category Filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '48px', justifyContent: 'center' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                ...btnBase,
                background: selectedCategory === cat ? '#A81D37' : 'transparent',
                color: selectedCategory === cat ? '#FFFFFF' : '#4B5563',
                borderColor: selectedCategory === cat ? '#A81D37' : '#D1D5DB',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion */}
        <div>
          {filtered.map((faq, idx) => {
            const globalIdx = faqs.indexOf(faq);
            const isOpen = openIndex === globalIdx;
            return (
              <div
                key={globalIdx}
                style={{ borderBottom: '1px solid #E5E7EB' }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : globalIdx)}
                  style={{
                    width: '100%',
                    background: isOpen ? '#F8F9FA' : 'transparent',
                    border: 'none',
                    color: '#111827',
                    padding: '24px 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    textAlign: 'left',
                    gap: '16px',
                    fontFamily: 'inherit',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '11px', color: '#A81D37', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>
                      {faq.category}
                    </span>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: isOpen ? '#111827' : '#1F2937' }}>
                      {faq.question}
                    </span>
                  </div>
                  <span style={{ fontSize: '24px', color: '#A81D37', fontWeight: 300, lineHeight: 1, flexShrink: 0, width: '28px', textAlign: 'center' }}>
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div style={{ padding: '0 0 28px', background: '#F8F9FA' }}>
                    <p style={{ color: '#4B5563', fontSize: '15px', lineHeight: 1.8, margin: 0 }}>
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{ marginTop: '80px', background: '#F8F9FA', border: '1px solid #E5E7EB', padding: '48px', textAlign: 'center' }}>
          <p style={{ color: '#4B5563', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Still have questions?</p>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#111827', margin: '0 0 24px' }}>
            Get in Touch with Our Team
          </h2>
          <a
            href="/contact"
            style={{ display: 'inline-block', background: '#A81D37', color: '#fff', padding: '14px 32px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none' }}
          >
            Contact Us
          </a>
        </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
