const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

const getAllAttendance = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const [attendance, total] = await Promise.all([
      Attendance.find().populate('employeeId', 'name email').skip(skip).limit(limit),
      Attendance.countDocuments()
    ]);
    res.status(200).json({ success: true, count: attendance.length, total, page, pages: Math.ceil(total / limit), data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAttendanceById = async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id).populate('employeeId', 'name email');
    if (!record) return res.status(404).json({ success: false, message: 'Attendance record not found' });
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createAttendance = async (req, res) => {
  const { employeeId, date, status, checkIn, checkOut } = req.body;
  if (!employeeId || !mongoose.Types.ObjectId.isValid(employeeId)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid employeeId' });
  }
  if (!date) return res.status(400).json({ success: false, message: 'Please provide a date' });
  if (!status || !['present', 'absent', 'leave'].includes(status.toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Status must be present, absent, or leave' });
  }
  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    const newAttendance = await Attendance.create({
      employeeId, date, status: status.toLowerCase(),
      checkIn: checkIn || null, checkOut: checkOut || null
    });
    res.status(201).json({ success: true, message: 'Attendance record created', data: newAttendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Attendance record not found' });
    const { employeeId, date, status, checkIn, checkOut } = req.body;
    if (employeeId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(employeeId)) {
        return res.status(400).json({ success: false, message: 'Invalid employeeId' });
      }
      const emp = await Employee.findById(employeeId);
      if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    if (status !== undefined && !['present', 'absent', 'leave'].includes(status.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Status must be present, absent, or leave' });
    }
    const updated = await Attendance.findByIdAndUpdate(
      req.params.id,
      {
        employeeId: employeeId !== undefined ? employeeId : record.employeeId,
        date: date || record.date,
        status: status ? status.toLowerCase() : record.status,
        checkIn: checkIn !== undefined ? checkIn : record.checkIn,
        checkOut: checkOut !== undefined ? checkOut : record.checkOut
      },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, message: 'Attendance record updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAttendance = async (req, res) => {
  try {
    const record = await Attendance.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Attendance record not found' });
    res.status(200).json({ success: true, message: 'Attendance record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllAttendance, getAttendanceById, createAttendance, updateAttendance, deleteAttendance };
