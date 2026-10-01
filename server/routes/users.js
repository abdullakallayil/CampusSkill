const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const User = require('../models/User');
const Skill = require('../models/Skill');
const Portfolio = require('../models/Portfolio');
const Review = require('../models/Review');

// Multer setup for profile images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../client/public/uploads/profiles');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `user_${req.user.id}_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/users/students — list all students with skills
router.get('/students', async (req, res) => {
  try {
    const { skill, search, limit = 20, offset = 0 } = req.query;
    
    let query = { role: 'student' };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }
    
    // If filtering by skill name
    if (skill) {
      const skillDocs = await Skill.find({ skill_name: { $regex: skill, $options: 'i' } });
      const skillIds = skillDocs.map(s => s._id);
      query.skills = { $in: skillIds };
    }

    const students = await User.find(query)
      .select('-password')
      .populate('skills')
      .sort({ rating: -1 })
      .skip(Number(offset))
      .limit(Number(limit));

    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/students/:id — single student profile
router.get('/students/:id', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'student' })
      .select('-password')
      .populate('skills');
      
    if (!user) return res.status(404).json({ message: 'Student not found' });

    const portfolio = await Portfolio.find({ student_id: req.params.id }).sort({ createdAt: -1 });
    const reviews = await Review.find({ reviewee_id: req.params.id })
      .populate('reviewer_id', 'name profile_image')
      .sort({ createdAt: -1 });

    res.json({
      ...user.toObject(),
      portfolio,
      reviews
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/profile — own profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('skills');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (user.role === 'student') {
      const portfolio = await Portfolio.find({ student_id: req.user.id }).sort({ createdAt: -1 });
      return res.json({ ...user.toObject(), portfolio });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/profile — update profile
router.put('/profile', authMiddleware, upload.single('profile_image'), async (req, res) => {
  try {
    const { name, college, bio, location } = req.body;
    const imageUrl = req.file ? `/uploads/profiles/${req.file.filename}` : undefined;
    
    const updates = {};
    if (name) updates.name = name;
    if (college) updates.college = college;
    if (bio) updates.bio = bio;
    if (location) updates.location = location;
    if (imageUrl) updates.profile_image = imageUrl;

    if (Object.keys(updates).length === 0) return res.status(400).json({ message: 'Nothing to update' });
    
    await User.findByIdAndUpdate(req.user.id, updates);
    res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/users/skills — add skill
router.post('/skills', authMiddleware, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Students only' });
  
  const { skill_id } = req.body;
  if (!skill_id) return res.status(400).json({ message: 'skill_id required' });
  
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { skills: skill_id }
    });
    res.status(201).json({ message: 'Skill added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/users/skills/:skillId — remove skill
router.delete('/skills/:skillId', authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { skills: req.params.skillId }
    });
    res.json({ message: 'Skill removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/skills — get all available skills
router.get('/skills', async (req, res) => {
  try {
    const skills = await Skill.find().sort({ category: 1, skill_name: 1 });
    res.json(skills);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
