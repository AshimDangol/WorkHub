const express = require('express');
const router = express.Router();
const { login, getAllUsers, getUserById, createUser } = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/login', login);
router.post('/', authenticate, authorize('admin'), createUser);
router.get('/', authenticate, authorize('admin'), getAllUsers);
router.get('/:id', authenticate, getUserById);

module.exports = router;
