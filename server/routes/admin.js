const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

// Middleware: admin only
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access only' });
  next();
};

// GET /api/admin/stats
router.get('/stats', authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await User.countDocuments({ role: { $ne: 'admin' } });
    const students = await User.countDocuments({ role: 'student' });
    const clients = await User.countDocuments({ role: 'client' });
    const jobs = await Job.countDocuments();
    const openJobs = await Job.countDocuments({ status: 'open' });
    const applications = await Application.countDocuments();
    
    res.json({
      users,
      total_users: users,
      students,
      total_students: students,
      clients,
      total_clients: clients,
      jobs,
      total_jobs: jobs,
      openJobs,
      total_open_jobs: openJobs,
      applications,
      total_applications: applications
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/users
router.get('/users', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { role, search, limit = 50, offset = 0 } = req.query;
    
    let query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(Number(offset))
      .limit(Number(limit));

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/jobs
router.get('/jobs', authMiddleware, adminOnly, async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('client_id', 'name')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
      
    const formatted = jobs.map(j => ({
      ...j,
      client_name: j.client_id?.name
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/jobs/:id
router.delete('/jobs/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/users/:id/verify
router.put('/users/:id/verify', authMiddleware, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.is_verified = !user.is_verified;
    await user.save();
    
    res.json({ message: 'Verification toggled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
