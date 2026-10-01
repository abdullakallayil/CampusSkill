const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number },
  deadline: { type: Date },
  category: { type: String },
  status: { type: String, enum: ['open', 'in_progress', 'completed', 'closed'], default: 'open' },
  required_skills: [{ type: String }],
  location: { type: String, default: 'Remote' }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
