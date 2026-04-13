const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: [true, 'Please provide a username'], unique: true, trim: true },
  email: {
    type: String, required: [true, 'Please provide an email'],
    unique: true, lowercase: true, trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  role: { type: String, required: true, enum: ['admin', 'manager', 'employee'], default: 'employee' },
  passwordHash: { type: String, required: true }
}, { timestamps: true });

// username and email already indexed via unique:true

module.exports = mongoose.model('User', userSchema);
