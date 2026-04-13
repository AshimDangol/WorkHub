const mongoose = require('mongoose');
const Performance = require('../models/Performance');
const Employee = require('../models/Employee');

const getAllPerformances = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const [performances, total] = await Promise.all([
      Performance.find().populate('employeeId', 'name email').skip(skip).limit(limit),
      Performance.countDocuments()
    ]);
    res.status(200).json({ success: true, count: performances.length, total, page, pages: Math.ceil(total / limit), data: performances });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPerformanceById = async (req, res) => {
  try {
    const performance = await Performance.findById(req.params.id).populate('employeeId', 'name email');
    if (!performance) return res.status(404).json({ success: false, message: 'Performance review not found' });
    res.status(200).json({ success: true, data: performance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createPerformance = async (req, res) => {
  const { employeeId, reviewDate, rating, comments, reviewedBy } = req.body;
  if (!employeeId || !mongoose.Types.ObjectId.isValid(employeeId)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid employeeId' });
  }
  if (rating === undefined || typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: 'Rating must be a number between 1 and 5' });
  }
  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    const newPerformance = await Performance.create({
      employeeId,
      reviewDate: reviewDate || new Date().toISOString().split('T')[0],
      rating,
      comments: comments ? comments.trim() : '',
      reviewedBy: reviewedBy ? reviewedBy.trim() : 'Manager'
    });
    res.status(201).json({ success: true, message: 'Performance review created', data: newPerformance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePerformance = async (req, res) => {
  try {
    const performance = await Performance.findById(req.params.id);
    if (!performance) return res.status(404).json({ success: false, message: 'Performance review not found' });
    const { employeeId, reviewDate, rating, comments, reviewedBy } = req.body;
    if (employeeId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(employeeId)) {
        return res.status(400).json({ success: false, message: 'Invalid employeeId' });
      }
      const emp = await Employee.findById(employeeId);
      if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    if (rating !== undefined && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }
    const updated = await Performance.findByIdAndUpdate(
      req.params.id,
      {
        employeeId: employeeId !== undefined ? employeeId : performance.employeeId,
        reviewDate: reviewDate || performance.reviewDate,
        rating: rating !== undefined ? rating : performance.rating,
        comments: comments !== undefined ? comments.trim() : performance.comments,
        reviewedBy: reviewedBy !== undefined ? reviewedBy.trim() : performance.reviewedBy
      },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, message: 'Performance review updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletePerformance = async (req, res) => {
  try {
    const record = await Performance.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Performance review not found' });
    res.status(200).json({ success: true, message: 'Performance review deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllPerformances, getPerformanceById, createPerformance, updatePerformance, deletePerformance };
