const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Performance = require('../models/Performance');
const Department = require('../models/Department');

// Generate monthly attendance report
const getMonthlyAttendanceReport = async (req, res) => {
  const { month, year } = req.query;
  
  const targetDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth()) - 1);
  const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1).toISOString().split('T')[0];
  const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).toISOString().split('T')[0];
  
  try {
    const monthAttendance = await Attendance.find({ date: { $gte: startOfMonth, $lte: endOfMonth } });
    
    // Calculate attendance by employee
    const attendanceByEmployee = {};
    monthAttendance.forEach(a => {
      if (!attendanceByEmployee[a.employeeId]) {
        attendanceByEmployee[a.employeeId] = { present: 0, absent: 0, leave: 0, total: 0 };
      }
      attendanceByEmployee[a.employeeId].total++;
      attendanceByEmployee[a.employeeId][a.status]++;
    });
    
    // Get employee details
    const report = await Employee.find();
    const result = report.map(emp => {
      const empAttendance = attendanceByEmployee[emp.id] || { present: 0, absent: 0, leave: 0, total: 0 };
      const attendanceRate = empAttendance.total > 0 
        ? ((empAttendance.present / empAttendance.total) * 100).toFixed(1) 
        : 0;
      
      return {
        employeeId: emp.id,
        name: emp.name,
        email: emp.email,
        department: emp.department,
        ...empAttendance,
        attendanceRate
      };
    });
    
    res.status(200).json({
      success: true,
      month: targetDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Generate performance summary report
const getPerformanceReport = async (req, res) => {
  const { department, minRating } = req.query;
  
  try {
    let query = {};
    if (department) {
      const deptEmployees = await Employee.find({ department: { $regex: new RegExp(`^${department}$`, 'i') } });
      query.employeeId = { $in: deptEmployees.map(e => e.id) };
    }
    
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }
    
    const performances = await Performance.find(query).populate('employeeId', 'name department');
    
    const report = performances.map(p => ({
      employeeId: p.employeeId._id,
      name: p.employeeId.name,
      department: p.employeeId.department,
      reviewDate: p.reviewDate,
      rating: p.rating,
      comments: p.comments,
      reviewedBy: p.reviewedBy
    }));
    
    // Calculate average by department
    const deptStats = {};
    report.forEach(r => {
      if (!deptStats[r.department]) {
        deptStats[r.department] = { count: 0, totalRating: 0 };
      }
      deptStats[r.department].count++;
      deptStats[r.department].totalRating += r.rating;
    });
    
    const deptAverages = Object.entries(deptStats).map(([dept, stats]) => ({
      department: dept,
      avgRating: (stats.totalRating / stats.count).toFixed(1),
      reviewCount: stats.count
    }));
    
    res.status(200).json({
      success: true,
      data: { reviews: report, deptAverages }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Generate department utilization report
const getDepartmentUtilizationReport = async (req, res) => {
  try {
    const departments = await Department.find();
    const deptStats = [];
    
    for (const dept of departments) {
      const deptEmployees = await Employee.find({ department: dept.name });
      const deptAttendance = await Attendance.find({
        employeeId: { $in: deptEmployees.map(e => e.id) }
      });
      
      const presentCount = deptAttendance.filter(a => a.status === 'present').length;
      const totalRecords = deptAttendance.length;
      const utilizationRate = totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(1) : 0;
      
      deptStats.push({
        department: dept.name,
        employeeCount: deptEmployees.length,
        totalAttendanceRecords: totalRecords,
        presentCount,
        utilizationRate
      });
    }
    
    res.status(200).json({
      success: true,
      data: deptStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { getMonthlyAttendanceReport, getPerformanceReport, getDepartmentUtilizationReport };
