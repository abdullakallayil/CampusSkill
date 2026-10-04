const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'client', 'admin'], default: 'student' },
  college: { type: String },
  bio: { type: String },
  profile_image: { type: String },
  location: { type: String },
  rating: { type: Number, default: 0.00 },
  total_reviews: { type: Number, default: 0 },
  is_verified: { type: Boolean, default: false },
  skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
