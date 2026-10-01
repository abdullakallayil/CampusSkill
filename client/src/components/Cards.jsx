import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getInitials, formatCurrency, getStatusBadge } from '../utils';

export function JobCard({ job }) {
  const id = job._id || job.job_id;
  return (
    <Link to={`/jobs/${id}`} className="card job-card animate-fade-in" style={{ display: 'block' }}>
      <div className="job-card-header">
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className={`badge ${getStatusBadge(job.status)}`}>{job.status || 'open'}</span>
            {job.category && <span className="badge badge-info">{job.category}</span>}
          </div>
          <div className="job-card-title">{job.title}</div>
          <div className="job-card-client">
            <div className="avatar-placeholder" style={{ width: 22, height: 22, fontSize: '0.65rem' }}>{getInitials(job.client_name)}</div>
            {job.client_name}
          </div>
        </div>
      </div>
      <p className="job-card-desc">{job.description}</p>
      <div className="job-card-footer">
        <span className="job-budget">{formatCurrency(job.budget)}</span>
        <div className="job-meta">
          <span>📅 {job.deadline ? new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Flexible'}</span>
          <span>📍 {job.location || 'Remote'}</span>
          <span>👥 {job.application_count || 0} applied</span>
        </div>
      </div>
    </Link>
  );
}

export function StudentCard({ student }) {
  const id = student._id || student.user_id;
  const skills = typeof student.skills === 'string'
    ? student.skills.split(',').filter(Boolean)
    : (Array.isArray(student.skills) ? student.skills.map(s => s.skill_name || s) : []);

  return (
    <Link to={`/profile/${id}`} className="card student-card animate-fade-in" style={{ display: 'block' }}>
      <div className="student-card-top">
        <div className="avatar-placeholder avatar-md" style={{ fontSize: '1.1rem', flexShrink: 0 }}>
          {getInitials(student.name)}
        </div>
        <div className="student-card-info" style={{ flex: 1 }}>
          <h3>{student.name}</h3>
          <p>{student.college || 'Student'}</p>
          <p style={{ marginTop: 2, color: 'var(--text-muted)', fontSize: '0.8rem' }}>📍 {student.location || 'India'}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <span style={{ color: 'var(--warning)', fontSize: '0.9rem' }}>★</span>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{Number(student.rating || 0).toFixed(1)}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({student.total_reviews || 0})</span>
        </div>
      </div>
      {student.bio && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: '12px 0' }}>
          {student.bio}
        </p>
      )}
      <div className="student-card-skills">
        {skills.slice(0, 4).map((skill, i) => (
          <span key={i} className="skill-tag" style={{ cursor: 'default' }}>{skill}</span>
        ))}
        {skills.length > 4 && <span className="skill-tag" style={{ cursor: 'default' }}>+{skills.length - 4}</span>}
      </div>
      <div className="student-card-footer">
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Joined {new Date(student.created_at || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
        </span>
        <span className="btn btn-sm btn-primary" style={{ pointerEvents: 'none' }}>View Profile →</span>
      </div>
    </Link>
  );
}

export function RatingStars({ rating, size = 'normal' }) {
  const stars = Math.round(rating || 0);
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`star${i > stars ? ' empty' : ''}`} style={{ fontSize: size === 'sm' ? '0.8rem' : '1rem' }}>★</span>
      ))}
    </div>
  );
}

export function Toast({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => removeToast(t.id)} style={{ cursor: 'pointer' }}>
          <span>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}</span>
          <span style={{ flex: 1, fontSize: '0.9rem' }}>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };
  const removeToast = (id) => setToasts(t => t.filter(x => x.id !== id));
  return { toasts, addToast, removeToast };
}
