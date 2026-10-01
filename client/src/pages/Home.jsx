import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { JobCard, StudentCard } from '../components/Cards';
import Footer from '../components/Footer';
import api from '../api';

// Mock data for display when backend is offline
const MOCK_JOBS = [
  { job_id: 1, title: 'Build a Portfolio Website', description: 'Need a clean responsive portfolio website using React. Should include animations and contact form.', budget: 3500, deadline: '2024-12-31', category: 'Web Development', status: 'open', client_name: 'Rahul Sharma', location: 'Remote', application_count: 5 },
  { job_id: 2, title: 'Design Logo for Startup', description: 'Looking for a creative logo designer for our new ed-tech startup. Minimalist, modern style preferred.', budget: 1200, deadline: '2024-12-15', category: 'Logo Design', status: 'open', client_name: 'Priya Enterprises', location: 'Remote', application_count: 8 },
  { job_id: 3, title: 'Social Media Content Creation', description: 'Need engaging content for Instagram and LinkedIn. 20 posts per month. Must understand college audience.', budget: 2000, deadline: '2024-12-20', category: 'Social Media Marketing', status: 'open', client_name: 'TechStartup Inc.', location: 'Remote', application_count: 12 },
];
const MOCK_STUDENTS = [
  { user_id: 1, name: 'Arjun Mehta', college: 'IIT Bombay', location: 'Mumbai', bio: 'Full-stack developer passionate about building beautiful web apps. 2+ years of freelance experience.', skills: 'Web Development,React.js,Python', rating: 4.8, total_reviews: 24, created_at: '2024-01-15' },
  { user_id: 2, name: 'Sneha Patel', college: 'NIFT Delhi', location: 'Delhi', bio: 'Creative graphic designer specializing in brand identity and UI/UX. Adobe Suite expert.', skills: 'Graphic Design,UI/UX Design,Logo Design', rating: 4.9, total_reviews: 31, created_at: '2024-02-10' },
  { user_id: 3, name: 'Vikram Singh', college: 'VIT Vellore', location: 'Vellore', bio: 'Mobile app developer with Flutter & React Native. Built 10+ apps for clients across India.', skills: 'Mobile App Development,JavaScript,UI/UX Design', rating: 4.7, total_reviews: 18, created_at: '2024-03-01' },
  { user_id: 4, name: 'Aisha Khan', college: 'Symbiosis Pune', location: 'Pune', bio: 'Digital marketing specialist and content writer. Helped 15+ brands grow their social media presence.', skills: 'Social Media Marketing,Content Writing,SEO', rating: 4.6, total_reviews: 22, created_at: '2024-01-20' },
];

