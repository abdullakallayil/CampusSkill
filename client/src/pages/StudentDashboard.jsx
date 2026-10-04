import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { getInitials, formatCurrency, formatDate, getStatusBadge, timeAgo } from '../utils';

const MOCK_APPLICATIONS = [
  { application_id: 1, job_title: 'Build a Portfolio Website', status: 'pending', bid_amount: 3200, proposal: 'I have 2 years of React experience...', client_name: 'Rahul Sharma', category: 'Web Development', created_at: '2024-11-22T09:00:00Z' },
  { application_id: 2, job_title: 'Design Logo for Startup', status: 'accepted', bid_amount: 1100, proposal: 'I specialize in brand identity...', client_name: 'Priya Enterprises', category: 'Logo Design', created_at: '2024-11-20T14:00:00Z' },
  { application_id: 3, job_title: 'Python Data Analysis', status: 'rejected', bid_amount: 4000, proposal: 'I have completed 5+ data projects...', client_name: 'DataCorp', category: 'Data Analysis', created_at: '2024-11-18T11:00:00Z' },
];

const MOCK_PORTFOLIO = [
  { portfolio_id: 1, title: 'E-commerce React App', description: 'Full e-commerce platform with cart and checkout.', category: 'Web Development', project_link: 'https://github.com', created_at: '2024-10-01' },
  { portfolio_id: 2, title: 'College Event Website', description: 'Annual fest website with registration and gallery.', category: 'Web Development', project_link: null, created_at: '2024-09-01' },
];

