const express = require('express');
const router = express.Router();
const { getAllAttendance, getAttendanceById, createAttendance, updateAttendance, deleteAttendance } = require('../controllers/attendanceController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getAllAttendance);
router.get('/:id', getAttendanceById);
router.post('/', authorize('admin', 'manager'), createAttendance);
router.put('/:id', authorize('admin', 'manager'), updateAttendance);
router.delete('/:id', authorize('admin', 'manager'), deleteAttendance);

module.exports = router;
