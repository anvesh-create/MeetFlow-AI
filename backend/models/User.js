const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  username: { type: String, required: true, unique: true, trim: true, lowercase: true, minlength: 3, maxlength: 40 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  role: { type: String, enum: ['Employee', 'Manager'], default: 'Employee' },
  passwordHash: { type: String, required: true, select: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
