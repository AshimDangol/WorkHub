const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  reviewDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comments: { type: String, default: '' },
  reviewedBy: { type: String, default: 'Manager' }
}, { timestamps: true });

performanceSchema.index({ employeeId: 1 });
performanceSchema.index({ rating: 1 });

module.exports = mongoose.model('Performance', performanceSchema);