const FEATURES = [
  { icon: '🎓', title: 'Student-First Platform', desc: 'Built exclusively for college students. Verified profiles, campus email integration, and college-specific opportunities.', color: 'rgba(108, 99, 255, 0.15)' },
  { icon: '💼', title: 'Real Opportunities', desc: 'Find genuine freelance and part-time work from verified clients. No scams, no spam — just real work.', color: 'rgba(67, 233, 123, 0.12)' },
  { icon: '🎨', title: 'Portfolio Showcase', desc: 'Upload your work, showcase projects, and let your skills speak for themselves with a beautiful profile.', color: 'rgba(255, 101, 132, 0.12)' },
  { icon: '⭐', title: 'Ratings & Reviews', desc: 'Build your reputation over time. Every completed job adds to your credibility and helps you get hired faster.', color: 'rgba(56, 249, 215, 0.1)' },
  { icon: '💬', title: 'Direct Messaging', desc: 'Communicate directly with clients. No middlemen, no delays — just seamless collaboration.', color: 'rgba(255, 179, 71, 0.12)' },
  { icon: '🔒', title: 'Safe & Verified', desc: 'Role-based verification, secure payments, and admin oversight keep the platform safe for everyone.', color: 'rgba(108, 99, 255, 0.1)' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Create Your Profile', desc: 'Sign up as a student or client. Add your skills, bio, and portfolio items.', icon: '👤' },
  { step: '02', title: 'Browse or Post Jobs', desc: 'Students browse and apply to jobs. Clients post requirements and set budgets.', icon: '🔍' },
  { step: '03', title: 'Connect & Collaborate', desc: 'Chat directly, agree on terms, and start working together seamlessly.', icon: '🤝' },
  { step: '04', title: 'Get Paid & Reviewed', desc: 'Complete the work, receive payment, and build your reputation through ratings.', icon: '⭐' },
];

export default function Home() {
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/jobs?limit=3').then(r => setJobs(r.data.length ? r.data : MOCK_JOBS)).catch(() => {});
    api.get('/users/students?limit=4').then(r => setStudents(r.data.length ? r.data : MOCK_STUDENTS)).catch(() => {});
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container">
          <div className="hero-content animate-fade-in">
            <div className="hero-badge">
              🎓 India's #1 Campus Freelancing Platform
            </div>
            <h1>
              Turn Your <span className="gradient-text">Campus Skills</span> Into Real Opportunities
            </h1>
            <p>
              CampusSkill connects college students with freelance work opportunities. Showcase your talent, build your portfolio, and earn while you learn.
            </p>
            <div className="hero-actions">
              <Link to="/register?role=student" className="btn btn-primary btn-lg">
                🚀 Start as Student
              </Link>
              <Link to="/jobs" className="btn btn-secondary btn-lg">
                Browse Jobs →
              </Link>
            </div>
            <div className="hero-stats">
              {[['500+', 'Students Registered'], ['200+', 'Jobs Posted'], ['150+', 'Projects Completed'], ['50+', 'Colleges']].map(([num, label]) => (
                <div key={label} className="hero-stat">
                  <div className="hero-stat-number">{num}</div>
                  <div className="hero-stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section" style={{ background: 'var(--bg-elevated)' }}>
        <div className="container">
          <div className="section-header">
            <h2>Everything You Need to <span className="gradient-text">Succeed</span></h2>
            <p>A complete platform designed around the needs of college students and the people who want to hire them.</p>
          </div>
          <div className="grid-3">
            {FEATURES.map((f, i) => (
              <div key={i} className="card feature-card animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="feature-icon" style={{ background: f.color }}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>How <span className="gradient-text">CampusSkill</span> Works</h2>
            <p>Four simple steps to start your freelancing journey.</p>
          </div>
          <div className="grid-4">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="card animate-fade-in" style={{ animationDelay: `${i * 0.1}s`, textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{step.icon}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-light)', letterSpacing: '0.1em', marginBottom: 8 }}>STEP {step.step}</div>
                <h3 style={{ fontSize: '1rem', marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{step.desc}</p>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div style={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', fontSize: '1.2rem', display: 'none' }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RECENT JOBS */}
      <section className="section" style={{ background: 'var(--bg-elevated)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: 8 }}>Latest <span className="gradient-text">Opportunities</span></h2>
              <p style={{ color: 'var(--text-secondary)' }}>Fresh jobs posted by clients looking for student talent</p>
            </div>
            <Link to="/jobs" className="btn btn-secondary">View All Jobs →</Link>
          </div>
          <div className="grid-3">
            {jobs.map(job => <JobCard key={job.job_id} job={job} />)}
          </div>
        </div>
      </section>

      {/* TOP STUDENTS */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: 8 }}>Top <span className="gradient-text">Student Talent</span></h2>
              <p style={{ color: 'var(--text-secondary)' }}>Highly-rated students ready to work on your project</p>
            </div>
            <Link to="/students" className="btn btn-secondary">Browse All Talent →</Link>
          </div>
          <div className="grid-4">
            {students.map(s => <StudentCard key={s.user_id} student={s} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.15), rgba(67, 233, 123, 0.08))' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🚀</div>
          <h2 style={{ fontSize: '2rem', marginBottom: 16 }}>Ready to Start Your Journey?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '1.05rem' }}>
            Join thousands of students already earning from their skills. Registration is completely free.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register?role=student" className="btn btn-primary btn-lg">Join as Student 🎓</Link>
            <Link to="/register?role=client" className="btn btn-secondary btn-lg">Hire a Student 💼</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
