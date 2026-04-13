const express = require('express');
const router = express.Router();
const { sendWelcomeEmail, sendAttendanceAlert, sendPerformanceNotification } = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin', 'manager'));
router.post('/welcome', sendWelcomeEmail);
router.post('/attendance-alert', sendAttendanceAlert);
router.post('/performance', sendPerformanceNotification);

module.exports = router;
