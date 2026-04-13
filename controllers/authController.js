const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// Login
const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Please provide username and password' });
  }
  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const { passwordHash, ...userWithoutPassword } = user._doc;
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: signToken(user._id),
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all users — admin only (auth enforced in route)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user by ID — authenticated users
const getUserById = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id).select('-passwordHash');
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: targetUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create user — admin only (auth enforced in route)
const createUser = async (req, res) => {
  const { username, email, role, password } = req.body;
  if (!username || !email || !role || !password) {
    return res.status(400).json({ success: false, message: 'Please provide username, email, role, and password' });
  }
  if (!['admin', 'manager', 'employee'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role. Valid roles: admin, manager, employee' });
  }
  try {
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = await User.create({ username, email, role, passwordHash });
    const { passwordHash: _, ...userWithoutPassword } = newUser._doc;
    res.status(201).json({ success: true, message: 'User created successfully', data: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { login, getAllUsers, getUserById, createUser };
