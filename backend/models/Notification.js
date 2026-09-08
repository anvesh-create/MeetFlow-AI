const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting' },
  type: { type: String, enum: ['task_assigned', 'analysis_complete', 'system'], default: 'system' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
