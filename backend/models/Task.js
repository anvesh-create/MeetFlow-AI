const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, default: '' },
  owner: { type: String, required: true, trim: true },
  ownerEmail: { type: String, trim: true, lowercase: true },
  deadline: { type: Date },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'Assigned', 'In Progress', 'Completed'], default: 'Pending' },
  meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dispatched: { type: Boolean, default: false },
  dispatchStatus: { type: String, enum: ['Pending', 'Notification created', 'Email sent', 'Email unavailable', 'Email failed'], default: 'Pending' },
  completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
