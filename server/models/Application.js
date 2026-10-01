const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  proposal: { type: String, required: true },
  bid_amount: { type: Number },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'withdrawn'], default: 'pending' },
}, { timestamps: true });

// Ensure unique application per student per job
applicationSchema.index({ job_id: 1, student_id: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
