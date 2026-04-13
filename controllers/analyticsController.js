const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Performance = require('../models/Performance');
const Department = require('../models/Department');

// Get employee retention analytics
const getRetentionAnalytics = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const newHiresLastMonth = await Employee.countDocuments({
      hireDate: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0] }
    });
    
    const retentionRate = totalEmployees > 0 ? ((totalEmployees - newHiresLastMonth) / totalEmployees * 100).toFixed(1) : 0;
    
    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        newHiresLastMonth,
        retentionRate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get performance distribution
const getPerformanceDistribution = async (req, res) => {
  try {
    const performances = await Performance.find();
    
    const distribution = {
      '5.0': 0,
      '4.0-4.9': 0,
      '3.0-3.9': 0,
      '2.0-2.9': 0,
      '1.0-1.9': 0
    };
    
    performances.forEach(p => {
      if (p.rating === 5) distribution['5.0']++;
      else if (p.rating >= 4) distribution['4.0-4.9']++;
      else if (p.rating >= 3) distribution['3.0-3.9']++;
      else if (p.rating >= 2) distribution['2.0-2.9']++;
      else distribution['1.0-1.9']++;
    });
    
    res.status(200).json({
      success: true,
      data: distribution
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get department performance summary
const getDepartmentPerformance = async (req, res) => {
  try {
    const departments = await Department.find();
    
    const deptPerformance = await Promise.all(departments.map(async (dept) => {
      const deptEmployees = await Employee.find({ department: dept.name });
      const deptPerformances = await Performance.find({
        employeeId: { $in: deptEmployees.map(e => e.id) }
      });
      
      const avgRating = deptPerformances.length > 0
        ? (deptPerformances.reduce((sum, p) => sum + p.rating, 0) / deptPerformances.length).toFixed(1)
        : 0;
      
      return {
        department: dept.name,
        employeeCount: deptEmployees.length,
        reviewCount: deptPerformances.length,
        avgRating
      };
    }));
    
    res.status(200).json({
      success: true,
      data: deptPerformance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get attendance trends
const getAttendanceTrends = async (req, res) => {
  try {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }
    
    const trends = await Promise.all(last7Days.map(async (date) => {
      const records = await Attendance.countDocuments({ date });
      const present = await Attendance.countDocuments({ date, status: 'present' });
      const absent = await Attendance.countDocuments({ date, status: 'absent' });
      const leave = await Attendance.countDocuments({ date, status: 'leave' });
      
      return {
        date,
        total: records,
        present,
        absent,
        leave,
        attendanceRate: records > 0 ? ((present / records) * 100).toFixed(1) : 0
      };
    }));
    
    res.status(200).json({
      success: true,
      data: trends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { getRetentionAnalytics, getPerformanceDistribution, getDepartmentPerformance, getAttendanceTrends };
