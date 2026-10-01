import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); setDropOpen(false); };

  const dashboardPath = user?.role === 'client' ? '/dashboard/client' :
                        user?.role === 'admin' ? '/admin' : '/dashboard/student';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">Campus<span>Skill</span></Link>

        <div className="navbar-links">
          <NavLink to="/jobs" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>Browse Jobs</NavLink>
          <NavLink to="/students" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>Find Talent</NavLink>
          {user?.role === 'client' && (
            <NavLink to="/post-job" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>Post a Job</NavLink>
          )}
        </div>

        <div className="navbar-actions">
          {user ? (
            <div className="navbar-user-container" ref={dropRef}>
              <button className="navbar-avatar-btn" onClick={() => setDropOpen(o => !o)}>
                <div className="avatar-placeholder avatar-sm" style={{ fontSize: '0.8rem' }}>
                  {getInitials(user.name)}
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, maxWidth: 120, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user.name}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              {dropOpen && (
                <div className="navbar-dropdown">
                  <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</div>
                  </div>
                  <Link to={dashboardPath} className="navbar-dropdown-item" onClick={() => setDropOpen(false)}>
                    <span>📊</span> Dashboard
                  </Link>
                  {user.role === 'student' && (
                    <Link to={`/profile/${user.id}`} className="navbar-dropdown-item" onClick={() => setDropOpen(false)}>
                      <span>👤</span> My Profile
                    </Link>
                  )}
                  <div className="navbar-dropdown-divider" />
                  <div className="navbar-dropdown-item" onClick={handleLogout} style={{ color: 'var(--error)' }}>
                    <span>🚪</span> Logout
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
