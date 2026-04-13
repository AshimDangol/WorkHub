const Leave = require('../models/Leave');

const getAllLeaves = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    // Admin sees all; others see only their own
    const filter = req.user.role === 'admin' ? {} : { employeeId: req.user._id };
    const [leaves, total] = await Promise.all([
      Leave.find(filter).populate('employeeId', 'name email').skip(skip).limit(limit),
      Leave.countDocuments(filter)
    ]);
    res.status(200).json({ success: true, count: leaves.length, total, page, pages: Math.ceil(total / limit), data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLeaveById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id).populate('employeeId', 'name email');
    if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });
    if (req.user.role !== 'admin' && leave.employeeId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createLeave = async (req, res) => {
  const { startDate, endDate, type, reason } = req.body;
  if (!startDate || !endDate || !type || !reason) {
    return res.status(400).json({ success: false, message: 'startDate, endDate, type, and reason are required' });
  }
  if (new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({ success: false, message: 'startDate must be before endDate' });
  }
  try {
    const newLeave = await Leave.create({
      employeeId: req.user._id,
      startDate, endDate,
      type: type.toLowerCase(),
      reason: reason.trim(),
      status: 'pending'
    });
    res.status(201).json({ success: true, message: 'Leave request submitted', data: newLeave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });
    const { status, reason } = req.body;
    if (status && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can update leave status' });
    }
    if (status && !['pending', 'approved', 'rejected'].includes(status.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Status must be pending, approved, or rejected' });
    }
    const updated = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status: status ? status.toLowerCase() : leave.status,
        reason: reason !== undefined ? reason.trim() : leave.reason
      },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, message: 'Leave request updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });
    if (req.user.role !== 'admin' && leave.employeeId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    await Leave.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Leave request deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllLeaves, getLeaveById, createLeave, updateLeave, deleteLeave };
