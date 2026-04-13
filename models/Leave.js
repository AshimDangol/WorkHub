const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  type: { type: String, required: true, enum: ['sick', 'vacation', 'personal', 'maternity', 'paternity', 'unpaid'] },
  reason: { type: String, required: true },
  status: { type: String, required: true, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

leaveSchema.index({ employeeId: 1 });
leaveSchema.index({ status: 1 });

module.exports = mongoose.model('Leave', leaveSchema);
