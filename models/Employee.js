const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please provide a name'], trim: true },
  email: {
    type: String, required: [true, 'Please provide an email'],
    unique: true, lowercase: true, trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  position: { type: String, required: [true, 'Please provide a position'], trim: true },
  department: { type: String, required: [true, 'Please provide a department'], trim: true },
  salary: { type: Number, default: 0, min: [0, 'Salary cannot be negative'] },
  hireDate: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, { timestamps: true });

// Indexes for frequently queried fields (email already indexed via unique:true)
employeeSchema.index({ department: 1 });
employeeSchema.index({ name: 1 });

module.exports = mongoose.model('Employee', employeeSchema);
