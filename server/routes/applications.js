const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

const Job = require('../models/Job');
const Application = require('../models/Application');

// POST /api/applications — apply to a job
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Students only' });
  
  const { job_id, proposal, bid_amount } = req.body;
  if (!job_id || !proposal) return res.status(400).json({ message: 'job_id and proposal required' });
  
  try {
    const existing = await Application.findOne({ job_id, student_id: req.user.id });
    if (existing) return res.status(409).json({ message: 'Already applied to this job' });
    
    const app = await Application.create({
      job_id,
      student_id: req.user.id,
      proposal,
      bid_amount
    });
    
    res.status(201).json({ application_id: app._id, message: 'Application submitted' });
  } catch (err) {
    console.error(err); 
    res.status(500).json({ message: 'Server error' }); 
  }
});

// GET /api/applications/job/:jobId — get applicants for a job (client)
router.get('/job/:jobId', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    if (job.client_id.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
      
    const applications = await Application.find({ job_id: req.params.jobId })
      .populate({
        path: 'student_id',
        select: 'name email profile_image college rating skills',
        populate: { path: 'skills', select: 'skill_name' }
      })
      .sort({ createdAt: -1 })
      .lean();
      
    // Format response to match expected frontend structure
    const formatted = applications.map(app => {
      const user = app.student_id;
      return {
        ...app,
        student_id: user?._id || app.student_id,
        name: user?.name,
        email: user?.email,
        profile_image: user?.profile_image,
        college: user?.college,
        rating: user?.rating,
        skills: user?.skills?.map(s => s.skill_name).join(',') || ''
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/applications/student/my and aliases
router.get(['/student/my', '/my-applications', '/my'], authMiddleware, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Students only' });
  
  try {
    const applications = await Application.find({ student_id: req.user.id })
      .populate({
        path: 'job_id',
        select: 'title budget deadline category client_id',
        populate: { path: 'client_id', select: 'name profile_image' }
      })
      .sort({ createdAt: -1 })
      .lean();

    const formatted = applications.map(app => {
      const job = app.job_id;
      const client = job?.client_id;
      return {
        ...app,
        job_id: job?._id || app.job_id,
        job_title: job?.title,
        budget: job?.budget,
        deadline: job?.deadline,
        category: job?.category,
        client_name: client?.name,
        client_image: client?.profile_image
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/applications/:id/status — accept/reject
router.put('/:id/status', authMiddleware, async (req, res) => {
  const { status } = req.body;
  if (!['accepted', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
  
  try {
    const app = await Application.findById(req.params.id).populate('job_id');
    if (!app) return res.status(404).json({ message: 'Application not found' });
    
    if (app.job_id.client_id.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
      
    app.status = status;
    await app.save();
    
    res.json({ message: `Application ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/applications/:id — withdraw
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: 'Not found' });
    
    if (app.student_id.toString() !== req.user.id) 
      return res.status(403).json({ message: 'Not authorized' });
      
    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: 'Application withdrawn' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
