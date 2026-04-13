const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Performance = require('../models/Performance');

// Search employees
const searchEmployees = async (req, res) => {
  const { q, department, position } = req.query;
  
  try {
    let query = {};
    
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { position: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (department) {
      query.department = department;
    }
    
    if (position) {
      query.position = position;
    }
    
    const results = await Employee.find(query);
    
    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Search attendance
const searchAttendance = async (req, res) => {
  const { employeeId, date, status, startDate, endDate } = req.query;
  
  try {
    let query = {};
    
    if (employeeId) {
      if (mongoose.Types.ObjectId.isValid(employeeId)) {
        query.employeeId = employeeId;
      }
    }
    
    if (date) {
      query.date = date;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    const results = await Attendance.find(query).populate('employeeId', 'name email');
    
    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Search performances
const searchPerformances = async (req, res) => {
  const { employeeId, minRating, maxRating, startDate, endDate } = req.query;
  
  try {
    let query = {};
    
    if (employeeId) {
      if (mongoose.Types.ObjectId.isValid(employeeId)) {
        query.employeeId = employeeId;
      }
    }
    
    if (minRating || maxRating) {
      query.rating = {};
      if (minRating) query.rating.$gte = parseFloat(minRating);
      if (maxRating) query.rating.$lte = parseFloat(maxRating);
    }
    
    if (startDate && endDate) {
      query.reviewDate = { $gte: startDate, $lte: endDate };
    }
    
    const results = await Performance.find(query).populate('employeeId', 'name email');
    
    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { searchEmployees, searchAttendance, searchPerformances };
