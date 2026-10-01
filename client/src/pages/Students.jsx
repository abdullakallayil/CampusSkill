import { useState, useEffect } from 'react';
import { StudentCard } from '../components/Cards';
import Footer from '../components/Footer';
import api from '../api';

const MOCK_STUDENTS = [
  { user_id: 1, name: 'Arjun Mehta', college: 'IIT Bombay', location: 'Mumbai', bio: 'Full-stack developer passionate about beautiful web apps. 2+ years freelance experience.', skills: 'Web Development,React.js,Python', rating: 4.8, total_reviews: 24, created_at: '2024-01-15' },
  { user_id: 2, name: 'Sneha Patel', college: 'NIFT Delhi', location: 'Delhi', bio: 'Creative graphic designer specializing in brand identity and UI/UX.', skills: 'Graphic Design,UI/UX Design,Logo Design', rating: 4.9, total_reviews: 31, created_at: '2024-02-10' },
  { user_id: 3, name: 'Vikram Singh', college: 'VIT Vellore', location: 'Vellore', bio: 'Mobile app developer with Flutter & React Native.', skills: 'Mobile App Development,JavaScript,UI/UX Design', rating: 4.7, total_reviews: 18, created_at: '2024-03-01' },
  { user_id: 4, name: 'Aisha Khan', college: 'Symbiosis Pune', location: 'Pune', bio: 'Digital marketing specialist and content writer for college brands.', skills: 'Social Media Marketing,Content Writing,SEO', rating: 4.6, total_reviews: 22, created_at: '2024-01-20' },
  { user_id: 5, name: 'Rohan Gupta', college: 'NIT Trichy', location: 'Trichy', bio: 'Data science enthusiast with Python and ML skills. Available for analysis and ML projects.', skills: 'Data Analysis,Python,Excel & Spreadsheets', rating: 4.5, total_reviews: 14, created_at: '2024-04-01' },
  { user_id: 6, name: 'Divya Reddy', college: 'Manipal University', location: 'Manipal', bio: 'Video editor and content creator. Specializes in YouTube and Instagram reels.', skills: 'Video Editing,Photography,Social Media Marketing', rating: 4.8, total_reviews: 19, created_at: '2024-02-28' },
];
const ALL_SKILLS = ['Web Development', 'Graphic Design', 'Video Editing', 'Content Writing', 'Data Analysis', 'Mobile App Development', 'UI/UX Design', 'Photography', 'Social Media Marketing', 'Tutoring'];

export default function Students() {
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');

  useEffect(() => {
    api.get('/users/students?limit=20').then(r => { if (r.data.length) setStudents(r.data); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.bio || '').toLowerCase().includes(search.toLowerCase()) || (s.college || '').toLowerCase().includes(search.toLowerCase());
    const skills = typeof s.skills === 'string' ? s.skills : (s.skills || []).map(x => x.skill_name || x).join(',');
    const matchSkill = !skill || skills.toLowerCase().includes(skill.toLowerCase());
    return matchSearch && matchSkill;
  });

  return (
    <>
      <div className="page">
        <div className="container section">
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>Find <span className="gradient-text">Student Talent</span></h1>
            <p style={{ color: 'var(--text-secondary)' }}>Browse skilled college students ready to work on your project</p>
          </div>

          {/* Filters */}
          <div className="filters-bar">
            <div className="search-input-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input className="form-input search-input" placeholder="Search by name, college, skills..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="filter-select" value={skill} onChange={e => setSkill(e.target.value)}>
              <option value="">All Skills</option>
              {ALL_SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {(search || skill) && (
              <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setSkill(''); }}>Clear ✕</button>
            )}
          </div>

          {/* Skill Quick Filters */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {ALL_SKILLS.slice(0, 6).map(s => (
              <button key={s} className={`skill-tag${skill === s ? ' active' : ''}`} onClick={() => setSkill(skill === s ? '' : s)}>{s}</button>
            ))}
          </div>

          <div style={{ marginBottom: 20, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> students
          </div>

          {loading ? (
            <div className="loading-page"><div className="spinner spinner-lg" /></div>
          ) : filtered.length > 0 ? (
            <div className="grid-4">
              {filtered.map(s => <StudentCard key={s.user_id} student={s} />)}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No students found</h3>
              <p>Try different search terms</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
