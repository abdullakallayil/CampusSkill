import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Register() {
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get('role') || 'student');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', college: '', location: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { ...form, role });
      login(data.token, data.user);
      navigate(role === 'client' ? '/dashboard/client' : '/dashboard/student');
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to backend server. Make sure the server is running on port 5000.');
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-scale">
        <div className="auth-logo">
          <Link to="/" style={{ display: 'inline-block' }}>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800 }}>
              <span className="gradient-text">Campus</span><span style={{ color: 'var(--secondary)' }}>Skill</span>
            </h1>
          </Link>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>Student Freelancing Platform</p>
        </div>

        <h2 className="auth-title">Create Your Account</h2>
        <p className="auth-subtitle">Join thousands of students already on CampusSkill</p>

        {/* Role Selection */}
        <div className="auth-role-grid">
          {[
            { value: 'student', icon: '🎓', label: 'I am a Student', sub: 'Showcase skills & find work' },
            { value: 'client', icon: '💼', label: 'I am a Client', sub: 'Post jobs & hire talent' },
          ].map(r => (
            <button
              key={r.value}
              type="button"
              className={`auth-role-btn${role === r.value ? ' selected' : ''}`}
              onClick={() => setRole(r.value)}
            >
              <div className="auth-role-icon">{r.icon}</div>
              <div className="auth-role-label">{r.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{r.sub}</div>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" name="name" placeholder="Your full name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange} required />
            </div>
          </div>
          {role === 'student' && (
            <div className="form-group">
              <label className="form-label">College / University</label>
              <input className="form-input" name="college" placeholder="e.g. IIT Bombay" value={form.college} onChange={handleChange} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Location</label>
            <input className="form-input" name="location" placeholder="City, State" value={form.location} onChange={handleChange} />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input className="form-input" name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input className="form-input" name="confirm" type="password" placeholder="Repeat password" value={form.confirm} onChange={handleChange} required />
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(255, 94, 125, 0.1)', border: '1px solid rgba(255, 94, 125, 0.3)', borderRadius: 'var(--radius-md)', padding: '12px 16px', color: 'var(--error)', fontSize: '0.9rem' }}>
              ❌ {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Creating Account...</> : `Create ${role === 'student' ? 'Student' : 'Client'} Account 🚀`}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
