import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { getInitials, timeAgo, getStatusBadge } from '../utils';

const MOCK_STATS = { users: 156, students: 120, clients: 36, jobs: 89, openJobs: 45, applications: 312 };
const MOCK_USERS = [
  { user_id: 1, name: 'Arjun Mehta', email: 'arjun@example.com', role: 'student', college: 'IIT Bombay', is_verified: true, created_at: '2024-01-15' },
  { user_id: 2, name: 'Sneha Patel', email: 'sneha@example.com', role: 'student', college: 'NIFT Delhi', is_verified: true, created_at: '2024-02-10' },
  { user_id: 3, name: 'Rahul Sharma', email: 'rahul@example.com', role: 'client', college: null, is_verified: false, created_at: '2024-02-20' },
  { user_id: 4, name: 'Priya Enterprises', email: 'priya@priyaent.com', role: 'client', college: null, is_verified: true, created_at: '2024-03-05' },
];
const MOCK_JOBS = [
  { job_id: 1, title: 'Build a Portfolio Website', client_name: 'Rahul Sharma', status: 'open', budget: 3500, created_at: '2024-11-20' },
  { job_id: 2, title: 'Design Logo for Startup', client_name: 'Priya Enterprises', status: 'in_progress', budget: 1200, created_at: '2024-11-18' },
  { job_id: 3, title: 'Python Data Analysis', client_name: 'DataCorp', status: 'completed', budget: 4500, created_at: '2024-11-10' },
];

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(MOCK_STATS);
  const [users, setUsers] = useState(MOCK_USERS);
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'admin') { navigate('/'); return; }
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {});
    api.get('/admin/users').then(r => r.data.length && setUsers(r.data)).catch(() => {});
    api.get('/admin/jobs').then(r => r.data.length && setJobs(r.data)).catch(() => {});
  }, [user]);

  const deleteUser = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try { 
      await api.delete(`/admin/users/${id}`); 
      setUsers(prev => prev.filter(u => (u._id || u.user_id) !== id)); 
    }
    catch (e) {}
  };
  const deleteJob = async (id) => {
    if (!confirm('Delete this job?')) return;
    try { 
      await api.delete(`/admin/jobs/${id}`); 
      setJobs(prev => prev.filter(j => (j._id || j.job_id) !== id)); 
    }
    catch (e) {}
  };
  const toggleVerify = async (id) => {
    try { 
      await api.put(`/admin/users/${id}/verify`); 
      setUsers(prev => prev.map(u => (u._id || u.user_id) === id ? { ...u, is_verified: !u.is_verified } : u)); 
    }
    catch (e) {}
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const TABS = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'users', icon: '👥', label: 'Users' },
    { id: 'jobs', icon: '💼', label: 'Jobs' },
  ];

  return (
    <div className="page">
      <div style={{ background: 'rgba(255, 94, 125, 0.05)', borderBottom: '1px solid rgba(255, 94, 125, 0.2)', padding: '8px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--error)' }}>
          ⚙️ <strong>Admin Panel</strong> — Restricted Access
        </div>
      </div>

      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div style={{ marginBottom: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--error), #cc3366)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: 12 }}>⚙️</div>
            <div style={{ fontWeight: 700 }}>{user?.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--error)' }}>Administrator</div>
          </div>
          {TABS.map(t => (
            <div key={t.id} className={`dashboard-nav-item${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
              <span>{t.icon}</span> {t.label}
            </div>
          ))}
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            <Link to="/" className="dashboard-nav-item" style={{ display: 'flex' }}>🏠 Back to Site</Link>
          </div>
        </aside>

        <main className="dashboard-content">
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {TABS.map(t => (
              <button key={t.id} className={`btn btn-sm${tab === t.id ? ' btn-primary' : ' btn-ghost'}`} onClick={() => setTab(t.id)}>{t.icon} {t.label}</button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="animate-fade-in">
              <div className="dashboard-title">Platform Overview</div>
              <div className="dashboard-subtitle">Real-time statistics and platform health</div>
              <div className="grid-3" style={{ marginBottom: 32 }}>
                {[
                  { label: 'Total Users', value: stats.users, color: 'var(--primary-light)', icon: '👥', sub: `${stats.students} students, ${stats.clients} clients` },
                  { label: 'Total Jobs', value: stats.jobs, color: 'var(--accent)', icon: '💼', sub: `${stats.openJobs} currently open` },
                  { label: 'Applications', value: stats.applications, color: 'var(--info)', icon: '📄', sub: 'Total submitted' },
                  { label: 'Students', value: stats.students, color: 'var(--success)', icon: '🎓', sub: 'Registered students' },
                  { label: 'Clients', value: stats.clients, color: 'var(--warning)', icon: '🏢', sub: 'Registered clients' },
                  { label: 'Open Jobs', value: stats.openJobs, color: 'var(--secondary)', icon: '🟢', sub: 'Awaiting applications' },
                ].map((s, i) => (
                  <div key={i} className="stat-card">
                    <div className="stat-card-label">{s.icon} {s.label}</div>
                    <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
                    <div className="stat-card-sub">{s.sub}</div>
                  </div>
                ))}
              </div>

              <h3 style={{ marginBottom: 16 }}>Recent Users</h3>
              <div className="card">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Name', 'Email', 'Role', 'Verified', 'Joined'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.82rem' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 5).map(u => (
                      <tr key={u.user_id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{u.name}</td>
                        <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{u.email}</td>
                        <td style={{ padding: '12px' }}>
                          <span className={`badge ${u.role === 'student' ? 'badge-primary' : u.role === 'client' ? 'badge-warning' : 'badge-danger'}`}>{u.role}</span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span className={`badge ${u.is_verified ? 'badge-success' : 'badge-danger'}`}>{u.is_verified ? 'Verified' : 'Pending'}</span>
                        </td>
                        <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{timeAgo(u.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'users' && (
            <div className="animate-fade-in">
              <div className="dashboard-title">User Management</div>
              <div className="dashboard-subtitle">Manage all registered users</div>

              <div className="filters-bar" style={{ marginBottom: 20 }}>
                <div className="search-input-wrap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                  <input className="form-input search-input" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="filter-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                  <option value="">All Roles</option>
                  <option value="student">Students</option>
                  <option value="client">Clients</option>
                  <option value="admin">Admins</option>
                </select>
              </div>

              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                      {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.05em' }}>{h.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => {
                      const uid = u._id || u.user_id;
                      return (
                        <tr key={uid} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div className="avatar-placeholder" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>{getInitials(u.name)}</div>
                              <span style={{ fontWeight: 600 }}>{u.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{u.email}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span className={`badge ${u.role === 'student' ? 'badge-primary' : u.role === 'client' ? 'badge-warning' : 'badge-danger'}`}>{u.role}</span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span className={`badge ${u.is_verified ? 'badge-success' : 'badge-warning'}`}>{u.is_verified ? '✓ Verified' : 'Pending'}</span>
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{timeAgo(u.created_at)}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-sm btn-secondary" onClick={() => toggleVerify(uid)} style={{ fontSize: '0.75rem' }}>
                                {u.is_verified ? 'Unverify' : 'Verify'}
                              </button>
                              {u.role !== 'admin' && (
                                <button className="btn btn-sm btn-danger" onClick={() => deleteUser(uid)} style={{ fontSize: '0.75rem' }}>Delete</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'jobs' && (
            <div className="animate-fade-in">
              <div className="dashboard-title">Job Management</div>
              <div className="dashboard-subtitle">Monitor and manage all posted jobs</div>

              <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: 16 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                      {['Job Title', 'Posted By', 'Budget', 'Status', 'Posted', 'Actions'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem' }}>{h.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map(j => {
                      const jid = j._id || j.job_id;
                      return (
                        <tr key={jid} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 600, maxWidth: 240 }}>
                            <Link to={`/jobs/${jid}`} style={{ color: 'var(--primary-light)' }}>{j.title}</Link>
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{j.client_name}</td>
                          <td style={{ padding: '12px 16px', color: 'var(--accent)', fontWeight: 700 }}>
                            {j.budget ? `₹${Number(j.budget).toLocaleString()}` : 'N/A'}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span className={`badge ${getStatusBadge(j.status)}`}>{j.status}</span>
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{timeAgo(j.created_at)}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <button className="btn btn-sm btn-danger" onClick={() => deleteJob(jid)} style={{ fontSize: '0.75rem' }}>Delete</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
