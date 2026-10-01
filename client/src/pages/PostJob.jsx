import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { CATEGORIES } from '../utils';

export default function PostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', budget: '', deadline: '', category: '', required_skills: '', location: 'Remote'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!user || user.role !== 'client') {
    return (
      <div className="page">
        <div className="container section" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔒</div>
          <h2>Client Access Only</h2>
          <p style={{ color: 'var(--text-muted)', margin: '12px 0 24px' }}>You need a client account to post jobs.</p>
          <button className="btn btn-primary" onClick={() => navigate('/register?role=client')}>Register as Client</button>
        </div>
      </div>
    );
  }

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/jobs', form);
      setSuccess(true);
      setTimeout(() => navigate(`/jobs/${data.job_id}`), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container section">
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>Post a <span className="gradient-text">New Job</span></h1>
            <p style={{ color: 'var(--text-secondary)' }}>Find the perfect student for your project. Be specific about requirements to get better applicants.</p>
          </div>

          {success ? (
            <div className="card" style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
              <h2>Job Posted Successfully!</h2>
              <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Redirecting to your job listing...</p>
              <div className="spinner spinner-lg" style={{ margin: '24px auto 0' }} />
            </div>
          ) : (
            <div className="card">
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Basic Info */}
                <div>
                  <h3 style={{ marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>📋 Job Details</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Job Title *</label>
                      <input className="form-input" name="title" placeholder="e.g. Build a React Website, Design Logo for Startup" value={form.title} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description *</label>
                      <textarea className="form-textarea" style={{ minHeight: 200 }} name="description" placeholder="Describe the project in detail:&#10;• What needs to be done?&#10;• What are the deliverables?&#10;• Any specific requirements or preferences?&#10;• What experience/skills do you expect?" value={form.description} onChange={handleChange} required />
                    </div>
                  </div>
                </div>

                {/* Category & Skills */}
                <div>
                  <h3 style={{ marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>🎯 Skills & Category</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select className="form-select" name="category" value={form.category} onChange={handleChange}>
                        <option value="">Select Category</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <select className="form-select" name="location" value={form.location} onChange={handleChange}>
                        <option value="Remote">Remote</option>
                        <option value="On-site">On-site</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: 16 }}>
                    <label className="form-label">Required Skills (comma-separated)</label>
                    <input className="form-input" name="required_skills" placeholder="e.g. React.js, Figma, Python, Adobe Photoshop" value={form.required_skills} onChange={handleChange} />
                  </div>
                </div>

                {/* Budget & Timeline */}
                <div>
                  <h3 style={{ marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>💰 Budget & Timeline</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Budget (₹)</label>
                      <input className="form-input" name="budget" type="number" placeholder="e.g. 3000" min="100" value={form.budget} onChange={handleChange} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Leave blank if negotiable</span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Deadline</label>
                      <input className="form-input" name="deadline" type="date" min={new Date().toISOString().split('T')[0]} value={form.deadline} onChange={handleChange} />
                    </div>
                  </div>
                </div>

                {error && (
                  <div style={{ background: 'rgba(255, 94, 125, 0.1)', border: '1px solid rgba(255, 94, 125, 0.3)', borderRadius: 'var(--radius-md)', padding: '12px 16px', color: 'var(--error)', fontSize: '0.9rem' }}>
                    ❌ {error}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                  <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                    {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Posting...</> : '🚀 Post Job Now'}
                  </button>
                  <button type="button" className="btn btn-ghost btn-lg" onClick={() => navigate(-1)}>Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
