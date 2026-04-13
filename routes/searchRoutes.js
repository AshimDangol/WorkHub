const express = require('express');
const router = express.Router();
const { searchEmployees, searchAttendance, searchPerformances } = require('../controllers/searchController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/employees', searchEmployees);
router.get('/attendance', searchAttendance);
router.get('/performances', searchPerformances);

module.exports = router;
