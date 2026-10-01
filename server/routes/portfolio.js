const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Portfolio = require('../models/Portfolio');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../client/public/uploads/portfolio');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `portfolio_${req.user.id}_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/portfolio — add item
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Students only' });
  const { title, description, project_link, category } = req.body;
  
  if (!title) return res.status(400).json({ message: 'Title required' });
  
  const image_url = req.file ? `/uploads/portfolio/${req.file.filename}` : null;
  
  try {
    const item = await Portfolio.create({
      student_id: req.user.id,
      title,
      description,
      project_link,
      image_url,
      category
    });
    
    res.status(201).json({ portfolio_id: item._id, message: 'Portfolio item added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/portfolio/my — student's portfolio
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const portfolio = await Portfolio.find({ student_id: req.user.id }).sort({ createdAt: -1 });
    res.json(portfolio);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/portfolio/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Portfolio.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    
    if (item.student_id.toString() !== req.user.id) 
      return res.status(403).json({ message: 'Not authorized' });
      
    if (item.image_url) {
      const imgPath = path.join(__dirname, '../../client/public', item.image_url);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    
    await Portfolio.findByIdAndDelete(req.params.id);
    res.json({ message: 'Portfolio item deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
