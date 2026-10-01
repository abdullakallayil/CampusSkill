import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { RatingStars } from '../components/Cards';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { getInitials, formatDate, formatCurrency, timeAgo } from '../utils';

const MOCK_STUDENT = {
  user_id: 1, name: 'Arjun Mehta', college: 'IIT Bombay', location: 'Mumbai', bio: 'Full-stack developer passionate about building beautiful and performant web applications. I specialize in React.js, Node.js, and modern CSS. 2+ years of freelance experience working with startups and small businesses.\n\nAvailable for short-term and long-term projects. I believe in clean code, clear communication, and delivering on time.', profile_image: null, rating: 4.8, total_reviews: 24, created_at: '2024-01-15',
  skills: [{ skill_id: 1, skill_name: 'Web Development', category: 'Tech' }, { skill_id: 2, skill_name: 'React.js', category: 'Tech' }, { skill_id: 3, skill_name: 'Python', category: 'Tech' }, { skill_id: 4, skill_name: 'JavaScript', category: 'Tech' }, { skill_id: 5, skill_name: 'UI/UX Design', category: 'Design' }],
  portfolio: [
    { portfolio_id: 1, title: 'E-commerce React App', description: 'A full e-commerce platform with cart, checkout, and payment integration built using React and Node.js.', project_link: 'https://github.com', category: 'Web Development', created_at: '2024-10-01' },
    { portfolio_id: 2, title: 'College Event Website', description: 'Official website for our college annual fest. Built with Next.js and includes registration, schedule, and gallery.', project_link: 'https://github.com', category: 'Web Development', created_at: '2024-09-01' },
    { portfolio_id: 3, title: 'Data Analysis Dashboard', description: 'Python Dash app for analyzing and visualizing COVID-19 data. Includes filtering, graphs, and export functionality.', project_link: 'https://github.com', category: 'Data Analysis', created_at: '2024-08-01' },
  ],
  reviews: [
    { review_id: 1, rating: 5, comment: 'Excellent work! Delivered the project ahead of schedule and the code quality was top-notch. Highly recommended.', reviewer_name: 'Rahul Sharma', reviewer_image: null, created_at: '2024-10-15' },
    { review_id: 2, rating: 5, comment: 'Very professional and responsive. The website looks amazing and exactly what we wanted.', reviewer_name: 'Priya Enterprises', reviewer_image: null, created_at: '2024-09-20' },
    { review_id: 3, rating: 4, comment: 'Good work overall. Minor delays but quality was great. Would hire again.', reviewer_name: 'TechCorp', reviewer_image: null, created_at: '2024-08-25' },
  ]
};

export default function StudentProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/students/${id}`).then(r => setStudent(r.data)).catch(() => setStudent(MOCK_STUDENT)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-page"><div className="spinner spinner-lg" /></div>;
  if (!student) return <div className="loading-page"><h2>Student not found</h2></div>;

  return (
    <div className="page">
      <div className="container section">
        {/* Profile Header */}
        <div className="profile-header" style={{ marginBottom: 32 }}>
          <div className="profile-header-inner">
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', marginBottom: 24 }}>
              <div className="avatar-placeholder avatar-xl" style={{ fontSize: '2.5rem', border: '3px solid var(--primary)' }}>
                {getInitials(student.name)}
              </div>
              <div style={{ flexGrow: 1 }}>
                <div style={{ marginTop: 80 }}>
                  <h1 className="profile-name">{student.name}</h1>
                  <div className="profile-college">🎓 {student.college || 'Student'} &nbsp;•&nbsp; 📍 {student.location || 'India'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                    <RatingStars rating={student.rating} />
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>{Number(student.rating || 0).toFixed(1)}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({student.total_reviews} reviews)</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                {user && user.role !== 'student' && (
                  <Link to="/messages" className="btn btn-primary">💬 Message</Link>
                )}
              </div>
            </div>

            {student.bio && (
              <p className="profile-bio">{student.bio}</p>
            )}

            <div className="profile-stats">
              <div className="profile-stat">
                <div className="profile-stat-number">{student.portfolio?.length || 0}</div>
                <div className="profile-stat-label">Projects</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-number">{student.total_reviews || 0}</div>
                <div className="profile-stat-label">Reviews</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-number">{student.skills?.length || 0}</div>
                <div className="profile-stat-label">Skills</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-number">{new Date().getFullYear() - new Date(student.created_at).getFullYear() || '< 1'}</div>
                <div className="profile-stat-label">Years on Platform</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32, alignItems: 'start' }}>
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Portfolio */}
            <div className="card">
              <h2 style={{ fontSize: '1.2rem', marginBottom: 20 }}>🎨 Portfolio</h2>
              {student.portfolio?.length > 0 ? (
                <div className="grid-2" style={{ gap: 16 }}>
                  {student.portfolio.map((item, index) => (
                    <div key={item._id || item.portfolio_id || index} className="card" style={{ padding: 20, border: '1px solid var(--border-hover)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{item.title}</h4>
                        {item.category && <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{item.category}</span>}
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: 12 }}>{item.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(item.created_at)}</span>
                        {item.project_link && (
                          <a href={item.project_link} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">View Project →</a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">📁</div>
                  <p>No portfolio items yet</p>
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="card">
              <h2 style={{ fontSize: '1.2rem', marginBottom: 20 }}>⭐ Reviews & Ratings</h2>
              {student.reviews?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {student.reviews.map((r, index) => (
                    <div key={r._id || r.review_id || index} style={{ padding: 20, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar-placeholder" style={{ width: 36, height: 36, fontSize: '0.75rem' }}>{getInitials(r.reviewer_name)}</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.reviewer_name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{timeAgo(r.created_at)}</div>
                          </div>
                        </div>
                        <RatingStars rating={r.rating} size="sm" />
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">⭐</div>
                  <p>No reviews yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Right - Skills Sidebar */}
          <div>
            <div className="card">
              <h3 style={{ marginBottom: 16 }}>🛠 Skills</h3>
              {student.skills?.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {student.skills.map((s, index) => (
                    <span key={s._id || s.skill_id || index} className="skill-tag" style={{ cursor: 'default' }}>{s.skill_name || s}</span>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No skills listed</p>
              )}
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <h3 style={{ marginBottom: 16 }}>ℹ️ Member Since</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{formatDate(student.created_at)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
