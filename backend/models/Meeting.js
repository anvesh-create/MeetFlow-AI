const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  transcript: { type: String, required: true, minlength: 10 },
  participants: [{ type: String, trim: true }],
  meetingDate: { type: Date, required: true },
  summary: { type: String, default: '' },
  decisions: [{ type: String }],
  analysisStatus: { type: String, enum: ['Pending', 'Processing', 'Completed', 'Failed'], default: 'Pending' },
  analysisError: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Meeting', meetingSchema);
