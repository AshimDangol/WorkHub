const express = require('express');
const router = express.Router();
const { getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getAllEmployees);
router.get('/:id', getEmployeeById);
router.post('/', authorize('admin', 'manager'), createEmployee);
router.put('/:id', authorize('admin', 'manager'), updateEmployee);
router.delete('/:id', authorize('admin', 'manager'), deleteEmployee);

module.exports = router;
