const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Performance = require('../models/Performance');
const Department = require('../models/Department');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const totalDepartments = await Department.countDocuments();
    
    // Attendance stats
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await Attendance.countDocuments({ date: today, status: 'present' });
    const absentCount = await Attendance.countDocuments({ date: today, status: 'absent' });
    const leaveCount = await Attendance.countDocuments({ date: today, status: 'leave' });
    
    // Performance stats
    const avgRating = await Performance.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);
    
    const avgRatingValue = avgRating.length > 0 ? avgRating[0].avg.toFixed(1) : 0;
    
    // Department distribution
    const deptDistribution = await Employee.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        totalDepartments,
        todayAttendance: {
          present: todayAttendance,
          absent: absentCount,
          leave: leaveCount
        },
        avgRating: avgRatingValue,
        deptDistribution: deptDistribution.map(d => ({ [d._id]: d.count }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { getDashboardStats };
