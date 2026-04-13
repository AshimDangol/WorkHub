const express = require('express');
const router = express.Router();
const { getAllPerformances, getPerformanceById, createPerformance, updatePerformance, deletePerformance } = require('../controllers/performanceController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getAllPerformances);
router.get('/:id', getPerformanceById);
router.post('/', authorize('admin', 'manager'), createPerformance);
router.put('/:id', authorize('admin', 'manager'), updatePerformance);
router.delete('/:id', authorize('admin', 'manager'), deletePerformance);

module.exports = router;
