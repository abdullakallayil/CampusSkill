import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.role === 'client') navigate('/dashboard/client');
      else navigate('/dashboard/student');
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to backend server. Make sure the server is running on port 5000.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Demo login helper
  const demoLogin = async (role) => {
    const demos = {
      student: { email: 'student@demo.com', password: 'demo123' },
      client:  { email: 'client@demo.com',  password: 'demo123' },
      admin:   { email: 'admin@campusskill.com', password: 'admin123' },
    };
    setForm(demos[role]);
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
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>Welcome back! 👋</p>
        </div>

        <h2 className="auth-title">Sign In to Your Account</h2>
        <p className="auth-subtitle">Continue your freelancing journey</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" name="password" type="password" placeholder="Your password" value={form.password} onChange={handleChange} required />
          </div>

          {error && (
            <div style={{ background: 'rgba(255, 94, 125, 0.1)', border: '1px solid rgba(255, 94, 125, 0.3)', borderRadius: 'var(--radius-md)', padding: '12px 16px', color: 'var(--error)', fontSize: '0.9rem' }}>
              ❌ {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Signing in...</> : 'Sign In 🚀'}
          </button>
        </form>

        {/* Demo accounts */}
        <div style={{ marginTop: 20 }}>
          <div className="auth-divider"><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quick demo login</span></div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['student', 'client', 'admin'].map(r => (
              <button key={r} type="button" className="btn btn-ghost btn-sm" onClick={() => demoLogin(r)} style={{ flex: 1, textTransform: 'capitalize', fontSize: '0.8rem' }}>
                {r === 'student' ? '🎓' : r === 'client' ? '💼' : '⚙️'} {r}
              </button>
            ))}
          </div>
        </div>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one free</Link>
        </div>
      </div>
    </div>
  );
}
