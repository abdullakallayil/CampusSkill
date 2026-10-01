const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

const Job = require('../models/Job');
const Application = require('../models/Application');

// GET /api/jobs — list all open jobs
router.get('/', async (req, res) => {
  try {
    const { category, search, min_budget, max_budget, limit = 20, offset = 0 } = req.query;
    
    let query = { status: 'open' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (min_budget) query.budget = { $gte: Number(min_budget) };
    if (max_budget) {
      query.budget = query.budget || {};
      query.budget.$lte = Number(max_budget);
    }

    const jobs = await Job.find(query)
      .populate('client_id', 'name profile_image rating')
      .sort({ createdAt: -1 })
      .skip(Number(offset))
      .limit(Number(limit))
      .lean();

    // Attach application counts
    const jobsWithCounts = await Promise.all(jobs.map(async (job) => {
      const count = await Application.countDocuments({ job_id: job._id });
      return { 
        ...job, 
        client_name: job.client_id?.name, 
        client_image: job.client_id?.profile_image,
        application_count: count 
      };
    }));

    res.json(jobsWithCounts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/jobs/:id — job detail
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('client_id', 'name profile_image rating')
      .lean();
      
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const application_count = await Application.countDocuments({ job_id: job._id });
    
    res.json({
      ...job,
      client_name: job.client_id?.name,
      client_image: job.client_id?.profile_image,
      client_rating: job.client_id?.rating,
      application_count
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/jobs — post new job (client only)
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'client') return res.status(403).json({ message: 'Clients only' });
  
  const { title, description, budget, deadline, category, required_skills, location } = req.body;
  if (!title || !description) return res.status(400).json({ message: 'Title and description required' });
  
  try {
    const job = await Job.create({
      client_id: req.user.id,
      title,
      description,
      budget,
      deadline,
      category,
      required_skills: required_skills ? (Array.isArray(required_skills) ? required_skills : required_skills.split(',')) : [],
      location: location || 'Remote'
    });
    
    res.status(201).json({ job_id: job._id, message: 'Job posted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/jobs/:id — update job
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    if (job.client_id.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    const { title, description, budget, deadline, category, status, location } = req.body;
    
    await Job.findByIdAndUpdate(req.params.id, {
      title, description, budget, deadline, category, status, location
    });
    
    res.json({ message: 'Job updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/jobs/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    if (job.client_id.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
      
    await Job.findByIdAndDelete(req.params.id);
    // Cleanup related applications
    await Application.deleteMany({ job_id: req.params.id });
    
    res.json({ message: 'Job deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/jobs/client/my — client's own jobs
router.get('/client/my', authMiddleware, async (req, res) => {
  if (req.user.role !== 'client') return res.status(403).json({ message: 'Clients only' });
  
  try {
    const jobs = await Job.find({ client_id: req.user.id }).sort({ createdAt: -1 }).lean();
    
    const jobsWithCounts = await Promise.all(jobs.map(async (job) => {
      const application_count = await Application.countDocuments({ job_id: job._id });
      return { ...job, application_count };
    }));

    res.json(jobsWithCounts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