const ALL_SKILLS = [
  { skill_id: 1, skill_name: 'Web Development' }, { skill_id: 2, skill_name: 'React.js' },
  { skill_id: 3, skill_name: 'Python' }, { skill_id: 4, skill_name: 'Graphic Design' },
  { skill_id: 5, skill_name: 'UI/UX Design' }, { skill_id: 6, skill_name: 'Content Writing' },
  { skill_id: 7, skill_name: 'Data Analysis' }, { skill_id: 8, skill_name: 'Mobile App Development' },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [applications, setApplications] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [mySkills, setMySkills] = useState([]);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState({ title: '', description: '', project_link: '', category: '' });
  const [savingPortfolio, setSavingPortfolio] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', college: '', bio: '', location: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/applications/student/my').then(r => setApplications(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    api.get('/portfolio/my').then(r => setPortfolio(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    api.get('/users/skills').then(r => setAllSkills(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    api.get('/users/profile').then(r => {
      const u = r.data;
      setProfileForm({ name: u.name || '', college: u.college || '', bio: u.bio || '', location: u.location || '' });
    }).catch(() => {});
  }, [user]);

  const addSkill = async (skillId) => {
    try { await api.post('/users/skills', { skill_id: skillId }); const s = allSkills.find(x => x.skill_id === skillId); if (s) setMySkills(prev => [...prev, s]); } catch (e) {}
  };
  const removeSkill = async (skillId) => {
    try { await api.delete(`/users/skills/${skillId}`); setMySkills(prev => prev.filter(s => s.skill_id !== skillId)); } catch (e) {}
  };
  const savePortfolio = async (e) => {
    e.preventDefault(); setSavingPortfolio(true);
    try { await api.post('/portfolio', portfolioForm); setPortfolio(prev => [...prev, { ...portfolioForm, portfolio_id: Date.now(), created_at: new Date().toISOString() }]); setShowPortfolioForm(false); setPortfolioForm({ title: '', description: '', project_link: '', category: '' }); }
    catch (e) {} finally { setSavingPortfolio(false); }
  };
  const deletePortfolio = async (id) => {
    try { await api.delete(`/portfolio/${id}`); setPortfolio(prev => prev.filter(p => p.portfolio_id !== id)); } catch (e) {}
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
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const TABS = [
    { id: 'overview', label: '📊 Overview', icon: '📊' },
    { id: 'applications', label: '📄 Applications', icon: '📄' },
    { id: 'portfolio', label: '🎨 Portfolio', icon: '🎨' },
    { id: 'skills', label: '🛠 Skills', icon: '🛠' },
    { id: 'profile', label: '👤 Profile', icon: '👤' },
  ];

  return (
    <div className="page">
      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, padding: '0 4px' }}>
            <div className="avatar-placeholder avatar-md">{getInitials(user?.name)}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{user?.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Student</div>
            </div>
          </div>
          {TABS.map(t => (
            <div key={t.id} className={`dashboard-nav-item${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
              <span>{t.icon}</span> {t.label.split(' ')[1]}
            </div>
          ))}
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            <Link to="/messages" className="dashboard-nav-item" style={{ display: 'flex' }}>💬 Messages</Link>
            <Link to="/jobs" className="dashboard-nav-item" style={{ display: 'flex' }}>🔍 Browse Jobs</Link>
            <Link to={`/profile/${user?.id}`} className="dashboard-nav-item" style={{ display: 'flex' }}>👁 View Profile</Link>
          </div>
        </aside>

        {/* Content */}
        <main className="dashboard-content">
          {/* Mobile Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
            {TABS.map(t => (
              <button key={t.id} className={`btn btn-sm${tab === t.id ? ' btn-primary' : ' btn-ghost'}`} onClick={() => setTab(t.id)}>{t.label}</button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="animate-fade-in">
              <div className="dashboard-title">Welcome back, {user?.name?.split(' ')[0]}! 👋</div>
              <div className="dashboard-subtitle">Here's a summary of your activity</div>
              <div className="grid-4" style={{ marginBottom: 32 }}>
                {[
                  { label: 'Total Applied', value: stats.total, color: 'var(--primary-light)', icon: '📄' },
                  { label: 'Pending', value: stats.pending, color: 'var(--warning)', icon: '⏳' },
                  { label: 'Accepted', value: stats.accepted, color: 'var(--success)', icon: '✅' },
                  { label: 'Portfolio Items', value: portfolio.length, color: 'var(--info)', icon: '🎨' },
                ].map((s, i) => (
                  <div key={i} className="stat-card">
                    <div className="stat-card-label">{s.icon} {s.label}</div>
                    <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>

              <h3 style={{ marginBottom: 16 }}>Recent Applications</h3>
              {applications.length === 0 ? (
                <div className="card" style={{ padding: 24, textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>You haven't submitted any job applications yet.</p>
                  <Link to="/jobs" className="btn btn-primary btn-sm">Explore Open Jobs →</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {applications.slice(0, 3).map(a => (
                    <div key={a.application_id || a._id} className="card" style={{ padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 700, marginBottom: 4 }}>{a.job_title}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>by {a.client_name} • {timeAgo(a.created_at)}</div>
                        </div>
                        <span className={`badge ${getStatusBadge(a.status)}`}>{a.status}</span>
                      </div>
                    </div>
                  ))}
                  <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => setTab('applications')}>View All Applications →</button>
                </div>
              )}
            </div>
          )}

          {tab === 'applications' && (
            <div className="animate-fade-in">
              <div className="dashboard-title">My Applications</div>
              <div className="dashboard-subtitle">Track all your job applications</div>
              {applications.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📄</div>
                  <h3>No applications yet</h3>
                  <p>Browse jobs and start applying!</p>
                  <Link to="/jobs" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Jobs</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {applications.map(a => (
                    <div key={a.application_id} className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{a.job_title}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Submitted {timeAgo(a.created_at)} • {a.category || 'General'}
                            {a.bid_amount && ` • Bid: ${formatCurrency(a.bid_amount)}`}
                          </div>
                        </div>
                        <span className={`badge ${getStatusBadge(a.status)}`}>{a.status}</span>
                      </div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{a.proposal}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'portfolio' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="dashboard-title">My Portfolio</div>
                  <div className="dashboard-subtitle">Showcase your best work to clients</div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowPortfolioForm(true)}>+ Add Project</button>
              </div>

              {showPortfolioForm && (
                <form onSubmit={savePortfolio} className="card" style={{ marginBottom: 24 }}>
                  <h3 style={{ marginBottom: 20 }}>Add Portfolio Item</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Project Title *</label>
                      <input className="form-input" placeholder="e.g. E-commerce Website" value={portfolioForm.title} onChange={e => setPortfolioForm(f => ({ ...f, title: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea className="form-textarea" style={{ minHeight: 80 }} placeholder="Describe the project..." value={portfolioForm.description} onChange={e => setPortfolioForm(f => ({ ...f, description: e.target.value }))} />
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Category</label>
                        <input className="form-input" placeholder="e.g. Web Development" value={portfolioForm.category} onChange={e => setPortfolioForm(f => ({ ...f, category: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Project Link</label>
                        <input className="form-input" type="url" placeholder="https://github.com/..." value={portfolioForm.project_link} onChange={e => setPortfolioForm(f => ({ ...f, project_link: e.target.value }))} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button type="submit" className="btn btn-primary" disabled={savingPortfolio}>
                        {savingPortfolio ? 'Saving...' : 'Save Project'}
                      </button>
                      <button type="button" className="btn btn-ghost" onClick={() => setShowPortfolioForm(false)}>Cancel</button>
                    </div>
                  </div>
                </form>
              )}

              <div className="grid-2" style={{ gap: 16 }}>
                {portfolio.map(item => (
                  <div key={item.portfolio_id} className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <h4 style={{ fontWeight: 700 }}>{item.title}</h4>
                      <button className="btn btn-sm btn-danger" onClick={() => deletePortfolio(item.portfolio_id)}>🗑</button>
                    </div>
                    {item.category && <span className="badge badge-info" style={{ marginBottom: 8 }}>{item.category}</span>}
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.description}</p>
                    {item.project_link && (
                      <a href={item.project_link} target="_blank" rel="noopener noreferrer" className="btn btn-guest btn-sm" style={{ marginTop: 12 }}>View Project →</a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'skills' && (
            <div className="animate-fade-in">
              <div className="dashboard-title">My Skills</div>
              <div className="dashboard-subtitle">Manage the skills shown on your profile</div>
              <div className="card" style={{ marginBottom: 20 }}>
                <h3 style={{ marginBottom: 12 }}>Current Skills</h3>
                {mySkills.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {mySkills.map(s => (
                      <button key={s.skill_id} className="skill-tag active" onClick={() => removeSkill(s.skill_id)}>
                        {s.skill_name} ✕
                      </button>
                    ))}
                  </div>
                ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No skills added yet</p>}
              </div>
              <div className="card">
                <h3 style={{ marginBottom: 12 }}>Add More Skills</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>Click to add a skill to your profile</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {allSkills.filter(s => !mySkills.find(m => m.skill_id === s.skill_id)).map(s => (
                    <button key={s.skill_id} className="skill-tag" onClick={() => addSkill(s.skill_id)}>{s.skill_name} +</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'profile' && (
            <div className="animate-fade-in">
              <div className="dashboard-title">Edit Profile</div>
              <div className="dashboard-subtitle">Update your profile information</div>
              <form className="card" onSubmit={saveProfile}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Name</label>
                      <input className="form-input" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input className="form-input" defaultValue={user?.email} disabled style={{ opacity: 0.6 }} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">College / University</label>
                    <input className="form-input" value={profileForm.college} onChange={e => setProfileForm(f => ({ ...f, college: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input className="form-input" placeholder="City, State" value={profileForm.location} onChange={e => setProfileForm(f => ({ ...f, location: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea className="form-textarea" placeholder="Tell clients about yourself, your skills, and your experience..." value={profileForm.bio} onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))} />
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
