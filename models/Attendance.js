const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: String, required: true },
  status: { type: String, required: true, enum: ['present', 'absent', 'leave'], default: 'present' },
  checkIn: { type: String, default: null },
  checkOut: { type: String, default: null }
}, { timestamps: true });

attendanceSchema.index({ employeeId: 1 });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ employeeId: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
