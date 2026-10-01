import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
              <span className="gradient-text">Campus</span>
              <span style={{ color: 'var(--secondary)' }}>Skill</span>
            </div>
            <p>Connecting college students with real opportunities. Turning skills into careers, one project at a time.</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              {['🐦', '📘', '💼', '📸'].map((emoji, i) => (
                <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-hover)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1rem', transition: 'var(--transition)' }}>{emoji}</div>
              ))}
            </div>
          </div>
          <div className="footer-col">
            <h4>Platform</h4>
            <Link to="/jobs" className="footer-link">Browse Jobs</Link>
            <Link to="/students" className="footer-link">Find Talent</Link>
            <Link to="/post-job" className="footer-link">Post a Job</Link>
            <Link to="/register" className="footer-link">Join Now</Link>
          </div>
          <div className="footer-col">
            <h4>Students</h4>
            <Link to="/register?role=student" className="footer-link">Create Profile</Link>
            <Link to="/jobs" className="footer-link">Find Work</Link>
            <Link to="/dashboard/student" className="footer-link">My Dashboard</Link>
            <a href="#" className="footer-link">Portfolio Tips</a>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <a href="#" className="footer-link">About Us</a>
            <a href="#" className="footer-link">How it Works</a>
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Contact</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2024 CampusSkill. All rights reserved.</span>
          <span style={{ color: 'var(--primary-light)' }}>🎓 Made for Students, by Students</span>
        </div>
      </div>
    </footer>
  );
}
