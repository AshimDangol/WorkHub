const express = require('express');
const router = express.Router();
const { getRetentionAnalytics, getPerformanceDistribution, getDepartmentPerformance, getAttendanceTrends } = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin', 'manager'));
router.get('/retention', getRetentionAnalytics);
router.get('/performance-distribution', getPerformanceDistribution);
router.get('/department-performance', getDepartmentPerformance);
router.get('/attendance-trends', getAttendanceTrends);

module.exports = router;
