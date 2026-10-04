import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { getInitials, formatCurrency, formatDate, getStatusBadge, timeAgo } from '../utils';

const MOCK_JOBS = [
  { job_id: 1, title: 'Build a Portfolio Website', status: 'open', budget: 3500, deadline: '2024-12-31', category: 'Web Development', application_count: 5, created_at: '2024-11-20' },
  { job_id: 2, title: 'Design Logo for Startup', status: 'in_progress', budget: 1200, deadline: '2024-12-15', category: 'Logo Design', application_count: 3, created_at: '2024-11-18' },
];
const MOCK_APPLICANTS = [
  { application_id: 1, name: 'Arjun Mehta', college: 'IIT Bombay', rating: 4.8, skills: 'React.js,Python,Web Development', proposal: 'I have 2+ years of React experience...', bid_amount: 3200, status: 'pending', created_at: '2024-11-22' },
  { application_id: 2, name: 'Rahul Kumar', college: 'BITS Pilani', rating: 4.5, skills: 'JavaScript,CSS,React.js', proposal: 'Experienced frontend developer...', bid_amount: 3000, status: 'pending', created_at: '2024-11-21' },
];

export default function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', bio: '', location: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/jobs/client/my').then(r => setJobs(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    api.get('/users/profile').then(r => {
      const u = r.data;
      setProfileForm({ name: u.name || '', bio: u.bio || '', location: u.location || '' });
    }).catch(() => {});
  }, [user]);

  const viewApplicants = async (job) => {
    setSelectedJob(job);
    setTab('applicants');
    setLoadingApplicants(true);
    const jobId = job._id || job.job_id;
    api.get(`/applications/job/${jobId}`)
      .then(r => setApplicants(Array.isArray(r.data) ? r.data : []))
      .catch(() => setApplicants([]))
      .finally(() => setLoadingApplicants(false));
  };

  const updateStatus = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}/status`, { status });
      setApplicants(prev => prev.map(a => (a.application_id === appId || a._id === appId) ? { ...a, status } : a));
    } catch (e) {}
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg('');
    try {
      await api.put('/users/profile', profileForm);
      setProfileMsg('Profile saved successfully!');
    } catch (err) {
      setProfileMsg(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const stats = {
    total: jobs.length,
    open: jobs.filter(j => j.status === 'open').length,
    inProgress: jobs.filter(j => j.status === 'in_progress').length,
    totalApplicants: jobs.reduce((s, j) => s + (j.application_count || 0), 0),
  };

  const TABS = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'jobs', icon: '💼', label: 'My Jobs' },
    { id: 'applicants', icon: '👥', label: 'Applicants' },
    { id: 'profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <div className="page">
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, padding: '0 4px' }}>
            <div className="avatar-placeholder avatar-md">{getInitials(user?.name)}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{user?.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Client</div>
            </div>
          </div>
          {TABS.map(t => (
            <div key={t.id} className={`dashboard-nav-item${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
              <span>{t.icon}</span> {t.label}
            </div>
          ))}
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            <Link to="/messages" className="dashboard-nav-item" style={{ display: 'flex' }}>💬 Messages</Link>
            <Link to="/post-job" className="dashboard-nav-item" style={{ display: 'flex' }}>➕ Post New Job</Link>
            <Link to="/students" className="dashboard-nav-item" style={{ display: 'flex' }}>🔍 Browse Students</Link>
          </div>
        </aside>

        <main className="dashboard-content">
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto' }}>
            {TABS.map(t => (
              <button key={t.id} className={`btn btn-sm${tab === t.id ? ' btn-primary' : ' btn-ghost'}`} onClick={() => setTab(t.id)}>{t.icon} {t.label}</button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="animate-fade-in">
              <div className="dashboard-title">Client Dashboard</div>
              <div className="dashboard-subtitle">Manage your jobs and applicants</div>

              <div className="grid-4" style={{ marginBottom: 32 }}>
                {[
                  { label: 'Total Jobs', value: stats.total, color: 'var(--primary-light)', icon: '💼' },
                  { label: 'Open Jobs', value: stats.open, color: 'var(--success)', icon: '🟢' },
                  { label: 'In Progress', value: stats.inProgress, color: 'var(--warning)', icon: '⚙️' },
                  { label: 'Total Applicants', value: stats.totalApplicants, color: 'var(--info)', icon: '👥' },
                ].map((s, i) => (
                  <div key={i} className="stat-card">
                    <div className="stat-card-label">{s.icon} {s.label}</div>
                    <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3>Recent Jobs</h3>
                <Link to="/post-job" className="btn btn-primary btn-sm">+ Post New Job</Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {jobs.slice(0, 3).map(j => (
                  <div key={j.job_id} className="card" style={{ padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>{j.title}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{j.application_count || 0} applicants • {formatCurrency(j.budget)}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span className={`badge ${getStatusBadge(j.status)}`}>{j.status}</span>
                        <button className="btn btn-sm btn-secondary" onClick={() => viewApplicants(j)}>View Applicants</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'jobs' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="dashboard-title">My Jobs</div>
                  <div className="dashboard-subtitle">All jobs you've posted</div>
                </div>
                <Link to="/post-job" className="btn btn-primary">+ Post New Job</Link>
              </div>
              {jobs.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">💼</div>
                  <h3>No jobs posted yet</h3>
                  <Link to="/post-job" className="btn btn-primary" style={{ marginTop: 16 }}>Post Your First Job</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
                  {jobs.map(j => (
                    <div key={j.job_id} className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 4 }}>{j.title}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: 16 }}>
                            <span>💰 {formatCurrency(j.budget)}</span>
                            <span>📅 Due {formatDate(j.deadline)}</span>
                            <span>👥 {j.application_count || 0} applicants</span>
                          </div>
                        </div>
                        <span className={`badge ${getStatusBadge(j.status)}`}>{j.status}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => viewApplicants(j)}>View Applicants ({j.application_count || 0})</button>
                        <Link to={`/jobs/${j.job_id}`} className="btn btn-ghost btn-sm">View Job →</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'applicants' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setTab('jobs')}>← Back</button>
                <div>
                  <div className="dashboard-title">{selectedJob ? `Applicants: ${selectedJob.title}` : 'All Applicants'}</div>
                  <div className="dashboard-subtitle">Review and manage applicants</div>
                </div>
              </div>
              {loadingApplicants ? <div className="loading-page"><div className="spinner" /></div> : (
                applicants.length === 0 ? (
                  <div className="empty-state"><div className="empty-state-icon">👥</div><h3>No applicants yet</h3></div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {applicants.map(a => (
                      <div key={a.application_id} className="card">
                        <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                          <div className="avatar-placeholder avatar-md">{getInitials(a.name)}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <div>
                                <div style={{ fontWeight: 700 }}>{a.name}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{a.college}</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span className={`badge ${getStatusBadge(a.status)}`}>{a.status}</span>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>Bid: {formatCurrency(a.bid_amount)}</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                              <span style={{ color: 'var(--warning)' }}>★</span>
                              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{a.rating}</span>
                            </div>
                          </div>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>{a.proposal}</p>
                        {a.skills && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                            {a.skills.split(',').map((s, i) => <span key={i} className="skill-tag" style={{ fontSize: '0.75rem', cursor: 'default' }}>{s}</span>)}
                          </div>
                        )}
                        {a.status === 'pending' && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-success btn-sm" onClick={() => updateStatus(a.application_id, 'accepted')}>✅ Accept</button>
                            <button className="btn btn-danger btn-sm" onClick={() => updateStatus(a.application_id, 'rejected')}>✕ Reject</button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => navigate(`/messages?with=${a.student_id || a._id}&name=${encodeURIComponent(a.name || 'Student')}`)}
                            >💬 Message</button>
                            <Link to={`/profile/${a.student_id || 1}`} className="btn btn-ghost btn-sm">View Profile →</Link>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}

          {tab === 'profile' && (
            <div className="animate-fade-in">
              <div className="dashboard-title">Company Profile</div>
              <div className="dashboard-subtitle">Update your client information</div>
              <form className="card" onSubmit={saveProfile}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Company / Name</label>
                      <input className="form-input" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input className="form-input" defaultValue={user?.email} disabled style={{ opacity: 0.6 }} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input className="form-input" placeholder="City, State" value={profileForm.location} onChange={e => setProfileForm(f => ({ ...f, location: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">About</label>
                    <textarea className="form-textarea" placeholder="Tell students about your company or project..." value={profileForm.bio} onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))} />
                  </div>
                  {profileMsg && <div style={{ color: profileMsg.includes('success') ? 'var(--success)' : 'var(--error)', fontSize: '0.9rem' }}>{profileMsg}</div>}
                  <button type="submit" className="btn btn-primary" disabled={savingProfile}>{savingProfile ? 'Saving...' : 'Save Changes'}</button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
