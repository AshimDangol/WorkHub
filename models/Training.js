const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  trainer: { type: String, default: '' },
  startDate: { type: String, required: true },
  endDate: { type: String, default: '' },
  completionStatus: { type: String, required: true, enum: ['in_progress', 'completed', 'cancelled'], default: 'in_progress' },
  certificateUrl: { type: String, default: '' }
}, { timestamps: true });

trainingSchema.index({ employeeId: 1 });
trainingSchema.index({ completionStatus: 1 });

module.exports = mongoose.model('Training', trainingSchema);
