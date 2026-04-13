const express = require('express');
const router = express.Router();
const { getMonthlyAttendanceReport, getPerformanceReport, getDepartmentUtilizationReport } = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin', 'manager'));
router.get('/attendance/monthly', getMonthlyAttendanceReport);
router.get('/performance', getPerformanceReport);
router.get('/department-utilization', getDepartmentUtilizationReport);

module.exports = router;
