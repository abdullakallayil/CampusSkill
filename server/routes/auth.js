const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, role, college, location } = req.body;
  if (!name || !email || !password || !role)
    return res.status(400).json({ message: 'Please fill all required fields' });

  if (!['student', 'client'].includes(role))
    return res.status(400).json({ message: 'Invalid role' });

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing)
      return res.status(409).json({ message: 'An account with this email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashed,
      role,
      college: role === 'student' ? college : undefined,
      location
    });

    const token = jwt.sign(
      { id: newUser._id, role, name: newUser.name, email: normalizedEmail },
      process.env.JWT_SECRET || 'campusskill_super_secret_jwt_key_2024',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { 
        id: newUser._id, 
        name: newUser.name, 
        email: normalizedEmail, 
        role, 
        college: newUser.college, 
        location: newUser.location 
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required' });

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user)
      return res.status(401).json({ message: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET || 'campusskill_super_secret_jwt_key_2024',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id, name: user.name, email: user.email,
        role: user.role, college: user.college, profile_image: user.profile_image
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
