import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RatingStars } from '../components/Cards';
import api from '../api';
import { formatCurrency, formatDate, timeAgo, getInitials } from '../utils';

const MOCK_JOB = {
  job_id: 1, title: 'Build a Portfolio Website', description: 'We need a clean, responsive portfolio website using React.js.\n\nRequirements:\n- Modern dark theme\n- Smooth animations\n- Contact form with email\n- SEO optimized\n- Mobile responsive\n- Deploy on Vercel\n\nPlease share your previous React projects when applying.', budget: 3500, deadline: '2024-12-31', category: 'Web Development', status: 'open', client_name: 'Rahul Sharma', client_image: null, client_rating: 4.5, location: 'Remote', required_skills: 'React.js, CSS, HTML, Vercel', application_count: 5, created_at: '2024-11-20T10:00:00Z'
};

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(MOCK_JOB);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [proposal, setProposal] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [generatingProposal, setGeneratingProposal] = useState(false);
  const [aiMessage, setAiMessage] = useState(null);

  useEffect(() => {
    api.get(`/jobs/${id}`).then(r => setJob(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleAiPitchAssist = async () => {
    if (!job?.title || !job?.description) {
      setAiMessage({ type: 'error', text: 'Job information is incomplete for AI generation.' });
      return;
    }

    setGeneratingProposal(true);
    setAiMessage(null);
    setError('');

    try {
      // 1. Fetch student details (skills)
      let studentSkills = '';
      try {
        const profileRes = await api.get('/users/profile');
        if (profileRes.data?.skills && Array.isArray(profileRes.data.skills)) {
          studentSkills = profileRes.data.skills
            .map(s => (typeof s === 'object' ? s.skill_name : s))
            .filter(Boolean)
            .join(', ');
        }
      } catch (profileErr) {
        console.warn('Could not fetch student profile skills:', profileErr);
      }

      // 2. Request AI proposal generation from /api/ai/generate-proposal
      const res = await api.post('/ai/generate-proposal', {
        job_title: job.title,
        job_description: job.description,
        student_skills: studentSkills
      });

      if (res.data?.proposal) {
        setProposal(res.data.proposal);
        setAiMessage({
          type: 'success',
          text: 'Proposal generated! Review and personalize it below before submitting.'
        });
      } else {
        setAiMessage({
          type: 'error',
          text: 'No proposal returned by AI. Please try again.'
        });
      }
    } catch (err) {
      console.error('AI Pitch Assist failed:', err);
      const msg = err.response?.data?.message || 'Failed to generate proposal. Please check your network and Gemini API key.';
      setAiMessage({ type: 'error', text: msg });
    } finally {
      setGeneratingProposal(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setApplying(true);
    setError('');
    try {
      await api.post('/applications', { job_id: id, proposal, bid_amount: bidAmount || null });
      setSubmitted(true);
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner spinner-lg" /></div>;

  const skills = Array.isArray(job.required_skills)
    ? job.required_skills
    : (typeof job.required_skills === 'string' ? job.required_skills.split(',').map(s => s.trim()) : []);

  return (
    <div className="page">
      <div className="container section">
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 24 }}>← Back to Jobs</button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>
          {/* Main */}
          <div>
            <div className="card" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
                <div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <span className="badge badge-success">{job.status}</span>
                    {job.category && <span className="badge badge-info">{job.category}</span>}
                  </div>
                  <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>{job.title}</h1>
                  <div style={{ display: 'flex', gap: 20, color: 'var(--text-muted)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                    <span>📅 Posted {timeAgo(job.created_at)}</span>
                    <span>📍 {job.location || 'Remote'}</span>
                    <span>👥 {job.application_count || 0} applicants</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'Outfit, sans-serif' }}>{formatCurrency(job.budget)}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Deadline: {formatDate(job.deadline)}</div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24 }}>
                <h3 style={{ marginBottom: 16 }}>Job Description</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{job.description}</p>
              </div>

              {skills.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <h3 style={{ marginBottom: 12 }}>Required Skills</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {skills.map((s, i) => <span key={i} className="skill-tag" style={{ cursor: 'default' }}>{s}</span>)}
                  </div>
                </div>
              )}
            </div>

            {/* Apply Section */}
            {user?.role === 'student' && !submitted && (
              <div className="card">
                <h3 style={{ marginBottom: 8 }}>Apply for this Job</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 16 }}>Write a compelling proposal to stand out from other applicants</p>
                {!showForm ? (
                  <button className="btn btn-primary" onClick={() => setShowForm(true)}>✍️ Write Proposal</button>
                ) : (
                  <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 4 }}>
                        <label className="form-label" style={{ marginBottom: 0 }}>
                          Your Proposal <span style={{ color: 'var(--error)' }}>*</span>
                        </label>
                        <button
                          type="button"
                          className="btn-ai-assist"
                          onClick={handleAiPitchAssist}
                          disabled={generatingProposal || applying}
                          title="Generate a tailored 3-paragraph proposal using Gemini 2.5 Flash"
                        >
                          {generatingProposal ? (
                            <>
                              <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                              <span>Generating Pitch...</span>
                            </>
                          ) : (
                            <>
                              <span style={{ fontSize: '0.95rem' }}>✨</span>
                              <span>AI Pitch Assist</span>
                              <span className="ai-pill-tag">Gemini 2.5</span>
                            </>
                          )}
                        </button>
                      </div>

                      <textarea
                        className="form-textarea"
                        style={{ minHeight: 180, lineHeight: 1.6 }}
                        placeholder="Explain why you're the best fit. Mention relevant experience, your approach, and timeline... Or click 'AI Pitch Assist' above to generate one!"
                        value={proposal}
                        onChange={e => setProposal(e.target.value)}
                        required
                      />

                      {aiMessage && (
                        <div className={`ai-feedback-banner ${aiMessage.type}`}>
                          <span>{aiMessage.type === 'success' ? '✨' : '⚠️'}</span>
                          <span style={{ flex: 1 }}>{aiMessage.text}</span>
                          <button
                            type="button"
                            onClick={() => setAiMessage(null)}
                            style={{ color: 'inherit', opacity: 0.75, cursor: 'pointer', padding: '2px 6px', fontSize: '0.85rem' }}
                            title="Dismiss"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        💡 Tip: You can freely edit and personalize the pitch before submitting.
                      </span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Your Bid Amount (₹) — Optional</label>
                      <input className="form-input" type="number" placeholder={`Client budget: ${formatCurrency(job.budget)}`} value={bidAmount} onChange={e => setBidAmount(e.target.value)} />
                    </div>
                    {error && <div style={{ color: 'var(--error)', fontSize: '0.9rem' }}>❌ {error}</div>}
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button type="submit" className="btn btn-primary" disabled={applying}>
                        {applying ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Submitting...</> : '🚀 Submit Application'}
                      </button>
                      <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {submitted && (
              <div className="card" style={{ background: 'rgba(67, 233, 123, 0.08)', border: '1px solid rgba(67, 233, 123, 0.3)', textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
                <h3 style={{ color: 'var(--success)', marginBottom: 8 }}>Application Submitted!</h3>
                <p style={{ color: 'var(--text-secondary)' }}>The client will review your proposal and get back to you soon.</p>
                <Link to="/dashboard/student" className="btn btn-success" style={{ marginTop: 16, display: 'inline-flex' }}>View My Applications</Link>
              </div>
            )}

            {!user && (
              <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Please log in to apply for this job</p>
                <Link to="/login" className="btn btn-primary">Login to Apply</Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Client Info */}
            <div className="card">
              <h3 style={{ marginBottom: 16 }}>About the Client</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div className="avatar-placeholder avatar-md" style={{ fontSize: '1.1rem' }}>{getInitials(job.client_name)}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{job.client_name}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Verified Client</div>
                </div>
              </div>
              {job.client_rating > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <RatingStars rating={job.client_rating} size="sm" />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{job.client_rating} rating</span>
                </div>
              )}
              {user && user.role === 'student' && (
                <Link to="/messages" className="btn btn-secondary" style={{ width: '100%', marginTop: 16, justifyContent: 'center' }}>💬 Message Client</Link>
              )}
            </div>

            {/* Summary */}
            <div className="card">
              <h3 style={{ marginBottom: 16 }}>Job Summary</h3>
              {[
                ['Budget', formatCurrency(job.budget)],
                ['Deadline', formatDate(job.deadline)],
                ['Location', job.location || 'Remote'],
                ['Applicants', `${job.application_count || 0} applied`],
                ['Category', job.category || 'General'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
