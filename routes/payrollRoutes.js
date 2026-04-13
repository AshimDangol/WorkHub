const express = require('express');
const router = express.Router();
const { generatePayslip } = require('../controllers/payrollController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/generate', authenticate, authorize('admin', 'manager'), generatePayslip);

module.exports = router;
