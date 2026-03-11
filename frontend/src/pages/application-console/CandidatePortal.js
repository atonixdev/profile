/**
 * CandidatePortal — Public Job Application Form
 * Route: /apply/:jobId (NO AUTH REQUIRED)
 *
 * Candidates can:
 * - View job details
 * - Submit application with CV
 * - Answer screening questions
 * - Provide cover letter
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ACCENT = '#1F4788';

export default function CandidatePortal() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    location: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
    cover_letter: '',
    screening_answers: {},
  });

  const [files, setFiles] = useState({
    cv: null,
    portfolio: null,
    cover_letter_file: null,
  });

  const [fileNames, setFileNames] = useState({
    cv: null,
    portfolio: null,
    cover_letter_file: null,
  });

  useEffect(() => {
    if (!jobId) return;
    fetch(`/api/employment/jobs/${jobId}/`, { credentials: 'include' })
      .then(r => {
        if (r.status === 404) return null;
        return r.json();
      })
      .then(job => {
        setJob(job);
        if (job && job.screening_questions) {
          const answers = {};
          job.screening_questions.forEach(q => {
            answers[q.question] = '';
          });
          setFormData(prev => ({ ...prev, screening_answers: answers }));
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScreeningAnswer = (question, answer) => {
    setFormData(prev => ({
      ...prev,
      screening_answers: { ...prev.screening_answers, [question]: answer },
    }));
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles(prev => ({ ...prev, [fileType]: file }));
      setFileNames(prev => ({ ...prev, [fileType]: file.name }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Create FormData for multipart upload
      const form = new FormData();
      form.append('job', jobId);
      form.append('first_name', formData.first_name);
      form.append('last_name', formData.last_name);
      form.append('email', formData.email);
      form.append('phone', formData.phone);
      form.append('location', formData.location);
      form.append('linkedin_url', formData.linkedin_url);
      form.append('github_url', formData.github_url);
      form.append('portfolio_url', formData.portfolio_url);
      form.append('cover_letter', formData.cover_letter);
      form.append('screening_answers', JSON.stringify(formData.screening_answers));

      // File uploads
      if (files.cv) form.append('documents', files.cv);
      if (files.portfolio) form.append('documents', files.portfolio);
      if (files.cover_letter_file) form.append('documents', files.cover_letter_file);

      const res = await fetch('/api/employment/applications/', {
        method: 'POST',
        credentials: 'include',
        body: form,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || JSON.stringify(errData));
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading job…</div>;
  }

  if (!job) {
    return (
      <div style={{ minHeight: '100vh', background: '#060e1a', color: '#e2e8f0', padding: 40 }}>
        <div style={{ color: '#f87171', fontSize: 16 }}>
          Job posting not found.
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060e1a',
      color: '#e2e8f0',
      padding: '40px 20px',
    }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Logo / Header */}
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>AtonixDev</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>Join our team</p>
        </div>

        {/* Job Summary */}
        <div style={{
          background: '#112240',
          border: `2px solid ${ACCENT}`,
          borderRadius: 8,
          padding: 20,
          marginBottom: 32,
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{job.title}</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', color: '#cbd5e1', fontSize: 13, marginBottom: 12 }}>
            <div>📍 {job.location || 'Remote'}</div>
            <div>💼 {job.job_type.replace('_', ' ')}</div>
            <div>🎓 {job.experience_level.replace('_', ' ')}</div>
          </div>
          {job.salary_min && (
            <div style={{ color: ACCENT, fontWeight: 600, fontSize: 14 }}>
              💰 ${job.salary_min.toLocaleString()} - ${job.salary_max?.toLocaleString()} {job.salary_currency}
            </div>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div style={{
            background: '#10b981',
            color: '#fff',
            borderRadius: 8,
            padding: 16,
            marginBottom: 20,
            textAlign: 'center',
          }}>
            ✓ Application submitted! Redirecting…
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#ef4444',
            color: '#fff',
            borderRadius: 8,
            padding: 16,
            marginBottom: 20,
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Application Form */}
        {!success && (
          <form onSubmit={handleSubmit}>
            {/* Personal Info */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: '#93c5fd' }}>📋 Your Information</h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 12, marginBottom: 12 }}>
                <input
                  type="text"
                  name="first_name"
                  placeholder="First name *"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  style={{
                    background: '#112240',
                    border: '1px solid #1e3a5f',
                    borderRadius: 6,
                    padding: '10px 12px',
                    color: '#e2e8f0',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
                <input
                  type="text"
                  name="last_name"
                  placeholder="Last name *"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                  style={{
                    background: '#112240',
                    border: '1px solid #1e3a5f',
                    borderRadius: 6,
                    padding: '10px 12px',
                    color: '#e2e8f0',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>

              <input
                type="email"
                name="email"
                placeholder="Email address *"
                value={formData.email}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  background: '#112240',
                  border: '1px solid #1e3a5f',
                  borderRadius: 6,
                  padding: '10px 12px',
                  color: '#e2e8f0',
                  fontSize: 13,
                  outline: 'none',
                  marginBottom: 12,
                }}
              />

              <input
                type="tel"
                name="phone"
                placeholder="Phone number"
                value={formData.phone}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  background: '#112240',
                  border: '1px solid #1e3a5f',
                  borderRadius: 6,
                  padding: '10px 12px',
                  color: '#e2e8f0',
                  fontSize: 13,
                  outline: 'none',
                  marginBottom: 12,
                }}
              />

              <input
                type="text"
                name="location"
                placeholder="City, Country"
                value={formData.location}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  background: '#112240',
                  border: '1px solid #1e3a5f',
                  borderRadius: 6,
                  padding: '10px 12px',
                  color: '#e2e8f0',
                  fontSize: 13,
                  outline: 'none',
                  marginBottom: 12,
                }}
              />
            </div>

            {/* Links */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: '#93c5fd' }}>🔗 Links</h3>

              <input
                type="url"
                name="linkedin_url"
                placeholder="LinkedIn profile URL"
                value={formData.linkedin_url}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  background: '#112240',
                  border: '1px solid #1e3a5f',
                  borderRadius: 6,
                  padding: '10px 12px',
                  color: '#e2e8f0',
                  fontSize: 13,
                  outline: 'none',
                  marginBottom: 12,
                }}
              />

              <input
                type="url"
                name="github_url"
                placeholder="GitHub profile URL"
                value={formData.github_url}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  background: '#112240',
                  border: '1px solid #1e3a5f',
                  borderRadius: 6,
                  padding: '10px 12px',
                  color: '#e2e8f0',
                  fontSize: 13,
                  outline: 'none',
                  marginBottom: 12,
                }}
              />

              <input
                type="url"
                name="portfolio_url"
                placeholder="Portfolio website"
                value={formData.portfolio_url}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  background: '#112240',
                  border: '1px solid #1e3a5f',
                  borderRadius: 6,
                  padding: '10px 12px',
                  color: '#e2e8f0',
                  fontSize: 13,
                  outline: 'none',
                  marginBottom: 12,
                }}
              />
            </div>

            {/* File Uploads */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: '#93c5fd' }}>📄 Files</h3>

              <div style={{
                border: '2px dashed #1e3a5f',
                borderRadius: 8,
                padding: 20,
                textAlign: 'center',
                marginBottom: 12,
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}>
                <label style={{ cursor: 'pointer' }}>
                  <div style={{ color: '#93c5fd', fontWeight: 600, fontSize: 13 }}>
                    {fileNames.cv ? `✓ ${fileNames.cv}` : '📄 Upload CV / Resume *'}
                  </div>
                  <div style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>PDF, DOC, DOCX (Max 5MB)</div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={e => handleFileChange(e, 'cv')}
                    required
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              <div style={{
                border: '1px dashed #1e3a5f',
                borderRadius: 8,
                padding: 20,
                textAlign: 'center',
                marginBottom: 12,
                cursor: 'pointer',
              }}>
                <label style={{ cursor: 'pointer' }}>
                  <div style={{ color: '#cbd5e1', fontSize: 13 }}>
                    {fileNames.portfolio ? `✓ ${fileNames.portfolio}` : '🖼️ Portfolio (Optional)'}
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.zip,.pptx,.xls,.xlsx"
                    onChange={e => handleFileChange(e, 'portfolio')}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>

            {/* Screening Questions */}
            {job.screening_questions && job.screening_questions.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: '#93c5fd' }}>❓ Screening Questions</h3>

                {job.screening_questions.map((q, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: 13, marginBottom: 6, fontWeight: 600 }}>
                      {q.question}
                      {q.required && <span style={{ color: '#f87171' }}> *</span>}
                    </label>
                    <textarea
                      value={formData.screening_answers[q.question] || ''}
                      onChange={e => handleScreeningAnswer(q.question, e.target.value)}
                      required={q.required}
                      placeholder="Your answer…"
                      style={{
                        width: '100%',
                        background: '#112240',
                        border: '1px solid #1e3a5f',
                        borderRadius: 6,
                        padding: '10px 12px',
                        color: '#e2e8f0',
                        fontSize: 13,
                        outline: 'none',
                        minHeight: 80,
                        fontFamily: 'inherit',
                        resize: 'vertical',
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Cover Letter */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: '#93c5fd' }}>💌 Cover Letter</h3>
              <textarea
                name="cover_letter"
                placeholder="Tell us why you're a great fit for this role…"
                value={formData.cover_letter}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  background: '#112240',
                  border: '1px solid #1e3a5f',
                  borderRadius: 6,
                  padding: '12px 14px',
                  color: '#e2e8f0',
                  fontSize: 13,
                  outline: 'none',
                  minHeight: 120,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                background: submitting ? '#1e3a5f' : ACCENT,
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '12px 20px',
                fontWeight: 700,
                fontSize: 14,
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
              }}
            >
              {submitting ? 'Submitting…' : '✓ Submit Application'}
            </button>

            <p style={{ color: '#64748b', fontSize: 11, marginTop: 12, textAlign: 'center' }}>
              By submitting, you agree to AtonixDev's privacy policy.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
