import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { JobCard } from '../components/Cards';
import Footer from '../components/Footer';
import api from '../api';
import { CATEGORIES } from '../utils';

const MOCK_JOBS = [
  { job_id: 1, title: 'Build a Portfolio Website', description: 'Need a clean responsive portfolio website using React. Should include animations and contact form.', budget: 3500, deadline: '2024-12-31', category: 'Web Development', status: 'open', client_name: 'Rahul Sharma', location: 'Remote', application_count: 5 },
  { job_id: 2, title: 'Design Logo for Startup', description: 'Looking for a creative logo designer for our new ed-tech startup. Minimalist, modern style preferred.', budget: 1200, deadline: '2024-12-15', category: 'Logo Design', status: 'open', client_name: 'Priya Enterprises', location: 'Remote', application_count: 8 },
  { job_id: 3, title: 'Social Media Content Creation', description: 'Need engaging content for Instagram and LinkedIn. 20 posts per month. Must understand college audience.', budget: 2000, deadline: '2024-12-20', category: 'Social Media Marketing', status: 'open', client_name: 'TechStartup Inc.', location: 'Remote', application_count: 12 },
  { job_id: 4, title: 'Python Data Analysis Project', description: 'Analyze sales data using Python pandas and create visualizations. Jupyter notebook preferred.', budget: 4500, deadline: '2024-12-25', category: 'Data Analysis', status: 'open', client_name: 'DataCorp', location: 'Remote', application_count: 3 },
  { job_id: 5, title: 'Video Editing for YouTube Channel', description: 'Edit 8-10 minute educational videos. Must know Premiere Pro or DaVinci Resolve. Weekly delivery.', budget: 1800, deadline: '2025-01-10', category: 'Video Editing', status: 'open', client_name: 'EduChannel', location: 'Remote', application_count: 15 },
  { job_id: 6, title: 'Mobile App UI Design', description: 'Design UI screens for a fitness tracking app. Figma required. Modern, clean aesthetic.', budget: 5000, deadline: '2025-01-15', category: 'UI/UX Design', status: 'open', client_name: 'FitTech', location: 'Bangalore', application_count: 7 },
];

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [budget, setBudget] = useState(searchParams.get('budget') || '');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);

    api.get(`/jobs?${params}`).then(r => {
      if (r.data.length) setJobs(r.data);
      else setJobs(MOCK_JOBS);
    }).catch(() => setJobs(MOCK_JOBS)).finally(() => setLoading(false));
  }, [search, category]);

  const filtered = jobs.filter(j => {
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = !category || j.category === category;
    const matchBudget = !budget || (budget === 'low' ? j.budget <= 2000 : budget === 'mid' ? j.budget <= 5000 : j.budget > 5000);
    return matchSearch && matchCat && matchBudget;
  });

  return (
    <>
      <div className="page">
        <div className="container section">
          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>Browse <span className="gradient-text">Jobs</span></h1>
            <p style={{ color: 'var(--text-secondary)' }}>Find the perfect freelance opportunity that matches your skills</p>
          </div>

          {/* Filters */}
          <div className="filters-bar">
            <div className="search-input-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input
                className="form-input search-input"
                placeholder="Search jobs, skills, keywords..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="filter-select" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="filter-select" value={budget} onChange={e => setBudget(e.target.value)}>
              <option value="">Any Budget</option>
              <option value="low">Under ₹2,000</option>
              <option value="mid">₹2,000 – ₹5,000</option>
              <option value="high">₹5,000+</option>
            </select>
            {(search || category || budget) && (
              <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setCategory(''); setBudget(''); }}>
                Clear Filters ✕
              </button>
            )}
          </div>

          {/* Results count */}
          <div style={{ marginBottom: 20, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> jobs
          </div>

          {/* Grid */}
          {loading ? (
            <div className="loading-page"><div className="spinner spinner-lg" /></div>
          ) : filtered.length > 0 ? (
            <div className="grid-3">
              {filtered.map(job => <JobCard key={job.job_id} job={job} />)}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No jobs found</h3>
              <p>Try adjusting your search filters</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
