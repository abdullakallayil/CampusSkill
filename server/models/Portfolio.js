const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  project_link: { type: String },
  image_url: { type: String },
  category: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);
