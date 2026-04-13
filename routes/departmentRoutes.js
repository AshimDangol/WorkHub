const express = require('express');
const router = express.Router();
const { getAllDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment } = require('../controllers/departmentController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getAllDepartments);
router.get('/:id', getDepartmentById);
router.post('/', authorize('admin'), createDepartment);
router.put('/:id', authorize('admin', 'manager'), updateDepartment);
router.delete('/:id', authorize('admin'), deleteDepartment);

module.exports = router;
